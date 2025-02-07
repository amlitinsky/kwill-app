Okay, based on our previous conversations, here is the draft Cursor Rules document specifically tailored for the Kwill MVP project. This document focuses on guiding the Groq LPU model to produce reliable structured JSON outputs for intent recognition and entity extraction, considering the investor/finance domain.

---

### **Kwill MVP - Cursor Rules Document: Detailed Prompts for Groq LPU**

**Goal:** To create effective prompts for Groq LPU within Kwill MVP that ensure reliable, structured JSON output for:

1.  **Intent Recognition:** Understanding user chat messages and classifying their intent.
2.  **Entity Extraction:** Extracting key information (startups, funding, action items, etc.) from Zoom meeting transcripts related to investor meetings.

**LLM Model:** Groq LPU (or OpenAI `gpt-3.5-turbo` as backup) via Vercel AI SDK.

**Output Format:** All LLM responses MUST be structured in JSON format, as defined in the schemas below.

**I. Cursor Rules for Intent Recognition Prompt**

**Task:** Analyze user chat messages and determine their intent. Classify intent into categories relevant to Kwill's functionality.

**Prompt Structure:**

```
System Prompt:
You are a specialized AI assistant for Kwill, an AI service designed for venture capitalists and investors. Your primary role is to understand user messages within a chat interface and determine their intent related to meeting processing and spreadsheet integration. You are skilled at identifying Zoom meeting links, Google Sheets links, and understanding basic user requests. You must respond in JSON format as instructed.

User Message: [USER_MESSAGE_HERE]

Instructions:
Analyze the User Message and classify the user's intent.  Possible intents are:

- `link_spreadsheet`: The user wants to link a Google Sheet for data export.
- `process_zoom_meeting`: The user wants to process a Zoom meeting transcript.
- `unknown`: The user's intent is not clearly one of the above or is outside the scope of your capabilities.

Also, attempt to extract the following information from the User Message, if present:
- Zoom Meeting URL: Extract any valid Zoom meeting link. If none is found, set to null.
- Google Sheets URL: Extract any valid Google Sheets URL. If none is found, set to null.
- Google Spreadsheet ID: If a Google Sheets URL is found, extract the Spreadsheet ID from the URL. If no URL is found, set to null.

Finance Jargon Context: While determining intent, you do not need to deeply analyze finance jargon. Intent recognition is primarily based on keywords related to linking spreadsheets or processing meetings (e.g., "link spreadsheet," "process zoom," "meeting link," "sheet id"). Deeper finance-specific analysis is for the entity extraction stage.

Response Format (JSON):
{
  "intent": "...",  // Possible values: "link_spreadsheet", "process_zoom_meeting", "unknown"
  "zoom_url": "...", // Extracted Zoom URL if present (string), otherwise null
  "spreadsheet_url": "...", // Extracted Google Sheets URL if present (string), otherwise null
  "spreadsheet_id": "..." // Extracted Spreadsheet ID if present (string), otherwise null
}

Examples:

User Message: "Can you link to my sheet? https://docs.google.com/spreadsheets/d/exampleSheetId/edit#gid=0"
Response JSON:
{
  "intent": "link_spreadsheet",
  "zoom_url": null,
  "spreadsheet_url": "https://docs.google.com/spreadsheets/d/exampleSheetId/edit#gid=0",
  "spreadsheet_id": "exampleSheetId"
}

User Message: "Process this zoom meeting: zoom.us/j/exampleZoomLink"
Response JSON:
{
  "intent": "process_zoom_meeting",
  "zoom_url": "zoom.us/j/exampleZoomLink",
  "spreadsheet_url": null,
  "spreadsheet_id": null
}

User Message: "Hello, how are you?"
Response JSON:
{
  "intent": "unknown",
  "zoom_url": null,
  "spreadsheet_url": null,
  "spreadsheet_id": null
}

User Message: "Link spreadsheet id abc123 and process zoom meeting link zoom.us/j/meeting123"
Response JSON:
{
  "intent": "unknown", // Could be argued for "process_zoom_meeting" but for MVP, keep intents distinct and simpler. Let user send link and process command separately.
  "zoom_url": "zoom.us/j/meeting123",
  "spreadsheet_url": null,
  "spreadsheet_id": "abc123" // LLM might try to extract even if "link spreadsheet" intent not primary, for MVP, focus on clear intent keywords.
}


Current User Message: [USER_MESSAGE_HERE]
```

**Key Cursor Rules Applied (Intent Recognition):**

*   **Clear Instructions:** Explicitly states the task: "analyze...and determine their intent," classify into categories, extract URLs/IDs.
*   **Role Definition:** Sets the persona as a "specialized AI assistant for Kwill," defining the context.
*   **JSON Schema:** Precisely defines the JSON output format, including fields and possible values for "intent."
*   **Examples (Few-Shot):** Provides diverse examples to guide the LLM on different intents and input formats.
*   **Finance Jargon Context (Limited for Intent):** Mentions finance context but clarifies it's *not* the primary focus for intent *recognition* (more for entity extraction).

**II. Cursor Rules for Entity Extraction Prompt**

**Task:** Analyze Zoom meeting transcripts and extract key entities relevant to investor meetings, such as startups, funding information, and action items.

**Prompt Structure:**

```
System Prompt:
You are an expert AI assistant specializing in analyzing transcripts of investor meetings, particularly venture capital and angel investor meetings. Your role is to extract key information relevant to investment decisions and reporting. You understand financial terminology common in investor meetings, including terms like "Series A," "valuation," "term sheet," "dilution," "cap table," "due diligence," "venture debt," "exit strategy," "runway," "burn rate," "ARR," "MRR," etc.  You must respond in JSON format as instructed.

Transcript: [MEETING_TRANSCRIPT_HERE]

Instructions:
Analyze the provided meeting transcript and extract the following information. Follow these steps and output your response in JSON format.

Step 1: Identify all mentions of company names or startup names discussed in the meeting. List them under the JSON key "startups" as an array of strings.  Be as comprehensive as possible.

Step 2: Look for any mentions of funding rounds (e.g., "Seed," "Series A," "Series B," "Pre-Seed," "Series C," "Venture Debt," "Bridge Round," "Growth Equity"). Classify the most prominent funding stage discussed for the *main startup(s)* in the meeting. Output the funding stage under the key "funding_stage". If no specific funding stage is clearly mentioned, output "unknown".

Step 3: Identify any *explicit* funding amounts or valuation figures discussed for any startup.  Extract the numerical value and the currency. Output under the key "funding_amount" as a string (e.g., "$500,000", "€1.2 million", "unknown" if not mentioned). Be conservative and only extract amounts that are clearly stated.

Step 4: Identify any *explicit action items* or next steps agreed upon during the meeting. List them as a bulleted list of strings under the key "action_items". Focus on concrete actions that were decided, not just general discussion points.

Step 5:  Summarize the main purpose and key discussion points of the meeting in 2-3 concise sentences. Output this summary under the key "summary".

Response Format (JSON):
{
  "meeting_date": "YYYY-MM-DD", // Attempt to infer meeting date if mentioned, otherwise "unknown"
  "startups": ["Startup Name 1", "Startup Name 2", ...], // Array of startup names, empty array if none found
  "funding_stage": "...", // e.g., "Seed Round", "Series A", "unknown"
  "funding_amount": "...", // e.g., "$500,000", "€1.2 million", "unknown"
  "action_items": [ // Array of action items, empty array if none found
    "Action item 1",
    "Action item 2",
    ...
  ],
  "summary": "..." // 2-3 sentence summary of the meeting.
}

Finance Jargon Emphasis: Remember to leverage your understanding of investor and finance-specific terminology (provided in the System Prompt) to accurately identify funding stages, valuations, and relevant entities within the transcript. For example, "term sheet discussion" implies a funding round context. "Due diligence checklist" implies an action item.

Example (Partial Transcript Snippet):
... "We are excited about Acme Corp. They are currently raising a Series A round, looking for $5 million at a $20 million pre-money valuation.  Our action item is to schedule a follow-up with their team next week to discuss the term sheet"...

Example Response JSON (based on snippet):
{
  "meeting_date": "unknown", // Not explicitly in snippet
  "startups": ["Acme Corp"],
  "funding_stage": "Series A",
  "funding_amount": "$5 million",
  "action_items": [
    "Schedule a follow-up with Acme Corp team next week to discuss the term sheet"
  ],
  "summary": "Meeting discussed Acme Corp's Series A funding round and next steps to discuss the term sheet."
}

Current Meeting Transcript: [MEETING_TRANSCRIPT_HERE]
```

**Key Cursor Rules Applied (Entity Extraction):**

*   **Clear Instructions (Step-by-Step):** Breaks down the complex extraction task into numbered steps for the LLM to follow (identify startups, funding stage, amounts, action items, summary).
*   **Role Definition (Expert Domain Assistant):**  Defines the persona as an "expert AI assistant specializing in analyzing transcripts of investor meetings," emphasizing domain expertise.
*   **Finance Jargon Context (Strong Emphasis):**  System prompt and instructions explicitly highlight the importance of understanding and leveraging finance jargon to improve extraction accuracy. Provides examples of relevant terms.
*   **JSON Schema:** Defines a detailed JSON schema for the extracted entities, specifying data types (arrays, strings, "unknown" values).
*   **Examples (Few-Shot):** Includes a partial transcript example and the desired JSON output to illustrate the expected extraction and formatting.
*   **Specific Keys and Output Format:**  Clearly specifies the keys to use in the JSON output ("startups", "funding_stage", "action_items", etc.) for easy parsing in the backend code.

**III. Technology-Specific Implementation Tips (Prompts in Kwill MVP Code):**

*   **Vercel AI SDK (`OpenAIStream`, `GroqStream`):**
    *   In your Next.js API routes (e.g., `/app/api/chat/route.ts`), store these prompts as template strings within your `sendMessage` function, as demonstrated in the Design Document code example.
    *   Pass the `intentPrompt` and `extractionPrompt` (populated with user message or transcript) to `OpenAIStream` or `GroqStream`.

*   **TypeScript Interfaces (for JSON Validation):**
    *   Define TypeScript interfaces that precisely match the JSON schemas defined in the prompts (e.g., `IntentRecognitionJsonOutput`, `EntityExtractionJsonOutput`).
    *   Use type assertions (`as IntentRecognitionJsonOutput`) when parsing the JSON response from the LLM to ensure type safety in your backend code.

**IV. Iterative Refinement and Testing:**

*   **A/B Testing Prompts:** Experiment with variations of these prompts (e.g., different wording, step order, example sets). A/B test different prompts to measure their impact on JSON output reliability, accuracy, and speed.
*   **Evaluate JSON Validity:**  Monitor the LLM's JSON output. Ensure it consistently produces valid JSON that conforms to your defined schemas. Implement error handling for cases where JSON parsing fails.
*   **Accuracy Metrics:**  Define metrics to evaluate the accuracy of entity extraction (e.g., precision, recall for startup names, funding stages, action items). Test prompts on a diverse set of meeting transcripts and measure these metrics.
*   **User Feedback Loop:** In beta testing, gather user feedback on the accuracy and usefulness of the extracted information. Use user feedback to further refine prompts and improve performance.

**Conclusion: Cursor Rules for Reliable JSON Output in Kwill MVP**

These Cursor Rules, with detailed prompt structures and examples, are designed to guide the Groq LPU model to generate reliable structured JSON output for both intent recognition and entity extraction in Kwill MVP.  By following these guidelines and engaging in iterative prompt refinement and testing, you can build a robust and valuable AI agent for investor workflows. Remember to continuously monitor performance and adapt the prompts as needed based on testing and user feedback.