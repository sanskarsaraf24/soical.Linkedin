import type { BrandProfile, LinkedInAccount, PostDraft } from './types';

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function pick<T>(items: T[], index: number): T {
  return items[index % items.length];
}

/**
 * Derive a brand accent color from image style description.
 * Supports named colors and hex values embedded in the style string.
 */
function deriveAccent(imageStyle: string): string {
  const style = (imageStyle || '').toLowerCase();
  // Support explicit hex colour values embedded in the style description
  const hexMatch = style.match(/#([0-9a-f]{3,6})\b/i);
  if (hexMatch) return hexMatch[0];
  // Named palette mappings — expanded and more nuanced
  if (style.includes('indigo') || style.includes('deep blue')) return '#4338ca';
  if (style.includes('teal') || style.includes('emerald')) return '#0d9488';
  if (style.includes('amber') || style.includes('gold') || style.includes('warm')) return '#d97706';
  if (style.includes('violet') || style.includes('purple') || style.includes('bold')) return '#7c3aed';
  if (style.includes('rose') || style.includes('red') || style.includes('coral')) return '#e11d48';
  if (style.includes('data') || style.includes('analytic') || style.includes('green')) return '#059669';
  if (style.includes('sky') || style.includes('light blue')) return '#0284c7';
  if (style.includes('navy')) return '#1e3a5f';
  if (style.includes('gradient')) return '#6366f1';
  // Default: neutral indigo – works well for most professional brands
  return '#4f46e5';
}

function deriveSurface(imageStyle: string): string {
  const style = (imageStyle || '').toLowerCase();
  if (style.includes('dark') || style.includes('night') || style.includes('noir')) return '#0f172a';
  if (style.includes('warm') || style.includes('cream') || style.includes('parchment')) return '#fdf8f0';
  if (style.includes('gradient')) return 'linear-gradient(160deg, #f8f6f4, #ffffff)';
  return '#f8fafc';
}

function escapeHtml(input: string): string {
  return String(input || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildHtmlAsset(
  title: string,
  content: string,
  kicker: string,
  accent: string,
  surface: string,
  authorName: string,
  authorHandle: string,
  logoUrl = '',
): string {
  // Use a clean sentence from content as the supporting line
  const supportingLine = String(content || '')
    .replace(/\s+/g, ' ')
    .split(/[.!?\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 20)
    .find(Boolean)
    ?.slice(0, 120) || '';

  const isDark = surface.includes('#0') || surface.includes('dark') || surface.includes('night');
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.92)';

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        background: ${surface};
        font-family: 'Inter', sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .wrap {
        width: 1080px;
        height: 1080px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 0;
        box-sizing: border-box;
        background: ${surface};
        position: relative;
        overflow: hidden;
      }
      /* Subtle background geometry */
      .bg-circle {
        position: absolute;
        border-radius: 50%;
        opacity: 0.08;
        background: ${accent};
      }
      .bg-circle.one { width: 800px; height: 800px; right: -200px; top: -200px; }
      .bg-circle.two { width: 400px; height: 400px; left: -100px; bottom: -100px; }
      .content-card {
        position: relative;
        z-index: 2;
        margin: 80px;
        flex: 1;
        background: ${cardBg};
        border-radius: 48px;
        padding: 96px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 32px 80px rgba(0,0,0,0.10);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.18);
      }
      .kicker {
        display: inline-block;
        background: ${accent};
        color: white;
        font-family: 'Inter', sans-serif;
        font-size: 22px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 12px 28px;
        border-radius: 40px;
        margin-bottom: 64px;
        align-self: flex-start;
      }
      .headline {
        font-family: 'Manrope', sans-serif;
        font-size: 88px;
        line-height: 1.0;
        letter-spacing: -0.03em;
        font-weight: 800;
        color: ${textPrimary};
        margin: 0;
        max-width: 900px;
      }
      .accent-line {
        width: 80px;
        height: 6px;
        background: ${accent};
        border-radius: 3px;
        margin: 56px 0;
      }
      .supporting {
        font-family: 'Inter', sans-serif;
        font-size: 36px;
        line-height: 1.5;
        color: ${textSecondary};
        margin: 0;
        max-width: 820px;
        font-weight: 400;
      }
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 56px;
      }
      .author {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .author-name {
        font-family: 'Manrope', sans-serif;
        font-size: 26px;
        font-weight: 700;
        color: ${textPrimary};
      }
      .author-handle {
        font-size: 20px;
        color: ${textSecondary};
        font-weight: 400;
      }
      .logo {
        max-width: 180px;
        max-height: 72px;
        object-fit: contain;
        opacity: 0.85;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="bg-circle one"></div>
      <div class="bg-circle two"></div>
      <div class="content-card">
        <div>
          <div class="kicker" data-required="kicker">${escapeHtml(kicker)}</div>
          <h1 class="headline" data-required="headline">${escapeHtml(title)}</h1>
          <div class="accent-line"></div>
          ${supportingLine ? `<p class="supporting" data-required="subheadline">${escapeHtml(supportingLine)}</p>` : ''}
        </div>
        <div class="footer">
          <div class="author">
            <span class="author-name">${escapeHtml(authorName)}</span>
            <span class="author-handle">${escapeHtml(authorHandle)}</span>
          </div>
          ${logoUrl ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="Logo" />` : ''}
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export function generatePostDraft(account: LinkedInAccount, brand: BrandProfile, index: number, logoUrl = ''): PostDraft {
  const pillar = pick(brand.contentPillars, index);
  const theme = pick(brand.contentThemes, index);
  const hashtags = Array.from(new Set([...brand.hashtags, `#${slugify(pillar)}`].filter(Boolean))).slice(0, 6);
  const accent = deriveAccent(brand.imageStyle || '');
  const surface = deriveSurface(brand.imageStyle || '');
  // Use the pillar as the graphic kicker (human-readable, brand-specific)
  const kicker = pillar;
  const authorHandle = account.linkedInUrl
    ? account.linkedInUrl.replace(/\/$/, '').split('/').pop() || account.name
    : account.name;

  // Content is a placeholder — it will be replaced by AI generation on the server
  const content = `A thought on ${theme} — and why it matters for ${account.name}.`;

  const htmlAsset = buildHtmlAsset(
    `${pillar}`,
    content,
    kicker,
    accent,
    surface,
    account.name,
    `LinkedIn · ${authorHandle}`,
    logoUrl,
  );

  return {
    id: `draft_${account.id}_${index + 1}`,
    accountId: account.id,
    title: `${pillar}`,
    theme,
    content,
    cta: brand.ctaStyle || '',
    hashtags,
    htmlAsset,
    scheduledAt: new Date(Date.now() + index * 86400000).toISOString(),
    status: 'scheduled',
    metrics: { impressions: 0, reactions: 0, comments: 0, clicks: 0, shares: 0 },
    notes: `Generated from ${brand.tone} / ${brand.imageStyle} profile.`,
  };
}

export function generateWeeklyPlan(account: LinkedInAccount, brand: BrandProfile, logoUrl = ''): PostDraft[] {
  return Array.from({ length: 7 }, (_, index) => generatePostDraft(account, brand, index, logoUrl));
}
