import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import LogoutConfirmModal from '../components/LogoutConfirmModal';

const StatCard = ({ label, value }) => (
  <div className="card text-center">
    <p className="font-serif text-3xl font-semibold text-teal">{value}</p>
    <p className="text-xs text-ink/50 mt-1">{label}</p>
  </div>
);

const QUESTION_TYPE_LABELS = {
  multiple_choice: 'Multiple choice',
  true_false_notgiven: 'True / False / Not Given',
  fill_in_blank: 'Fill in the blank',
  matching_headings: 'Matching headings',
  short_answer: 'Short answer',
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    api
      .get('/attempts/stats')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load stats'));
  }, []);

  return (
    <Layout>
      {showLogoutModal && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold">{user?.name}</h1>
            <p className="text-sm text-ink/50 mt-1">{user?.email}</p>
          </div>
          <button onClick={() => setShowLogoutModal(true)} className="btn-secondary shrink-0">
            Log out
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={
              ['active', 'trialing'].includes(user?.subscription?.status)
                ? 'badge bg-teal-light text-teal'
                : 'badge bg-panel text-ink/50'
            }
          >
            {user?.subscription?.status === 'active' || user?.subscription?.status === 'trialing'
              ? `${user.subscription.plan} plan — active`
              : 'No active subscription'}
          </span>
          {!['active', 'trialing'].includes(user?.subscription?.status) && (
            <Link to="/#pricing" className="text-sm text-teal hover:underline">
              View plans
            </Link>
          )}
          {stats?.streak?.current > 0 && (
            <span className="badge bg-gold-light text-gold">
              🔥 {stats.streak.current}-day streak
              {stats.streak.longest > stats.streak.current && ` · best ${stats.streak.longest}`}
            </span>
          )}
        </div>

        {error && <p className="mt-6 text-sm text-brick">{error}</p>}

        {stats && (
          <>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Passages completed" value={stats.passagesCompleted} />
              <StatCard label="Total attempts" value={stats.totalAttempts} />
              <StatCard label="Average score" value={`${stats.averageScorePercent}%`} />
              <StatCard label="Estimated band" value={stats.averageBand ?? '—'} />
            </div>

            {stats.questionTypeBreakdown?.length > 0 && (
              <>
                <h2 className="font-serif text-lg font-semibold mt-10 mb-4">
                  Strengths &amp; weak spots
                </h2>
                <div className="space-y-2">
                  {stats.questionTypeBreakdown
                    .slice()
                    .sort((a, b) => a.percent - b.percent)
                    .map((row) => (
                      <div key={row.type} className="card py-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>{QUESTION_TYPE_LABELS[row.type] || row.type}</span>
                          <span className="text-ink/50">
                            {row.correct}/{row.total} ({row.percent}%)
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-panel overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.percent < 50 ? 'bg-brick' : 'bg-teal'
                            }`}
                            style={{ width: `${row.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}

            <h2 className="font-serif text-lg font-semibold mt-10 mb-4">Recent attempts</h2>
            {stats.recentAttempts.length === 0 ? (
              <p className="text-sm text-ink/50">
                No attempts yet — head to your{' '}
                <Link to="/dashboard" className="text-teal hover:underline">
                  dashboard
                </Link>{' '}
                to start one.
              </p>
            ) : (
              <div className="space-y-2">
                {stats.recentAttempts.map((a) => (
                  <Link
                    to={`/attempts/${a._id}/review`}
                    key={a._id}
                    className="flex items-center justify-between card py-3 hover:border-teal transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{a.passage?.title || 'Deleted passage'}</p>
                      <p className="text-xs text-ink/50 capitalize">{a.passage?.type}</p>
                    </div>
                    <p className="text-sm font-medium text-teal">
                      {a.score}/{a.totalQuestions}
                    </p>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-10 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold">Writing practice</h2>
              <Link to="/writing/submissions" className="text-sm text-teal hover:underline">
                View submissions
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
