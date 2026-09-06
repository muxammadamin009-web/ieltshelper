import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

const WritingTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/writing/tasks')
      .then((res) => setTasks(res.data.tasks))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load writing tasks'));
  }, []);

  const hasAccess =
    user?.role === 'admin' || ['active', 'trialing'].includes(user?.subscription?.status);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-24">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold">Writing practice</h1>
            <p className="text-sm text-ink/60 mt-1 max-w-lg">
              Task 1 (150+ words) and Task 2 (250+ words) prompts. Submissions get instant
              automated feedback on length, structure, and vocabulary — useful for catching
              mechanical issues, not a substitute for a real examiner's band score.
            </p>
          </div>
          <Link to="/writing/submissions" className="btn-secondary shrink-0">
            My submissions
          </Link>
        </div>

        {!hasAccess && (
          <div className="mt-4 bg-gold-light border border-gold/30 rounded-md px-4 py-3 text-sm">
            You'll need an active subscription to submit an essay for feedback — browsing
            prompts is free.
          </div>
        )}

        {error && <p className="mt-6 text-sm text-brick">{error}</p>}
        {tasks.length === 0 && !error && (
          <p className="mt-6 text-sm text-ink/50">No writing tasks published yet — check back soon.</p>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {tasks.map((task, i) => (
            <Link
              key={task._id}
              to={`/writing/${task._id}`}
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              className="card hover:border-teal hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-smooth animate-fade-up"
            >
              <span className="badge bg-teal-light text-teal uppercase">{task.taskType}</span>
              <h3 className="font-serif text-lg font-semibold mt-3">{task.title}</h3>
              <p className="text-sm text-ink/60 mt-2 line-clamp-3">{task.prompt}</p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default WritingTasks;
