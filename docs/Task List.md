Task List

## Phase 1: Foundation & Authentication (Weeks 1-1.5)

### Backend Setup
- [ ] **T1.1** Initialize Node.js + Express project (2h)
  - Install dependencies: express, dotenv, cors, helmet
  - Create folder structure (routes, controllers, models, middleware)
  - Setup error handling & logging middleware
  - Dependencies: None | Priority: P0 | Blocker

- [ ] **T1.2** Setup MongoDB connection & schema (3h)
  - Install mongoose
  - Create connection string from .env
  - Define all 6 collections (accounts, brandProfiles, generatedPosts, postMetrics, settings, agentLogs)
  - Add indexes for frequently queried fields
  - Dependencies: T1.1 | Priority: P0 | Blocker

- [ ] **T1.3** Environment configuration (.env file) (1h)
  - MongoDB URI
  - LinkedIn OAuth (client_id, client_secret, redirect_uri)
  - GROQ API key
  - Brave Search API key
  - JWT secret (if needed)
  - Node environment (dev/prod)
  - Dependencies: None | Priority: P0 | Blocker

- [ ] **T1.4** Implement authentication middleware (3h)
  - JWT token generation & validation
  - OAuth state management
  - Session storage (optional: Redis)
  - Token refresh logic
  - Dependencies: T1.2, T1.3 | Priority: P0 | Blocker

### LinkedIn OAuth Implementation
- [ ] **T1.5** LinkedIn OAuth flow (Authorize Code Flow) (4h)
  - Create `/auth/linkedin` endpoint (redirects to LinkedIn)
  - Create `/auth/callback` endpoint (handles OAuth response)
  - Store access_token + refresh_token in DB
  - Implement token refresh on expiration
  - Add error handling for OAuth failures
  - Dependencies: T1.1, T1.2, T1.4 | Priority: P0 | Blocker

- [ ] **T1.6** Account connection logic (3h)
  - Fetch user's LinkedIn profile (GET /v2/me)
  - For organization accounts: fetch org URN
  - Store account details in MongoDB
  - Handle multiple accounts per user
  - Dependencies: T1.5 | Priority: P0 | Blocker

- [ ] **T1.7** Account selector logic (2h)
  - Endpoint: GET /api/accounts (list all connected)
  - Endpoint: POST /api/accounts (add new)
  - Endpoint: DELETE /api/accounts/:accountId (disconnect)
  - Account validation & permissions
  - Dependencies: T1.6 | Priority: P0

### Frontend Setup
- [ ] **T1.8** React + TypeScript scaffold (2h)
  - Install Vite, React, TypeScript
  - Create folder structure (components, pages, hooks, utils, services)
  - Setup Tailwind CSS
  - Setup React Router
  - Dependencies: None | Priority: P0 | Blocker

- [ ] **T1.9** API client setup (2h)
  - Create axios instance with auth headers
  - Setup interceptors for token refresh
  - Error handling layer
  - Dependencies: T1.8 | Priority: P0

- [ ] **T1.10** Login page & OAuth flow (3h)
  - "Login with LinkedIn" button
  - Redirect to `/auth/linkedin`
  - Capture OAuth callback (state validation)
  - Store JWT token in localStorage
  - Dependencies: T1.5, T1.8, T1.9 | Priority: P0 | Blocker

- [ ] **T1.11** Account selector UI (2h)
  - Dropdown/modal to choose 1 of 3 accounts
  - Fetch list from GET /api/accounts
  - Display account name + type (person/org)
  - Switch accounts functionality
  - Dependencies: T1.10, T1.7 | Priority: P0

### Dashboard Skeleton
- [ ] **T1.12** Layout & navigation shell (2h)
  - Header with account selector
  - Sidebar with navigation (Dashboard, Accounts, Settings, Analytics)
  - Responsive design (desktop/tablet)
  - Dark mode toggle (optional)
  - Dependencies: T1.8 | Priority: P1

- [ ] **T1.13** Empty dashboard page (1h)
  - Placeholder for post calendar
  - Status cards (pending posts, metrics)
  - Dependencies: T1.12 | Priority: P1

### Database Models & Validation
- [ ] **T1.14** Define & export all Mongoose schemas (2h)
  - Accounts schema
  - BrandProfiles schema
  - GeneratedPosts schema
  - PostMetrics schema
  - Settings schema
  - AgentLogs schema
  - Add validation rules
  - Dependencies: T1.2 | Priority: P0 | Blocker

### Testing & Documentation
- [ ] **T1.15** Setup testing framework (Jest + Supertest) (2h)
  - Configure Jest for Node.js
  - Configure Supertest for API testing
  - Create test utilities
  - Dependencies: T1.1 | Priority: P2

- [ ] **T1.16** Basic integration tests for OAuth flow (2h)
  - Test login endpoint
  - Test callback handler
  - Test token storage
  - Dependencies: T1.5, T1.15 | Priority: P2

- [ ] **T1.17** Documentation: Setup & deployment guide (2h)
  - Local setup instructions
  - Environment variable explanation
  - Database setup
  - VPS deployment steps
  - Dependencies: All Phase 1 | Priority: P1

**Phase 1 Total: 40-50 hours**

---

## Phase 2: Agent Architecture & GROQ Integration (Weeks 1.5-2.5)

### GROQ Integration Setup
- [ ] **T2.1** GROQ API client setup (2h)
  - Install groq SDK
  - Create API wrapper (src/services/groq.js)
  - Implement error handling & retries
  - Add cost tracking (optional)
  - Dependencies: T1.3 | Priority: P0 | Blocker

- [ ] **T2.2** Prompt engineering & testing (4h)
  - Create base system prompts for each agent
  - Test prompts locally with GROQ
  - Iterate for best quality output
  - Document prompt versions
  - Dependencies: T2.1 | Priority: P0 | Blocker

### Social Media Manager Agent
- [ ] **T2.3** Social Media Manager agent core (5h)
  - Input: brand profile, content pillars, history
  - Process: analyze trends, generate 7 topics
  - Implement Brave Search integration (1 call)
  - Output: topic list with hooks & angles
  - Error handling & fallbacks
  - Dependencies: T2.1, T2.2 | Priority: P0 | Blocker

- [ ] **T2.4** SM Manager prompt refinement (3h)
  - Test with actual account data
  - Iterate for quality
  - Add few-shot examples in prompt
  - Document best practices
  - Dependencies: T2.3 | Priority: P1

### Content Writer Agent
- [ ] **T2.5** Content Writer agent core (5h)
  - Input: topic, brand voice, tone, pillar
  - Process: draft copy (2-3 paras), CTAs, hashtags
  - Implement Brave Search integration (optional 1 call)
  - Output: structured content (copy, cta, hashtags)
  - Error handling & fallbacks
  - Dependencies: T2.1, T2.2 | Priority: P0 | Blocker

- [ ] **T2.6** Content Writer prompt refinement (3h)
  - Test with topics from T2.3
  - Iterate for engagement
  - Add tone examples in prompt
  - Test CTA variations
  - Dependencies: T2.5 | Priority: P1

### Graphic Designer Agent
- [ ] **T2.7** Graphic Designer agent core (6h)
  - Input: topic, content, brand voice, image style
  - Process: generate HTML/CSS design code
  - Create design templates for: quote card, carousel, infographic
  - Ensure LinkedIn dimensions (1200x627px)
  - Output: HTML code with inline CSS
  - Dependencies: T2.1, T2.2 | Priority: P0 | Blocker

- [ ] **T2.8** Graphic Designer prompt refinement (3h)
  - Test HTML generation quality
  - Ensure valid HTML/CSS
  - Add design system guidelines
  - Test brand color usage
  - Dependencies: T2.7 | Priority: P1

### Brave Search Integration
- [ ] **T2.9** Brave Search API wrapper (2h)
  - Install/setup Brave Search SDK
  - Create wrapper function with error handling
  - Implement search query builder
  - Add cost tracking (count searches per post)
  - Dependencies: T1.3 | Priority: P0 | Blocker

- [ ] **T2.10** Integrate Brave Search into agents (3h)
  - Social Media Manager calls search (trends)
  - Content Writer optional search (facts)
  - Graphic Designer optional search (design inspiration)
  - Add search count limits (3-cap per post)
  - Dependencies: T2.3, T2.5, T2.7, T2.9 | Priority: P0 | Blocker

### Agent Orchestration
- [ ] **T2.11** Agent pipeline orchestrator (5h)
  - Create orchestration service (src/services/agentOrchestrator.js)
  - Sequential pipeline: Manager → Writer → Designer
  - Pass context between agents
  - Store agent interactions in agentLogs collection
  - Implement timeouts & error recovery
  - Dependencies: T2.3, T2.5, T2.7 | Priority: P0 | Blocker

- [ ] **T2.12** Agent context management (3h)
  - Build context object from brand profile
  - Include recent post performance data
  - Track search queries used per post
  - Add agent conversation logging
  - Dependencies: T2.11 | Priority: P1

### Image Rendering (HTML → PNG)
- [ ] **T2.13** Setup image rendering engine (3h)
  - Install Puppeteer or Playwright
  - Create render service (src/services/imageRenderer.js)
  - Render HTML → PNG at 1200x627px
  - Add error handling & retries
  - Store images in /uploads/images/
  - Dependencies: T1.3 | Priority: P0 | Blocker

- [ ] **T2.14** Image rendering tests & optimization (2h)
  - Test rendering quality
  - Optimize rendering speed
  - Handle special characters & emojis
  - Test brand colors rendering
  - Dependencies: T2.13 | Priority: P1

### Testing & Validation
- [ ] **T2.15** Agent output validation (3h)
  - Validate Social Media Manager output structure
  - Validate Content Writer output structure
  - Validate Graphic Designer HTML output
  - Create validation schemas (Joi/Zod)
  - Dependencies: T2.3, T2.5, T2.7 | Priority: P1

- [ ] **T2.16** E2E agent test (topic → content → design) (3h)
  - End-to-end test with mock brand profile
  - Test full pipeline: manager → writer → designer
  - Test image rendering
  - Test Brave Search integration
  - Dependencies: T2.11, T2.13 | Priority: P1

- [ ] **T2.17** Prompt quality tests (2h)
  - Test various brand voices
  - Test different content pillars
  - Test image style variations
  - Document failing cases
  - Dependencies: T2.4, T2.6, T2.8 | Priority: P2

### Documentation
- [ ] **T2.18** Agent architecture documentation (3h)
  - Explain each agent's responsibility
  - Document prompt engineering approach
  - API reference for agent endpoints
  - Troubleshooting guide
  - Dependencies: All T2.x | Priority: P1

**Phase 2 Total: 60-80 hours**

---

## Phase 3: LinkedIn API & Post Generation (Weeks 2.5-3.5)

### LinkedIn API Integration
- [ ] **T3.1** LinkedIn Posts API wrapper (4h)
  - Install LinkedIn API client (or use REST)
  - Create posts.js service
  - Implement POST endpoint to create posts
  - Support text + image + document
  - Handle response & extract post ID
  - Dependencies: T1.6 | Priority: P0 | Blocker

- [ ] **T3.2** LinkedIn Analytics API wrapper (3h)
  - Implement GET endpoint for post metrics
  - Fetch: impressions, reactions, comments, clicks, shares
  - Handle pagination & time ranges
  - Error handling & retries
  - Dependencies: T1.6 | Priority: P0 | Blocker

- [ ] **T3.3** LinkedIn OAuth token refresh (2h)
  - Auto-refresh access token on expiration
  - Store new token in DB
  - Implement pre-emptive refresh (before expiry)
  - Dependencies: T1.5 | Priority: P0 | Blocker

### Post Generation & Storage
- [ ] **T3.4** Post data model refinement (2h)
  - Define complete post schema
  - Add fields: text, image, imageUrl, status, scheduledTime, linkedinPostId
  - Add metrics fields
  - Add search queries used, agent logs
  - Dependencies: T1.14 | Priority: P0 | Blocker

- [ ] **T3.5** Post creation endpoint (3h)
  - POST /api/posts/generate - trigger generation
  - Input: accountId, count (7), scheduling (7 days)
  - Call agent orchestrator (T2.11)
  - Save generated posts to DB
  - Return post list with images
  - Dependencies: T2.11, T3.4 | Priority: P0 | Blocker

- [ ] **T3.6** Post list endpoint (2h)
  - GET /api/posts/:accountId - fetch scheduled posts
  - Filter by status (scheduled, posted, failed, cancelled)
  - Sort by scheduled time
  - Return with image URLs
  - Dependencies: T3.4 | Priority: P0

- [ ] **T3.7** Post details endpoint (2h)
  - GET /api/posts/:postId - fetch single post
  - Include all metadata, images, agent logs
  - Include metrics if posted
  - Dependencies: T3.4 | Priority: P1

### Scheduling & Publication
- [ ] **T3.8** Job queue setup (Node-schedule or Bull) (3h)
  - Install node-schedule (simple) or Bull (advanced)
  - Create job manager service
  - Queue generation jobs (every Monday)
  - Queue publication jobs (scheduled times)
  - Dependencies: T1.2, T1.3 | Priority: P0 | Blocker

- [ ] **T3.9** Weekly generation job (3h)
  - Schedule: Every Monday 00:00 IST
  - Fetch all accounts with active settings
  - For each account, run agent pipeline (T2.11)
  - Generate 7 posts spread across 7 days
  - Store in DB with status "scheduled"
  - Error logging & alerts
  - Dependencies: T3.5, T3.8 | Priority: P0 | Blocker

- [ ] **T3.10** Post publication job (3h)
  - Check queue for posts due to publish
  - Call LinkedIn Posts API (T3.1)
  - Store linkedinPostId & postedTime
  - Update post status to "posted"
  - Handle failures: retry with backoff
  - Dependencies: T3.1, T3.8 | Priority: P0 | Blocker

- [ ] **T3.11** Manual generation trigger (2h)
  - POST /api/posts/generate endpoint
  - Immediate execution (not queued)
  - Returns generated posts
  - Error handling
  - Dependencies: T3.5 | Priority: P1

- [ ] **T3.12** Reschedule & cancel endpoints (3h)
  - PUT /api/posts/:postId - edit scheduled time
  - DELETE /api/posts/:postId - cancel post
  - Check if already posted (prevent cancelling)
  - Update job queue
  - Dependencies: T3.8, T3.10 | Priority: P1

- [ ] **T3.13** Publish now endpoint (2h)
  - POST /api/posts/:postId/publish-now
  - Override schedule, publish immediately
  - Call LinkedIn API
  - Store result
  - Dependencies: T3.1, T3.10 | Priority: P1

### Error Handling & Resilience
- [ ] **T3.14** LinkedIn API error handling (3h)
  - Handle rate limiting (429)
  - Handle auth failures (401)
  - Handle post validation errors
  - Implement exponential backoff
  - Store error details for debugging
  - Dependencies: T3.1, T3.2 | Priority: P0

- [ ] **T3.15** Agent failure fallback (2h)
  - If agent fails, use template-based content
  - Log agent failures
  - Alert user in dashboard
  - Allow manual override
  - Dependencies: T2.11 | Priority: P1

- [ ] **T3.16** Image rendering failure handling (2h)
  - If image fails to render, use placeholder
  - Allow re-render from dashboard
  - Log render failures
  - Dependencies: T2.13 | Priority: P1

### Testing
- [ ] **T3.17** LinkedIn API integration tests (3h)
  - Mock LinkedIn API responses
  - Test post creation
  - Test metrics fetching
  - Test token refresh
  - Dependencies: T3.1, T3.2, T3.3 | Priority: P2

- [ ] **T3.18** Job queue tests (2h)
  - Test weekly generation job
  - Test publication job
  - Test job retry logic
  - Dependencies: T3.8, T3.9, T3.10 | Priority: P2

- [ ] **T3.19** End-to-end generation → posting test (3h)
  - Generate posts
  - Publish them
  - Verify in LinkedIn (if possible)
  - Check status updates
  - Dependencies: T3.5, T3.10 | Priority: P2

### Documentation
- [ ] **T3.20** LinkedIn API integration guide (2h)
  - Document OAuth flow
  - Document post creation API
  - Document metrics API
  - Troubleshooting LinkedIn errors
  - Dependencies: All T3.x | Priority: P1

**Phase 3 Total: 50-70 hours**

---

## Phase 4: Dashboard UI & Settings (Weeks 3.5-4.5)

### Main Dashboard
- [ ] **T4.1** Post calendar view (5h)
  - 7-day calendar grid
  - Show scheduled posts per day
  - Color-code by account
  - Show post preview on hover
  - Click to view/edit post
  - Dependencies: T1.12, T3.6 | Priority: P0 | Blocker

- [ ] **T4.2** Post preview modal (3h)
  - Display post text
  - Display post image (rendered PNG)
  - Display metrics (if posted)
  - Show scheduled time
  - Edit/reschedule/delete buttons
  - Dependencies: T3.7 | Priority: P0

- [ ] **T4.3** Status cards (2h)
  - Posts scheduled (count)
  - Posts posted this week (count)
  - Avg engagement rate
  - Next generation date
  - Dependencies: T1.13 | Priority: P1

- [ ] **T4.4** Generate posts button (2h)
  - Manual trigger for 7-day generation
  - Show loading state
  - Display generated posts
  - Error alerts
  - Dependencies: T3.11, T4.1 | Priority: P0

### Account Management
- [ ] **T4.5** Accounts page (3h)
  - List all connected accounts
  - Account name, type (person/org), status
  - Connect new account button
  - Disconnect button with confirmation
  - Default account selector
  - Dependencies: T1.11, T1.7 | Priority: P1

- [ ] **T4.6** Connect account flow (3h)
  - "Connect LinkedIn Account" button
  - OAuth popup/redirect
  - Handle callback & token storage
  - Verify connection
  - Add to account list
  - Dependencies: T1.5, T4.5 | Priority: P1

### Brand Profile Settings
- [ ] **T4.7** Brand profile form (4h)
  - Account selector (dropdown)
  - Account name (display only)
  - Brand voice textarea
  - Tone dropdown (professional/casual/witty/educational)
  - Content pillars (multi-select + add custom)
  - Hashtags (comma-separated input)
  - Image style dropdown
  - Save button with validation
  - Dependencies: T1.14, T3.4 | Priority: P0 | Blocker

- [ ] **T4.8** Brand profile API endpoints (3h)
  - GET /api/brand-profiles/:accountId
  - POST /api/brand-profiles/:accountId (create/update)
  - PUT /api/brand-profiles/:accountId (update)
  - Input validation & sanitization
  - Dependencies: T1.2, T4.7 | Priority: P0

- [ ] **T4.9** Brand profile preview (2h)
  - Preview how selected voice/tone will be applied
  - Example post snippet
  - Tone color indicator
  - Dependencies: T4.7 | Priority: P2

### Scheduling Settings
- [ ] **T4.10** Schedule settings form (3h)
  - Account selector
  - Post frequency (flexible dropdown: 1/day, 3/week, 5/week, custom)
  - Posting times (multi-select: 08:00, 12:00, 18:00, custom)
  - Timezone selector (default: IST)
  - Generation frequency (fixed: every Monday)
  - Next generation date (display only)
  - Save button
  - Dependencies: T1.14 | Priority: P0 | Blocker

- [ ] **T4.11** Schedule settings API endpoints (2h)
  - GET /api/settings/:accountId
  - POST /api/settings/:accountId (create/update)
  - Validate posting times (within 24h)
  - Validate timezone
  - Dependencies: T1.2, T4.10 | Priority: P0

### Advanced Features
- [ ] **T4.12** Manual post creation (4h)
  - Form: post text, upload image OR enter HTML design
  - Schedule time picker (date + time)
  - Preview before saving
  - Save to DB (status: scheduled)
  - Can override generated posts
  - Dependencies: T3.4 | Priority: P2

- [ ] **T4.13** Post edit functionality (3h)
  - Edit post text
  - Edit scheduled time
  - Re-render image if HTML changed
  - Show edit history (optional)
  - Dependencies: T4.12, T3.4 | Priority: P2

- [ ] **T4.14** Post filtering & search (2h)
  - Filter by account
  - Filter by status (scheduled, posted, failed)
  - Search by keywords in post text
  - Sort by date, engagement
  - Dependencies: T3.6 | Priority: P2

### Responsive Design & UX
- [ ] **T4.15** Mobile responsive layout (3h)
  - Mobile-first design
  - Stack cards vertically on mobile
  - Touch-friendly buttons
  - Responsive calendar (swipeable on mobile)
  - Test on tablet & phone
  - Dependencies: T4.1 | Priority: P2

- [ ] **T4.16** Dark/Light theme (2h)
  - Theme toggle in header
  - Persist theme preference
  - Use Tailwind dark mode
  - Test contrast on both themes
  - Dependencies: T1.12 | Priority: P2

- [ ] **T4.17** Loading states & error handling (2h)
  - Loading spinners
  - Error toast notifications
  - Empty states (no posts, no accounts)
  - Skeleton screens
  - Dependencies: T4.1 | Priority: P1

### Testing
- [ ] **T4.18** Component tests (React Testing Library) (4h)
  - Test calendar component
  - Test forms (brand profile, settings)
  - Test modal interactions
  - Test filter/search logic
  - Dependencies: T4.1 | Priority: P2

- [ ] **T4.19** E2E dashboard tests (Cypress) (3h)
  - Login → select account
  - View scheduled posts
  - Generate posts
  - Update settings
  - Verify data persistence
  - Dependencies: All T4.x | Priority: P2

### Documentation
- [ ] **T4.20** Dashboard user guide (2h)
  - Screenshots of each page
  - Step-by-step workflows
  - Troubleshooting common issues
  - Video tutorials (optional)
  - Dependencies: All T4.x | Priority: P1

**Phase 4 Total: 50-60 hours**

---

## Phase 5: Analytics & LinkedIn Metrics (Weeks 4.5-5.5)

### Metrics Collection
- [ ] **T5.1** Post metrics collection job (3h)
  - Daily job to fetch metrics for posted posts
  - Call LinkedIn Analytics API (T3.2)
  - Store in postMetrics collection
  - Handle failures gracefully
  - Dependencies: T3.2 | Priority: P0 | Blocker

- [ ] **T5.2** Metrics aggregation (3h)
  - Aggregate metrics by account
  - Calculate engagement rate per post
  - Track trending topics by performance
  - Store aggregated metrics
  - Dependencies: T5.1 | Priority: P1

- [ ] **T5.3** Post-level metrics API (2h)
  - GET /api/analytics/:accountId/posts/:postId
  - Return impressions, reactions, comments, clicks, shares
  - Include timestamps
  - Dependencies: T5.1 | Priority: P0

### Analytics Dashboard
- [ ] **T5.4** Analytics page layout (2h)
  - Account selector
  - Date range picker (last 7/30/90 days)
  - KPI cards (impressions, engagement, clicks)
  - Charts section
  - Dependencies: T1.12 | Priority: P0 | Blocker

- [ ] **T5.5** Impressions chart (3h)
  - Line chart: impressions over time
  - Use Recharts library
  - X-axis: date, Y-axis: impressions
  - Tooltip on hover
  - Interactive legend
  - Dependencies: T5.4 | Priority: P0

- [ ] **T5.6** Engagement metrics chart (3h)
  - Bar chart: reactions, comments, shares per post
  - Stacked bars
  - Hover details
  - Filter by metric
  - Dependencies: T5.4 | Priority: P0

- [ ] **T5.7** Top performing posts table (3h)
  - Table: post content, impressions, engagement rate
  - Sortable columns
  - Link to post preview
  - Show date posted
  - Dependencies: T5.3, T5.4 | Priority: P1

- [ ] **T5.8** Account-level KPIs (2h)
  - GET /api/analytics/:accountId/metrics
  - Total impressions, engagement rate, avg clicks
  - Growth rate (week over week)
  - Best performing content pillar
  - Dependencies: T5.2 | Priority: P1

### Advanced Analytics
- [ ] **T5.9** Content pillar performance (3h)
  - Track engagement by content pillar
  - Show which pillars perform best
  - Recommendations for content balance
  - Chart: pillar vs engagement
  - Dependencies: T5.2 | Priority: P2

- [ ] **T5.10** Tone/voice performance (2h)
  - Track which tone generates most engagement
  - Show tone variants performance
  - Recommend tone for next posts
  - Dependencies: T5.2 | Priority: P2

- [ ] **T5.11** Time-of-day performance (2h)
  - Track which posting times get best engagement
  - Heatmap: hours of day vs engagement
  - Recommend optimal posting times
  - Dependencies: T5.2 | Priority: P2

- [ ] **T5.12** Export analytics (3h)
  - Export to CSV (posts, metrics, summary)
  - Export to PDF (dashboard snapshot)
  - Include charts & tables
  - Date range selection
  - Dependencies: T5.4 | Priority: P2

### Insights & Recommendations
- [ ] **T5.13** Engagement insights (3h)
  - Analyze trending topics
  - Show insights (e.g., "hashtag #AI boosted engagement by 25%")
  - Compare post types (quote, carousel, infographic)
  - Recommend content improvements
  - Dependencies: T5.2 | Priority: P2

- [ ] **T5.14** AI insights from GROQ (optional) (3h)
  - Feed analytics to GROQ
  - Get insights on what's working
  - Recommendations for next posts
  - Prompt: analyze metrics & suggest improvements
  - Dependencies: T2.1, T5.8 | Priority: P3

### Testing
- [ ] **T5.15** Metrics collection tests (2h)
  - Mock LinkedIn Analytics API
  - Test data aggregation
  - Test error handling
  - Dependencies: T5.1 | Priority: P2

- [ ] **T5.16** Analytics dashboard tests (3h)
  - Test chart rendering
  - Test date range filtering
  - Test data sorting
  - Dependencies: T5.4 | Priority: P2

### Documentation
- [ ] **T5.17** Analytics guide (2h)
  - How to interpret metrics
  - Guide to dashboards
  - Tips for improving engagement
  - FAQ
  - Dependencies: All T5.x | Priority: P1

**Phase 5 Total: 40-50 hours**

---

## Phase 6: Testing, Optimization & Deployment (Weeks 5.5-6)

### Integration Testing
- [ ] **T6.1** End-to-end generation test (3h)
  - Setup test accounts (LinkedIn sandbox if available)
  - Generate posts
  - Publish to LinkedIn
  - Verify metrics collection
  - Dependencies: All previous phases | Priority: P0 | Blocker

- [ ] **T6.2** Performance testing (3h)
  - Load test API endpoints
  - Test with 100+ scheduled posts
  - Test agent orchestration speed
  - Identify bottlenecks
  - Dependencies: All backend | Priority: P1

- [ ] **T6.3** Security testing (3h)
  - OAuth token security
  - API key storage & rotation
  - SQL/NoSQL injection tests
  - XSS & CSRF tests
  - Rate limiting tests
  - Dependencies: All auth & API | Priority: P0

### Optimization
- [ ] **T6.4** Backend optimization (3h)
  - Database indexing optimization
  - Query optimization
  - Caching frequently accessed data (Redis optional)
  - Connection pooling
  - Dependencies: T1.2 | Priority: P1

- [ ] **T6.5** Frontend optimization (2h)
  - Code splitting
  - Lazy loading
  - Image optimization
  - Bundle size analysis
  - Dependencies: T1.8 | Priority: P1

- [ ] **T6.6** API response optimization (2h)
  - Pagination for large lists
  - Only return needed fields
  - Compress responses
  - Cache headers
  - Dependencies: All API endpoints | Priority: P1

### Monitoring & Logging
- [ ] **T6.7** PM2 monitoring setup (2h)
  - PM2 Plus integration (or free monitoring)
  - Monitor CPU, memory, restart counts
  - Error alerts
  - PM2 logs configuration
  - Dependencies: Deployment setup | Priority: P1

- [ ] **T6.8** Application logging (2h)
  - Winston logger setup
  - Log levels (error, warn, info, debug)
  - Structured logging (JSON)
  - Log rotation
  - Dependencies: T1.1 | Priority: P1

- [ ] **T6.9** Error tracking & alerting (2h)
  - Sentry (or similar) for error tracking
  - Alert on critical errors
  - Email notifications
  - Error dashboard
  - Dependencies: T6.8 | Priority: P2

### Database & Backups
- [ ] **T6.10** MongoDB backup strategy (2h)
  - Daily backups
  - Backup retention policy
  - Restore testing
  - Document backup/restore process
  - Dependencies: T1.2 | Priority: P1

- [ ] **T6.11** Data migration scripts (2h)
  - Backup current data
  - Test migration to production DB
  - Rollback procedures
  - Dependencies: T1.2 | Priority: P1

### VPS Deployment
- [ ] **T6.12** VPS folder structure setup (1h)
  - Create /opt/linkedin-ai/ folder
  - Setup subdirectories (backend, frontend, uploads)
  - Setup permissions
  - Dependencies: None | Priority: P0 | Blocker

- [ ] **T6.13** PM2 ecosystem.config.js (2h)
  - Configure app startup
  - Environment variables
  - Log output paths
  - Error handling
  - Restart policy
  - Dependencies: T1.1 | Priority: P0 | Blocker

- [ ] **T6.14** Frontend build & serve (2h)
  - React build process
  - Serve static files from Express
  - Or use separate web server (nginx)
  - Dependencies: T1.8 | Priority: P0 | Blocker

- [ ] **T6.15** Environment configuration (1h)
  - Production .env file
  - Secure credential storage
  - MongoDB connection string
  - API keys
  - Dependencies: T1.3 | Priority: P0 | Blocker

- [ ] **T6.16** HTTPS/SSL setup (1h)
  - Verify LiteSpeed HTTPS
  - Set secure cookies
  - CORS configuration
  - Dependencies: LiteSpeed setup | Priority: P1

### Deployment Process
- [ ] **T6.17** Deploy backend (1h)
  - Copy files to /opt/linkedin-ai/backend
  - Install dependencies (npm ci)
  - Run migrations (if needed)
  - Start with PM2
  - Dependencies: T6.12, T6.13 | Priority: P0 | Blocker

- [ ] **T6.18** Deploy frontend (1h)
  - Build React (npm run build)
  - Copy dist to /opt/linkedin-ai/frontend
  - Setup serving (Express static or nginx)
  - Test routes
  - Dependencies: T6.12, T6.14 | Priority: P0 | Blocker

- [ ] **T6.19** Verify deployment (2h)
  - Test all endpoints
  - Test OAuth flow
  - Test post generation
  - Test dashboard
  - Check logs for errors
  - Dependencies: T6.17, T6.18 | Priority: P0 | Blocker

- [ ] **T6.20** Post-deployment smoke tests (1h)
  - Automated health checks
  - API response validation
  - Database connectivity
  - External API connectivity (LinkedIn, GROQ, Brave)
  - Dependencies: T6.19 | Priority: P1

### Documentation & Handoff
- [ ] **T6.21** Deployment runbook (2h)
  - Step-by-step deployment guide
  - Rollback procedures
  - Emergency procedures
  - Troubleshooting guide
  - Dependencies: All deployment | Priority: P1

- [ ] **T6.22** Operations guide (3h)
  - Daily operations
  - Monitoring dashboards
  - Log analysis
  - Handling common issues
  - Scaling guidance
  - Dependencies: All phases | Priority: P1

- [ ] **T6.23** Architecture documentation (2h)
  - System diagram (agents, APIs, DB)
  - Data flow diagrams
  - Deployment diagram
  - Technology choices & rationale
  - Dependencies: All phases | Priority: P1

- [ ] **T6.24** API documentation (2h)
  - OpenAPI/Swagger spec
  - Example requests & responses
  - Error codes & handling
  - Rate limits
  - Dependencies: All API endpoints | Priority: P1

- [ ] **T6.25** User documentation (2h)
  - Getting started guide
  - Dashboard walkthrough
  - FAQ
  - Video tutorials (optional)
  - Dependencies: All phases | Priority: P1

- [ ] **T6.26** Developer onboarding (2h)
  - Code style guide
  - Development setup
  - Running tests
  - Contributing guidelines
  - Dependencies: All phases | Priority: P1

### Final Checks
- [ ] **T6.27** Security audit checklist (2h)
  - OAuth implementation review
  - API authentication review
  - Data encryption review
  - Secrets management review
  - Dependencies: All auth/security | Priority: P0

- [ ] **T6.28** Performance audit (1h)
  - Dashboard load time (<2s)
  - API response time (<500ms)
  - Generation time (<5min for 7 posts)
  - Dependencies: T6.2, T6.4, T6.5 | Priority: P1

- [ ] **T6.29** Final UAT (User Acceptance Testing) (3h)
  - Test all workflows end-to-end
  - Test with real LinkedIn accounts
  - Gather feedback
  - Fix final issues
  - Dependencies: T6.19 | Priority: P0 | Blocker

- [ ] **T6.30** Production go-live (1h)
  - Final checks
  - Monitoring enabled
  - Alerts configured
  - Team available for support
  - Dependencies: T6.29 | Priority: P0 | Blocker

**Phase 6 Total: 40-50 hours**

---

## Total Task Count: 130+ tasks
## Total Effort: 280-360 hours (4-5 weeks for 1 full-time developer)

## Priority Legend
- **P0 (Blocker):** Must complete before moving to next phase
- **P1 (High):** Should complete in current phase
- **P2 (Medium):** Nice to have, can defer to post-MVP
- **P3 (Low):** Future enhancements

## Dependency Management
- Tasks with dependencies are clearly marked
- Run tasks in parallel where possible (no dependencies)
- Phase progression is strict (don't start Phase 2 until Phase 1 done)

---

**Ready to start? Confirm Phase 1 kickoff and I'll provide task assignment & daily standup templates.**