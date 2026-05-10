/**
 * REPLACEMENT for brandProfiles array in src/lib/storage.ts
 * 
 * Each brand now has a concrete, actionable image style guide
 * with 4 layout archetypes, CSS specs, and anti-patterns.
 */

const brandProfiles = [
  {
    accountId: 'acc_personal',
    brandName: 'Sanskar Saraf',
    aboutCompany: 'Personal founder brand focused on AI operators, shipping lessons, and product strategy.',
    voice: 'Founder-led, sharp, practical, reflective',
    tone: 'educational',
    contentPillars: ['AI operators', 'builder lessons', 'product strategy'],
    hashtags: ['#AI', '#BuildInPublic', '#Founder'],
    imageStyle: `
## Visual Identity: Founder Brand
Core colors: Indigo #4F46E5 (primary action/text), Off-White #F8F6F1 (surface), Charcoal #1F2937 (headlines)

## Typography System
- Headlines: Manrope Bold 88px, line-height 1.0, letter-spacing -0.03em
- Body: Inter Regular 36px, line-height 1.5
- Labels: Inter Semibold 22px, uppercase, letter-spacing 0.08em

## 4 Layout Archetypes (rotate through these—use a different one for each post)

**ARCHETYPE A: Bold Left Headline**
Structure: Two-column layout
- Left column: Headline (70% width) + supporting text below
- Right column: Visual element (30% width) — accent bar, gradient shape, or data point
- Accent: Vertical gradient bar transitioning Indigo→transparent, positioned right edge
- Footer: Small metadata or author name
- Grid: Use CSS Grid with gap: 40px, align-items: center

**ARCHETYPE B: Magazine Spread**
Structure: Centered editorial
- Top: Kicker (uppercase, indigo, small)
- Center: Large headline occupies 60% of card width, left-aligned
- Right side of center: Geometric accent element (diagonal line 4px indigo, or triangle shape at 20% opacity indigo)
- Bottom: Supporting text (left-aligned)
- Footer: Author/date on bottom right
- No shadows. Thin 1px indigo border on left edge.

**ARCHETYPE C: Quote/Statement**
Structure: Vertical, centered
- Top: Kicker (center, uppercase)
- Large headline, centered, occupies 50% of card height
- Thin divider line below headline (indigo, 80px, centered)
- Supporting sentence below divider (small, centered, secondary text)
- Footer: Author name + date, centered
- Minimal. Maximum whitespace. Professional/editorial tone.

**ARCHETYPE D: Data/Insight Focus**
Structure: Asymmetric with emphasis
- Top left: Small kicker (uppercase, muted text)
- Center: Large headline (left-aligned)
- Right side: Grid of 2–3 small data points (numbers, metrics, or key terms)
- Accent: Circular background behind data (20% opacity indigo, ~200px diameter)
- Bottom: Supporting text
- Clean dividers between data points.

## Color Palette (Strict)
- Primary: #4F46E5 (indigo) — use for text, accents, borders
- Text: #1F2937 (dark charcoal) — headlines
- Text secondary: #6B7280 (light gray) — supporting text
- Background: #F8F6F1 (warm off-white) — page surface
- Accent shapes: #4F46E5 at 8–12% opacity for subtle fills, 100% for borders/lines

## Dos and Don'ts
✓ Clean white space. Grid-based layout. Squared corners (border-radius: 0).
✓ Single primary accent color (indigo). Accents must serve layout purpose.
✓ Professional sans-serif typography (Manrope, Inter). No scripts.
✗ No gradients (except the archetype A gradient bar which is on white). No images. 
✗ No rounded corners. No drop shadows. No decorative shapes.
    `,
    writingStyle: 'Short hooks, clean paragraphs, useful takeaways',
    contentThemes: ['operator notes', 'shipping lessons', 'market observations'],
    ctaStyle: 'Ask for a thoughtful reply',
    bannedTopics: ['politics', 'controversy'],
    postingDays: [1, 3, 5],
    postingTimes: ['09:00', '13:00', '18:00'],
    timezone: 'Asia/Kolkata',
  },
  {
    accountId: 'acc_page_1',
    brandName: 'Minpay Consultants',
    aboutCompany: 'Minpay Consultants LLP is an India-based debt resolution and legal settlement support company for borrowers dealing with credit card and personal loan dues, lender communication, recovery pressure, and structured settlement processes. It does not provide loans or financing.',
    voice: 'Serious, trustworthy, calm, legally aware, empathetic, and solution-oriented. The voice should feel like a professional consultation environment, not an advertisement or loan product.',
    tone: 'professional',
    contentPillars: ['debt resolution education', 'recovery call handling', 'legal settlement process', 'borrower expectations', 'qualification clarity'],
    hashtags: ['#DebtResolution', '#LoanSettlement', '#FinancialStress'],
    imageStyle: `
## Visual Identity: Debt Resolution (Financial Services)
Core colors: Deep Teal #143D45 (primary, trust), Mint Teal #47A48B (accent, success), White #FFFFFF, Cool Light Gray #F4F6F8

## Typography System
- Headlines: Montserrat Bold 82px, line-height 1.04, letter-spacing 0
- Body: Roboto Regular 35px, line-height 1.4
- Kicker: Montserrat Bold 30px, uppercase, letter-spacing 0.08em

## 4 Layout Archetypes (rotate through these—use a different one for each post)

**ARCHETYPE A: Checklist/Process**
Structure: Dual panel with trust signals
- Left panel: Deep teal background (#143D45), 35% width, with white text
  - Inside: Kicker (white) + 2–3 process/checklist items
  - Each item: Mint checkmark (#47A48B) + white text
- Right panel: White background, 65% width
  - Large headline + supporting text
- Divider: Thin 2px mint line between panels
- Bottom right: Small mint accent circle (80px diameter, 10% opacity)
- Visual metaphor: Process, structure, trust

**ARCHETYPE B: Sidebar Authority**
Structure: Vertical accent with headline
- Left column: Deep teal background, 25% width
  - Kicker + short supporting statement (white text)
  - Mint decorative element (2px bar, vertical, 60px height)
- Right column: White background, 75% width
  - Large headline + body text
- Clean 1px deep teal border between columns
- Bottom: Logo or small mint geometric shape
- Professional, contained, calm

**ARCHETYPE C: Focused Statement**
Structure: Centered card with strong top accent
- Kicker top-left with left border (10px solid mint)
- Padding: 100px
- Centered large headline
- Single supporting sentence (20% smaller font, secondary text)
- Bottom right: Small mint accent (circle or corner element)
- Calm, minimal, professional. Maximum whitespace.

**ARCHETYPE D: Data + Trust Signal**
Structure: Stat-forward with context
- Top: Kicker (center, uppercase, deep teal)
- Center-left: Large number/statistic (mint teal text, Montserrat Bold 72px)
- Center-right: Descriptor + supporting text (deep teal)
- Accent: Vertical bar (mint, 4px wide, 120px height) behind the stat
- Bottom: Supporting statement
- Professional, confidence-based, stat-driven

## Color Palette (Strict, No Substitutions)
- Deep Teal #143D45: Primary text, backgrounds, frames, headlines
- Mint Teal #47A48B: Accents, checkmarks, dividers, success states, prosperity signals
- White #FFFFFF: Card backgrounds, text on teal backgrounds
- Light Gray #F4F6F8: Page background, neutral fills
- No other colors. No gradients. Only these 4.

## Dos and Don'ts
✓ Clean borders. White space. Document/process/checklist visual language.
✓ Small, purposeful geometric accents (checkmarks, bars, dividers, circles).
✓ Confidence through structure, not decoration. Trust through organization.
✓ Squared corners (border-radius: 0). Thin borders (1–2px).
✗ No rounded corners. No gradients. No stock imagery.
✗ No playful tone. No fear-based imagery. No unverified settlement promises.
✗ No decorative shapes. No drop shadows. No animations.
    `,
    writingStyle: 'Short, clear, empathetic, and controlled. Explain the process at a high level, set realistic expectations, and avoid sounding sales-heavy. Never overpromise outcomes.',
    contentThemes: ['recovery pressure', 'credit card and personal loan dues', 'structured settlement support', 'lender communication', 'client qualification', 'documentation and process clarity'],
    ctaStyle: 'Invite users to check eligibility or speak with the team without promising results.',
    bannedTopics: ['loan offers', 'new loans', 'guaranteed settlement percentage', 'instant stop to recovery calls', 'legal advice', 'financial advice', 'fearmongering', 'unverified claims'],
    postingDays: [1, 2, 3, 4, 5],
    postingTimes: ['10:00', '14:00', '17:30'],
    timezone: 'Asia/Kolkata',
  },
  {
    accountId: 'acc_page_2',
    brandName: 'Casemate AI',
    aboutCompany: 'Casemate AI is an India-based legal AI platform for advocates and litigation teams. It helps with court-ready drafting, source-verified legal research, matter organisation, hearing calendars, WhatsApp reminders, and controlled collaboration inside case folders.',
    voice: 'Institutional, authoritative, structured, professional, court-ready, and never playful. The product should feel like a disciplined legal associate for Indian litigation teams.',
    tone: 'professional',
    contentPillars: ['structured legal drafting', 'source-strict research', 'case-centric workspace', 'hearing calendar and alerts', 'professional responsibility'],
    hashtags: ['#LegalAI', '#IndianLitigation', '#LegalTech'],
    imageStyle: `
## Visual Identity: Legal Tech (Court-Ready)
Core colors: Deep Navy #0F172A (primary), Royal Blue #1D4ED8 (secondary accents), Off-White #F5F3EF (surface), Slate Grey #334155 (body text), Deep Emerald #065F46 (success only)

## Typography System
- Headlines: Playfair Display Bold 80px, line-height 1.0, letter-spacing -0.02em, serif gravitas
- Body: Inter Regular 34px, line-height 1.5
- Kicker: Inter Semibold 24px, uppercase, letter-spacing 0.12em
- Monospace (citations): JetBrains Mono 18px (only if referencing legal framework)

## 4 Layout Archetypes (rotate through these—use a different one for each post)

**ARCHETYPE A: Citation/Authority**
Structure: Framed statement with legal context
- Left edge: 8px solid navy border (full height)
- Left column (25%): Kicker + small legal framework/act reference (8–10px text, secondary color)
- Right column (75%): Large headline (navy Playfair) + supporting text
- Bottom: Single citation line or legal reference (monospace, 16px, slate grey)
- Footer: Emerald accent bar (3px) ONLY if this post is about success/wins
- Institutional, legal, professional

**ARCHETYPE B: Two-Column Brief**
Structure: Divided authority/reference
- Left column (40%): Deep navy background with white text
  - Kicker + supporting statement (white, bold)
- Right column (60%): Off-white background
  - Large headline (navy, Playfair) + body text (slate grey, Inter)
- Divider: 2px navy line between columns
- Squared layout. No rounded corners.
- Professional, structured, binary (problem/solution or idea/outcome)

**ARCHETYPE C: Vertical Authority**
Structure: Sidebar emphasis with hierarchy
- Left edge: Narrow navy panel (12% width) with white content
  - Vertical text OR small icon/symbol
- Right: Large headline + supporting statement + footer note
- Accent bar: Deep emerald (3px) on right edge ONLY if post is about success/compliance wins
- Otherwise: Subtle 1px navy border on right
- Clean, minimal, focused

**ARCHETYPE D: Grid Reference**
Structure: Framework/categorization showcase
- Top: Kicker (center, uppercase, navy)
- Center: Large headline (Playfair, navy)
- Bottom: 3–4 small reference boxes in a row
  - Each box: White background, navy border (2px), small text (slate grey)
  - Contents: Category name, framework element, or reference
- Purpose: Show process, framework, categories, or structure
- Professional, educational, system-based

## Color Palette (Strict, No Variation)
- Deep Navy #0F172A: Headlines, primary text, backgrounds, borders
- Royal Blue #1D4ED8: Secondary accents, highlights (use sparingly)
- Off-White #F5F3EF: Card backgrounds, supporting surfaces
- Slate Grey #334155: Body text, secondary text, borders
- Deep Emerald #065F46: ONLY for success/positive states; use very sparingly (1–2% of card)
- No other colors. No gradients. No custom shades.

## Dos and Don'ts
✓ Clean, squared layout (border-radius: 0). High whitespace. Document-style UI.
✓ Thin borders (1–2px navy or grey). Professional separators.
✓ Serif headlines (Playfair) for gravitas. Sans-serif body (Inter).
✓ Monospace for legal citations if needed. Institutional tone throughout.
✗ No rounded corners. No playful illustrations. No stock photos.
✗ No gradients. No decorative shapes. No generic AI marketing language.
✗ No drop shadows. No semi-transparent overlays. No animations.
    `,
    writingStyle: 'Precise, legal, structured, and specific to Indian litigation workflows. Emphasize court-ready drafting, verified citations, confidentiality, advocate control, and refusal to fabricate sources.',
    contentThemes: ['court-ready drafting', 'verified Indian case law', 'matter organisation', 'generic AI limitations', 'advocate control', 'confidentiality', 'hearing discipline'],
    ctaStyle: 'Invite advocates to start a 14-day free trial or see how the workflow works.',
    bannedTopics: ['legal advice', 'fabricated citations', 'guaranteed case outcomes', 'playful tone', 'generic AI hype', 'ChatGPT wrapper positioning', 'unverified claims'],
    postingDays: [2, 4],
    postingTimes: ['11:00', '16:00'],
    timezone: 'Asia/Kolkata',
  },
];

module.exports = { brandProfiles };
