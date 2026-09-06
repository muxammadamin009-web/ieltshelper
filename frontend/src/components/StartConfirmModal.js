const StartConfirmModal = ({ onConfirm, onCancel }) => {
  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center px-6 z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="start-confirm-title"
    >
      <div className="card max-w-md w-full animate-scale-in">
        <h2 id="start-confirm-title" className="font-serif text-xl font-semibold mb-3">
          Before you start
        </h2>
        <p className="text-sm text-ink/70 leading-relaxed">
          This test only tells you something useful if you take it the way
          you'd take the real IELTS: on your own, without searching for
          answers or asking someone else. Treat it like exam day — it's the
          only way to know your actual level.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Not now
          </button>
          <button onClick={onConfirm} className="btn-primary flex-1">
            I'll do it myself — start
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartConfirmModal;
