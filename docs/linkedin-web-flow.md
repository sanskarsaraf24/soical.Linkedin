# LinkedIn Automation Web Flow

## Goal
Build a clean dashboard for managing LinkedIn content across 3 connected accounts:

- 2 company pages
- 1 personal profile

The UI should make it easy to:

- define account-specific brand rules
- generate post ideas and drafts
- design HTML-based post assets
- schedule and review posts
- publish to the correct LinkedIn identity
- monitor upcoming and sent content

Comments are intentionally out of scope for this phase.

## Primary Navigation

The product should be split into clear pages instead of one long dashboard.

- `Overview`
- `Accounts`
- `Brand Profiles`
- `Content Studio`
- `Design Studio`
- `Scheduler`
- `Published Posts`
- `Analytics`
- `Settings`

## Main User Flow

### 1. Connect Accounts

The user connects the three LinkedIn identities through the same developer app.

The account screen should show:

- account name
- account type
- connection status
- last sync time
- posting permissions
- available publishing scopes

### 2. Configure Brand Rules

Each account gets its own brand profile.

The user sets:

- writing style
- tone
- content themes
- image style
- CTA style
- hashtag preferences
- banned phrases
- posting cadence

These settings must be isolated per account.

### 3. Create Content

The content studio should support:

- idea generation
- post draft generation
- hook variations
- CTA variations
- theme selection
- audience selection
- campaign tagging

The user should be able to choose which account the draft belongs to before generation or after generation.

### 4. Design the Post Asset

For HTML-based posts, the design flow should be:

- write content
- choose layout template
- preview HTML rendering
- convert HTML to image or document asset
- attach asset to the post draft

The design studio should support:

- single image cards
- carousel-like assets
- quote cards
- infographic layouts
- document-style posts

### 5. Schedule and Approve

The scheduler should show all planned posts in one calendar view.

The user should be able to:

- drag a draft to a date/time
- switch account target
- approve or reject a draft
- edit schedule
- pause a schedule
- publish immediately

### 6. Publish

At publish time the system should:

- select the correct LinkedIn account
- submit the post to LinkedIn
- save a local record of the published content
- mark the job as sent
- record errors if posting fails

### 7. Review Results

The analytics page should show:

- posts created
- posts scheduled
- posts published
- engagement by account
- best-performing themes
- best-performing writing styles
- best-performing design templates

## Suggested Screen Layouts

### Overview

- top-level metrics
- upcoming scheduled posts
- recent publishing activity
- account health
- quick actions

### Accounts

- 3 account cards
- connect/disconnect controls
- identity scope details
- sync status
- posting readiness

### Brand Profiles

- one section per account
- editable style controls
- theme lists
- examples of preferred voice
- validation notes

### Content Studio

- prompt panel
- account selector
- theme selector
- draft editor
- generate button
- save draft button

### Design Studio

- template picker
- live preview
- HTML input/rendering preview
- asset export status

### Scheduler

- monthly/week/week/day views
- draft queue
- approval queue
- publish timing controls

### Published Posts

- timeline
- account filter
- status chips
- open post links
- error state logs

## UX Principles

- keep the primary workflow visible in one click
- never hide the target account
- keep every draft tied to exactly one account
- avoid modal-heavy editing
- make scheduling obvious
- use short labels, not technical jargon
- show what will happen before posting

