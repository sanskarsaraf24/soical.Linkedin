/**
 * REPLACEMENT for buildGraphicPrompt() in server.js
 * 
 * This version includes:
 * - Concrete layout archetypes instead of vague descriptions
 * - Specific CSS/HTML constraints
 * - Premium design principles
 * - Anti-patterns to avoid
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

  return `You are a premium brand designer creating a LinkedIn square graphic (1080x1080px) for ${displayBrandName}.

## Brand Design System (Source of Truth)
${brand.imageStyle || 'Professional, minimal, clean.'}

## Layout Requirement
Use **ARCHETYPE ${layoutArchetype}** from the brand guide above. This is mandatory—implement the exact structure described.

## Content to Render
- **Kicker** (label/category): "${kicker}"
- **Headline** (primary message, ~8 words): "${title}"
- **Supporting text** (optional, max 120 chars): "${captionLine || '(no supporting text for this post)'}"
- **Logo**: ${logoUrl ? `Include the logo image. Max width 180px, positioned logically (top-right, bottom-right, or center based on layout).` : 'No logo for this post.'}

## Design Specifications

### HTML & Canvas
- Start with: <!doctype html>
- Canvas dimensions: width: 1080px, height: 1080px
- Content container: Align to grid, margins 80–100px
- Font stack: Use fonts from brand guide (Manrope, Montserrat, Playfair Display, Inter, Roboto)
- Import fonts via Google Fonts in <head>
- No external stylesheets, images, or assets except Google Fonts and the logo URL

### Typography Rules (Non-Negotiable)
- Headline: Font per brand guide, 80–92px, line-height 1.0, letter-spacing per brand
- Body/supporting: Font per brand guide, 32–40px minimum, line-height 1.4–1.5
- Kicker/label: Font per brand guide, 20–30px, uppercase if specified, letter-spacing expanded
- NO TEXT BELOW 32PX. Ever.
- NO decorative fonts (scripts, displays except Playfair/Montserrat where specified)

### Color Constraints
- Use ONLY colors from the brand palette specified in the design system
- NO gradient backgrounds (unless brand guide explicitly requires)
- NO custom color mixing or substitutions
- NO semi-transparent colors except for very subtle accent overlays (max 12% opacity)
- Accent colors should be used sparingly—as borders, icons, or highlights, not dominant backgrounds

### Layout & Structure
- Border-radius: 0px ONLY (squared corners, professional)
- Grid-based alignment: Use CSS Grid or Flexbox; no free-floating elements
- Whitespace is design—do NOT fill empty space with decoration
- Maximum 3 visual accent colors on card (usually: primary text, accent color, background)
- Dividers: Thin lines (1–2px), never thick or decorative
- Shadows: Subtle box-shadow (0 4px 12px rgba(0,0,0,0.1)) or NONE—no blurred/oversized shadows

### Anti-Patterns (NEVER Do These)
✗ Do NOT use the same template or layout for consecutive posts
✗ Do NOT fill backgrounds with gradients, patterns, or textures
✗ Do NOT use more than 4 colors on the card
✗ Do NOT place text over photographic or complex backgrounds
✗ Do NOT use rounded corners (border-radius > 0) unless explicitly required
✗ Do NOT add decorative shapes, icons, or illustrations
✗ Do NOT include drop shadows (use borders instead)
✗ Do NOT use opacity effects unless subtle (< 15%)
✗ Do NOT output any text outside the HTML—no markdown, no explanations, no preamble

## Data Attributes (Required for Post Parsing)
Wrap content with these exact data attributes so the system can extract and update text:
- <h1 data-required="headline">...</h1>
- <p data-required="subheadline">...</p>
- <span data-required="kicker">...</span> or <div data-required="kicker">...</div>

## What Premium Design Looks Like
- Intentional. Every element serves a purpose.
- Clean. Ample whitespace. Minimal decoration.
- Grid-based. Aligned layout. Consistent spacing.
- Consistent typography. Hierarchy is clear and deliberate.
- Restrained color. 2–3 colors maximum per card.
- Professional tone. Squared corners, thin borders, subtle accents.
- Reference: Linear.app, Stripe.com, Notion.so—these are the benchmark

## Output Format
- Return ONLY raw HTML/CSS (no markdown backticks, no code fences, no text before/after)
- Ensure <head> includes <meta charset="utf-8"> and <meta name="viewport">
- All required data attributes must be present in the output
- The HTML must render immediately in a browser with no external requests
- After rendering, the design should look premium—intentional, clean, professional`;
}

module.exports = { buildGraphicPrompt };
