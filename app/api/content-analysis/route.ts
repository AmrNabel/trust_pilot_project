import { NextRequest, NextResponse } from 'next/server';
import { analyzeContent } from '@/lib/perspective';
import { EDUCATION_INAPPROPRIATE_PHRASES } from '@/lib/moderation/inappropriate-words';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. Text parameter is required.' },
        { status: 400 }
      );
    }

    // Log the input for debugging
    console.log('Received text for analysis:', text);
    // Analyze content using enhanced system with Egyptian Arabic support
    const result = await analyzeContent(text);

    // Check if we found educational-specific inappropriate content
    const hasEducationalInappropriateContent = result.flaggedWords?.some(
      (word) => EDUCATION_INAPPROPRIATE_PHRASES.includes(word)
    );

    // Log detailed results for debugging
    console.log('Content analysis result:', {
      toxic: result.toxic,
      passed: result.passed,
      flaggedWords: result.flaggedWords || [],
      toxicityScores: result.categories,
      hasEducationalInappropriateContent,
    });

    // Prepare a more user-friendly response
    const response = {
      result,
      success: true,
      message: result.passed
        ? 'Content appears appropriate'
        : hasEducationalInappropriateContent
        ? 'Content contains inappropriate educational references'
        : 'Content contains inappropriate language',
      details:
        result.flaggedWords && result.flaggedWords.length > 0
          ? `Inappropriate terms detected: ${result.flaggedWords.join(', ')}`
          : result.passed
          ? undefined
          : 'Your content contains inappropriate language',
      flaggedWords: result.flaggedWords || [],
      contentType: hasEducationalInappropriateContent
        ? 'educational_abuse'
        : result.toxic
        ? 'general_inappropriate'
        : 'appropriate',
      severity: result.toxic ? 'high' : 'none',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error analyzing content:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
