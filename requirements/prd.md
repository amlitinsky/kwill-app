# Kwill Product Requirements Document
Version 1.0 | December 2024

## 1. Product Overview

### 1.1 Problem Statement
Business professionals and investors need an efficient way to capture, analyze, and organize key information from Zoom meetings into structured data formats. Manual note-taking and data entry are time-consuming and prone to errors.

### 1.2 Product Vision
Kwill is an AI-powered meeting assistant that automatically captures, analyzes, and organizes meeting information into structured spreadsheet data, focusing primarily on investor calls and business meetings.

### 1.3 Target Users
- Primary: Venture capitalists and investors
- Secondary: Business professionals conducting structured interviews
- Tertiary: Anyone needing to convert meeting discussions into structured data

## 2. Product Architecture

### 2.1 Technology Stack
- Frontend: Next.js 15, TailwindCSS, ShadCN UI
- Backend: Next.js API routes
- Database & Auth: Supabase
- APIs:
  - Recall.ai: Zoom meeting bot and recording
  - AssemblyAI: Speech transcription
  - Claude.ai: Transcript analysis and data extraction
  - Google Sheets: Data storage
  - Stripe: Payment processing
  - Calendly: Meeting scheduling integration
- Infrastructure:
  - Hosting: Vercel
  - Queue: Qstash/Upstash
  - Cache: Redis
  - Runtime: Node.js
  - Package Manager: Yarn

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
- Real-time meeting status tracking
- Historical meeting access

### 3.3 Data Processing Pipeline
1. Meeting Recording (Recall.ai)
2. Transcription (AssemblyAI)
3. Analysis (Claude.ai)
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
- Create Query interface
- Settings management
- Analytics dashboard
- Billing management

## 4. Business Logic

### 4.1 Pricing Model
- Pay-as-you-go system based on meeting hours
- Automatic renewal option
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