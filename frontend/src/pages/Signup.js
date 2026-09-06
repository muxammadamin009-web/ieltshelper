import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <Layout>
      <div className="max-w-sm mx-auto px-6 pt-16 pb-24">
        <h1 className="font-serif text-2xl font-semibold mb-6">Create your account</h1>

        {error && (
          <p className="mb-4 text-sm text-brick bg-brick-light rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="mt-1 text-xs text-ink/50">At least 6 characters.</p>
          </div>
          <button type="submit" className="btn-primary w-full">
            Sign up
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/60">
          Already have an account?{' '}
          <Link to="/login" className="text-teal hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default Signup;
