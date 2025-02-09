# Revised Product Requirements Document (PRD) for Kwill (2025-02-08) - MVP Edition
Simplified scope for Minimum Viable Product, focusing on core functionality and streamlined architecture.

1. Overview
Product Name: Kwill
Mission: Empower investors and venture capitalists to automate meeting data export, analysis, and spreadsheet integration using a vertical AI agent tailored to financial workflows. (MVP Focus: Initial automation for Zoom meetings and Google Sheets.)
Vision: Become the system of action for investor workflows, replacing fragmented manual processes with AI-driven automation. (MVP Focus:  Validate core automation for meeting data to spreadsheets.)

Key Trends Addressed:

Vertical AI dominance: Specialized agents for niche industries are projected to capture 70% of AI's economic value by 2026.
Agentic workflows: Shift from systems of record (e.g., CRMs) to systems of action that automate tasks end-to-end.
Unstructured data processing: Critical for handling meeting transcripts and mapping data to structured spreadsheets.
2. Core Features (MVP)
Domain-Specific Chat Interface

AI Agent: LLM-powered assistant (Google Gemini Pro) fine-tuned on investor jargon, financial regulations, and spreadsheet semantics. (MVP: Focus on general financial and investor terms; fine-tuning as future enhancement.)
Contextual Awareness: Retains chat history for basic conversational continuity within a single session. (MVP: Basic session memory, no cross-session memory or knowledge base for MVP.)
Spreadsheet Integration

Google Sheets API: Read/write access to map transcript-derived data to user-defined columns. (MVP: Automated mapping based on basic keyword matching; manual overrides deferred.)
Single Spreadsheet Context: MVP assumes a single Google Sheet for data export per chat session.
Zoom Meeting Processing

Direct API Call from Chat: User provides Zoom link in chat; Kwill directly calls Recall.ai API to fetch transcript and metadata. (MVP: Synchronous processing for MVP. Webhook integration for Recall.ai deferred.)
Real-Time Status: "Thinking" state during processing, with basic progress updates via chat.
LLM Analysis Pipeline (Google Gemini Pro)

Entity Extraction: Identify startups, funding amounts, and action items from transcripts using Google Gemini Pro. (MVP: Focus on core entities; domain-specific training and fine-tuning deferred for MVP.)
Data Validation: Basic validation of extracted data against spreadsheet headers (e.g., data type mismatch). (MVP: Basic validation rules.)
Dynamic Reporting (MVP - Text-Based Summaries)

AI-Generated Summaries: Action items, meeting highlights provided as text summaries in chat. (MVP: Text summaries only. Visualizations deferred.)
Basic Querying: Users can ask simple questions about processed meetings within the current chat session. (MVP: Basic question answering within session context only.)
3. User Stories (MVP)
Role	Goal	Outcome
VC Analyst	Automate post-meeting data entry for a single meeting	Reduce manual work for individual meeting data entry using AI-generated spreadsheet updates.
Investor	Get a quick summary of a recent meeting	Instantly receive text-based summaries of action items and key highlights from a processed meeting.

Export to Sheets
4. Technical Architecture (MVP)
Stack:

Frontend: Next.js 15 (App Router), shadcn/ui, Next.js AI SDK for streaming chat.
Backend: tRPC for type-safe APIs, Next.js API Routes (App Router), Drizzle ORM (Neon Postgres), Neon Postgres Database.
Integrations: Google Sheets API, Recall.ai API (direct API calls for MVP), Google Gemini Pro (LLM via Vercel AI SDK).
Key Components:

Cognitive Skills Module (Simplified MVP):

Domain-Specific Inference: Basic inference using Google Gemini Pro and prompt engineering, focused on core investor concepts. Domain-specific training deferred.
Basic Regulatory Considerations: Data mapping for common financial data fields. In-depth regulatory compliance features deferred for MVP.
Agentic Workflow Engine (Synchronous MVP):

Step 1: Detect Zoom URL in chat input → Trigger direct Recall.ai API call.
Step 2: Process transcript with Google Gemini Pro → Extract entities → Basic validation.
Step 3: Generate text summaries → Update spreadsheet → Notify user via chat. (All steps synchronous for MVP.)
Data Security:

Encryption: AES-256 for API keys and sensitive data.
OAuth: Clerk for authentication; Google Workspace scopes limited to spreadsheets owned by the user.
5. Market & Competitive Landscape
Vertical AI Growth: Market projected to reach $47.1B by 2030, driven by labor-cost savings.
Competitors:
Horizontal Tools: ChatGPT Plugins (limited domain specificity).
Vertical Differentiators (MVP Focus): Pre-built investor workflows, cost-effective and fast processing with Google Gemini Pro, streamlined for core data entry automation.
6. Risks & Mitigation (MVP)
Risk	Mitigation
Data Mapping Errors (MVP)	Basic validation and user confirmation of overall spreadsheet update. Manual override UI deferred for MVP.
API Latency (Recall.ai, Gemini, Google Sheets)	Synchronous processing for MVP. Focus on optimizing Gemini Pro prompts for speed. Asynchronous processing (Trigger.dev) for future scalability.
LLM Output Accuracy (MVP)	Focus on prompt engineering for Gemini Pro. Domain-specific fine-tuning deferred for MVP.

Export to Sheets
7. Roadmap (Q2–Q4 2025) - MVP and Beyond
Q2 2025 (MVP - Core Functionality Beta Launch): Beta launch with Zoom + Google Sheets integration, synchronous processing, basic chat interface, using Google Gemini Pro.
Q3 2025 (Scalability & Enhanced Features): Asynchronous processing with Trigger.dev, Recall.ai webhook integration, Excel/CSV support, manual mapping UI.
Q4 2025 (AI-Driven Analytics & Knowledge): AI-driven chart generation, portfolio analytics, vector embeddings for semantic search, more advanced memory management.
8. Metrics for Success (MVP)
Adoption (MVP Beta): 100+ beta users (VC analysts/angels) providing feedback.
Efficiency (MVP): Demonstrate noticeable time savings in post-meeting tasks for beta users.
Accuracy (MVP): Gather user feedback on the accuracy of AI-generated mappings and data extraction in the MVP.
9. Key Insights from Vertical AI Trends (MVP Context)
Specialization Wins: Vertical AI agents offer higher ROI. MVP focuses on investor workflows.
Ethical Guardrails: Basic data validation and security in MVP. More robust compliance for future.
Scalability: MVP is synchronous. Scalability via asynchronous processing (Trigger.dev) planned for next phase.
For implementation details, refer to the revised MVP design document below.