// moderationConfig.js

// Comprehensive list of banned words and patterns
// \b ensures whole word matching (e.g., "ass" in "bass" won't be censored)
// 'g' for global (all occurrences), 'i' for case-insensitive
export const BANNED_WORDS_PATTERNS = [
  // General profanity
  /\b(fuck|f\*ck|f\*\*k|f\*\*\*|f[u\*]+ck|f[u\*]+k)\b/gi,
  /\b(shit|sh\*t|s\*\*t|sh[i\!1]+t)\b/gi,
  /\b(asshole|a\*\*hole|a\*\*\*\*\*e)\b/gi,
  /\b(bitch|b\*tch|b\*\*\*\*|bi[t7]ch)\b/gi,
  /\b(cunt|c\*nt|c\*\*\*)\b/gi,
  /\b(damn|d\*mn|d\*\*\*)\b/gi,
  /\b(hell|h\*ll|h\*\*\*)\b/gi,
  /\b(dick|d\*ck|d\*\*\*)\b/gi,
  /\b(pussy|p\*ssy|p\*\*\*\*)\b/gi,
  /\b(whore|w\*ore|w\*\*\*\*)\b/gi,
  /\b(slut|s\*ut|s\*\*\*)\b/gi,
  /\b(bastard|b\*stard|b\*\*\*\*\*\*)\b/gi,
  /\b(wanker|w\*nker|w\*\*\*\*\*)\b/gi,
  /\b(twat|t\*at|t\*\*\*)\b/gi,
  /\b(arsehole|a\*\*ehole|a\*\*\*\*\*\*\*)\b/gi,
  
  // Sexual content
  /\b(sex|s\*x|s\*\*)\b/gi,
  /\b(penis|p\*nis|p\*\*\*\*)\b/gi,
  /\b(vagina|v\*gina|v\*\*\*\*\*)\b/gi,
  /\b(boobs|b\*\*bs|b\*\*\*\*)\b/gi,
  /\b(tits|t\*ts|t\*\*\*)\b/gi,
  /\b(anal|a\*al|a\*\*\*)\b/gi,
  /\b(blowjob|b\*owjob|b\*\*\*\*\*\*\*)\b/gi,
  /\b(handjob|h\*ndjob|h\*\*\*\*\*\*\*)\b/gi,
  /\b(masturbat|m\*sturbat|m\*\*\*\*\*\*\*\*)\b/gi,
  /\b(orgasm|o\*gasm|o\*\*\*\*\*)\b/gi,
  /\b(erotic|e\*otic|e\*\*\*\*\*)\b/gi,
  
  // Racial slurs and hate speech
  /\b(n[i1]gg[ae3r]+|n\*gg[ae3r]+|n\*\*\*\*)\b/gi,
  /\b(chink|c\*ink|c\*\*\*\*)\b/gi,
  /\b(spic|s\*ic|s\*\*\*)\b/gi,
  /\b(kike|k\*ke|k\*\*\*)\b/gi,
  /\b(wetback|w\*tback|w\*\*\*\*\*\*\*)\b/gi,
  /\b(cracker|c\*acker|c\*\*\*\*\*\*\*)\b/gi,
  /\b(honky|h\*nky|h\*\*\*\*)\b/gi,
  /\b(redneck|r\*dneck|r\*\*\*\*\*\*\*)\b/gi,
  /\b(terrorist|t\*rrorist|t\*\*\*\*\*\*\*\*\*)\b/gi,
  /\b(white\s*power|w\*ite\s*p\*wer)\b/gi,
  /\b(black\s*power|b\*ack\s*p\*wer)\b/gi,
  /\b(hitler|h\*tler|h\*\*\*\*\*)\b/gi,
  /\b(nazi|n\*zi|n\*\*\*)\b/gi,
  /\b(klan|k\*an|k\*\*\*)\b/gi,
  /\b(holocaust|h\*locaust|h\*\*\*\*\*\*\*\*\*)\b/gi,
  
  // Homophobic/transphobic terms
  /\b(fag|f\*g|f\*\*)\b/gi,
  /\b(faggot|f\*ggot|f\*\*\*\*\*)\b/gi,
  /\b(queer|q\*eer|q\*\*\*\*)\b/gi,
  /\b(homo|h\*mo|h\*\*\*)\b/gi,
  /\b(tranny|t\*anny|t\*\*\*\*\*)\b/gi,
  /\b(shemale|s\*emale|s\*\*\*\*\*\*)\b/gi,
  /\b(dyke|d\*ke|d\*\*\*)\b/gi,
  /\b(lesbo|l\*sbo|l\*\*\*\*)\b/gi,
  
  // Drug-related terms
  /\b(cocaine|c\*caine|c\*\*\*\*\*\*)\b/gi,
  /\b(heroin|h\*roin|h\*\*\*\*\*\*)\b/gi,
  /\b(meth|m\*th|m\*\*\*)\b/gi,
  /\b(weed|w\*ed|w\*\*\*)\b/gi,
  /\b(marijuana|m\*rijuana|m\*\*\*\*\*\*\*\*)\b/gi,
  /\b(lsd|l\*d|l\*\*)\b/gi,
  /\b(ecstasy|e\*stasy|e\*\*\*\*\*\*\*)\b/gi,
  /\b(crack|c\*ack|c\*\*\*\*\*)\b/gi,
  /\b(acid|a\*id|a\*\*\*)\b/gi,
  /\b(pot|p\*t|p\*\*)\b/gi,
  /\b(dope|d\*pe|d\*\*\*)\b/gi,
  
  // Violent/abusive terms
  /\b(kill|k\*ll|k\*\*\*)\b/gi,
  /\b(murder|m\*rder|m\*\*\*\*\*\*)\b/gi,
  /\b(rape|r\*pe|r\*\*\*)\b/gi,
  /\b(beating|b\*ating|b\*\*\*\*\*\*)\b/gi,
  /\b(stab|s\*ab|s\*\*\*)\b/gi,
  /\b(shoot|s\*oot|s\*\*\*\*)\b/gi,
  /\b(bomb|b\*mb|b\*\*\*)\b/gi,
  /\b(terror|t\*rror|t\*\*\*\*\*\*)\b/gi,
  /\b(suicide|s\*icide|s\*\*\*\*\*\*\*)\b/gi,
  /\b(hang|h\*ng|h\*\*\*)\b/gi,
  
  // Common misspellings and variations
  /\b(phuck|ph\*ck|ph\*\*\*)\b/gi,
  /\b(fuk|f\*k|f\*\*)\b/gi,
  /\b(f u c k|f\*\*\*k)\b/gi,
  /\b(s h i t|s\*\*\*t)\b/gi,
  /\b(b i t c h|b\*\*\*\*h)\b/gi,
  /\b(a s s|a\*\*s)\b/gi,
  
  // General offensive terms
  /\b(retard|r\*tard|r\*\*\*\*\*\*)\b/gi,
  /\b(moron|m\*ron|m\*\*\*\*\*)\b/gi,
  /\b(idiot|i\*iot|i\*\*\*\*)\b/gi,
  /\b(stupid|s\*upid|s\*\*\*\*\*\*)\b/gi,
  /\b(dumb|d\*mb|d\*\*\*)\b/gi,
  /\b(fatass|f\*tass|f\*\*\*\*\*\*)\b/gi,
  /\b(ugly|u\*ly|u\*\*\*)\b/gi,
  /\b(loser|l\*ser|l\*\*\*\*\*)\b/gi,
  
  // Internet slang/abbreviations
  /\b(stfu|s\*fu|s\*\*\*)\b/gi,
  /\b(gtfo|g\*fo|g\*\*\*)\b/gi,
  /\b(wtf|w\*f|w\*\*)\b/gi,
  /\b(omfg|o\*fg|o\*\*\*)\b/gi,
  /\b(lmfao|l\*fao|l\*\*\*\*)\b/gi,
  /\b(rofl|r\*fl|r\*\*\*)\b/gi,
  
  // Pattern-based offensive terms
  /[a@][s$][s$]/gi,
  /[b8][i1!][t+][c<][h7]/gi,
  /[f][a@][g6][g6][o0][t+]/gi,
  /[n][i1!][g6][g6][a@]/gi,
  
  // Add more specific and relevant terms for your application context
  // Consider variations, misspellings, and attempts to bypass filters
];

// What to replace banned words with
export const CENSOR_REPLACEMENT = '****';

/**
 * Censors text based on the BANNED_WORDS_PATTERNS.
 * @param {string} text - The input text to censor.
 * @returns {string} - The censored text.
 */
export const censorText = (text) => {
  if (!text || typeof text !== 'string') return text;
  let censoredText = text;
  BANNED_WORDS_PATTERNS.forEach(pattern => {
    censoredText = censoredText.replace(pattern, CENSOR_REPLACEMENT);
  });
  return censoredText;
};

/**
 * Checks if text contains any banned words.
 * @param {string} text - The input text to check.
 * @returns {boolean} - True if banned words are found, false otherwise.
 */
export const hasBannedWords = (text) => {
  if (!text || typeof text !== 'string') return false;
  return BANNED_WORDS_PATTERNS.some(pattern => pattern.test(text));
};

/**
 * Returns an array of banned words found in the text.
 * @param {string} text - The input text to scan.
 * @returns {Array} - Array of banned words found.
 */
export const getBannedWordsInText = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const foundWords = [];
  BANNED_WORDS_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      foundWords.push(...matches);
    }
  });
  
  return [...new Set(foundWords)]; // Return unique values
};