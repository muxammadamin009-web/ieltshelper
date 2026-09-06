import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/api';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';

const formatAnswer = (val) => {
  if (val === undefined || val === null || val === '') return '(no answer)';
  if (Array.isArray(val)) return val.join(' / ');
  return String(val);
};

const AttemptReview = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [onlyMistakes, setOnlyMistakes] = useState(false);

  useEffect(() => {
    api
      .get(`/attempts/${id}/review`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load review'));
  }, [id]);

  if (error) {
    return (
      <Layout>
        <p className="max-w-3xl mx-auto px-6 pt-12 text-brick">{error}</p>
      </Layout>
    );
  }
  if (!data) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  const { attempt, breakdown } = data;
  const visibleItems = onlyMistakes ? breakdown.filter((b) => !b.isCorrect) : breakdown;
  const mistakeCount = breakdown.filter((b) => !b.isCorrect).length;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        <p className="text-teal text-sm font-medium capitalize">{attempt.passage?.type}</p>
        <h1 className="font-serif text-2xl font-semibold mt-1">
          Review: {attempt.passage?.title || 'Deleted passage'}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          <span className="badge bg-teal-light text-teal">
            {attempt.score} / {attempt.totalQuestions} correct
          </span>
          {typeof attempt.bandScore === 'number' && (
            <span className="badge bg-panel text-ink/70">Estimated band: {attempt.bandScore}</span>
          )}
          {mistakeCount > 0 && (
            <label className="flex items-center gap-2 text-sm text-ink/70 ml-auto">
              <input
                type="checkbox"
                className="accent-teal"
                checked={onlyMistakes}
                onChange={(e) => setOnlyMistakes(e.target.checked)}
              />
              Show mistakes only ({mistakeCount})
            </label>
          )}
        </div>

        <div className="mt-8 space-y-4">
          {visibleItems.map((b, idx) => (
            <div
              key={b.questionId}
              className={`card border-l-4 ${
                b.isCorrect ? 'border-l-teal' : 'border-l-brick'
              }`}
            >
              <p className="text-sm font-medium">
                {idx + 1}. {b.questionText}
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <p className={b.isCorrect ? 'text-teal' : 'text-brick'}>
                  Your answer: {formatAnswer(b.userAnswer)}
                </p>
                {!b.isCorrect && (
                  <p className="text-ink/70">
                    Correct answer: {formatAnswer(b.correctAnswer)}
                  </p>
                )}
              </div>
            </div>
          ))}
          {visibleItems.length === 0 && (
            <p className="text-sm text-ink/50">No mistakes here — nice work.</p>
          )}
        </div>

        <Link to="/profile" className="text-sm text-teal hover:underline mt-8 inline-block">
          ← Back to profile
        </Link>
      </div>
    </Layout>
  );
};

export default AttemptReview;
