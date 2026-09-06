import { useEffect, useState } from 'react';
import api from '../../api/api';
import Layout from '../../components/Layout';

const empty = {
  title: '',
  taskType: 'task2',
  prompt: '',
  imageUrl: '',
  minWords: '',
  timeMinutes: '',
  published: false,
};

const WritingAdmin = () => {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/admin/writing-tasks').then((res) => setTasks(res.data.tasks));
  };
  useEffect(load, []);

  const handleAdd = async () => {
    try {
      await api.post('/admin/writing-tasks', {
        ...form,
        minWords: form.minWords ? Number(form.minWords) : null,
        timeMinutes: form.timeMinutes ? Number(form.timeMinutes) : null,
      });
      setForm(empty);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task');
    }
  };

  const togglePublish = async (task) => {
    await api.put(`/admin/writing-tasks/${task._id}`, { published: !task.published });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this writing task?')) return;
    await api.delete(`/admin/writing-tasks/${id}`);
    load();
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        <h1 className="font-serif text-2xl font-semibold mb-6">Writing tasks</h1>
        {error && <p className="mb-4 text-sm text-brick">{error}</p>}

        <div className="card space-y-4 mb-8">
          <h2 className="text-sm font-medium">Add task</h2>
          <div className="grid grid-cols-2 gap-4">
            <select
              className="field"
              value={form.taskType}
              onChange={(e) => setForm({ ...form, taskType: e.target.value })}
            >
              <option value="task1">Task 1</option>
              <option value="task2">Task 2</option>
            </select>
            <input
              className="field"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <textarea
            rows={4}
            className="field"
            placeholder="Prompt text"
            value={form.prompt}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
          />
          <input
            className="field"
            placeholder="Chart/diagram image URL (optional, mainly for Task 1)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Min words (optional)</label>
              <input
                type="number"
                className="field"
                placeholder={form.taskType === 'task1' ? 'Default: 150' : 'Default: 250'}
                value={form.minWords}
                onChange={(e) => setForm({ ...form, minWords: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Suggested minutes (optional)</label>
              <input
                type="number"
                className="field"
                placeholder={form.taskType === 'task1' ? 'Default: 20' : 'Default: 40'}
                value={form.timeMinutes}
                onChange={(e) => setForm({ ...form, timeMinutes: e.target.value })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-teal"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Published (visible to students)
          </label>
          <button onClick={handleAdd} className="btn-primary">Add</button>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task._id} className="card flex items-start justify-between">
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  <span className="text-ink/40 uppercase">[{task.taskType}]</span> {task.title}
                </p>
                <p className="text-xs text-ink/60 mt-1 line-clamp-2">{task.prompt}</p>
              </div>
              <div className="flex gap-3 shrink-0 ml-4 text-sm">
                <button onClick={() => togglePublish(task)} className="text-ink/70 hover:underline">
                  {task.published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => handleDelete(task._id)} className="btn-danger">Delete</button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-sm text-ink/50">No writing tasks yet.</p>}
        </div>
      </div>
    </Layout>
  );
};

export default WritingAdmin;
