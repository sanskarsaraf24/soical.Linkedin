# Premium Graphics Generation Fix Guide

## Problem Analysis

Your graphics are poor quality because:

1. **Prompt is too generic and prescriptive** – You're telling Claude "create an 1080x1080 HTML" but NOT showing examples of what you want
2. **Visual direction is vague** – "Split-screen", "magazine", "left-aligned" are meaningless without context
3. **HTML templates are rigid** – The same card layout with accent line repeats for every post
4. **No visual variation strategy** – All posts look the same because layout doesn't change
5. **Haiku struggles with open-ended design** – Claude-Opus or Sonnet would perform better, but the real issue is **instruction clarity**
6. **Image style guides are text-heavy but not actionable** – They describe colors and vibes, not layout grids or component hierarchies

---

## Solution Overview

### Phase 1: Redesign Brand Image Style Guides (High Impact)
Replace vague narratives with **concrete layout grids, component specs, and visual rules**.

### Phase 2: Rewrite Graphics Generation Prompt (High Impact)
- Provide visual design principles
- Show specific layout options with names
- Include CSS patterns that work
- Request varied layouts, not repetition
- Add specific typographic constraints

### Phase 3: Implement Layout Rotation System (High Impact)
Cycle through 4–5 distinct layout **archetypes** per brand so no two posts look identical.

### Phase 4: Upgrade Model (Optional but Recommended)
Use Claude Sonnet 4.6 instead of Haiku for design work. Haiku is fast but weaker at visual reasoning.

---

## Implementation

### 1. NEW IMAGE STYLE GUIDES

#### **Sanskar Saraf (Personal Brand)**

```javascript
{
  brandName: "Sanskar Saraf",
  imageStyle: `
## Visual Identity: Founder Brand
Core colors: Indigo #4F46E5 (primary action/text), Off-White #F8F6F1 (surface), Charcoal #1F2937 (headlines)

## Typography System
- Headlines: Manrope Bold 88px, line-height 1.0, letter-spacing -0.03em
- Body: Inter Regular 36px, line-height 1.5
- Labels: Inter Semibold 22px, uppercase, letter-spacing 0.08em

## 4 Layout Archetypes (rotate through these)

**ARCHETYPE A: Bold Left Headline**
- Left column: Headline + supporting text (70% width)
- Right column: Accent shape + metadata (30% width)
- Accent: Vertical gradient bar Indigo→transparent
- No rounded corners. Clean grid.

**ARCHETYPE B: Magazine Spread**
- Centered kicker at top (uppercase, indigo)
- Large headline occupies 60% of card
- Supporting text bottom-left
- Geometric accent element: diagonal line or triangle bottom-right (indigo)

**ARCHETYPE C: Quote/Statement**
- Full-width headline centered
- Thin divider line below (indigo, 80px)
- Single supporting sentence, centered, smaller
- Footer: author name + date
- Minimal, editorial

**ARCHETYPE D: Data/Insight Focus**
- Small kicker (uppercase, muted)
- Headline left-aligned
- Grid of 2–3 small numbers or tags on right side
- Accent circle background behind data (20% opacity indigo)

## Color Palette
- Primary: #4F46E5 (indigo) – use sparingly for accents
- Text: #1F2937 (dark gray)
- Text muted: #6B7280 (light gray)
- Background: #F8F6F1 (warm off-white)
- Accent shapes: #4F46E5 at 8–12% opacity or 100% stroke

## Dos and Don'ts
✓ Clean white space. Grid-based layout.
✓ Single accent color. Accent shapes must serve layout purpose.
✓ Professional sans-serif typography. No scripts, no slab serifs.
✗ No gradients. No images. No rounded corners (use 0px border-radius).
✗ No drop shadows (use subtle borders). No decorative shapes.
  `
}
```

#### **Minpay Consultants**

```javascript
{
  brandName: "Minpay Consultants",
  imageStyle: `
## Visual Identity: Debt Resolution (Financial Services)
Core colors: Deep Teal #143D45 (primary), Mint Teal #47A48B (accent/checkmarks), White #FFFFFF, Cool Light Gray #F4F6F8

## Typography System
- Headlines: Montserrat Bold 82px, line-height 1.04, letter-spacing 0
- Body: Roboto Regular 35px, line-height 1.4
- Kicker: Montserrat Bold 30px, uppercase, letter-spacing 0

## 4 Layout Archetypes (rotate through these)

**ARCHETYPE A: Checklist/Process**
- Left: Tall deep-teal panel with white text
- Inside teal: Kicker + 2–3 checkbox items (mint checkmarks)
- Right: Large headline + supporting text on white
- Visual metaphor: Process/trust

**ARCHETYPE B: Sidebar Authority**
- Left column: Kicker + short headline (mint teal background, deep teal text)
- Right column: Body text (60% of card width)
- Bottom right: Mint accent mark or small geometric shape
- Clean divider between left/right (1px deep teal)

**ARCHETYPE C: Focused Statement**
- Kicker top-left with left border (10px solid mint)
- Centered headline (large)
- Single supporting sentence
- Bottom right: Logo or mint accent circle
- Calm, professional

**ARCHETYPE D: Data + Trust Signal**
- Kicker center-top
- Large number/stat + descriptor
- Headline below
- Supporting text
- Accent: Vertical bar (mint) behind the stat

## Color Usage Rules
- Deep teal #143D45: Backgrounds, primary text, frames
- Mint teal #47A48B: Accents, checkmarks, dividers, success states
- White: Card backgrounds, text on teal
- Light gray #F4F6F8: Page background
- No other colors. Strictly 4-color palette.

## Dos and Don'ts
✓ Clean borders. White space. Document/process visual language.
✓ Small, purposeful geometric accents (checkmarks, bars, dividers).
✓ Confidence through structure, not decoration.
✗ No rounded corners (use 0px). No gradients. No images.
✗ No playful tone. No fear-based imagery. No unverified claims.
  `
}
```

#### **Casemate AI**

```javascript
{
  brandName: "Casemate AI",
  imageStyle: `
## Visual Identity: Legal Tech (Court-Ready)
Core colors: Deep Navy #0F172A (primary), Royal Blue #1D4ED8 (secondary), Off-White #F5F3EF (surface), Slate Grey #334155 (text), Deep Emerald #065F46 (success only)

## Typography System
- Headlines: Playfair Display Bold 80px, line-height 1.0, letter-spacing -0.02em
- Body: Inter Regular 34px, line-height 1.5
- Kicker: Inter Semibold 24px, uppercase, letter-spacing 0.12em
- Monospace: JetBrains Mono 18px (for citations/code snippets if used)

## 4 Layout Archetypes (rotate through these)

**ARCHETYPE A: Citation/Authority**
- Left column: Kicker + small legal framework reference
- Large headline occupies right (navy text)
- Bottom: Single supporting line + citation reference (monospace, small)
- Accent: Thin navy border on left edge (4px)

**ARCHETYPE B: Two-Column Brief**
- Left: Deep navy background with white text (kicker + supporting)
- Right: White background (headline + body text)
- Divider: Thin navy line between columns
- No rounded corners. Squared layout.

**ARCHETYPE C: Vertical Statement**
- Narrow navy panel left (12% width) with vertical text or small icon
- Main content right: Headline + supporting text
- Accent bar: Emerald (3px) only if post is about success/wins
- Professional, minimal

**ARCHETYPE D: Grid Reference**
- Top: Kicker in uppercase navy
- Center: Large headline
- Bottom: 3–4 small reference boxes (white bg, navy border, small text)
- Purpose: Show framework, process, or categories

## Color Palette (Strict)
- Deep Navy #0F172A: Headlines, primary backgrounds, text
- Royal Blue #1D4ED8: Accents, secondary highlights
- Off-White #F5F3EF: Card/surface backgrounds
- Slate Grey #334155: Body text, secondary text
- Deep Emerald #065F46: ONLY for success/positive states; use sparingly
- No other colors. No gradients.

## Dos and Don'ts
✓ Clean, squared layout. High whitespace. Document-style UI.
✓ Thin borders. Professional separators. Legal/institutional tone.
✓ Monospace for citations if needed. Playfair for gravitas.
✗ No rounded corners. No playful illustrations. No stock photos.
✗ No gradients. No decorative shapes. No generic AI language.
  `
}
```

---

### 2. NEW GRAPHICS GENERATION PROMPT

Replace `buildGraphicPrompt()` in `server.js` with:

```javascript
function buildGraphicPrompt({ account, brand, title, content, kicker, logoUrl, visualDirection, visualState, layoutArchetype }) {
  const displayBrandName = brand.brandName || account.name;
  const captionLine = String(content || '').split('\n').find(Boolean)?.slice(0, 160) || '';
  const archetypen = layoutArchetype || 'A'; // Default to A, cycle through A-D per post

  return `You are a premium brand designer creating a LinkedIn square graphic (1080x1080px) for ${displayBrandName}.

## Brand Design System (Source of Truth)
${brand.imageStyle || 'Professional, minimal, clean.'}

## Layout Requirement
Use **ARCHETYPE ${archetypen}** from the brand guide above. This is mandatory—implement exactly as described.

## Content to Render
- **Kicker** (top label): "${kicker}"
- **Headline** (primary message): "${title}"
- **Supporting text** (max 120 characters): "${captionLine}"
- **Logo**: ${logoUrl ? 'Include logo image. Max 180px width, positioned top-right or bottom-right.' : 'No logo'}

## Design Specifications

### HTML Structure Requirements
- DOCTYPE: <!doctype html>
- Canvas: 1080x1080px, no padding beyond content area
- No external dependencies except Google Fonts (Manrope, Montserrat, Playfair Display, Inter, Roboto)
- All text must be 32px or larger for readability

### CSS Constraints
- Box-sizing: border-box throughout
- Border-radius: 0px only (NO rounded corners)
- Colors: Use ONLY colors from brand palette; no substitutions or custom shades
- Typography: Use fonts specified in brand guide
- Shadows: Subtle (0 4px 12px rgba(0,0,0,0.1)) or none
- Gradients: PROHIBITED unless brand guide explicitly requires

### Layout Grid
- Margin: 80–100px on all sides
- Content area: 880–920px × 880–920px
- Use CSS Grid or Flexbox for component alignment
- Whitespace is a design element—do NOT fill empty space with decoration

### Data Attributes (Critical)
Add these to your HTML for content extraction:
- <h1 data-required="headline">...</h1>
- <p data-required="subheadline">...</p>
- <span data-required="kicker">...</span>

## Anti-Patterns (Never Do These)
- Do NOT use the same template for every post
- Do NOT fill backgrounds with shapes, gradients, or textures
- Do NOT use more than 3 distinct accent colors
- Do NOT place text over complex backgrounds
- Do NOT use rounded corners unless brand explicitly requires (Archetype descriptions specify)
- Do NOT add decorative elements that don't serve a purpose
- Do NOT use drop shadows; use subtle borders instead
- Do NOT output any text outside the HTML—no preamble, no explanation

## Output Requirements
- Return ONLY valid HTML/CSS (no markdown, no code fences, no text before/after)
- Ensure all required data attributes are present
- Test: The design should load immediately in a browser with no external resources
- Sophistication: Demonstrate that you understand premium design—clean, intentional, grid-based
`;
}
```

---

### 3. IMPLEMENT LAYOUT ROTATION IN `createScheduledPostForTomorrow()`

In `server.js`, modify this function:

```javascript
async function createScheduledPostForTomorrow({ workspace, account, brand, targetDate, targetTime, scheduledAt, scheduleSlotKey }) {
  const timeZone = brand.timezone || workspace.settings?.defaultTimezone || schedulerTimezone;
  const targetDay = getZonedParts(new Date(scheduledAt), timeZone);
  const strategyItem = (brand.weeklyStrategy || []).find(s => s.day === targetDay.weekdayName);

  // NEW: Calculate layout archetype for this post (rotate A→B→C→D)
  const accountPostCount = workspace.posts.filter(p => p.accountId === account.id).length;
  const archetypeLetters = ['A', 'B', 'C', 'D'];
  const layoutArchetype = archetypeLetters[accountPostCount % 4];

  const prompt = buildGenerationPrompt({ account, brand, targetDate, targetTime, strategyItem, layoutArchetype });
  const { content, title } = await generatePostContent({ account, brand, prompt });
  const theme = strategyItem?.topic || brand.contentThemes?.[Math.abs(scheduleSlotKey.length) % Math.max(brand.contentThemes.length, 1)] || brand.contentPillars?.[0] || 'general';

  const kicker = theme.charAt(0).toUpperCase() + theme.slice(1);
  const graphicHtml = await generateGraphicHtml({
    account,
    brand: {
      ...brand,
      visualDirection: strategyItem?.visualDirection,
      visualState: strategyItem?.visualState
    },
    title,
    content,
    kicker,
    logoUrl: brand.logoUrl || workspace.settings.logoUrl,
    layoutArchetype, // PASS ARCHETYPE
  });

  // ... rest of function
}
```

Also update `buildGraphicPrompt` call:

```javascript
const graphicPrompt = buildGraphicPrompt({
  account,
  brand,
  title: generated.title,
  content: generated.content,
  kicker: strategyItem.topic,
  logoUrl: brand.logoUrl || workspace.settings.logoUrl,
  visualState: strategyItem?.visualState,
  visualDirection: strategyItem?.visualDirection,
  layoutArchetype: archetypeLetters[idx % 4], // ADD THIS
});
```

---

### 4. UPDATE `generatePostContent()` PROMPT

Modify `buildGenerationPrompt()` to include archetype context:

```javascript
function buildGenerationPrompt({ account, brand, targetDate, targetTime, strategyItem, layoutArchetype }) {
  let dayOfWeek = '';
  try {
    dayOfWeek = new Date(targetDate).toLocaleDateString('en-US', { weekday: 'long' });
  } catch { dayOfWeek = targetDate; }
  
  const pillarsStr = (brand.contentPillars || []).join(', ');
  const themesStr = (brand.contentThemes || []).join(', ');

  return `Write one LinkedIn post for ${account.name}, scheduled for ${dayOfWeek} at ${targetTime}.

Design Note: This post will use Layout Archetype ${layoutArchetype} from the brand guide.

${strategyItem ? `## AI Strategy Direction
Topic: ${strategyItem.topic}
Hook Idea: ${strategyItem.hook}
Strategic Angle: ${strategyItem.angle}

Implement this specific idea creatively.` : `## Content Pillars
Pick ONE for this post, vary across the week: ${pillarsStr}`}

... [rest of prompt remains same]
`;
}
```

---

### 5. OPTIONAL: UPGRADE MODEL

In `server.js`, change:

```javascript
const anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
```

Sonnet is significantly better at design reasoning than Haiku. For graphics, the ~2x cost is worth it.

---

## Summary of Changes

| Issue | Fix | Impact |
|-------|-----|--------|
| Vague visual direction | Concrete layout archetypes (A–D per brand) | 🟢 High |
| Generic prompt | Detailed design specs + anti-patterns | 🟢 High |
| Template repetition | Automatic layout rotation system | 🟢 High |
| Color/typography confusion | Executable CSS palettes in image style | 🟢 High |
| Weak model performance | (Optional) Upgrade to Sonnet | 🟡 Medium |

---

## Testing Checklist

1. **Visual Variety**: Generate 5 posts for same account—layouts should differ (A, B, C, D, A)
2. **Grid Alignment**: Check that elements align to margins (80–100px) without overflow
3. **Typography**: All text should be ≥32px; headers use correct font (Manrope/Montserrat/Playfair)
4. **Color Accuracy**: Extract colors from rendered HTML; they should match brand palette exactly
5. **Data Attributes**: Run `iframe.contentDocument.querySelector('[data-required="headline"]')` in preview—should resolve
6. **Professional Feel**: Compare to premium SaaS brands (Linear, Stripe, Notion)—should feel similar or better

---

## Files to Modify

1. `server.js` — Update `buildGraphicPrompt()`, `createScheduledPostForTomorrow()`, `buildBatchGenerationPrompt()`
2. `src/lib/storage.ts` — Replace brand `imageStyle` strings with new guides
3. Optional: Env var `ANTHROPIC_MODEL=claude-sonnet-4-20250514`
