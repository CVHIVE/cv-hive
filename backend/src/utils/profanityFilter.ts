/**
 * Profanity filter utility for validating user names.
 * Contains a comprehensive list of blocked words and validation helpers.
 */

const PROFANITY_LIST: string[] = [
  // Common English profanity / swear words
  'ass', 'asshole', 'bastard', 'bitch', 'bloody', 'bollocks', 'bugger',
  'bullshit', 'crap', 'cunt', 'damn', 'dick', 'dickhead', 'douchebag',
  'fag', 'faggot', 'fuck', 'fucking', 'fucker', 'goddamn', 'hell',
  'idiot', 'jerk', 'motherfucker', 'nigger', 'nigga', 'piss', 'prick',
  'pussy', 'shit', 'shithead', 'slut', 'son of a bitch', 'twat', 'wanker',
  'whore', 'arse', 'arsehole', 'bellend', 'knob', 'knobhead', 'tosser',
  'slag', 'minger', 'pillock', 'plonker', 'sod', 'git', 'numpty',
  'dipshit', 'dumbass', 'jackass', 'scumbag', 'skank', 'tramp',
  'retard', 'retarded', 'spastic', 'moron', 'imbecile',
  'cock', 'cocksucker', 'ballsack', 'blowjob', 'boob', 'dildo',
  'pornstar', 'penis', 'vagina', 'tits', 'titties',
  // Slurs and hate terms
  'chink', 'gook', 'kike', 'spic', 'wetback', 'cracker',
  'honky', 'redneck', 'beaner', 'coon', 'darkie', 'paki',
  // Common attempts to disguise profanity
  'phuck', 'phuk', 'fuk', 'fck', 'fcuk', 'fuc', 'sh1t', 'b1tch',
  'a55', 'a$$', 'd1ck', 'p1ss', 'c0ck', 'pr1ck', 'stfu', 'gtfo',
  'wtf', 'lmfao',
];

/**
 * Check if a given text contains any profanity.
 * Checks each word in the text against the profanity list.
 */
export function containsProfanity(text: string): boolean {
  const normalized = text.toLowerCase().trim();

  // Check full text against multi-word profanity
  for (const word of PROFANITY_LIST) {
    if (word.includes(' ')) {
      if (normalized.includes(word)) return true;
    }
  }

  // Check individual words
  const words = normalized.split(/[\s\-_.]+/);
  for (const w of words) {
    // Strip common punctuation from edges
    const cleaned = w.replace(/[^a-z0-9]/g, '');
    if (cleaned && PROFANITY_LIST.includes(cleaned)) {
      return true;
    }
  }

  return false;
}

/**
 * Validate that a name contains at least a first name and last name.
 * Each name part must be at least 2 characters and contain only valid characters.
 */
export function isValidFullName(name: string): { valid: boolean; message?: string } {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, message: 'Full name is required' };
  }

  // Split by whitespace
  const parts = trimmed.split(/\s+/).filter((p) => p.length > 0);

  if (parts.length < 2) {
    return { valid: false, message: 'Please enter both your first name and last name' };
  }

  // Each part should be at least 2 characters
  for (const part of parts) {
    if (part.length < 2) {
      return { valid: false, message: 'Each name must be at least 2 characters long' };
    }
  }

  // Only allow letters, hyphens, apostrophes, and spaces (supports international characters)
  const nameRegex = /^[a-zA-Z\u00C0-\u024F\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\s'\-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { valid: false, message: 'Name can only contain letters, hyphens, and apostrophes' };
  }

  // Check for profanity
  if (containsProfanity(trimmed)) {
    return { valid: false, message: 'Name contains inappropriate language. Please enter your real name.' };
  }

  return { valid: true };
}
