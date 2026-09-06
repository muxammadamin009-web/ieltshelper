import { useEffect, useState } from 'react';
import api from '../api/api';
import Layout from '../components/Layout';

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14 5h5v5M19 5l-8 8M9 6H6.5A1.5 1.5 0 0 0 5 7.5v10A1.5 1.5 0 0 0 6.5 19h10a1.5 1.5 0 0 0 1.5-1.5V15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TABS = [
  { key: 'vocab', label: 'Vocabulary' },
  { key: 'grammar', label: 'Grammar' },
  { key: 'review', label: 'Review (due today)' },
];

const BrowseList = ({ tab }) => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/study-items?type=${tab}`)
      .then((res) => setItems(res.data.items))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <>
      {error && <p className="mt-6 text-sm text-brick">{error}</p>}
      {loading && <p className="mt-6 text-sm text-ink/40">Loading…</p>}
      {!loading && items.length === 0 && !error && (
        <p className="mt-6 text-sm text-ink/50">Nothing published here yet — check back soon.</p>
      )}
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item._id} className="card">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-serif text-lg font-semibold">{item.term}</h3>
              <span className="badge bg-panel text-ink/50 capitalize shrink-0">{item.level}</span>
            </div>
            <p className="text-sm text-ink/70 mt-2 leading-relaxed">{item.definition}</p>
            {item.example && <p className="text-sm text-ink/50 mt-2 italic">"{item.example}"</p>}
            {item.externalUrl && (
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-teal hover:underline mt-4"
              >
                Open exercise <ExternalLinkIcon />
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

// Spaced-repetition review queue: shows one due item at a time as a flip
// card. "Again" resets the interval, "Good"/"Easy" push it further out -
// see backend/models/StudyProgress.js for the underlying schedule.
const ReviewQueue = () => {
  const [queue, setQueue] = useState(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState('');
  const [sessionDone, setSessionDone] = useState(0);

  const load = () => {
    api
      .get('/study-items/due')
      .then((res) => {
        setQueue(res.data.items);
        setIndex(0);
        setRevealed(false);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load review queue'));
  };

  useEffect(load, []);

  const current = queue && queue[index];

  const handleReview = async (quality) => {
    if (!current) return;
    try {
      await api.post(`/study-items/${current._id}/review`, { quality });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save review');
      return;
    }
    setSessionDone((n) => n + 1);
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  if (error) return <p className="mt-6 text-sm text-brick">{error}</p>;
  if (queue === null) return <p className="mt-6 text-sm text-ink/40">Loading…</p>;

  if (!current) {
    return (
      <div className="mt-6 card text-center py-10">
        <p className="font-serif text-lg font-semibold">
          {sessionDone > 0 ? "That's everything due for now." : 'Nothing due right now.'}
        </p>
        <p className="text-sm text-ink/60 mt-1">
          {sessionDone > 0
            ? `You reviewed ${sessionDone} item${sessionDone === 1 ? '' : 's'}. Come back tomorrow for more.`
            : "You're all caught up on vocab and grammar reviews. Check back later."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-xs text-ink/50">
        {index + 1} of {queue.length} due
      </p>
      <div className="card mt-2 min-h-[220px] flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <span className="badge bg-panel text-ink/50 capitalize">{current.type}</span>
          <span className="badge bg-panel text-ink/50 capitalize">{current.level}</span>
        </div>
        <div className="flex-1 flex items-center justify-center py-8">
          <h3 className="font-serif text-2xl font-semibold text-center">{current.term}</h3>
        </div>

        {revealed ? (
          <div className="border-t border-line pt-4">
            <p className="text-sm text-ink/70 leading-relaxed">{current.definition}</p>
            {current.example && (
              <p className="text-sm text-ink/50 mt-2 italic">"{current.example}"</p>
            )}
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => handleReview('again')}
                className="flex-1 border border-brick/40 text-brick rounded-md px-4 py-2 text-sm font-medium hover:bg-brick/10 transition-colors"
              >
                Again
              </button>
              <button onClick={() => handleReview('good')} className="btn-secondary flex-1">
                Good
              </button>
              <button onClick={() => handleReview('easy')} className="btn-primary flex-1">
                Easy
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setRevealed(true)} className="btn-primary w-full">
            Show answer
          </button>
        )}
      </div>
    </div>
  );
};

const Study = () => {
  const [tab, setTab] = useState('vocab');

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        <h1 className="font-serif text-2xl font-semibold">Build the basics</h1>
        <p className="text-sm text-ink/60 mt-1 max-w-md">
          Vocabulary and grammar points worth knowing before you sit a full mock test, plus a
          daily spaced-repetition review to make them stick.
        </p>

        <div className="flex gap-2 mt-6 border-b border-line overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                tab === t.key
                  ? 'px-4 py-2 text-sm font-medium text-teal border-b-2 border-teal -mb-px whitespace-nowrap'
                  : 'px-4 py-2 text-sm font-medium text-ink/50 hover:text-ink whitespace-nowrap'
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'review' ? <ReviewQueue /> : <BrowseList tab={tab} />}
      </div>
    </Layout>
  );
};

export default Study;
