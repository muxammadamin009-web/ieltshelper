import { useState } from 'react';

// Asks for confirmation twice before logging out, since this is a
// destructive-feeling action (kicks you back to the login screen).
const LogoutConfirmModal = ({ onConfirm, onCancel }) => {
  const [step, setStep] = useState(1);

  const copy =
    step === 1
      ? {
          title: 'Log out?',
          body: "You'll be signed out of your account on this device.",
          confirmLabel: 'Yes, log out',
        }
      : {
          title: 'Just checking',
          body: "You'll need your email and password to sign back in. Ready to go?",
          confirmLabel: 'Log me out',
        };

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center px-6 z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
    >
      <div className="card max-w-sm w-full animate-scale-in">
        <h2 id="logout-confirm-title" className="font-serif text-xl font-semibold mb-3">
          {copy.title}
        </h2>
        <p className="text-sm text-ink/70 leading-relaxed">{copy.body}</p>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={() => (step === 1 ? setStep(2) : onConfirm())}
            className="btn-primary flex-1"
          >
            {copy.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
