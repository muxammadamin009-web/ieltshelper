// Rough IELTS-style band estimator (0-9 scale) from a raw percentage score.
// This is an APPROXIMATION for student motivation/tracking purposes only —
// real IELTS band conversion tables differ slightly between Reading and
// Listening, and between Academic and General Training. Treat this as a
// "roughly where you'd land" indicator, not an official score.
const BANDS = [
  { min: 97, band: 9 },
  { min: 90, band: 8.5 },
  { min: 83, band: 8 },
  { min: 75, band: 7.5 },
  { min: 67, band: 7 },
  { min: 59, band: 6.5 },
  { min: 50, band: 6 },
  { min: 42, band: 5.5 },
  { min: 34, band: 5 },
  { min: 27, band: 4.5 },
  { min: 20, band: 4 },
  { min: 13, band: 3.5 },
  { min: 7, band: 3 },
  { min: 0, band: 2.5 },
];

const percentToBand = (percent) => {
  if (percent === null || percent === undefined || Number.isNaN(percent)) return null;
  const clamped = Math.max(0, Math.min(100, percent));
  const match = BANDS.find((b) => clamped >= b.min);
  return match ? match.band : 0;
};

const scoreToBand = (score, totalQuestions) => {
  if (!totalQuestions) return null;
  return percentToBand((score / totalQuestions) * 100);
};

module.exports = { percentToBand, scoreToBand };
