import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const TYPE_STYLES = {
  reading: { badge: 'bg-teal-light text-teal', label: 'Reading' },
  listening: { badge: 'bg-gold-light text-gold', label: 'Listening' },
};

const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14 5h5v5M19 5l-8 8M9 6H6.5A1.5 1.5 0 0 0 5 7.5v10A1.5 1.5 0 0 0 6.5 19h10a1.5 1.5 0 0 0 1.5-1.5V15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PosterCard = ({ passage, index = 0 }) => {
  const style = TYPE_STYLES[passage.type] || TYPE_STYLES.reading;
  return (
    <Link
      to={`/test/${passage._id}`}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className="card flex flex-col justify-between hover:border-teal hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-smooth h-full animate-fade-up"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className={`badge ${style.badge}`}>{style.label}</span>
          {passage.externalUrl && (
            <span className="text-ink/40" title="Opens on another site">
              <ExternalLinkIcon />
            </span>
          )}
        </div>
        <h3 className="font-serif text-lg font-semibold mt-3 leading-snug">
          {passage.title}
        </h3>
        <p className="text-xs text-ink/50 mt-1 capitalize">{passage.difficulty}</p>
      </div>
      <p className="text-sm font-medium text-teal mt-6">Start test</p>
    </Link>
  );
};

const NewsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 5.5h13a2 2 0 0 1 2 2V17a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 3 17V7a1.5 1.5 0 0 1 1-1.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M7 9.5h9M7 12.5h9M7 15.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const NewsCard = ({ article, index = 0 }) => (
  <div
    style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    className="card flex flex-col h-full hover:shadow-md transition-shadow duration-200 animate-fade-up"
  >
    <span className="badge bg-gold-light text-gold w-fit">{article.source}</span>
    <h3 className="font-serif text-base font-semibold mt-3 leading-snug">{article.title}</h3>
    <p className="text-sm text-ink/60 mt-2 leading-relaxed flex-1">{article.description}</p>
    {article.url ? (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-teal hover:underline mt-4"
      >
        Read full article ↗
      </a>
    ) : (
      <p className="text-xs text-ink/40 mt-4 italic">Practice text — no live link</p>
    )}
  </div>
);

const NewsSection = () => {
  const [news, setNews] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    api
      .get('/news')
      .then((res) => {
        setNews(res.data.articles || []);
        if (res.data.note) setNote(res.data.note);
      })
      .catch(() => setNews([]));
  }, []);

  if (news === null) return null;
  if (news.length === 0) return null;

  return (
    <div className="mt-14">
      <div className="flex items-center gap-2">
        <NewsIcon />
        <h2 className="font-serif text-lg font-semibold">Today's reading practice: US news</h2>
      </div>
      <p className="text-sm text-ink/60 mt-1 max-w-lg">
        Real short articles are great extra reading practice — new vocabulary, current
        topics, and a different rhythm than a mock test passage.
      </p>
      {note && <p className="text-xs text-ink/40 mt-1">{note}</p>}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5">
        {news.map((article, i) => (
          <NewsCard key={article.id} article={article} index={i} />
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [passages, setPassages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/passages')
      .then((res) => setPassages(res.data.passages))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load tests'));
  }, []);

  const hasAccess =
    user?.role === 'admin' ||
    ['active', 'trialing'].includes(user?.subscription?.status);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-24">
        <h1 className="font-serif text-2xl font-semibold animate-fade-up">Welcome, {user?.name}</h1>

        {!hasAccess && (
          <div className="mt-4 flex items-center justify-between bg-gold-light border border-gold/30 rounded-md px-4 py-3 animate-fade-up">
            <p className="text-sm">
              You don't have an active subscription yet — subscribe to unlock mock tests.
            </p>
            <Link to="/#pricing" className="btn-primary py-1.5 shrink-0 ml-4">
              Subscribe
            </Link>
          </div>
        )}

        <h2 className="font-serif text-lg font-semibold mt-10 mb-4">Available mock tests</h2>

        {error && <p className="text-sm text-brick">{error}</p>}

        {passages.length === 0 && !error && (
          <p className="text-sm text-ink/50">No tests published yet — check back soon.</p>
        )}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {passages.map((p, i) => (
            <PosterCard key={p._id} passage={p} index={i} />
          ))}
        </div>

        <NewsSection />
      </div>
    </Layout>
  );
};

export default Dashboard;
