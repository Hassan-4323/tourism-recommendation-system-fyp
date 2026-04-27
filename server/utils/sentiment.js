const POSITIVE_WORDS = [
  'amazing','awesome','beautiful','best','clean','comfortable','excellent','fantastic','friendly','good','great','helpful','love','loved','nice','perfect','recommended','safe','smooth','wonderful','enjoyed','enjoyable','outstanding'
];

const NEGATIVE_WORDS = [
  'bad','boring','crowded','delay','delayed','dirty','disappointing','expensive','hard','horrible','issue','issues','poor','problem','rude','slow','terrible','uncomfortable','unsafe','worst'
];

function analyzeSentiment(text = '') {
  const words = String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  let score = 0;
  words.forEach((word) => {
    if (POSITIVE_WORDS.includes(word)) score += 1;
    if (NEGATIVE_WORDS.includes(word)) score -= 1;
  });

  let label = 'Neutral';
  if (score >= 2) label = 'Positive';
  else if (score <= -2) label = 'Negative';

  return { label, score };
}

module.exports = { analyzeSentiment };
