// Heuristic (non-AI) writing feedback generator.
//
// IMPORTANT: This does NOT do real IELTS Writing grading. Genuine band
// scoring for Task Achievement, Coherence & Cohesion, Lexical Resource, and
// Grammatical Range needs either a human examiner or an LLM call. What's
// here is a lightweight, deterministic stand-in so the feature works with
// zero external dependencies/keys, covering the mechanical checks a human
// or an LLM would also start with (length, sentence variety, repetition),
// plus a rough band estimate so students get *something* immediately.
//
// To upgrade this to real AI grading later: call the Anthropic API from
// here with the essay + task prompt + official band descriptors, and parse
// a structured JSON response for scores per criterion. Everything else in
// the writing module (models/routes/UI) already expects this same
// return shape, so swapping this function's internals is the only change
// needed.

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

const countSentences = (text) => {
  const matches = text.match(/[^.!?]+[.!?]+/g);
  return matches ? matches.length : text.trim() ? 1 : 0;
};

const countParagraphs = (text) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean).length;

const typeTokenRatio = (text) => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 0;
  const unique = new Set(words);
  return unique.size / words.length;
};

const generateWritingFeedback = (essayText, task) => {
  const wordCount = countWords(essayText);
  const sentenceCount = countSentences(essayText);
  const paragraphCount = countParagraphs(essayText);
  const avgSentenceLength = sentenceCount ? Math.round(wordCount / sentenceCount) : 0;
  const ttr = typeTokenRatio(essayText);
  const minWords = task?.minWords || (task?.taskType === 'task1' ? 150 : 250);

  const notes = [];
  let bandEstimate = 6;

  // Length
  if (wordCount < minWords) {
    notes.push(
      `Under the ${minWords}-word minimum for this task (you wrote ${wordCount}). Under-length responses are penalized on Task Achievement.`
    );
    bandEstimate -= 1;
  } else if (wordCount > minWords * 2.2) {
    notes.push(
      `Quite long (${wordCount} words). Length itself isn't scored, but longer essays under time pressure often lose accuracy — check you're not padding.`
    );
  } else {
    notes.push(`Length looks appropriate (${wordCount} words, minimum is ${minWords}).`);
    bandEstimate += 0.5;
  }

  // Paragraphing
  if (paragraphCount < 3) {
    notes.push(
      'Only ' +
        paragraphCount +
        ' paragraph(s) detected. IELTS essays are usually scored higher with clear intro / body / conclusion structure — use blank lines between paragraphs.'
    );
    bandEstimate -= 0.5;
  } else {
    notes.push(`${paragraphCount} paragraphs — reasonable structure.`);
  }

  // Sentence variety
  if (avgSentenceLength > 0 && avgSentenceLength < 8) {
    notes.push(
      'Average sentence length is short — try combining some ideas with linking words (although, whereas, which) to show grammatical range.'
    );
    bandEstimate -= 0.5;
  } else if (avgSentenceLength > 30) {
    notes.push(
      'Average sentence length is very long — very long sentences often lose control of grammar. Consider splitting some up.'
    );
    bandEstimate -= 0.5;
  } else if (avgSentenceLength > 0) {
    notes.push(`Average sentence length: ${avgSentenceLength} words — reasonable variety is possible here.`);
  }

  // Vocabulary diversity
  if (ttr > 0) {
    if (ttr < 0.4) {
      notes.push(
        'Vocabulary repetition looks high (lots of repeated words). Try synonyms for words you use more than a couple of times.'
      );
      bandEstimate -= 0.5;
    } else if (ttr > 0.65) {
      notes.push('Good lexical variety — you are not repeating the same words too often.');
      bandEstimate += 0.5;
    }
  }

  bandEstimate = Math.max(2.5, Math.min(8.5, Math.round(bandEstimate * 2) / 2));

  return {
    wordCount,
    sentenceCount,
    paragraphCount,
    avgSentenceLength,
    bandEstimate,
    notes,
    disclaimer:
      'This is an automated, heuristic estimate based on length/structure/vocabulary checks — not an official IELTS band. Use it to catch mechanical issues, and get a human or a full AI-grading pass for a real score.',
  };
};

module.exports = { generateWritingFeedback };
