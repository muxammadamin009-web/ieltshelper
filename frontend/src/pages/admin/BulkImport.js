import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Layout from '../../components/Layout';

const SAMPLE = `{
  "title": "The History of Tea",
  "type": "reading",
  "difficulty": "intermediate",
  "bodyText": "Paste the full passage text here...",
  "published": false,
  "questions": [
    {
      "type": "multiple_choice",
      "questionText": "Where was tea first cultivated?",
      "options": ["China", "India", "England", "Brazil"],
      "correctAnswer": "China",
      "order": 1
    },
    {
      "type": "true_false_notgiven",
      "questionText": "Tea was originally used as medicine.",
      "correctAnswer": "true",
      "order": 2
    },
    {
      "type": "fill_in_blank",
      "questionText": "Tea reached Europe in the ____ century.",
      "correctAnswer": ["17th", "seventeenth"],
      "order": 3
    }
  ]
}`;

const BulkImport = () => {
  const [jsonText, setJsonText] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => setJsonText(event.target.result);
    reader.onerror = () => setError('Could not read that file');
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setError('');
    setSuccess('');

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      setError("That's not valid JSON — check for a missing comma or bracket.");
      return;
    }

    try {
      const res = await api.post('/admin/import', parsed);
      setSuccess(
        `Imported "${res.data.passage.title}" with ${res.data.questions.length} question(s).`
      );
      setTimeout(() => navigate(`/admin/edit/${res.data.passage._id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        <h1 className="font-serif text-2xl font-semibold mb-2">Bulk import</h1>
        <p className="text-sm text-ink/60 mb-6 max-w-lg">
          Upload a <code className="bg-panel px-1 rounded">.json</code> file, or paste JSON
          directly, describing one passage and all of its questions — created in a single step.
        </p>

        <div className="card space-y-4">
          <div>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="text-sm"
            />
            {fileName && <p className="text-xs text-ink/50 mt-1">Loaded: {fileName}</p>}
          </div>

          <textarea
            rows={16}
            className="field font-mono text-xs"
            placeholder="Paste JSON here, or upload a file above"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />

          {error && <p className="text-sm text-brick">{error}</p>}
          {success && <p className="text-sm text-teal">{success}</p>}

          <div className="flex gap-3">
            <button onClick={handleImport} disabled={!jsonText.trim()} className="btn-primary">
              Import
            </button>
            <button onClick={() => setJsonText(SAMPLE)} className="btn-secondary">
              Load sample format
            </button>
          </div>
        </div>

        <details className="mt-6 text-sm">
          <summary className="cursor-pointer text-teal">Expected JSON format</summary>
          <pre className="bg-paper border border-line rounded-md p-4 mt-3 text-xs overflow-x-auto">
            {SAMPLE}
          </pre>
          <p className="text-ink/60 mt-2">
            <code className="bg-panel px-1 rounded">correctAnswer</code> can be a single string,
            or an array of acceptable strings — useful for fill-in-blank where spelling variants
            should count, e.g. <code className="bg-panel px-1 rounded">["17th", "seventeenth"]</code>.
          </p>
        </details>
      </div>
    </Layout>
  );
};

export default BulkImport;
