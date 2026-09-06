// Short, original practice articles used when no NEWS_API_KEY is configured
// (or the live request fails). These are NOT real news - they're clearly
// labelled sample content so students always have something to read.
const FALLBACK_ARTICLES = [
  {
    id: 'sample-1',
    title: 'Cities experiment with shorter work weeks',
    description:
      'A handful of local governments in the US are trialling four-day work weeks for public employees, aiming to measure the effect on productivity, hiring, and staff wellbeing before deciding whether to make the change permanent.',
    source: 'Practice Wire',
    url: '',
    imageQuery: 'city office workers',
  },
  {
    id: 'sample-2',
    title: 'Community gardens spread across small towns',
    description:
      'Small towns across the Midwest are converting unused lots into community gardens, giving residents a place to grow vegetables, meet neighbours, and cut down on grocery costs during the summer months.',
    source: 'Practice Wire',
    url: '',
    imageQuery: 'community garden',
  },
  {
    id: 'sample-3',
    title: 'Library systems expand free tutoring programs',
    description:
      'Public library systems in several states are expanding after-school tutoring programs, pairing volunteer tutors with students who need extra help in reading and math, at no cost to families.',
    source: 'Practice Wire',
    url: '',
    imageQuery: 'public library students',
  },
  {
    id: 'sample-4',
    title: 'Coastal towns invest in flood barriers',
    description:
      'Several coastal towns are investing in new flood barriers and updated drainage systems ahead of the next storm season, following a series of engineering studies that flagged ageing infrastructure as a risk.',
    source: 'Practice Wire',
    url: '',
    imageQuery: 'coastal town infrastructure',
  },
  {
    id: 'sample-5',
    title: 'Regional airports add direct routes',
    description:
      'A number of mid-sized regional airports are adding new direct routes this year, responding to steady growth in demand from travellers who want to avoid connecting through larger hub airports.',
    source: 'Practice Wire',
    url: '',
    imageQuery: 'regional airport',
  },
  {
    id: 'sample-6',
    title: 'Universities pilot open textbook programs',
    description:
      'A group of state universities is piloting an open textbook program, replacing costly commercial textbooks with freely licensed alternatives in introductory courses to reduce costs for first-year students.',
    source: 'Practice Wire',
    url: '',
    imageQuery: 'university library students',
  },
];

// @route GET /api/news
// Returns a small list of short articles for reading practice. Uses a real
// US headlines API when NEWS_API_KEY is set in the environment; otherwise
// (or if the live call fails for any reason) falls back to the sample set
// above so the dashboard never looks empty.
const getNews = async (req, res) => {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ source: 'sample', articles: FALLBACK_ARTICLES });
  }

  try {
    const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=8&apiKey=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`News API responded with ${response.status}`);

    const data = await response.json();
    const articles = (data.articles || [])
      .filter((a) => a.title && a.description)
      .map((a, i) => ({
        id: `live-${i}`,
        title: a.title,
        description: a.description,
        source: a.source?.name || 'News',
        url: a.url,
        imageUrl: a.urlToImage || '',
      }));

    if (articles.length === 0) throw new Error('No usable articles returned');

    return res.status(200).json({ source: 'live', articles });
  } catch (err) {
    // Never let a flaky external API break the dashboard - just fall back.
    return res.status(200).json({
      source: 'sample',
      articles: FALLBACK_ARTICLES,
      note: 'Live news unavailable right now, showing practice articles instead.',
    });
  }
};

module.exports = { getNews };
