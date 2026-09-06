import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import Layout from '../../components/Layout';

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

const StatPill = ({ value, label }) => (
  <div className="card py-4 text-center animate-fade-up">
    <p className="font-serif text-2xl font-semibold text-teal">{value}</p>
    <p className="text-xs text-ink/50 mt-1">{label}</p>
  </div>
);

const TYPE_BADGE = {
  reading: 'bg-teal-light text-teal',
  listening: 'bg-gold-light text-gold',
};

const AdminDashboard = () => {
  const [passages, setPassages] = useState([]);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const loadPassages = () => {
    api
      .get('/admin/passages')
      .then((res) => setPassages(res.data.passages))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load'));
  };

  useEffect(loadPassages, []);

  const filteredPassages = passages.filter((p) =>
    p.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  const togglePublish = async (p) => {
    await api.put(`/admin/passages/${p._id}`, { published: !p.published });
    loadPassages();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this passage and all its questions?')) return;
    await api.delete(`/admin/passages/${id}`);
    loadPassages();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-semibold">Passages &amp; tasks</h1>
          <div className="flex gap-2 flex-wrap">
            <Link to="/admin/users" className="btn-secondary">Users &amp; subscriptions</Link>
            <Link to="/admin/study" className="btn-secondary">Vocab &amp; grammar</Link>
            <Link to="/admin/writing" className="btn-secondary">Writing tasks</Link>
            <Link to="/admin/import" className="btn-secondary">Bulk import</Link>
            <Link to="/admin/new" className="btn-primary">Add passage</Link>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-brick">{error}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <StatPill value={passages.length} label="Total passages" />
          <StatPill value={passages.filter((p) => p.published).length} label="Published" />
          <StatPill value={passages.filter((p) => !p.published).length} label="Drafts" />
          <StatPill value={passages.filter((p) => p.externalUrl).length} label="External links" />
        </div>

        <input
          className="field mt-6 max-w-sm"
          placeholder="Search passages by title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="mt-4 border border-line rounded-lg overflow-hidden bg-paper">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-line text-ink/50">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Difficulty</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPassages.map((p) => (
                <tr key={p._id} className="border-b border-line last:border-b-0 hover:bg-panel/60 transition-colors duration-150">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      {p.title}
                      {p.externalUrl && (
                        <span className="text-ink/40" title="Links to an external test">
                          <ExternalLinkIcon />
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${TYPE_BADGE[p.type] || 'bg-panel text-ink/70'}`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-ink/70">{p.difficulty}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.published
                          ? 'text-teal bg-teal-light px-2 py-0.5 rounded-full text-xs'
                          : 'text-ink/50 bg-panel px-2 py-0.5 rounded-full text-xs'
                      }
                    >
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-3 whitespace-nowrap">
                    <Link to={`/admin/edit/${p._id}`} className="text-teal hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => togglePublish(p)} className="text-ink/70 hover:underline">
                      {p.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPassages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                    {passages.length === 0
                      ? 'No passages yet — add one or bulk import to get started.'
                      : 'No passages match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
