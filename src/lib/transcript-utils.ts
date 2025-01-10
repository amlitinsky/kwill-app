interface RawTranscriptSegment {
  speaker: string;
  words: { text: string, start_time: number, end_time: number }[];
}

export interface ProcessedTranscriptSegment {
  speaker: string;
  text: string;
  start_time: number
  end_time: number;
}

export function processRawTranscript(rawTranscript: RawTranscriptSegment[]): ProcessedTranscriptSegment[] {
  return rawTranscript.map((segment) => ({
    speaker: segment.speaker,
    text: segment.words.map((word) => word.text).join(' '),
    start_time: segment.words[0].start_time,
    end_time: segment.words[segment.words.length - 1].end_time,
  }));
}