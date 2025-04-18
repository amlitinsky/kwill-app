# Revised Product Requirements Document (PRD) for Kwill (2025-02-08) - MVP Edition

## 1. Overview

**Product Name:** Kwill  
**Mission:** Empower investors and venture capitalists to automate meeting data export, analysis, and spreadsheet integration using a vertical AI agent tailored to financial workflows.  
*(MVP Focus: Initial automation for Zoom meetings and Google Sheets.)*

**Vision:** Become the system of action for investor workflows – replacing fragmented manual processes with AI-driven automation.  
*(MVP Focus: Validate core automation for meeting data to spreadsheets.)*

**Key Trends Addressed:**

- **Vertical AI Dominance:** Specialized agents for niche industries are projected to capture 70% of AI’s economic value by 2026.
- **Agentic Workflows:** Transition from systems of record (e.g., CRMs) to systems of action that automate tasks end-to-end.
- **Unstructured Data Processing:** Handling meeting transcripts and mapping data to structured spreadsheets is critical.

## 2. Core Features (MVP)

### Domain-Specific Chat Interface

- **AI Agent:** LLM-powered assistant fine-tuned on investor jargon and financial regulations.
  - *(MVP: Focus on general investor terms; future fine-tuning as enhancement.)*
- **Contextual Awareness:** Retains chat history for basic conversational continuity within a session.
  - *(MVP: Basic session memory only.)*

### Spreadsheet Integration

- **Google Sheets API:** Read/write access to map transcript-derived data into user-defined columns.
  - *(MVP: Automated mapping via keyword matching; manual overrides deferred.)*
- **Single Spreadsheet Context:** One Google Sheet per chat session.

### Zoom Meeting Processing

- **Direct API Call from Chat:** When a user includes a Zoom link, Kwill makes a synchronous Recall.ai API call to fetch the transcript and metadata.
  - *(MVP: Synchronous processing. Webhook integration deferred.)*
- **Unified Transcript Processing:**  
  When a meeting finishes, the system funnels the transcript into the unified `/api/chat` endpoint with an `isTranscript` flag.  
  - The transcript is used solely as input to the LLM.
  - Only the generated meeting insights (e.g., summary and action items) are inserted as an assistant message in the conversation.
  - The raw transcript is not displayed to the end user.

### LLM Analysis Pipeline 

- **Entity Extraction:** Identify startups, funding amounts, and action items from transcripts.
  - *(MVP: Focus on core investor entities; advanced training deferred.)*
- **Data Validation:** Basic validation of extracted data against spreadsheet headers.
  - *(MVP: Basic validation rules.)*

### Dynamic Reporting (MVP – Text-Based Summaries)

- **AI-Generated Summaries:** Provide action items and meeting highlights as text summaries directly in chat.
  - *(MVP: Text summaries only; visualizations deferred.)*
- **Basic Querying:** Allow simple follow-up queries about processed meetings within the current chat session.
  - *(MVP: Limited to session context.)*

## 3. User Stories (MVP)

| Role          | Goal                                                      | Outcome                                          |
|---------------|-----------------------------------------------------------|--------------------------------------------------|
| VC Analyst    | Automate post-meeting data entry for a meeting            | Reduce manual meeting data entry via AI insights |
| Investor      | Get a quick summary of a recent meeting                   | Receive immediate text-based summaries         |

## 4. Technical Architecture (MVP)

**Stack:**

- **Frontend:** Next.js 15 (App Router), shadcn/ui, Next.js AI SDK (streaming chat with unified `/api/chat`).
- **Backend:** tRPC for type-safe APIs, Next.js API Routes, Drizzle ORM (Neon Postgres).
- **Integrations:** Google Sheets API, Recall.ai API (direct API calls for MVP), LLM APIs (Deepseek, Anthropic, OpenAI, etc).

**Key Components:**

- **Unified Chat Endpoint:**  
  Uses a single `/api/chat` endpoint for both regular messages and meeting transcripts.  
  - **For Regular Messages:** It supports tool calls (e.g., linking spreadsheets or joining Zoom meetings).  
  - **For Meeting Transcripts:** It processes the transcript into meeting insights with a system prompt designed for analysis. Only the LLM’s assistant output (meeting insights) is stored and streamed—keeping the raw transcript hidden from the user.

- **Cognitive Skills Module (MVP):**  
  Basic domain-specific inference using LLM APIs with prompt engineering for investor contexts.

- **Agentic Workflow Engine (Synchronous MVP):**  
  1. Detect Zoom URL in chat → Trigger Recall.ai API call.  
  2. LLM analyzes transcript, extracts entities, and generates meeting insights.  
  3. Update spreadsheet and chat with the derived insights.

**Data Security:**  
- AES-256 for encryption.  
- Clerk for authentication; OAuth with limited Google Sheets scopes.

## 5. Metrics for Success (MVP)

- **Adoption:** 100+ beta users (VC analysts/angels) providing feedback.
- **Efficiency:** Noticeable time savings in post-meeting tasks.
- **Accuracy:** Positive user feedback on AI-generated mappings and data extraction.