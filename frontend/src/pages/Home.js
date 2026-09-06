import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const FEATURES = [
  {
    title: 'Mock tests',
    body: 'Timed Reading and Listening passages modeled on the real test format, with instant scoring.',
    icon: (
      <path
        d="M6 4.5h9.5L20 9v10.5A1.5 1.5 0 0 1 18.5 21h-13A1.5 1.5 0 0 1 4 19.5v-13A1.5 1.5 0 0 1 5.5 5H6ZM15 4.5V9h4.5M8 12.5h8M8 16h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Track progress',
    body: 'Every attempt is saved, so you can see which question types trip you up before test day.',
    icon: (
      <path
        d="M4 19.5V4.5M4 19.5h16M8 16v-4M12.5 16V8.5M17 16v-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Build the basics',
    body: 'Not ready for a full mock yet? Work through vocabulary and grammar built for pre-IELTS learners.',
    icon: (
      <path
        d="M4 6.2C6.4 5 9 4.7 12 6c3-1.3 5.6-1 8 .2v12c-2.4-1.2-5-1.5-8-.2-3-1.3-5.6-1-8 .2V6.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <section className="relative overflow-hidden">
        {/* Decorative floating gradient blobs — purely visual, aria-hidden,
            and skipped by prefers-reduced-motion via the global rule in
            index.css. */}
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-teal/10 blur-3xl animate-float" />
          <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-gold/10 blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-brick/5 blur-3xl animate-float" />
        </div>

        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16">
          <p className="text-teal font-medium text-sm mb-3 inline-flex items-center gap-2 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block animate-pulse-soft" />
            IELTS Reading &amp; Listening
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight max-w-xl animate-fade-up [animation-delay:80ms]">
            Practice like it's exam day, until it isn't.
          </h1>
          <p className="mt-5 text-ink/70 max-w-md leading-relaxed animate-fade-up [animation-delay:160ms]">
            Full-length mock tests, graded the moment you finish, plus the
            vocabulary and grammar work that gets you ready to take one.
          </p>

          <div className="mt-8 flex items-center gap-3 animate-fade-up [animation-delay:240ms]">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                Go to your dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn-primary">
                  Start practicing
                </Link>
                <Link to="/login" className="btn-secondary">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper">
        <div className="max-w-4xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group animate-fade-up"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-teal-light text-teal flex items-center justify-center mb-3 transition-transform duration-200 ease-smooth group-hover:scale-110 group-hover:rotate-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {f.icon}
                </svg>
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-ink/70 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="max-w-4xl mx-auto px-6 py-16 scroll-mt-16">
        <h2 className="font-serif text-2xl font-semibold mb-6 animate-fade-up">Plans</h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-xl">
          <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-smooth animate-fade-up">
            <h3 className="font-serif text-lg font-semibold">Monthly</h3>
            <p className="font-serif text-3xl font-semibold mt-3">
              $4<span className="text-base font-sans font-normal text-ink/50">/month</span>
            </p>
            <p className="text-sm text-ink/60 mt-1 mb-4">Full access, cancel anytime.</p>
            <Link to="/signup" className="btn-secondary w-full text-center block">
              Choose monthly
            </Link>
          </div>
          <div className="card border-teal relative overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-smooth animate-fade-up [animation-delay:90ms]">
            <span className="absolute top-0 right-0 bg-teal text-white text-[10px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-bl-md">
              Best value
            </span>
            <h3 className="font-serif text-lg font-semibold">Yearly</h3>
            <p className="font-serif text-3xl font-semibold mt-3">
              $30<span className="text-base font-sans font-normal text-ink/50">/year</span>
            </p>
            <p className="text-sm text-ink/60 mt-1 mb-4">
              Works out to $2.50/month — 37% less than paying monthly.
            </p>
            <Link to="/signup" className="btn-primary w-full text-center block">
              Choose yearly
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
