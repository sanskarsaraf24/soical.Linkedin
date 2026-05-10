MongoDB Schema

## Database Name
    `linkedin_ai`

---

## Collections & Schemas

### 1. Accounts Collection
    ** Purpose:** Store connected LinkedIn accounts and OAuth tokens

        ```javascript
db.createCollection("accounts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "linkedinProfileId", "accountType"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { 
          bsonType: "string",
          description: "Internal user ID"
        },
        linkedinProfileId: { 
          bsonType: "string",
          description: "LinkedIn user ID or organization ID"
        },
        accountName: { 
          bsonType: "string",
          description: "Display name of account"
        },
        accountType: { 
          enum: ["person", "organization"],
          description: "Type of LinkedIn account"
        },
        organizationUrn: { 
          bsonType: ["string", "null"],
          description: "Organization URN (required for org accounts)"
        },
        accessToken: { 
          bsonType: "string",
          description: "LinkedIn OAuth access token (encrypted)"
        },
        refreshToken: { 
          bsonType: "string",
          description: "LinkedIn OAuth refresh token (encrypted)"
        },
        tokenExpiresAt: { 
          bsonType: "date",
          description: "When access token expires"
        },
        linkedinUrl: { 
          bsonType: "string",
          description: "LinkedIn profile/page URL"
        },
        avatar: { 
          bsonType: ["string", "null"],
          description: "Profile picture URL"
        },
        isActive: { 
          bsonType: "bool",
          default: true
        },
        createdAt: { 
          bsonType: "date",
          description: "Account connection timestamp"
        },
        updatedAt: { 
          bsonType: "date",
          description: "Last update timestamp"
        }
      }
    }
  }
});

// Index for faster lookups
db.accounts.createIndex({ userId: 1 });
db.accounts.createIndex({ linkedinProfileId: 1 });
db.accounts.createIndex({ isActive: 1 });
```

        ** Example Document:**
            ```json
{
  "_id": ObjectId("..."),
  "userId": "user_1",
  "linkedinProfileId": "123456789",
  "accountName": "John Doe",
  "accountType": "person",
  "organizationUrn": null,
  "accessToken": "encrypted_token_here",
  "refreshToken": "encrypted_refresh_token_here",
  "tokenExpiresAt": ISODate("2024-02-15T12:00:00Z"),
  "linkedinUrl": "https://www.linkedin.com/in/johndoe/",
  "avatar": "https://media.licdn.com/...",
  "isActive": true,
  "createdAt": ISODate("2024-01-15T12:00:00Z"),
  "updatedAt": ISODate("2024-01-15T12:00:00Z")
}
```

---

### 2. BrandProfiles Collection
    ** Purpose:** Store brand voice, tone, and content configuration per account

        ```javascript
db.createCollection("brandProfiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["accountId"],
      properties: {
        _id: { bsonType: "objectId" },
        accountId: { 
          bsonType: "objectId",
          description: "Reference to accounts._id"
        },
        accountName: { 
          bsonType: "string",
          description: "Account name (for reference)"
        },
        brandVoice: { 
          bsonType: ["string", "null"],
          description: "Brand voice & communication style"
        },
        tone: { 
          enum: ["professional", "casual", "witty", "educational", "inspirational", "custom"],
          description: "Posting tone"
        },
        contentPillars: { 
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Main content topics (e.g., ['AI', 'Startups', 'Growth'])"
        },
        hashtags: { 
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Preferred hashtags"
        },
        imageStyle: { 
          enum: ["minimalist", "bold", "illustrated", "photo", "gradient", "data-driven"],
          description: "Visual design preference"
        },
        brandColors: { 
          bsonType: ["array", "null"],
          items: { bsonType: "string" },
          description: "Hex color codes for designs"
        },
        excludedTopics: { 
          bsonType: ["array", "null"],
          items: { bsonType: "string" },
          description: "Topics to avoid"
        },
        customPrompt: { 
          bsonType: ["string", "null"],
          description: "Additional custom instructions for agents"
        },
        createdAt: { 
          bsonType: "date"
        },
        updatedAt: { 
          bsonType: "date"
        }
      }
    }
  }
});

db.brandProfiles.createIndex({ accountId: 1 });
```

        ** Example Document:**
            ```json
{
  "_id": ObjectId("..."),
  "accountId": ObjectId("..."),
  "accountName": "John Doe",
  "brandVoice": "Thought leader in AI, educational, first-person storytelling, actionable insights",
  "tone": "professional",
  "contentPillars": ["AI & Automation", "Startup Growth", "Founder Insights"],
  "hashtags": ["#AI", "#Startup", "#Growth", "#Founder", "#Innovation"],
  "imageStyle": "bold",
  "brandColors": ["#0066FF", "#00D9FF", "#001F3F"],
  "excludedTopics": ["politics", "personal drama"],
  "customPrompt": "Always include data points. Focus on actionable advice.",
  "createdAt": ISODate("2024-01-15T12:00:00Z"),
  "updatedAt": ISODate("2024-01-15T12:00:00Z")
}
```

---

### 3. GeneratedPosts Collection
    ** Purpose:** Store all generated posts, their content, images, and status

        ```javascript
db.createCollection("generatedPosts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["accountId", "status"],
      properties: {
        _id: { bsonType: "objectId" },
        accountId: { 
          bsonType: "objectId",
          description: "Reference to accounts._id"
        },
        linkedinPostId: { 
          bsonType: ["string", "null"],
          description: "LinkedIn URN of posted content"
        },
        
        // Content
        text: { 
          bsonType: "string",
          description: "Post copy/text content"
        },
        hashtags: { 
          bsonType: ["array", "null"],
          items: { bsonType: "string" }
        },
        cta: { 
          bsonType: ["string", "null"],
          description: "Call-to-action"
        },
        
        // Strategy & Generation
        strategy: { 
          bsonType: "object",
          description: "SM Manager agent output",
          properties: {
            day: { bsonType: "int" },
            title: { bsonType: "string" },
            angle: { bsonType: "string" },
            hook: { bsonType: "string" },
            researchSnippet: { bsonType: ["string", "null"] }
          }
        },
        contentPillar: { 
          bsonType: "string",
          description: "Which content pillar this belongs to"
        },
        
        // Image/Design
        imageHtml: { 
          bsonType: ["string", "null"],
          description: "Raw HTML/CSS generated by Designer agent"
        },
        imageUrl: { 
          bsonType: ["string", "null"],
          description: "URL of rendered image (PNG)"
        },
        imageStyle: { 
          bsonType: "string",
          description: "Image style used"
        },
        
        // Scheduling
        scheduledTime: { 
          bsonType: "date",
          description: "When post should go live"
        },
        status: { 
          enum: ["draft", "scheduled", "posted", "failed", "cancelled"],
          description: "Current post status"
        },
        postedTime: { 
          bsonType: ["date", "null"],
          description: "When post actually went live"
        },
        
        // Metrics
        metrics: {
          bsonType: ["object", "null"],
          properties: {
            impressions: { bsonType: "int", default: 0 },
            reactions: { bsonType: "int", default: 0 },
            comments: { bsonType: "int", default: 0 },
            clicks: { bsonType: "int", default: 0 },
            shares: { bsonType: "int", default: 0 },
            saves: { bsonType: "int", default: 0 },
            engagement_rate: { bsonType: "double" },
            fetched_at: { bsonType: "date" }
          }
        },
        
        // Generation Process
        generationRequest: {
          bsonType: "object",
          properties: {
            generatedAt: { bsonType: "date" },
            generationTriggeredBy: { enum: ["auto", "manual"] },
            bravSearchCalls: { bsonType: "int", description: "Search calls used (max 3)" }
          }
        },
        
        // Error Tracking
        error: { 
          bsonType: ["object", "null"],
          properties: {
            message: { bsonType: "string" },
            code: { bsonType: "string" },
            timestamp: { bsonType: "date" },
            retryCount: { bsonType: "int" }
          }
        },
        
        // Metadata
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.generatedPosts.createIndex({ accountId: 1 });
db.generatedPosts.createIndex({ status: 1 });
db.generatedPosts.createIndex({ scheduledTime: 1 });
db.generatedPosts.createIndex({ linkedinPostId: 1 });
db.generatedPosts.createIndex({ createdAt: -1 });
```

        ** Example Document:**
            ```json
{
  "_id": ObjectId("..."),
  "accountId": ObjectId("..."),
  "linkedinPostId": "urn:li:share:1234567890",
  "text": "Just launched our new AI feature! Excited to share how this changes everything for automation...",
  "hashtags": ["#AI", "#Startup", "#Innovation"],
  "cta": "Read the full article on our blog",
  "strategy": {
    "day": 1,
    "title": "AI Feature Launch",
    "angle": "How automation saves 20 hours/week",
    "hook": "We just did something crazy..."
  },
  "contentPillar": "AI & Automation",
  "imageHtml": "<div style='...'>...</div>",
  "imageUrl": "https://linkedin-ai.com/uploads/images/post_1.png",
  "imageStyle": "bold",
  "scheduledTime": ISODate("2024-01-16T09:00:00Z"),
  "status": "posted",
  "postedTime": ISODate("2024-01-16T09:00:15Z"),
  "metrics": {
    "impressions": 1234,
    "reactions": 89,
    "comments": 12,
    "clicks": 45,
    "shares": 5,
    "saves": 22,
    "engagement_rate": 8.2,
    "fetched_at": ISODate("2024-01-17T12:00:00Z")
  },
  "generationRequest": {
    "generatedAt": ISODate("2024-01-15T00:00:00Z"),
    "generationTriggeredBy": "auto",
    "bravSearchCalls": 2
  },
  "error": null,
  "createdAt": ISODate("2024-01-15T00:00:00Z"),
  "updatedAt": ISODate("2024-01-17T12:00:00Z")
}
```

---

### 4. PostMetrics Collection
    ** Purpose:** Historical metrics data for posted posts(timestamped snapshots)

        ```javascript
db.createCollection("postMetrics", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["generatedPostId", "linkedinPostId", "accountId"],
      properties: {
        _id: { bsonType: "objectId" },
        generatedPostId: { 
          bsonType: "objectId",
          description: "Reference to generatedPosts._id"
        },
        linkedinPostId: { 
          bsonType: "string",
          description: "LinkedIn post URN"
        },
        accountId: { 
          bsonType: "objectId",
          description: "Account ID"
        },
        
        impressions: { bsonType: "int" },
        reactions: { bsonType: "int" },
        comments: { bsonType: "int" },
        clicks: { bsonType: "int" },
        shares: { bsonType: "int" },
        saves: { bsonType: "int" },
        
        engagement_rate: { bsonType: "double" },
        impressions_change: { bsonType: ["double", "null"] },
        
        fetchedAt: { bsonType: "date" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.postMetrics.createIndex({ generatedPostId: 1 });
db.postMetrics.createIndex({ linkedinPostId: 1 });
db.postMetrics.createIndex({ accountId: 1 });
db.postMetrics.createIndex({ fetchedAt: 1 });
```

---

### 5. Settings Collection
    ** Purpose:** User settings for posting schedule, frequency, and generation preferences

        ```javascript
db.createCollection("settings", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["accountId"],
      properties: {
        _id: { bsonType: "objectId" },
        accountId: { 
          bsonType: "objectId",
          description: "Reference to accounts._id"
        },
        
        // Posting Schedule
        postFrequency: { 
          enum: ["1/day", "3/week", "5/week", "custom"],
          description: "How often to post"
        },
        scheduledTimes: { 
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Times to post (e.g., ['09:00', '14:00', '18:00'])"
        },
        timezone: { 
          bsonType: "string",
          default: "Asia/Kolkata",
          description: "Timezone for scheduling"
        },
        
        // Generation Settings
        generationDay: { 
          enum: ["monday", "weekly", "daily", "manual"],
          default: "monday",
          description: "When to generate posts"
        },
        generationTime: { 
          bsonType: "string",
          default: "00:00",
          description: "Time to trigger generation"
        },
        nextGenerationDate: { 
          bsonType: "date",
          description: "Next scheduled generation"
        },
        
        // Preferences
        autoPublish: { 
          bsonType: "bool",
          default: true,
          description: "Auto-publish on scheduled time"
        },
        requireApproval: { 
          bsonType: "bool",
          default: false,
          description: "Require manual approval before posting"
        },
        
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.settings.createIndex({ accountId: 1 });
```

        ** Example Document:**
            ```json
{
  "_id": ObjectId("..."),
  "accountId": ObjectId("..."),
  "postFrequency": "custom",
  "scheduledTimes": ["09:00", "14:00", "18:00"],
  "timezone": "Asia/Kolkata",
  "generationDay": "monday",
  "generationTime": "00:00",
  "nextGenerationDate": ISODate("2024-01-22T00:00:00Z"),
  "autoPublish": true,
  "requireApproval": false,
  "createdAt": ISODate("2024-01-15T12:00:00Z"),
  "updatedAt": ISODate("2024-01-15T12:00:00Z")
}
```

---

### 6. AgentLogs Collection
    ** Purpose:** Detailed logs of agent interactions for debugging and optimization

        ```javascript
db.createCollection("agentLogs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["postId", "agentType"],
      properties: {
        _id: { bsonType: "objectId" },
        postId: { 
          bsonType: "objectId",
          description: "Reference to generatedPosts._id"
        },
        accountId: { 
          bsonType: "objectId"
        },
        
        agentType: { 
          enum: ["social_media_manager", "content_writer", "graphic_designer"],
          description: "Which agent ran"
        },
        
        input: {
          bsonType: "object",
          description: "Input to the agent"
        },
        
        prompt: { 
          bsonType: "string",
          description: "Full prompt sent to GROQ"
        },
        
        response: { 
          bsonType: "string",
          description: "Raw response from GROQ"
        },
        
        parsedOutput: {
          bsonType: ["object", "null"],
          description: "Structured output after parsing"
        },
        
        duration_ms: { 
          bsonType: "int",
          description: "Execution time in milliseconds"
        },
        
        tokens_used: {
          bsonType: "object",
          properties: {
            input: { bsonType: "int" },
            output: { bsonType: "int" },
            total: { bsonType: "int" }
          }
        },
        
        bravSearchCalls: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              query: { bsonType: "string" },
              results_count: { bsonType: "int" },
              duration_ms: { bsonType: "int" }
            }
          }
        },
        
        status: { 
          enum: ["success", "partial", "failed"],
          description: "Outcome of agent execution"
        },
        
        error: { 
          bsonType: ["object", "null"],
          properties: {
            message: { bsonType: "string" },
            code: { bsonType: "string" },
            stack: { bsonType: ["string", "null"] }
          }
        },
        
        timestamp: { bsonType: "date" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.agentLogs.createIndex({ postId: 1 });
db.agentLogs.createIndex({ agentType: 1 });
db.agentLogs.createIndex({ timestamp: -1 });
db.agentLogs.createIndex({ status: 1 });
```

---

### 7. Users Collection(Optional)
    ** Purpose:** Store user account info if multi - user support is needed

        ```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email"],
      properties: {
        _id: { bsonType: "objectId" },
        email: { 
          bsonType: "string",
          description: "User email (unique)"
        },
        password: { 
          bsonType: "string",
          description: "Hashed password"
        },
        name: { 
          bsonType: "string"
        },
        role: { 
          enum: ["admin", "user"],
          default: "user"
        },
        isActive: { 
          bsonType: "bool",
          default: true
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.users.createIndex({ email: 1 }, { unique: true });
```

---

## Indexes Summary

    ```javascript
// Accounts
db.accounts.createIndex({ userId: 1 });
db.accounts.createIndex({ linkedinProfileId: 1 });
db.accounts.createIndex({ isActive: 1 });

// BrandProfiles
db.brandProfiles.createIndex({ accountId: 1 });

// GeneratedPosts
db.generatedPosts.createIndex({ accountId: 1 });
db.generatedPosts.createIndex({ status: 1 });
db.generatedPosts.createIndex({ scheduledTime: 1 });
db.generatedPosts.createIndex({ linkedinPostId: 1 });
db.generatedPosts.createIndex({ createdAt: -1 });
db.generatedPosts.createIndex({ accountId: 1, status: 1, scheduledTime: 1 });

// PostMetrics
db.postMetrics.createIndex({ generatedPostId: 1 });
db.postMetrics.createIndex({ linkedinPostId: 1 });
db.postMetrics.createIndex({ accountId: 1 });
db.postMetrics.createIndex({ fetchedAt: 1 });

// Settings
db.settings.createIndex({ accountId: 1 });

// AgentLogs
db.agentLogs.createIndex({ postId: 1 });
db.agentLogs.createIndex({ agentType: 1 });
db.agentLogs.createIndex({ timestamp: -1 });
db.agentLogs.createIndex({ status: 1 });

// Users
db.users.createIndex({ email: 1 }, { unique: true });
```

---

## Relationships(ERD)

    ```
Users (1) → (Many) Accounts
Accounts (1) → (Many) GeneratedPosts
Accounts (1) → (1) BrandProfiles
Accounts (1) → (1) Settings
Accounts (1) → (Many) AgentLogs
GeneratedPosts (1) → (Many) PostMetrics
GeneratedPosts (1) → (Many) AgentLogs
```

---

## Data Constraints & Validations

### Accounts
    - `accessToken` and `refreshToken` must be encrypted(never stored in plain text)
        - `tokenExpiresAt` should be 1 - 2 hours in the future when storing
            - `organizationUrn` is required if `accountType` is "organization"

### GeneratedPosts
    - `scheduledTime` must be in the future or present
        - Status transitions: `draft` → `scheduled` → `posted`(or`failed` / `cancelled`)
            - `linkedinPostId` is null until`status` = "posted"
                - Only 3 `bravSearchCalls` maximum per post

### Settings
    - `scheduledTimes` must be valid 24h format(HH: MM)
        - `nextGenerationDate` auto - calculated based on`generationDay`
            - Posting times must not exceed post frequency

---

## Backup & Recovery Strategy

    ** Backup Schedule:**
        - Daily full backup at 02:00 IST
            - Weekly backup retention(7 copies)
                - Monthly backup retention(12 copies)

                    ** Backup Command(MongoDB Atlas):**
                        ```bash
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/linkedin_ai" --out /backups/linkedin_ai_$(date +%Y%m%d)
```

                        ** Restore Command:**
                            ```bash
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/linkedin_ai" /backups/linkedin_ai_YYYYMMDD
```

---

## Data Migration Scripts

### Initialize Empty Database

    ```javascript
// Run in MongoDB shell
use linkedin_ai;

// Create all collections
db.createCollection("accounts");
db.createCollection("brandProfiles");
db.createCollection("generatedPosts");
db.createCollection("postMetrics");
db.createCollection("settings");
db.createCollection("agentLogs");
db.createCollection("users");

// Create indexes (see Indexes Summary above)
```

---

** Schema Version:** 1.0
    ** Last Updated:** January 2024
        ** Maintained By:** LinkedIn AI Development Team