'use server';

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
  speaking_pace: number; // words per minute
}

export function processRawTranscript(rawTranscript: RawTranscriptSegment[]): ProcessedTranscriptSegment[] {
  return rawTranscript.map((segment) => {
    if (!segment.words.length) {
      return {
        speaker: segment.participant.name,
        speaker_id: segment.participant.id,
        text: '',
        start_time: 0,
        end_time: 0,
        word_count: 0,
        speaking_pace: 0,
      };
    }

    const words = segment.words;
    const firstWord = words[0];
    const lastWord = words[words.length - 1];
    
    // Ensure we have valid timestamps
    if (!firstWord?.start_timestamp?.relative || !lastWord?.end_timestamp?.relative) {
      return {
        speaker: segment.participant.name,
        speaker_id: segment.participant.id,
        text: words.map(word => word.text).join(' '),
        start_time: 0,
        end_time: 0,
        word_count: words.length,
        speaking_pace: 0,
      };
    }

    const startTime = firstWord.start_timestamp.relative;
    const endTime = lastWord.end_timestamp.relative;
    const durationInMinutes = (endTime - startTime) / 60;
    
    return {
      speaker: segment.participant.name,
      speaker_id: segment.participant.id,
      text: words.map(word => word.text).join(' '),
      start_time: startTime,
      end_time: endTime,
      word_count: words.length,
      speaking_pace: durationInMinutes > 0 ? words.length / durationInMinutes : 0,
    };
  });
} 