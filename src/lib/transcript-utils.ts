interface RawTranscriptSegment {
  speaker: string;
  words: { text: string }[];
}

export interface ProcessedTranscriptSegment {
  speaker: string;
  text: string;
}

export function processRawTranscript(rawTranscript: RawTranscriptSegment[]): ProcessedTranscriptSegment[] {
  return rawTranscript.map((segment) => ({
    speaker: segment.speaker,
    text: segment.words.map((word) => word.text).join(' ')
  }));
}