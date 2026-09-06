import { useState } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'ru', label: 'Russian' },
  { code: 'uz', label: 'Uzbek' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'tr', label: 'Turkish' },
];

// Compact, collapsible translator — meant to sit next to a passage so
// students can look up a word without leaving the page. Uses the free
// MyMemory API (no key required, reasonable for occasional lookups).
const TranslatorWidget = ({ defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [text, setText] = useState('');
  const [from, setFrom] = useState('en');
  const [to, setTo] = useState('es');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const translate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResult('');
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
      );
      const data = await res.json();
      setResult(data.responseData?.translatedText || 'No translation found');
    } catch (err) {
      setError('Translation service is unavailable right now');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium">Translator</span>
        <span className="text-ink/40 text-sm">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <select
              className="field text-xs"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <select
              className="field text-xs"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <textarea
            rows={2}
            className="field text-sm"
            placeholder="Type a word or phrase..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button onClick={translate} disabled={loading} className="btn-primary w-full">
            {loading ? 'Translating…' : 'Translate'}
          </button>

          {error && <p className="text-xs text-brick">{error}</p>}
          {result && (
            <p className="text-sm bg-panel rounded-md px-3 py-2">{result}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TranslatorWidget;
