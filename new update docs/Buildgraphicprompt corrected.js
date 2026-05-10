/**
 * CORRECTED buildGraphicPrompt() - Fixes the Over-Design Issue
 * 
 * The previous version was too permissive. Claude was adding unnecessary
 * elements, breaking typography, and ignoring the "minimal" principle.
 * 
 * This version is STRICT about:
 * - Typography (all text ≥32px, clear hierarchy)
 * - Simplicity (no unnecessary shapes or decoration)
 * - Grid-based layout (predictable alignment)
 * - Color discipline (2-3 colors maximum per card)
 */

function buildGraphicPrompt({ account, brand, title, content, kicker, logoUrl, visualDirection, visualState, layoutArchetype = 'A' }) {
    const displayBrandName = brand.brandName || account.name;
    const captionLine = String(content || '')
        .replace(/\s+/g, ' ')
        .split(/[.!?\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 20)
        .find(Boolean)
        ?.slice(0, 160) || '';

    return `You are a premium brand designer. Create a LinkedIn square graphic (1080x1080px) for ${displayBrandName}.

## CRITICAL CONSTRAINTS (Non-Negotiable)

### Typography (Strict)
- MINIMUM font size: 32px for ALL text. No exceptions.
- Headline: 80–92px (primary)
- Body/supporting: 32–40px (secondary)
- Labels/kicker: 24–32px (tertiary)
- Line-height: Always ≥1.4
- Font family: Use ONLY fonts from brand guide

### Layout (Grid-Based, Not Freeform)
- Canvas: 1080×1080px exactly
- Margin: 80–100px on all sides
- Content area: 880–920px × 880–920px
- Alignment: Use CSS Grid or Flexbox (no absolute positioning except accents)
- Structure: Simple, predictable, intentional

### Colors (Palette Discipline)
- Use ONLY 2–3 colors maximum on the card
- ALL colors from brand palette (no substitutions)
- Accent colors used sparingly (borders, highlights, text emphasis only)
- No gradients. No opacity except 8–12% for subtle fills.
- Color = intention, not decoration

### Elements (Minimalist Design)
- White space is a design element—do NOT fill empty areas
- Maximum 1 decorative element per card (accent bar, thin border, or geometric shape)
- Decorative element must serve layout function (divide, highlight, or guide eye)
- NO overlapping elements
- NO shadows (use subtle 1–2px borders instead)
- NO rounded corners (border-radius: 0 always)

### Anti-Patterns (NEVER Do)
✗ Do NOT use more than 2–3 colors
✗ Do NOT place text over complex backgrounds
✗ Do NOT use text below 32px
✗ Do NOT add "just one more" shape
✗ Do NOT use drop shadows
✗ Do NOT use semi-transparent overlays (except 8–12% fills)
✗ Do NOT use gradients
✗ Do NOT free-position elements
✗ Do NOT create visual clutter

## Brand Design System
${brand.imageStyle || 'Professional, minimal, clean.'}

## Layout Requirement: ARCHETYPE ${layoutArchetype}
Implement this layout structure EXACTLY from the brand guide:
- If ARCHETYPE A: Two columns (headline + text left, accent element right)
- If ARCHETYPE B: Centered kicker top, large headline center, supporting text bottom
- If ARCHETYPE C: Centered everything, divider line, maximum whitespace
- If ARCHETYPE D: Data-forward with accent background behind key element

Do NOT deviate from archetype structure. Do NOT add "extra" elements.

## Content to Render
- **Kicker**: "${kicker}"
- **Headline**: "${title}"
- **Supporting text**: "${captionLine || '(optional)'}"
- **Logo**: ${logoUrl ? 'Include logo. Max width 180px. Position logically.' : 'No logo.'}

## Design Output Requirements

### HTML/CSS Quality
- Valid HTML5 with <!doctype html>
- All fonts from Google Fonts (no external stylesheets)
- Self-contained CSS in <head>
- No external images except logo URL
- Renders immediately in browser

### Data Attributes (Required)
- <h1 data-required="headline">...</h1>
- <p data-required="subheadline">...</p>
- <span data-required="kicker">...</span>

### Final Checklist Before Output
□ All text ≥32px? (Measure in CSS, verify in browser)
□ Only 2–3 colors used? (Count hex values in CSS)
□ Grid-aligned layout? (No free-positioned elements)
□ Archetype structure followed? (Matches A/B/C/D spec)
□ Minimal and intentional? (No unnecessary shapes)
□ Professional/premium feel? (Clean, not cluttered)

## What Premium Design Looks Like
- Intentional. Every element has purpose.
- Clean. Ample whitespace. No filler.
- Grid-based. Aligned. Predictable.
- Restrained. 2–3 colors. Minimal accents.
- Typography-first. Hierarchy is clear.
- Squared corners, thin borders, subtle details.

Reference: Linear.app, Stripe.com, Notion.so—these are the baseline.

## Output Format
Return ONLY raw HTML/CSS. No markdown, no preamble, no explanations. The HTML must load and render perfectly at 1080×1080px with no external resources (except Google Fonts and logo image if applicable).`;
}

module.exports = { buildGraphicPrompt };