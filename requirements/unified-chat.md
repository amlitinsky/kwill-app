# Unified Chat Endpoint: Architecture, Design & Transcript Processing

## Overview

This document explains the unified design for the `/api/chat` endpoint that manages both regular chat messages and specialized tool calls, as well as processing meeting transcripts. This approach ensures that all messages flow through a single endpoint, while adapting the behavior dynamically based on context.

## Key Concepts

- **Unified Entry Point:**  
  All chat-related interactions—from standard user messages to meeting transcript processing—are sent to the single `/api/chat` API endpoint.

- **Dual-Mode Processing:**  
  The endpoint distinguishes between:
  - **Regular Chat Messages:**  
    These may trigger tool calls (e.g., linking a Google Spreadsheet or joining a Zoom meeting) based on the user's input.
  - **Transcript Messages:**  
    When a meeting finishes, the transcript is sent with an additional flag (`isTranscript: true`). In this mode, the raw transcript is used solely as input to the language model (LLM) to generate meeting insights (such as summaries and action items), and the raw transcript is not stored or shown.

- **Tool Integration:**  
  When handling ordinary chat messages, the endpoint supports tool calls. For example:
  - **Spreadsheet Tool:** Automatically extract and link a Google Sheets URL.
  - **Meeting Tool:** Recognize Zoom URLs and trigger the meeting processing routines.
  These tools are activated only when `isTranscript` is false or absent.

## How It Works

1. **Incoming Payload Structure:**  
   All POST requests to `/api/chat` are expected to include:
   - A `messages` array (the conversation or single message payload).
   - A unique `userId` that indicates the sender.
   - An optional boolean `isTranscript` flag indicating if the payload is a meeting transcript.
   
   **Example:**
   ```json
   {
     "messages": [{
       "role": "user",
       "content": "Full transcript from the Zoom meeting..."
     }],
     "userId": "userXyz",
     "isTranscript": true
   }
   ```

2. **Dynamic System Prompts:**  
   - **Regular Messages:**  
     The system prompt instructs the LLM to check for tool-specific keywords (like Google Sheets URLs or Zoom meeting links) and supports tool calls.
   - **Transcript Processing:**  
     When `isTranscript` is set to true, the prompt changes to instruct the LLM to analyze the provided transcript and generate meeting insights (e.g., meeting summary and action items) in a structured JSON format. Importantly, the transcript itself is excluded from the stored conversation history. (or maybe there is a better way to do this?)

3. **Message Flow & Storage:**  
   - **Standard Chat Interaction:**  
     The user's chat messages are processed, potentially updating the conversation history (e.g., `chatMessages` table) with both user and assistant messages.
   - **Transcript Processing Workflow:**  
     After a meeting ends, a webhook or automated job sends the transcript to the `/api/chat` endpoint. The endpoint uses the transcript solely for LLM processing, and only the generated meeting insights are inserted as an assistant message in the conversation history.
     This ensures that the raw transcript never appears in the user interface, only the distilled insights.

4. **Frontend Integration:**  
   The frontend (using the Next.js AI SDK and the `useChat` hook) continues using the standard workflows:
   - Chat messages are sent as usual.
   - When the meeting transcript is processed, the endpoint’s response stream (the meeting insights) gets merged into the conversation.
   - Cache invalidation and re-fetch strategies (e.g., via a `getMessages()` call) will update the chat view automatically with the new assistant message.

## Benefits of This Approach

- **Simplicity:**  
  A single API endpoint handles all messaging logic. There’s no need for multiple endpoints for chat messages and transcripts.

- **Flexibility:**  
  The endpoint dynamically adjusts its behavior based on the `isTranscript` flag, allowing tool integration for regular messages and dedicated transcript analysis for meeting processing.

- **Clean Conversation History:**  
  Users only see the assistant’s insights (e.g., meeting summaries, action items), and the raw transcript is kept internal.

- **Ease of Integration:**  
  The frontend does not require significant changes. By injecting additional parameters (such as `userId` and `isTranscript`) into the payload, the unified endpoint adapts seamlessly without disrupting the user experience.

## Conclusion

The unified `/api/chat` endpoint provides a clean and extensible design for managing all chat interactions—both standard messages and meeting transcripts. Leveraging the `isTranscript` flag allows the system to differentiate between messages intended for tool calls and those needing specialized analysis, ensuring that investors and VC analysts receive concise, actionable insights directly from their conversation threads.

This approach streamlines the data flow, simplifies backend logic, and maintains a coherent conversation history, all while supporting the integration of powerful domain-specific tools.