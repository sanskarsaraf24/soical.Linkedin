# LinkedIn AI Platform - Requirements from You

## 1. Credentials & API Keys

### LinkedIn Developer App
**Status:** Already have (from n8n setup)
**What we need:**
- [ ] **Client ID** (LinkedIn App)
- [ ] **Client Secret** (LinkedIn App)
- [ ] **Redirect URI** (e.g., `https://your-domain.com/api/auth/callback`)
- [ ] **LinkedIn App Name** (for reference)

**How to provide:**
```
Client ID: ___________________________
Client Secret: ___________________________
Redirect URI: ___________________________
```

---

### GROQ API Key
**Status:** Need to obtain
**Where:** https://console.groq.com
**What we need:**
- [ ] GROQ API key for Claude (gpt-4/mixtral/etc access)

**How to provide:**
```
GROQ API Key: ___________________________
```

---

### Brave Search API Key
**Status:** Need to obtain
**Where:** https://api.search.brave.com (request API access)
**What we need:**
- [ ] Brave Search API key (for research integration)
- [ ] Monthly API call limit (if any)

**How to provide:**
```
Brave Search API Key: ___________________________
Monthly Call Limit: ___________________________
```

---

## 2. LinkedIn Account Details

### Personal Account
**What we need:**
- [ ] LinkedIn Profile URL (e.g., https://www.linkedin.com/in/yourname/)
- [ ] LinkedIn User ID / Profile URN (optional, can fetch from API)

**How to provide:**
```
Profile URL: ___________________________
Display Name: ___________________________
```

---

### Company Page 1
**What we need:**
- [ ] Page Name
- [ ] LinkedIn Page URL (e.g., https://www.linkedin.com/company/pagename/)
- [ ] **Organization URN** (e.g., urn:li:organization:1234567890)
  - How to find: Login to LinkedIn → Page → Settings → Admin resources → Organization ID

**How to provide:**
```
Page 1 Name: ___________________________
Page 1 URL: ___________________________
Page 1 Organization URN: ___________________________
```

---

### Company Page 2
**What we need:**
- [ ] Page Name
- [ ] LinkedIn Page URL
- [ ] **Organization URN**

**How to provide:**
```
Page 2 Name: ___________________________
Page 2 URL: ___________________________
Page 2 Organization URN: ___________________________
```

---

## 3. VPS & Infrastructure

### VPS Access
**Status:** Already have
**What we need:**
- [ ] VPS SSH access (IP, username, password/key)
- [ ] VPS OS confirmation (likely Linux, check if Ubuntu 20.04+)
- [ ] Port availability (suggest: 3000 for backend, 5000 for frontend or 80/443 if reverse proxy)
- [ ] LiteSpeed reverse proxy configuration (we'll handle or you help)

**How to provide:**
```
VPS IP Address: ___________________________
SSH Username: ___________________________
SSH Port: ___________________________
Available Ports: ___________________________
```

---

### Database
**Status:** Need MongoDB
**Options:**
1. **MongoDB Atlas (Cloud)** - Simple, managed
   - [ ] Create free cluster on MongoDB Atlas
   - [ ] Create database user + password
   - [ ] Get connection string (mongodb+srv://...)
   
2. **MongoDB on VPS (Local)** - Self-hosted
   - [ ] We install MongoDB on VPS
   - [ ] Create local connection string

**Recommendation:** MongoDB Atlas (managed service, less ops burden)

**How to provide:**
```
Option chosen: [ ] Atlas  [ ] Local VPS
Connection String: ___________________________
Database Name: linkedin_ai
Username: ___________________________
Password: ___________________________
```

---

### VPS Folder Structure
**Status:** Need to create
**Path:** `/opt/linkedin-ai/` (isolated from minpay)

**Structure we'll create:**
```
/opt/linkedin-ai/
├── backend/                    (Node.js + Express)
├── frontend/                   (React build)
├── uploads/
│   └── images/                (Generated post images)
├── logs/                       (PM2 logs)
├── config/
│   ├── .env                   (credentials - you provide)
│   └── ecosystem.config.js    (PM2 config - we provide)
└── scripts/
    ├── deploy.sh              (deployment script)
    └── backup.sh              (backup script)
```

---

### PM2 Setup
**Status:** Already using (minpay-backend)
**What we need:**
- [ ] Confirm PM2 is installed globally
- [ ] Existing PM2 processes running (for reference)
- [ ] PM2 Plus enabled? (for monitoring)

**Verification:**
```bash
pm2 list          # Should show minpay-backend, minpay-whatsapp-bot, calldesk-backend
pm2 -v            # Should be >= 5.0
```

---

## 4. Brand Voice & Content Configuration

### Personal Account Brand Profile
**What we need:**
- [ ] **Brand Voice:** How you communicate (e.g., "thought leader, educational, 1st person")
- [ ] **Tone:** From list: Professional / Casual / Witty / Educational / Inspirational
- [ ] **Content Pillars:** 3-5 main topics (e.g., AI, Startups, Growth)
- [ ] **Hashtag Strategy:** 5-10 preferred hashtags
- [ ] **Image Style:** Visual preference (e.g., "minimalist", "bold colors", "illustrated")
- [ ] **Post Frequency:** Posts per week (1, 3, 5, or custom)
- [ ] **Preferred Posting Times:** e.g., 9 AM, 2 PM, 6 PM IST

**How to provide:**
```
Personal Account:
- Brand Voice: ___________________________
- Tone: ___________________________
- Content Pillars: ___________________________
- Hashtags: ___________________________
- Image Style: ___________________________
- Post Frequency (per week): ___________________________
- Posting Times: ___________________________
- Timezone: IST [ ] Other: [ ]
```

---

### Company Page 1 Brand Profile
**What we need:** (same as above)

```
Company Page 1:
- Brand Voice: ___________________________
- Tone: ___________________________
- Content Pillars: ___________________________
- Hashtags: ___________________________
- Image Style: ___________________________
- Post Frequency (per week): ___________________________
- Posting Times: ___________________________
```

---

### Company Page 2 Brand Profile
**What we need:** (same as above)

```
Company Page 2:
- Brand Voice: ___________________________
- Tone: ___________________________
- Content Pillars: ___________________________
- Hashtags: ___________________________
- Image Style: ___________________________
- Post Frequency (per week): ___________________________
- Posting Times: ___________________________
```

---

## 5. Content Preferences

### Example Posts (for prompt engineering)
**What we need:**
- [ ] 2-3 example posts per account showing desired tone/style
- [ ] Or reference to existing LinkedIn posts you like

**How to provide:**
```
Personal Account Examples:
1. ___________________________
2. ___________________________
3. ___________________________

Page 1 Examples:
1. ___________________________
2. ___________________________
3. ___________________________

Page 2 Examples:
1. ___________________________
2. ___________________________
3. ___________________________
```

---

### Content Restrictions
**What we need:**
- [ ] Any topics to AVOID?
- [ ] Any claims that need fact-checking?
- [ ] Any brand guidelines (colors, fonts)?

**How to provide:**
```
Topics to Avoid: ___________________________
Fact-Check Requirements: ___________________________
Brand Guidelines: ___________________________
```

---

## 6. Business Requirements

### Posting Schedule
**Status:** Flexible per account
**What we need:**
- [ ] Confirm post frequency for each account (will set later in settings UI)
- [ ] Preferred time zone (default: IST)
- [ ] Any blackout days/dates?

**How to provide:**
```
Personal Account Frequency: 1/day [ ] 3/week [ ] 5/week [ ] Custom: [ ]
Page 1 Frequency: 1/day [ ] 3/week [ ] 5/week [ ] Custom: [ ]
Page 2 Frequency: 1/day [ ] 3/week [ ] 5/week [ ] Custom: [ ]
Blackout Dates: ___________________________
```

---

### Analytics Requirements
**Status:** Will collect from LinkedIn API
**What we need:**
- [ ] Metrics to track: impressions, reactions, comments, clicks, shares
- [ ] Export format: CSV, PDF, both?
- [ ] Reporting frequency: Weekly, monthly, or on-demand?

**How to provide:**
```
Export Format: CSV [ ] PDF [ ] Both [ ]
Reporting Frequency: Weekly [ ] Monthly [ ] On-demand [ ]
Custom Metrics: ___________________________
```

---

## 7. Testing & Validation

### LinkedIn Sandbox/Testing
**Status:** Need to clarify
**What we need:**
- [ ] Can we use the 3 real accounts for testing?
- [ ] Or do you have sandbox/test accounts?
- [ ] Any restrictions on test posts?

**How to provide:**
```
Use Real Accounts for Testing: Yes [ ] No [ ]
Test Accounts Available: Yes [ ] No [ ]
Restrictions: ___________________________
```

---

### UAT (User Acceptance Testing)
**Status:** Will be done in Phase 6
**What we need:**
- [ ] Your availability for 4-6 hours of testing
- [ ] Feedback form / testing checklist
- [ ] Who approves go-live?

**How to provide:**
```
Available for UAT: ___________________________
Testing Lead: ___________________________
Go-Live Approver: ___________________________
```

---

## 8. Team & Support

### Team Access
**What we need:**
- [ ] Who will manage the system day-to-day?
- [ ] Who do we contact for VPS/infrastructure questions?
- [ ] Who approves design/content decisions?

**How to provide:**
```
Daily Manager: ___________________________
VPS Contact: ___________________________
Content Approver: ___________________________
Emergency Contact: ___________________________
```

---

## 9. Documentation & Handoff

### Knowledge Transfer
**What we need:**
- [ ] Your preferred format (video, written, both)?
- [ ] Training needed for team members?
- [ ] Ongoing support level (24/7, business hours, etc)?

**How to provide:**
```
Documentation Format: Video [ ] Written [ ] Both [ ]
Team Training Needed: Yes [ ] No [ ]
Support Level: 24/7 [ ] Business Hours [ ] On-demand [ ]
Training Participants: ___________________________
```

---

## 10. Deliverables Checklist

### From Us
- [ ] Complete backend (Node.js + Express)
- [ ] Complete frontend (React + TypeScript)
- [ ] MongoDB schema & setup
- [ ] GROQ agent integration
- [ ] LinkedIn API integration
- [ ] Brave Search integration
- [ ] Image rendering (HTML → PNG)
- [ ] PM2 configuration
- [ ] Deployment scripts
- [ ] Monitoring setup
- [ ] Documentation (API, deployment, operations)
- [ ] User guide
- [ ] Source code (GitHub repo? or as files?)

### From You
- [ ] API credentials (LinkedIn, GROQ, Brave)
- [ ] LinkedIn account URNs
- [ ] Brand voice/tone/content examples
- [ ] VPS SSH access
- [ ] MongoDB connection string (or Atlas cluster)
- [ ] Feedback on UAT
- [ ] Go-live approval

---

## 11. Timeline & Milestones

### Phase 1: Foundation & Auth (Week 1-1.5)
**Due Date:** [DATE]
**Blocker:** LinkedIn OAuth credentials

### Phase 2: Agents & GROQ (Week 1.5-2.5)
**Due Date:** [DATE]
**Blocker:** GROQ API key, brand voice examples

### Phase 3: LinkedIn API & Posting (Week 2.5-3.5)
**Due Date:** [DATE]
**Blocker:** LinkedIn account URNs

### Phase 4: Dashboard UI (Week 3.5-4.5)
**Due Date:** [DATE]
**Blocker:** None (dependent on T3)

### Phase 5: Analytics (Week 4.5-5.5)
**Due Date:** [DATE]
**Blocker:** None (dependent on T4)

### Phase 6: Deployment & Testing (Week 5.5-6)
**Due Date:** [DATE]
**Blocker:** VPS access, MongoDB setup

**Go-Live Date:** [DATE]

---

## 12. Final Checklist Before We Start

Please confirm you have/will provide:

### Critical (Blocking)
- [ ] LinkedIn Client ID & Secret
- [ ] GROQ API key
- [ ] Brave Search API key
- [ ] LinkedIn Account URLs (3 accounts)
- [ ] VPS SSH access
- [ ] MongoDB Atlas cluster (or local DB)
- [ ] Brand voice examples (at least 1 account)

### High Priority
- [ ] Company Page Organization URNs
- [ ] Content pillars for each account
- [ ] Example posts (for tone)
- [ ] Posting frequency preferences
- [ ] LiteSpeed proxy help (or path to docs)

### Nice to Have
- [ ] Hashtag lists
- [ ] Content restrictions
- [ ] Design guidelines
- [ ] Example brand colors

---

## 13. Support & Questions

**Before we start, answer:**

1. **LinkedIn OAuth:** Do you have a LinkedIn Developer app already registered?
   - [ ] Yes, fully setup
   - [ ] Yes, but need help with redirect URI
   - [ ] No, need to create one

2. **GROQ & Brave:** Do you have API keys, or need help getting them?
   - [ ] Have both
   - [ ] Need GROQ only
   - [ ] Need Brave only
   - [ ] Need both

3. **VPS:** Do you have a specific folder path preference for /opt/linkedin-ai?
   - [ ] Yes, use /opt/linkedin-ai (proposed)
   - [ ] Yes, use other path: ___________________________
   - [ ] Not sure, recommend something

4. **Database:** MongoDB preference?
   - [ ] Atlas (cloud) - preferred
   - [ ] Local on VPS
   - [ ] Not sure, recommend

5. **Team Size:** How many people will manage this system?
   - [ ] Just you
   - [ ] 2-3 people
   - [ ] Larger team

---

## Next Steps

1. **Fill out this entire requirements doc**
2. **Provide all credentials & account details**
3. **Confirm API access (GROQ, Brave)**
4. **Schedule kickoff call (30 min) to review**
5. **Start Phase 1 development**

---

**Estimated time to gather all requirements: 1-2 hours**

Once completed, share back and we'll begin development immediately!