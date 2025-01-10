# Client-Side Recording Feature Epic
**Epic Title**: Transition from Recall.ai to Browser-Based Recording System  
**Priority**: High  
**Status**: Proposed  
**Target Release**: TBD

## 🎯 Epic Overview
Transform Kwill's recording system from Recall.ai-based Zoom integration to a client-side recording solution using the browser's MediaRecorder API and Jigsaw Stack for diarization.

## 📋 Business Context
### Current System
- Uses Recall.ai for Zoom bot deployment
- Relies on webhooks for media gathering
- High operational costs
- Complex architecture

### Proposed Solution
- Browser-based recording using MediaRecorder API
- Direct audio processing pipeline
- Jigsaw Stack integration for speaker diarization
- Streamlined architecture

## 💰 Business Value
1. Cost Reduction
   - Elimination of Recall.ai subscription costs
   - Reduced API usage fees
   - Lower infrastructure costs

2. Technical Benefits
   - Simplified architecture
   - Reduced external dependencies
   - Greater control over recording process
   - Improved scalability

## 🔧 Technical Requirements

### Core Components
1. Audio Recording Module
   ```typescript
   interface AudioRecorder {
     startRecording(): Promise<void>;
     stopRecording(): Promise<Blob>;
     isRecording: boolean;
   }
   ```

2. Audio Processing Pipeline
   ```typescript
   interface AudioProcessor {
     uploadAudio(blob: Blob): Promise<string>;
     processDiarization(url: string): Promise<TranscriptSegment[]>;
   }
   ```

3. API Integration Layer
   ```typescript
   interface APILayer {
     uploadEndpoint: '/api/upload-audio';
     processEndpoint: '/api/process-audio';
     diarizationEndpoint: 'jigsawstack.com/v1/speech/diarize';
   }
   ```

### Implementation Phases

#### Phase 1: Recording Infrastructure
- [ ] Implement MediaRecorder hook
- [ ] Create audio chunk management system
- [ ] Develop blob creation and handling
- [ ] Add basic error handling
- [ ] Implement recording controls UI

#### Phase 2: Processing Pipeline
- [ ] Create audio upload endpoint
- [ ] Implement file storage system
- [ ] Set up Jigsaw Stack integration
- [ ] Develop diarization processing
- [ ] Add error handling and retries

#### Phase 3: Integration & Testing
- [ ] Integrate with existing transcript system
- [ ] Implement end-to-end testing
- [ ] Add browser compatibility checks
- [ ] Create fallback mechanisms
- [ ] Perform load testing

## 🎨 User Interface Requirements

### Recording Controls
- Start/Stop button
- Recording indicator
- Audio level visualization
- Error state handling
- Processing status indicator

### Status Indicators
- Recording state
- Upload progress
- Processing status
- Error messages
- Success confirmation

## 🔍 Technical Considerations

### Browser Compatibility
- Target Browsers:
  - Chrome 49+
  - Firefox 25+
  - Safari 14.1+
  - Edge 79+

### Performance Requirements
- Maximum audio file size: 100MB
- Processing time: < 5 minutes
- Upload timeout: 5 minutes
- Storage retention: 7 days

### Error Handling
1. Recording Errors
   - Permission denied
   - Device not found
   - Browser not supported
   - Storage full

2. Processing Errors
   - Upload failure
   - Diarization error
   - Timeout
   - Format incompatibility

## 📊 Success Metrics

### Technical Metrics
- Recording success rate: >99%
- Processing success rate: >98%
- Average processing time: <3 minutes
- Error rate: <1%

### Business Metrics
- Cost reduction: >50%
- User satisfaction: >90%
- System reliability: >99.9%

## 🔒 Security Requirements

### Data Protection
- End-to-end encryption for audio files
- Secure file storage
- Automatic file deletion
- Access control implementation

### Compliance
- GDPR compliance
- CCPA compliance
- SOC 2 requirements
- Data retention policies

## 📝 Testing Requirements

### Unit Tests
- Recording functionality
- Chunk management
- Blob creation
- Error handling

### Integration Tests
- Upload process
- Diarization integration
- Storage system
- API endpoints

### User Acceptance Testing
- Recording workflow
- Error scenarios
- Browser compatibility
- Performance metrics

## 🚀 Rollout Strategy

### Phase 1: Alpha
- Internal testing
- Core team validation
- Performance monitoring
- Bug fixing

### Phase 2: Beta
- Selected customer testing
- Feedback collection
- System optimization
- Documentation

### Phase 3: Production
- Gradual rollout
- Monitor metrics
- Customer support preparation
- Legacy system deprecation

## 📈 Future Considerations

### Potential Enhancements
- Multiple audio track support
- Real-time transcription
- Advanced audio processing
- Offline recording capability

### Technical Debt
- Legacy system removal
- API version updates
- Storage optimization
- Performance improvements


## To Summarize
- We need to implement a client-side recording system using the browser's MediaRecorder API and Jigsaw Stack for diarization.
- This will replace the current Recall.ai-based Zoom integration.
- The system will be built in phases, starting with recording infrastructure, then processing pipeline, and finally integration and testing.
- We will also need to implement a user interface for recording controls and status indicators.
- We will need to ensure that the system is compatible with the target browsers and meets the performance requirements.
- We will need to implement error handling for both recording and processing errors.
- The process is as follows:
    - Start Recording
    - Stop Recording
    - Upload Audio
    - Process Audio
    - Diarization
- If you look at my current webhook implementation the end goal is gaining the proper diarizatized transcript so we can use it for further analysis. Make sure to use best practices and patterns from @meeting-epic.md


### Example Implementation:
To process audio from a MediaRecorder and use JigsawStack to diarize and convert it into a diarized transcript, you can follow these steps:

## Recording Audio

First, capture audio using the MediaRecorder API:

```javascript
let chunks = [];
const mediaRecorder = new MediaRecorder(stream);

mediaRecorder.ondataavailable = (event) => {
  chunks.push(event.data);
};

mediaRecorder.onstop = async () => {
  const audioBlob = new Blob(chunks, { type: 'audio/webm' });
  await processAudio(audioBlob);
};

// Start recording
mediaRecorder.start();

// Stop recording after some time
setTimeout(() => mediaRecorder.stop(), 5000);
```

## Processing Audio with JigsawStack

Once you have the audio blob, use JigsawStack to process it:

```javascript
import { JigsawStack } from "jigsawstack";

const jigsaw = JigsawStack({ apiKey: "your-api-key" });

async function processAudio(audioBlob) {
  // Upload the audio file
  const uploadResponse = await jigsaw.store.upload(audioBlob, { filename: "recording.webm" });
  const audioUrl = uploadResponse.url;

  // Perform speech-to-text with diarization
  const transcriptionResponse = await jigsaw.audio.speech_to_text({
    audio: audioUrl,
    diarization: true
  });

  // Process the diarized transcript
  displayDiarizedTranscript(transcriptionResponse);
}

function displayDiarizedTranscript(transcription) {
  transcription.segments.forEach(segment => {
    console.log(`Speaker ${segment.speaker}: ${segment.text}`);
    console.log(`Start time: ${segment.start}, End time: ${segment.end}`);
  });
}
```

## Key Points

1. **Audio Capture**: Use MediaRecorder to capture audio from the user's microphone[6].

2. **File Upload**: JigsawStack requires the audio to be accessible via a URL. Use the `jigsaw.store.upload()` method to upload the audio blob[7].

3. **Speech-to-Text with Diarization**: The `jigsaw.audio.speech_to_text()` method supports diarization. Set the `diarization` parameter to `true` to enable speaker identification[1][3].

4. **Processing Results**: The response will include segments with speaker labels, text, and timestamps. You can process this to display or further analyze the diarized transcript[3].

5. **Performance**: JigsawStack offers fast processing times, with an average latency of 2.7 seconds for a 3-minute audio file[4].

6. **Accuracy**: JigsawStack's Word Error Rate (WER) is around 10.30%, which is competitive with other leading services[4].

Remember to handle errors and edge cases in your implementation. Also, ensure you have the necessary permissions to access the user's microphone before attempting to record audio.

Citations:
[1] https://www.youtube.com/watch?v=SAIsk0i7KgU
[2] https://www.reddit.com/r/rust/comments/1cw2axe/seeking_advice_implementing_speaker_diarization/
[3] https://voice.neuralspace.ai/docs/v1/file-transcription/speaker-diarization
[4] https://jigsawstack.com/blog/jigsawstack-vs-groq-vs-assemblyai-vs-openai-speech-to-text-benchmark-comparison
[5] https://www.gladia.io/blog/gladia-speech-to-text-api-speaker-diarization
[6] https://devforum.zoom.us/t/need-help-in-extracting-transcripts-from-the-audio-file/105560
[7] https://jigsawstack.com
[8] https://github.com/meronym/speaker-transcription
[9] https://github.com/openai/whisper/discussions/264


Make sure to follow best practices and it aligns with @meeting-epic.md @prd.md