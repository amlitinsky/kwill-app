interface RawTranscriptSegment {
  participant: {
    id: number;
    name: string;
  };
  words: {
    text: string;
    start_timestamp: { relative: number };
    end_timestamp: { relative: number };
  }[];
}

export interface ProcessedTranscriptSegment {
  speaker: string;
  speaker_id: number;
  text: string;
  start_time: number;
  end_time: number;
  word_count: number;
  speaking_pace: number;
}

export function processRawTranscript(rawTranscript: RawTranscriptSegment[]): ProcessedTranscriptSegment[] {
  return rawTranscript.map((segment) => {
    const words = segment.words;
    const durationInMinutes = 
      (words[words.length - 1].end_timestamp.relative - words[0].start_timestamp.relative) / 60;
    
    return {
      speaker: segment.participant.name,
      speaker_id: segment.participant.id,
      text: words.map(word => word.text).join(' '),
      start_time: words[0].start_timestamp.relative,
      end_time: words[words.length - 1].end_timestamp.relative,
      word_count: words.length,
      speaking_pace: words.length / durationInMinutes,
    };
  });
}