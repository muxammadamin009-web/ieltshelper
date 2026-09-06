import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

const WritingTaskPage = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [essay, setEssay] = useState('');
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/writing/tasks/${id}`)
      .then((res) => setTask(res.data.task))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load task'));
  }, [id]);

  const wordCount = useMemo(() => countWords(essay), [essay]);
  const minWords = task?.minWords || (task?.taskType === 'task1' ? 150 : 250);

  const handleSubmit = async () => {
    if (!essay.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post(`/writing/tasks/${id}/submit`, { essayText: essay });
      setSubmission(res.data.submission);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit essay');
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !task) {
    return (
      <Layout>
        <p className="max-w-3xl mx-auto px-6 pt-12 text-brick">{error}</p>
      </Layout>
    );
  }
  if (!task) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        <span className="badge bg-teal-light text-teal uppercase">{task.taskType}</span>
        <h1 className="font-serif text-2xl font-semibold mt-3">{task.title}</h1>
        <div className="card mt-4 text-sm leading-relaxed whitespace-pre-wrap">{task.prompt}</div>
        {task.imageUrl && (
          <img src={task.imageUrl} alt="Task prompt visual" className="mt-4 rounded-md border border-line" />
        )}
        <p className="text-xs text-ink/50 mt-3">
          Minimum {minWords} words{task.timeMinutes ? ` · suggested time: ${task.timeMinutes} min` : ''}
        </p>

        {error && <p className="mt-4 text-sm text-brick">{error}</p>}

        {submission ? (
          <div className="mt-8 card border-teal">
            <p className="text-sm text-ink/60">Estimated band</p>
            <p className="font-serif text-3xl font-semibold text-teal mt-1">
              {submission.feedback.bandEstimate}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink/70 list-disc list-inside">
              {submission.feedback.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
            <p className="text-xs text-ink/40 mt-4 italic">{submission.feedback.disclaimer}</p>
          </div>
        ) : (
          <div className="mt-8">
            <textarea
              rows={14}
              className="field"
              placeholder="Write your essay here…"
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
            />
            <div className="flex items-center justify-between mt-2">
              <p className={`text-xs ${wordCount < minWords ? 'text-brick' : 'text-ink/50'}`}>
                {wordCount} / {minWords} words
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting || !essay.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit for feedback'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WritingTaskPage;
