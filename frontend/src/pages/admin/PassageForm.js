import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';

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

const UploadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 15V4M12 4 8 8M12 4l4 4M5 16v2.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V16"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const emptyQuestion = {
  type: 'multiple_choice',
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  order: 0,
};

const PassageForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [passage, setPassage] = useState({
    title: '',
    type: 'reading',
    difficulty: 'intermediate',
    bodyText: '',
    bodyFormat: 'text',
    attachmentUrl: '',
    attachmentName: '',
    audioUrl: '',
    externalUrl: '',
    durationMinutes: null,
    published: false,
  });
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState(emptyQuestion);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isEditing) return;
    api.get('/admin/passages').then((res) => {
      const found = res.data.passages.find((p) => p._id === id);
      if (found) setPassage(found);
    });
    api
      .get(`/admin/passages/${id}/questions`)
      .then((res) => setQuestions(res.data.questions));
  }, [id, isEditing]);

  const savePassage = async () => {
    try {
      if (isEditing) {
        await api.put(`/admin/passages/${id}`, passage);
        setToast({ type: 'success', message: 'Passage saved.' });
      } else {
        const res = await api.post('/admin/passages', passage);
        navigate(`/admin/edit/${res.data.passage._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save passage');
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to save passage' });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/admin/upload', formData);

      if (res.data.kind === 'text') {
        setPassage((p) => ({
          ...p,
          bodyText: res.data.bodyText,
          bodyFormat: res.data.bodyFormat,
        }));
      } else if (res.data.kind === 'audio') {
        setPassage((p) => ({
          ...p,
          audioUrl: res.data.audioUrl,
        }));
      } else {
        setPassage((p) => ({
          ...p,
          attachmentUrl: res.data.fileUrl,
          attachmentName: res.data.fileName,
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addQuestion = async () => {
    try {
      const payload = {
        ...newQuestion,
        options: ['multiple_choice', 'matching_headings'].includes(newQuestion.type)
          ? newQuestion.options.filter(Boolean)
          : [],
      };
      const res = await api.post(`/admin/passages/${id}/questions`, payload);
      setQuestions((prev) => [...prev, res.data.question]);
      setNewQuestion(emptyQuestion);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    }
  };

  const deleteQuestion = async (qid) => {
    await api.delete(`/admin/questions/${qid}`);
    setQuestions((prev) => prev.filter((q) => q._id !== qid));
  };

  return (
    <Layout>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        <h1 className="font-serif text-2xl font-semibold mb-6">
          {isEditing ? 'Edit passage' : 'New passage'}
        </h1>
        {error && <p className="mb-4 text-sm text-brick">{error}</p>}

        <div className="card space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              className="field"
              value={passage.title}
              onChange={(e) => setPassage({ ...passage, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                className="field"
                value={passage.type}
                onChange={(e) => setPassage({ ...passage, type: e.target.value })}
              >
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
              </select>
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select
                className="field"
                value={passage.difficulty}
                onChange={(e) => setPassage({ ...passage, difficulty: e.target.value })}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {passage.type === 'listening' && (
            <div>
              <label className="label">Audio URL</label>
              <input
                className="field"
                placeholder="Upload an audio file below, or paste a URL directly"
                value={passage.audioUrl}
                onChange={(e) => setPassage({ ...passage, audioUrl: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="label">
              Time limit override (minutes, optional)
            </label>
            <input
              type="number"
              min="1"
              className="field max-w-[160px]"
              placeholder={passage.type === 'listening' ? 'Default: 30' : 'Default: 60'}
              value={passage.durationMinutes ?? ''}
              onChange={(e) =>
                setPassage({
                  ...passage,
                  durationMinutes: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
            <p className="text-xs text-ink/60 mt-1">
              Leave blank to use the standard IELTS timing (60 min reading / 30 min
              listening) shown as a countdown on the test page.
            </p>
          </div>

          <div className="rounded-md border border-teal/30 bg-teal-light/40 p-4 space-y-2">
            <label className="label flex items-center gap-1.5">
              <ExternalLinkIcon /> External test URL (optional)
            </label>
            <input
              className="field"
              placeholder="https://... e.g. a Google Form or another platform"
              value={passage.externalUrl}
              onChange={(e) => setPassage({ ...passage, externalUrl: e.target.value })}
            />
            <p className="text-xs text-ink/60 leading-relaxed">
              If this {passage.type} test actually lives somewhere else, paste the link
              here. Students will see a "Go to test" button that opens it in a new tab,
              instead of answering inline on this site.
            </p>
          </div>

          <div className="rounded-md border border-line bg-panel/60 p-4 space-y-3">
            <label className="label flex items-center gap-1.5">
              <UploadIcon /> Upload a file (optional)
            </label>
            <p className="text-xs text-ink/60 leading-relaxed">
              Drop in an <code>.html</code> or <code>.txt</code> file and its content
              fills the body below automatically. An audio file (mp3/wav/m4a/ogg/aac)
              fills in the Audio URL field below automatically. Any other file (PDF,
              DOCX, image…) is attached as a downloadable resource instead.
            </p>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="text-sm text-ink/70 file:mr-3 file:py-2 file:px-3 file:rounded-md
                         file:border-0 file:text-sm file:font-medium
                         file:bg-teal file:text-white hover:file:bg-teal-dark file:cursor-pointer"
            />
            {uploading && <p className="text-xs text-teal">Uploading…</p>}
            {passage.bodyFormat === 'html' && passage.bodyText && (
              <p className="text-xs text-teal bg-teal-light rounded px-2 py-1 inline-block">
                HTML loaded — it'll be rendered as formatted markup for students, not plain text.
              </p>
            )}
            {passage.attachmentUrl && (
              <div className="flex items-center gap-3 text-sm bg-paper border border-line rounded-md px-3 py-2">
                <span className="truncate">{passage.attachmentName || 'Attachment'}</span>
                <button
                  type="button"
                  onClick={() => setPassage({ ...passage, attachmentUrl: '', attachmentName: '' })}
                  className="btn-danger shrink-0 ml-auto"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="label">
              Body text {passage.type === 'listening' && '(transcript, optional)'}
              {passage.bodyFormat === 'html' && ' — HTML'}
            </label>
            <textarea
              rows={8}
              className="field font-mono text-xs"
              value={passage.bodyText}
              onChange={(e) => setPassage({ ...passage, bodyText: e.target.value })}
            />
            {passage.bodyFormat === 'html' && (
              <button
                type="button"
                onClick={() => setPassage({ ...passage, bodyFormat: 'text' })}
                className="text-xs text-ink/50 hover:text-teal hover:underline mt-1"
              >
                Treat as plain text instead
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-teal"
              checked={passage.published}
              onChange={(e) => setPassage({ ...passage, published: e.target.checked })}
            />
            Published (visible to students)
          </label>

          <button onClick={savePassage} className="btn-primary">
            {isEditing ? 'Save changes' : 'Create passage'}
          </button>
        </div>

        {isEditing && (
          <div className="mt-10">
            <h2 className="font-serif text-lg font-semibold mb-4">Questions</h2>

            <div className="space-y-2 mb-6">
              {questions.map((q, i) => (
                <div
                  key={q._id}
                  className="flex items-start justify-between bg-paper border border-line rounded-md px-4 py-3 text-sm"
                >
                  <div>
                    <span className="text-ink/50">
                      {i + 1}. [{q.type.replace(/_/g, ' ')}]
                    </span>{' '}
                    {q.questionText}
                    <p className="text-xs text-ink/40 mt-1">
                      Answer: {JSON.stringify(q.correctAnswer)}
                    </p>
                  </div>
                  <button onClick={() => deleteQuestion(q._id)} className="btn-danger shrink-0 ml-4">
                    Delete
                  </button>
                </div>
              ))}
              {questions.length === 0 && (
                <p className="text-sm text-ink/50">No questions yet.</p>
              )}
            </div>

            <div className="card space-y-4">
              <h3 className="text-sm font-medium">Add a question</h3>

              <select
                className="field"
                value={newQuestion.type}
                onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
              >
                <option value="multiple_choice">Multiple choice</option>
                <option value="true_false_notgiven">True / False / Not Given</option>
                <option value="fill_in_blank">Fill in the blank</option>
                <option value="matching_headings">Matching headings</option>
                <option value="short_answer">Short answer</option>
              </select>

              <input
                placeholder="Question text"
                className="field"
                value={newQuestion.questionText}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, questionText: e.target.value })
                }
              />

              {['multiple_choice', 'matching_headings'].includes(newQuestion.type) && (
                <div className="space-y-2">
                  <label className="label">Options</label>
                  {newQuestion.options.map((opt, i) => (
                    <input
                      key={i}
                      placeholder={`Option ${i + 1}`}
                      className="field"
                      value={opt}
                      onChange={(e) => {
                        const opts = [...newQuestion.options];
                        opts[i] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: opts });
                      }}
                    />
                  ))}
                </div>
              )}

              <div>
                <label className="label">Correct answer</label>
                <input
                  className="field"
                  placeholder='e.g. an option value, or "true"'
                  value={newQuestion.correctAnswer}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })
                  }
                />
              </div>

              <button onClick={addQuestion} className="btn-secondary">
                Add question
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PassageForm;
