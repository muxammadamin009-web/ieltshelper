import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/api';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import StartConfirmModal from '../components/StartConfirmModal';
import TranslatorWidget from '../components/TranslatorWidget';

const ExternalLinkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14 5h5v5M19 5l-8 8M9 6H6.5A1.5 1.5 0 0 0 5 7.5v10A1.5 1.5 0 0 0 6.5 19h10a1.5 1.5 0 0 0 1.5-1.5V15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DEFAULT_MINUTES = { reading: 60, listening: 30 };

const formatClock = (totalSeconds) => {
  const clamped = Math.max(0, totalSeconds);
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const TestPage = () => {
  const { id } = useParams();
  const [passage, setPassage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const startTimeRef = useRef(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    api
      .get(`/passages/${id}`)
      .then((res) => {
        setPassage(res.data.passage);
        setQuestions(res.data.questions);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load test'));
  }, [id]);

  const handleSubmit = async (auto = false) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    const durationSeconds = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : null;

    const payload = {
      answers: Object.entries(answers).map(([questionId, userAnswer]) => ({
        questionId,
        userAnswer,
      })),
      durationSeconds,
    };
    try {
      const res = await api.post(`/attempts/${id}`, payload);
      setResult(res.data.attempt);
      if (auto) setError('Time ran out — your answers so far were submitted automatically.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answers');
      submittingRef.current = false;
    }
  };

  useEffect(() => {
    if (!confirmed || !passage || questions.length === 0 || result) return;
    const minutes = passage.durationMinutes || DEFAULT_MINUTES[passage.type] || 60;
    startTimeRef.current = Date.now();
    setSecondsLeft(minutes * 60);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(interval);
          if (!submittingRef.current) handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [confirmed, passage, questions.length, result]);

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const renderQuestionInput = (q) => {
    switch (q.type) {
      case 'multiple_choice':
      case 'matching_headings':
        return (
          <div className="space-y-2 mt-2">
            {q.options.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={q._id}
                  value={opt}
                  checked={answers[q._id] === opt}
                  onChange={() => handleChange(q._id, opt)}
                  className="accent-teal"
                />
                {opt}
              </label>
            ))}
          </div>
        );
      case 'true_false_notgiven':
        return (
          <select
            className="field mt-2 max-w-xs"
            value={answers[q._id] ?? ''}
            onChange={(e) => handleChange(q._id, e.target.value)}
          >
            <option value="" disabled>Select an answer</option>
            <option value="true">True</option>
            <option value="false">False</option>
            <option value="not given">Not Given</option>
          </select>
        );
      case 'fill_in_blank':
      case 'short_answer':
      default:
        return (
          <input
            type="text"
            className="field mt-2 max-w-sm"
            value={answers[q._id] ?? ''}
            onChange={(e) => handleChange(q._id, e.target.value)}
          />
        );
    }
  };

  if (error && !passage) {
    return (
      <Layout>
        <p className="max-w-4xl mx-auto px-6 pt-12 text-brick">{error}</p>
      </Layout>
    );
  }
  if (!passage) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  const isLowTime = secondsLeft !== null && secondsLeft <= 60;

  return (
    <Layout>
      {!confirmed && (
        <StartConfirmModal
          onConfirm={() => setConfirmed(true)}
          onCancel={() => window.history.back()}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 flex flex-col gap-6 w-full">
        
        {/* Заголовок и Таймер */}
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4 shrink-0">
          <div>
            <p className="text-teal text-sm font-medium capitalize">{passage.type}</p>
            <h1 className="font-serif text-2xl font-semibold mt-1">{passage.title}</h1>
          </div>
          {secondsLeft !== null && !result && (
            <div
              className={`shrink-0 rounded-md border px-4 py-2 text-center ${
                isLowTime ? 'border-brick text-brick bg-brick-light/20' : 'border-line text-ink/70 bg-paper'
              }`}
            >
              <p className="text-[10px] uppercase tracking-wide opacity-70">Time left</p>
              <p className="font-serif text-lg font-semibold tabular-nums">
                {formatClock(secondsLeft)}
              </p>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-brick">{error}</p>}

        {passage.type === 'listening' && passage.audioUrl && (
          <audio controls src={passage.audioUrl} className="w-full shrink-0" />
        )}

        {/* БЛОК ТЕСТА С ВНУТРЕННИМ СКРОЛЛОМ */}
        {passage.bodyText && passage.bodyFormat === 'html' && (
          <div
            className="card text-sm leading-relaxed html-body w-full h-[75vh] min-h-[500px] overflow-y-auto p-4 sm:p-6 shadow-inner"
            dangerouslySetInnerHTML={{ __html: passage.bodyText }}
          />
        )}

        {passage.bodyText && passage.bodyFormat !== 'html' && (
          <div className="card text-sm leading-relaxed whitespace-pre-wrap w-full h-[75vh] min-h-[500px] overflow-y-auto p-4 sm:p-6 shadow-inner">
            {passage.bodyText}
          </div>
        )}

        {passage.attachmentUrl && (
          <a
            href={
              passage.attachmentUrl.startsWith('http')
                ? passage.attachmentUrl
                : `${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${passage.attachmentUrl}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-teal hover:underline"
          >
            <ExternalLinkIcon /> {passage.attachmentName || 'Download attachment'}
          </a>
        )}

        {passage.externalUrl && (
          <div className="card border-teal bg-teal-light/40">
            <p className="text-sm font-medium">This test is hosted on another site</p>
            <p className="text-sm text-ink/60 mt-1 leading-relaxed">
              Read the {passage.type === 'listening' ? 'audio and transcript' : 'passage'}{' '}
              above, then head over to complete the questions there. Come back to this
              page any time — it'll still be here.
            </p>
            <a
              href={passage.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 mt-4"
            >
              Go to test <ExternalLinkIcon />
            </a>
          </div>
        )}

        {result ? (
          <div className="card border-teal">
            <p className="text-sm text-ink/60">Your score</p>
            <p className="font-serif text-3xl font-semibold text-teal mt-1">
              {result.score} / {result.totalQuestions}
            </p>
            {typeof result.bandScore === 'number' && (
              <p className="text-sm text-ink/60 mt-2">
                Estimated band: <span className="font-medium text-ink">{result.bandScore}</span>
                <span className="text-ink/40"> (approximate)</span>
              </p>
            )}
            <Link
              to={`/attempts/${result._id}/review`}
              className="btn-secondary inline-block mt-4"
            >
              Review your answers
            </Link>
          </div>
        ) : (
          questions.length > 0 && (
            <div className="card space-y-6">
              {passage.externalUrl && (
                <p className="text-sm font-medium text-ink/60 border-t border-line pt-5">
                  Or answer these questions here instead:
                </p>
              )}
              {questions.map((q, idx) => (
                <div key={q._id} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                  <p className="text-sm font-medium">
                    {idx + 1}. {q.questionText}
                  </p>
                  {renderQuestionInput(q)}
                </div>
              ))}
              <button onClick={() => handleSubmit(false)} className="btn-primary">
                Submit answers
              </button>
            </div>
          )
        )}

        {/* ПЕРЕВОДЧИК ВНИЗУ ПОД ТЕСТОМ */}
        <div className="pt-6 border-t border-line w-full">
          <TranslatorWidget />
        </div>

      </div>
    </Layout>
  );
};

export default TestPage;