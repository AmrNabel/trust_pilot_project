import Perspective from 'perspective-api-client';
import {
  ALL_INAPPROPRIATE_WORDS,
  EGYPTIAN_INAPPROPRIATE_WORDS,
  EDUCATION_INAPPROPRIATE_PHRASES,
} from '../moderation/inappropriate-words';

// Initialize the Perspective API client with your API key
// Note: In production, this should be stored in environment variables, not in the code
const PERSPECTIVE_API_KEY = process.env.NEXT_PUBLIC_PERSPECTIVE_API_KEY;
const perspective = new Perspective({ apiKey: PERSPECTIVE_API_KEY });

export interface ContentAnalysisResult {
  toxic: boolean;
  toxicityScore: number;
  categories: Record<string, number>;
  passed: boolean;
  flaggedWords?: string[];
  contentType: 'appropriate' | 'general_inappropriate' | 'educational_abuse';
}

// Define threshold values for different attributes
const TOXICITY_THRESHOLD = 0.6; // Lowered from 0.7 to be more strict
const SEVERE_TOXICITY_THRESHOLD = 0.4; // Lowered from 0.5 to be more strict
const INSULT_THRESHOLD = 0.6; // Lowered from 0.7 to be more strict
const PROFANITY_THRESHOLD = 0.6; // Lowered from 0.7 to be more strict

/**
 * Checks if text contains inappropriate Egyptian Arabic content
 * @param text Text to check
 * @returns Object with flag indicating if inappropriate content was found and the flagged words
 */
function containsEgyptianInappropriateContent(text: string): {
  inappropriate: boolean;
  flaggedWords: string[];
} {
  // Normalize the text: remove diacritics, convert to lowercase
  const normalizedText = text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, ''); // Remove Arabic diacritics (tashkeel)

  // Check for inappropriate words
  const flaggedWords: string[] = [];

  // Specific check for كلب and عرص which might be reported as not working
  if (normalizedText.includes('كلب')) {
    flaggedWords.push('كلب');
  }

  if (normalizedText.includes('عرص')) {
    flaggedWords.push('عرص');
  }

  // Check for educational-specific inappropriate content first
  for (const phrase of EDUCATION_INAPPROPRIATE_PHRASES) {
    if (normalizedText.includes(phrase)) {
      flaggedWords.push(phrase);
    }
  }

  // If educational content was found, return immediately
  if (flaggedWords.length > 0) {
    return {
      inappropriate: true,
      flaggedWords,
    };
  }

  // Check for all other inappropriate words
  for (const word of EGYPTIAN_INAPPROPRIATE_WORDS) {
    // Escape special regex characters
    const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    // Create a regex pattern that's more flexible for Egyptian dialect
    // This will match the word even if it's part of another word or has prefixes/suffixes
    const regex = new RegExp(
      `(^|\\s|[^\\p{L}])?${escapedWord}($|\\s|[^\\p{L}])?`,
      'ui'
    );

    if (regex.test(normalizedText)) {
      flaggedWords.push(word);
    }
  }

  // Additional check for phrases that might be broken up or have characters between words
  if (
    normalizedText.includes('ابن') &&
    (normalizedText.includes('متناك') ||
      normalizedText.includes('عرص') ||
      normalizedText.includes('كلب') ||
      normalizedText.includes('شرموط'))
  ) {
    if (!flaggedWords.includes('ابن متناكة')) {
      flaggedWords.push('ابن متناكة');
    }
  }

  // Specific check for the user's example
  if (
    normalizedText.includes('مدرس') &&
    normalizedText.includes('ابن') &&
    normalizedText.includes('متناكة')
  ) {
    if (!flaggedWords.includes('مدرس ابن متناكة')) {
      flaggedWords.push('مدرس ابن متناكة');
    }
  }

  return {
    inappropriate: flaggedWords.length > 0,
    flaggedWords,
  };
}

/**
 * Analyzes text content using Google Perspective API and custom filters
 * @param text The text content to analyze
 * @returns Analysis result with toxicity score and whether the content passed the check
 */
export async function analyzeContent(
  text: string
): Promise<ContentAnalysisResult> {
  try {
    console.log('Starting content analysis with Perspective API');

    // First check with our custom Egyptian Arabic filter
    const egyptianCheck = containsEgyptianInappropriateContent(text);
    console.log('Egyptian check result:', egyptianCheck);

    // If our custom filter found inappropriate content, return immediately
    if (egyptianCheck.inappropriate) {
      console.log(
        'Inappropriate content found by Egyptian filter:',
        egyptianCheck.flaggedWords
      );

      // Check if the flagged words are specifically from educational abuse phrases
      const isEducationalAbuse = egyptianCheck.flaggedWords.some((word) =>
        EDUCATION_INAPPROPRIATE_PHRASES.includes(word)
      );

      return {
        toxic: true,
        toxicityScore: 1.0, // Max toxicity score
        categories: {
          toxicity: 1.0,
          severeToxicity: 1.0,
          insult: 1.0,
          profanity: 1.0,
          egyptianDialect: 1.0,
        },
        passed: false,
        flaggedWords: egyptianCheck.flaggedWords,
        contentType: isEducationalAbuse
          ? 'educational_abuse'
          : 'general_inappropriate',
      };
    }

    if (!PERSPECTIVE_API_KEY) {
      console.warn(
        'Perspective API key is missing. Content moderation is disabled.'
      );
      return {
        toxic: false,
        toxicityScore: 0,
        categories: {},
        passed: true,
        contentType: 'appropriate',
      };
    }

    console.log(
      'Using Perspective API key:',
      PERSPECTIVE_API_KEY ? 'Key is defined' : 'Key is missing'
    );

    // Request analysis from Perspective API
    // Add Arabic as a supported language to improve detection
    const result = await perspective.analyze(text, {
      attributes: ['TOXICITY', 'SEVERE_TOXICITY', 'INSULT', 'PROFANITY'],
      languages: ['ar', 'en'], // Explicitly add Arabic and English language support
    });

    // Extract scores for each attribute
    const toxicityScore =
      result.attributeScores?.TOXICITY?.summaryScore?.value || 0;
    const severeToxicityScore =
      result.attributeScores?.SEVERE_TOXICITY?.summaryScore?.value || 0;
    const insultScore =
      result.attributeScores?.INSULT?.summaryScore?.value || 0;
    const profanityScore =
      result.attributeScores?.PROFANITY?.summaryScore?.value || 0;

    // Determine if the content is toxic based on thresholds
    const isToxic =
      toxicityScore >= TOXICITY_THRESHOLD ||
      severeToxicityScore >= SEVERE_TOXICITY_THRESHOLD ||
      insultScore >= INSULT_THRESHOLD ||
      profanityScore >= PROFANITY_THRESHOLD;

    // Prepare category scores for detailed feedback
    const categories = {
      toxicity: toxicityScore,
      severeToxicity: severeToxicityScore,
      insult: insultScore,
      profanity: profanityScore,
    };

    return {
      toxic: isToxic,
      toxicityScore,
      categories,
      passed: !isToxic,
      contentType: isToxic ? 'general_inappropriate' : 'appropriate',
    };
  } catch (error) {
    console.error('Error analyzing content with Perspective API:', error);

    // In case of API error, allow the content to pass through
    // This is a fallback to avoid blocking legitimate content when the API fails
    return {
      toxic: false,
      toxicityScore: 0,
      categories: {},
      passed: true,
      contentType: 'appropriate',
    };
  }
}

/**
 * Checks if content is appropriate for posting
 * @param text The text content to check
 * @returns True if content passes moderation, false otherwise
 */
export async function isContentAppropriate(text: string): Promise<boolean> {
  const result = await analyzeContent(text);
  return result.passed;
}
