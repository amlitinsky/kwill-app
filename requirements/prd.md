# Kwill Product Requirements Document
Version 1.0 | December 2024

## 1. Product Overview

### 1.1 Problem Statement
Business professionals and investors need an efficient way to capture, analyze, and organize key information from Zoom meetings into structured data formats. Manual note-taking and data entry are time-consuming and prone to errors.

### 1.2 Revised Product Vision
Kwill is a vertical AI agent platform that enables natural language interaction with business automation workflows, specializing in meeting intelligence and data orchestration through conversational interfaces.

### 1.3 Target Users
- Primary: Venture capitalists and investors
- Secondary: Business professionals conducting structured interviews
- Tertiary: Anyone needing to convert meeting discussions into structured data

## 2. Product Architecture

### 2.1 Updated Technology Stack
- **Core Stack**: Next.js 15, tRPC, Drizzle ORM, Auth.js
- **AI Infrastructure**: Vercel AI SDK, LangChain
- **Key Additions**:
  - Agent orchestration with LangGraph
  - Real-time communication with PartyKit
  - Vector DB for agent memory

## 3. Core Features

### 3.1 Authentication & Authorization
- Google OAuth integration
- Email/password authentication
- Session management with automatic logout
- Role-based access control

### 3.2 Meeting Management
- Create new meeting queries
- Zoom bot integration
- Calendly integration for automated scheduling
- Real-time meeting status tracking (supabase realtime websockets maybe)
- Historical meeting access

### 3.3 Data Processing Pipeline
1. Meeting Recording (Recall.ai)
2. Transcription (Deepgram or Meeting Captions)
3. Analysis (Deepseek)
4. Data Extraction
5. Spreadsheet Update (Google Sheets API)

### 3.4 User Interface
#### Public Pages
- Landing page with clear value proposition
- Pricing information
- Product features
- Login/Signup
- Terms of Service and Privacy Policy

#### Authenticated Pages
- Dashboard (meeting overview)
- Create Meeting interface
- Settings management
- Analytics dashboard
- Billing management

## 4. Business Logic

### 4.1 Pricing Model
- Subscription based model (5, 10, 20 hours priced at $20, $30, $40)
- If user uses all hours by the end of the month, they can purchase more hours at an overage rate of $3.5 per hour
- Bot auto-disconnection on exceeding purchased hours
- Transparent API cost management

### 4.2 Meeting Processing
- Spreadsheet validation before meeting
- Column header extraction
- Custom instruction support
- Speaker exclusion capability
- Automated data mapping
- Error handling and validation

## 5. Technical Requirements

### 5.1 Performance
- Maximum meeting processing time: 10 minutes
- UI response time: < 200ms
- 99.9% uptime for core services

### 5.2 Security
- End-to-end encryption for meeting data
- Secure API key management
- Row-level security in Supabase
- GDPR compliance
- SOC 2 compliance readiness

### 5.3 Scalability
- Horizontal scaling capability
- Redis-based idempotency
- Asynchronous job processing
- Load balancing

## 6. User Experience Requirements

### 6.1 Interface Design
- Clean, intuitive navigation
- Responsive design
- Consistent branding
- Clear status indicators
- Error messaging
- Loading states

### 6.2 User Flows
1. Meeting Setup
   - Spreadsheet link validation
   - Column header review
   - Custom instruction input
   - Speaker exclusion selection

2. Meeting Execution
   - Status tracking
   - Progress indicators
   - Error notifications

3. Data Review
   - Transcript access
   - Data mapping review
   - Manual override capability

## 7. Future Considerations

### 7.1 Planned Features
- Meeting templates
- Bulk meeting processing
- Advanced analytics
- Custom API integrations
- Team collaboration features

### 7.2 Technical Debt
- Migration to newer API versions
- Performance optimization
- Code refactoring
- Testing automation

## 8. Success Metrics

### 8.1 Key Performance Indicators
- Meeting processing success rate
- Data accuracy rate
- User retention rate
- Processing time
- Customer satisfaction score

### 8.2 Business Metrics
- Monthly recurring revenue
- Customer acquisition cost
- Average revenue per user
- API cost per meeting

## 3.1 New Core Features
### AI Agent Interface
- Natural language command processing
- Context-aware workflow activation
- Multi-modal interaction (text/voice)
- Agent-to-agent collaboration

### Vertical-Specific Capabilities
- "Create meeting bot" → Zoom integration
- "Analyze last meeting" → Data pipeline trigger
- "Show revenue trends" → Chart generation