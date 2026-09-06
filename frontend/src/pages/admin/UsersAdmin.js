import { useEffect, useState } from 'react';
import api from '../../api/api';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';

const GiftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8M2 8h20v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8ZM12 21V8M12 8C10.5 8 8 7 8 5a2 2 0 0 1 4-.6M12 8c1.5 0 4-1 4-3a2 2 0 0 0-4-.6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const DURATIONS = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: '1y', label: '1 year' },
  { key: 'lifetime', label: 'Lifetime' },
];

const isActive = (u) => ['active', 'trialing'].includes(u?.subscription?.status);

const formatExpiry = (u) => {
  if (!isActive(u)) return null;
  if (!u.subscription.expiresAt) return 'Lifetime access';
  const d = new Date(u.subscription.expiresAt);
  return `Until ${d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
};

const GiftPanel = ({ user, onGrant, busy }) => {
  const [duration, setDuration] = useState('30d');
  const [plan, setPlan] = useState('yearly');

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-line animate-fade-in">
      <select
        className="field text-xs w-auto py-1.5"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      >
        {DURATIONS.map((d) => (
          <option key={d.key} value={d.key}>
            {d.label}
          </option>
        ))}
      </select>
      <select
        className="field text-xs w-auto py-1.5"
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
      >
        <option value="monthly">Monthly plan</option>
        <option value="yearly">Yearly plan</option>
      </select>
      <button
        disabled={busy}
        onClick={() => onGrant(user, duration, plan)}
        className="btn-primary py-1.5 inline-flex items-center gap-1.5"
      >
        <GiftIcon /> Gift subscription
      </button>
    </div>
  );
};

const UserRow = ({ user, onGrant, onRevoke, busyId }) => {
  const [open, setOpen] = useState(false);
  const active = isActive(user);
  const busy = busyId === user._id;

  return (
    <div className="card py-4 hover:border-teal/40 transition-colors animate-fade-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-[180px]">
          <p className="text-sm font-medium flex items-center gap-2">
            {user.name}
            {user.role === 'admin' && (
              <span className="badge bg-gold-light text-gold">Admin</span>
            )}
          </p>
          <p className="text-xs text-ink/50 mt-0.5">{user.email}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={active ? 'badge bg-teal-light text-teal' : 'badge bg-panel text-ink/50'}>
            {active ? formatExpiry(user) : 'No subscription'}
          </span>

          {user.role !== 'admin' && (
            <>
              <button
                onClick={() => setOpen((o) => !o)}
                disabled={busy}
                className="btn-secondary py-1.5 inline-flex items-center gap-1.5"
              >
                <GiftIcon /> {open ? 'Cancel' : 'Gift'}
              </button>
              {active && (
                <button
                  onClick={() => onRevoke(user)}
                  disabled={busy}
                  className="btn-danger"
                >
                  Revoke
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {open && user.role !== 'admin' && (
        <GiftPanel
          user={user}
          busy={busy}
          onGrant={(u, duration, plan) => {
            onGrant(u, duration, plan);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
};

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const load = (search = '') => {
    setLoading(true);
    api
      .get('/admin/users', { params: search ? { search } : {} })
      .then((res) => setUsers(res.data.users))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => load(query), 300); // debounce search
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleGrant = async (user, duration, plan) => {
    setBusyId(user._id);
    try {
      const res = await api.put(`/admin/users/${user._id}/subscription`, { duration, plan });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? res.data.user : u)));
      const label = DURATIONS.find((d) => d.key === duration)?.label || duration;
      setToast({ type: 'success', message: `Gifted ${label} of ${plan} access to ${user.name}.` });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to gift subscription' });
    } finally {
      setBusyId(null);
    }
  };

  const handleRevoke = async (user) => {
    if (!window.confirm(`Revoke ${user.name}'s active subscription?`)) return;
    setBusyId(user._id);
    try {
      const res = await api.delete(`/admin/users/${user._id}/subscription`);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? res.data.user : u)));
      setToast({ type: 'success', message: `Revoked ${user.name}'s subscription.` });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to revoke subscription' });
    } finally {
      setBusyId(null);
    }
  };

  const activeCount = users.filter(isActive).length;

  return (
    <Layout>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="max-w-4xl mx-auto px-6 pt-12 pb-24">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-serif text-2xl font-semibold">Users &amp; subscriptions</h1>
            <p className="text-sm text-ink/60 mt-1 max-w-lg">
              Search for anyone who's signed up and gift them free access — no payment involved.
              Great for beta testers, support cases, or just being generous.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="card py-3 px-4 text-center">
              <p className="font-serif text-xl font-semibold text-teal">{users.length}</p>
              <p className="text-[11px] text-ink/50 mt-0.5">Total users</p>
            </div>
            <div className="card py-3 px-4 text-center">
              <p className="font-serif text-xl font-semibold text-teal">{activeCount}</p>
              <p className="text-[11px] text-ink/50 mt-0.5">Active subs</p>
            </div>
          </div>
        </div>

        <div className="relative mt-6 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40">
            <SearchIcon />
          </span>
          <input
            className="field pl-9"
            placeholder="Search by name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {error && <p className="mt-6 text-sm text-brick">{error}</p>}

        <div className="mt-6 space-y-3">
          {loading && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card py-4 animate-pulse-soft">
                  <div className="h-4 w-40 bg-line/60 rounded" />
                  <div className="h-3 w-56 bg-line/40 rounded mt-2" />
                </div>
              ))}
            </div>
          )}

          {!loading &&
            users.map((u) => (
              <UserRow key={u._id} user={u} onGrant={handleGrant} onRevoke={handleRevoke} busyId={busyId} />
            ))}

          {!loading && users.length === 0 && !error && (
            <p className="text-sm text-ink/50 py-8 text-center">
              {query ? 'No users match that search.' : 'No users yet.'}
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UsersAdmin;
