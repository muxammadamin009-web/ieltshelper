import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

// Previously there was no catch-all route, so any mistyped or stale URL
// (a bad bookmark, an old link to a deleted passage, a typo) rendered a
// blank white page with the header/footer missing entirely. This gives
// people somewhere useful to go instead.
const NotFound = () => (
  <Layout>
    <div className="max-w-lg mx-auto px-6 pt-24 pb-24 text-center animate-fade-up">
      <p className="font-serif text-6xl font-semibold text-teal/30">404</p>
      <h1 className="font-serif text-2xl font-semibold mt-4">Page not found</h1>
      <p className="text-sm text-ink/60 mt-2 leading-relaxed">
        The page you're looking for doesn't exist, or may have moved.
      </p>
      <Link to="/" className="btn-primary inline-block mt-6">
        Back to home
      </Link>
    </div>
  </Layout>
);

export default NotFound;
