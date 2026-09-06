import { useEffect } from 'react';

// Small self-contained toast used for one-off action feedback (saved,
// granted, revoked, failed...). Callers own the { message, type } state and
// just render <Toast toast={toast} onClose={...} /> — this component only
// handles the animation and the auto-dismiss timer.
const Toast = ({ toast, onClose, duration = 3200 }) => {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        role="status"
        className={`animate-toast-in pointer-events-auto flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ${
          isError
            ? 'bg-brick-light/95 border-brick/30 text-brick'
            : 'bg-teal-light/95 border-teal/30 text-teal-dark'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${isError ? 'bg-brick' : 'bg-teal'} animate-pulse-soft`}
        />
        {toast.message}
      </div>
    </div>
  );
};

export default Toast;
