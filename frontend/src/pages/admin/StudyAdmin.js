import { useEffect, useState } from 'react';
import api from '../../api/api';
import Layout from '../../components/Layout';

const empty = {
  type: 'vocab',
  term: '',
  definition: '',
  example: '',
  externalUrl: '',
  level: 'beginner',
  published: true,
};

const ExternalLinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14 5h5v5M19 5l-8 8M9 6H6.5A1.5 1.5 0 0 0 5 7.5v10A1.5 1.5 0 0 0 6.5 19h10a1.5 1.5 0 0 0 1.5-1.5V15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StudyAdmin = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/admin/study-items').then((res) => setItems(res.data.items));
  };
  useEffect(load, []);

  const handleAdd = async () => {
    try {
      await api.post('/admin/study-items', form);
      setForm(empty);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
    }
  };

  const togglePublish = async (item) => {
    await api.put(`/admin/study-items/${item._id}`, { published: !item.published });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await api.delete(`/admin/study-items/${id}`);
    load();
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        <h1 className="font-serif text-2xl font-semibold mb-6">Vocabulary &amp; grammar</h1>
        {error && <p className="mb-4 text-sm text-brick">{error}</p>}

        <div className="card space-y-4 mb-8">
          <h2 className="text-sm font-medium">Add item</h2>
          <div className="grid grid-cols-2 gap-4">
            <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="vocab">Vocabulary</option>
              <option value="grammar">Grammar</option>
            </select>
            <select className="field" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <input
            className="field"
            placeholder={form.type === 'vocab' ? 'Word' : 'Grammar point (e.g. Present Perfect)'}
            value={form.term}
            onChange={(e) => setForm({ ...form, term: e.target.value })}
          />
          <textarea
            rows={3}
            className="field"
            placeholder="Definition / explanation"
            value={form.definition}
            onChange={(e) => setForm({ ...form, definition: e.target.value })}
          />
          <input
            className="field"
            placeholder="Example sentence (optional)"
            value={form.example}
            onChange={(e) => setForm({ ...form, example: e.target.value })}
          />
          <div className="rounded-md border border-teal/30 bg-teal-light/40 p-4 space-y-2">
            <label className="label flex items-center gap-1.5">
              <ExternalLinkIcon /> External exercise URL (optional)
            </label>
            <input
              className="field"
              placeholder="https://... a quiz or drill hosted elsewhere"
              value={form.externalUrl}
              onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
            />
            <p className="text-xs text-ink/60 leading-relaxed">
              If set, students get an "Open exercise" button that sends them to this
              link to practice, instead of just reading the definition here.
            </p>
          </div>
          <button onClick={handleAdd} className="btn-primary">Add</button>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item._id} className="card flex items-start justify-between">
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  <span className="text-ink/40 capitalize">[{item.type}]</span> {item.term}
                  {item.externalUrl && (
                    <span className="badge bg-teal-light text-teal flex items-center gap-1">
                      <ExternalLinkIcon /> linked
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink/60 mt-1">{item.definition}</p>
              </div>
              <div className="flex gap-3 shrink-0 ml-4 text-sm">
                <button onClick={() => togglePublish(item)} className="text-ink/70 hover:underline">
                  {item.published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => handleDelete(item._id)} className="btn-danger">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-ink/50">No items yet.</p>}
        </div>
      </div>
    </Layout>
  );
};

export default StudyAdmin;
