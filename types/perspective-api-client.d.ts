declare module 'perspective-api-client' {
  interface AnalyzeOptions {
    attributes: string[];
    languages?: string[];
    doNotStore?: boolean;
  }

  interface SummaryScore {
    value: number;
    type: string;
  }

  interface AttributeScore {
    spanScores?: Array<any>;
    summaryScore: SummaryScore;
  }

  interface AnalysisResult {
    attributeScores?: {
      [key: string]: AttributeScore;
    };
    languages?: string[];
    detectedLanguages?: string[];
  }

  class Perspective {
    constructor(options: { apiKey: string | undefined });
    analyze(text: string, options: AnalyzeOptions): Promise<AnalysisResult>;
  }

  export = Perspective;
}
