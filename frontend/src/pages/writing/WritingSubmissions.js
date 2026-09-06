import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import Layout from '../../components/Layout';

const WritingSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/writing/submissions/me')
      .then((res) => setSubmissions(res.data.submissions))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load submissions'));
  }, []);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        <h1 className="font-serif text-2xl font-semibold">My writing submissions</h1>

        {error && <p className="mt-6 text-sm text-brick">{error}</p>}
        {submissions.length === 0 && !error && (
          <p className="mt-6 text-sm text-ink/50">
            No submissions yet — head to{' '}
            <Link to="/writing" className="text-teal hover:underline">
              writing practice
            </Link>{' '}
            to write your first essay.
          </p>
        )}

        <div className="mt-6 space-y-3">
          {submissions.map((s) => (
            <div key={s._id} className="card flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{s.task?.title || 'Deleted task'}</p>
                <p className="text-xs text-ink/50 uppercase mt-1">{s.task?.taskType}</p>
              </div>
              <p className="font-serif text-xl font-semibold text-teal shrink-0">
                {s.feedback?.bandEstimate}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default WritingSubmissions;
