import Layout from '../components/Layout';
import TranslatorWidget from '../components/TranslatorWidget';

const Translator = () => {
  return (
    <Layout>
      <div className="max-w-md mx-auto px-6 pt-12 pb-24">
        <h1 className="font-serif text-2xl font-semibold mb-2">Translator</h1>
        <p className="text-sm text-ink/60 mb-6">
          Quick lookups for words you don't recognize while reading.
        </p>
        <TranslatorWidget defaultOpen />
      </div>
    </Layout>
  );
};

export default Translator;
