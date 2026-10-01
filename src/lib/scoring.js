// Scores a journal entry.
//
// TEMPORARY: this is a fake, keyword-based scorer so the app works end to end
// without an AI. Later, this function will call our server (Supabase Edge
// Function), which asks Claude to score the entry. The rest of the app won't
// need to change, because the AI will return the same shape:
//
//   { body: 0-1, mind: 0-1, tags: string[], systemMessage: string }

const BODY_WORDS = [
  'workout', 'gym', 'lift', 'squat', 'deadlift', 'bench', 'push-up', 'pushup',
  'pull-up', 'pullup', 'run', 'ran', 'jog', 'cardio', 'swim', 'hike', 'cycle',
  'bike', 'calisthenics', 'sprint', 'train', 'yoga', 'climb', 'walk',
]
const MIND_WORDS = [
  'study', 'studied', 'read', 'learn', 'meditat', 'code', 'coding', 'program',
  'practice', 'wrote', 'write', 'math', 'course', 'lecture', 'research',
  'exam', 'homework', 'book', 'language', 'chess', 'solve',
]
const INTENSE_WORDS = [
  'exhaust', 'brutal', 'intense', 'hard', 'heavy', 'personal best', 'pr ',
  'destroyed', 'grueling', 'difficult', 'pushed', 'deep', 'focused', 'hours',
]
const EASY_WORDS = ['light', 'easy', 'short', 'quick', 'walk', 'stretch', 'a bit', 'skimmed']

function matches(text, words) {
  return words.filter((w) => text.includes(w))
}

function scoreStat(text, statWords) {
  const hits = matches(text, statWords)
  if (hits.length === 0) return { score: 0, hits }

  let score = 0.3
  score += Math.min(hits.length - 1, 3) * 0.1
  if (matches(text, INTENSE_WORDS).length > 0) score += 0.3
  if (matches(text, EASY_WORDS).length > 0) score = Math.min(score, 0.3)

  return { score: Math.round(Math.min(score, 1) * 10) / 10, hits }
}

function systemMessage(body, mind) {
  if (body === 0 && mind === 0) {
    return 'The System observes. Nothing stirs. Rest is permitted — stagnation is not.'
  }
  const parts = []
  if (body > 0) parts.push(`BODY +${body}`)
  if (mind > 0) parts.push(`MIND +${mind}`)
  const flavor =
    body >= mind
      ? 'Your flesh remembers the strain.'
      : 'The fog recedes, if only slightly.'
  return `${flavor} ${parts.join('  ·  ')}`
}

export async function scoreEntry(rawText) {
  // Simulate the delay of a real AI call.
  await new Promise((resolve) => setTimeout(resolve, 600))

  const text = rawText.toLowerCase()
  const body = scoreStat(text, BODY_WORDS)
  const mind = scoreStat(text, MIND_WORDS)

  return {
    body: body.score,
    mind: mind.score,
    tags: [...body.hits, ...mind.hits],
    systemMessage: systemMessage(body.score, mind.score),
  }
}
