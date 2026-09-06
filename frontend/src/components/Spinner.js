// Small centered spinner used for full-page loading states (route guards,
// initial data fetch) — replaces plain "Loading..." text.
const Spinner = ({ label = 'Loading…' }) => (
  <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-ink/50">
    <span className="w-8 h-8 rounded-full border-2 border-line border-t-teal animate-spin" />
    <p className="text-sm">{label}</p>
  </div>
);

export default Spinner;
