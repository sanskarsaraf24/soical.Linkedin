import type { AppSettings, BrandProfile, LinkedInAccount, PostDraft, WorkspaceState } from './types';

const storageKey = 'linkedin-ai-dashboard:v1';
export const canonicalLinkedInRedirectUri = 'https://social.minpay.in/linkedin/api/auth/linkedin/callback';

const now = new Date();

const minpayImageStyle = [
  'MinPay Consultants LLP brand kit. Colors: Deep Teal #143D45 as the primary brand color, Mint Teal #47A48B as the accent/checkmark color, White #FFFFFF, Cool Light Gray #F4F6F8, and Charcoal Gray #4A4A4A for secondary text.',
  'Typography: Montserrat Bold for headlines, labels, and key numbers; Roboto Regular for body/supporting text. Use clean, confident, professional spacing with no decorative gradients.',
  'Visual language: calm debt-resolution and consultation brand, not a loan app and not generic SaaS. Use white or light-gray backgrounds, deep-teal panels, mint accents, clean dividers, document/checklist/process motifs, and subtle finance/legal-consultation cues.',
  'Mood board direction: minimalist financial service posters, clean business-card style layouts, flat illustration only when useful, subtle office/document context, and strong trust signals through structure and restraint.',
  'Layout states to rotate: Clean White, Light Gray, Deep Teal, Mint Accent. Keep the logo visible once, preferably top-left or bottom-right depending on contrast.',
  'Avoid: navy/charcoal-heavy palettes not in the kit, emerald substitutes, purple/blue startup gradients, rounded pill-heavy UI, playful illustrations, fear-based debt imagery, stock-photo people, clutter, tiny text, and any promise of guaranteed settlement outcomes.'
].join(' ');

const casemateImageStyle = [
  'Casemate AI brand kit. Colors: Deep Navy #0F172A, Royal Blue #1D4ED8, Warm Off-White #F5F3EF, Slate Grey #334155, and Deep Emerald #065F46 only for success states.',
  'Typography: Playfair Display for headlines, Inter for body, JetBrains Mono for citations or references. Keep the tone court-ready, precise, and disciplined.',
  'Visual language: legal-tech, source-verified, structured, and institutional. Use squared layouts, thin borders, document-style panels, and calm whitespace.',
  'Layout states to rotate: Citation Authority, Two-Column Brief, Vertical Authority, Grid Reference. Do not repeat the same framing every post.',
  'Avoid: playful illustrations, startup gradients, rounded pill-heavy styling, stock imagery, neon accents, and generic AI branding.'
].join(' ');

const personalImageStyle = [
  'Founder brand visual kit. Colors: Indigo #4F46E5, Off-White #F8F6F1, Charcoal #1F2937, Muted Grey #6B7280.',
  'Typography: Manrope Bold for headlines, Inter for supporting text. Keep the voice crisp, practical, and reflective.',
  'Visual language: editorial but restrained, with clear hierarchy, ample whitespace, subtle dividers, and no decorative clutter.',
  'Layout states to rotate: Bold Left Headline, Magazine Spread, Quote Statement, Data Insight. Each post should feel distinct.',
  'Avoid: gradients, noisy textures, rounded card-heavy design, and filler decoration.'
].join(' ');

function isoDaysFromNow(days: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function createHtmlAsset(title: string, content: string, colors: string[], style: string, logoUrl = '', layoutArchetype = 'A'): string {
  const [primary = '#0f766e', secondary = '#e2e8f0'] = colors;
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body { margin:0; width:100%; height:100%; background:#f7f4ef; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
    .card {
      width: 1080px;
      height: 1080px;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at 10% 20%, rgba(15,118,110,0.18), transparent 32%),
        radial-gradient(circle at 90% 15%, rgba(245,158,11,0.12), transparent 28%),
        linear-gradient(160deg, #f8f6f1 0%, #ffffff 100%);
      color: #132238;
      box-sizing: border-box;
      padding: 72px;
    }
    .frame {
      width: 100%;
      height: 100%;
      border-radius: 44px;
      border: 1px solid rgba(19,34,56,0.08);
      background: rgba(255,255,255,0.7);
      box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
      padding: 70px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 24px;
    }
    .eyebrow { color: ${primary}; font-size: 28px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; }
    h1 { margin: 0; font-size: 92px; line-height: 0.96; letter-spacing: -0.06em; }
    p { margin: 0; font-size: 34px; line-height: 1.35; color: rgba(19,34,56,0.78); max-width: 980px; }
    .footer {
      display:flex;
      justify-content:space-between;
      align-items:flex-end;
      gap: 24px;
      font-size: 22px;
      color: rgba(19,34,56,0.68);
    }
    .pill {
      display:inline-flex;
      padding: 16px 22px;
      border-radius: 999px;
      background: ${secondary};
      color: ${primary};
      font-weight: 700;
    }
    .style {
      font-size: 18px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: rgba(19,34,56,0.45);
    }
    .logo {
      width: 112px;
      max-height: 112px;
      object-fit: contain;
      align-self: flex-end;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="frame">
      <div class="eyebrow">LinkedIn AI</div>
      ${logoUrl ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="Logo" />` : ''}
      <div>
        <h1>${escapeHtml(title)}</h1>
        <div style="height:28px"></div>
        <p>${escapeHtml(content)}</p>
      </div>
      <div class="footer">
        <span class="pill">HTML post asset</span>
        <span class="style">${escapeHtml(style)}</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isMinpayAccount(account: LinkedInAccount): boolean {
  return `${account.name} ${account.handle}`.toLowerCase().includes('minpay');
}

function isCasemateAccount(account: LinkedInAccount): boolean {
  return `${account.name} ${account.handle}`.toLowerCase().includes('casemate');
}

function isFounderAccount(account: LinkedInAccount): boolean {
  return `${account.name} ${account.handle}`.toLowerCase().includes('sanskar') || `${account.name} ${account.handle}`.toLowerCase().includes('founder');
}

function normalizeBrandImageStyleForAccount(account: LinkedInAccount, imageStyle?: string, fallbackStyle?: string): string {
  const style = imageStyle || fallbackStyle || '';
  const lower = style.toLowerCase();
  if (
    isMinpayAccount(account)
    && (
      !style
      || !lower.includes('#143d45')
      || lower.includes('navy')
      || lower.includes('dark slate')
      || lower.includes('emerald')
    )
  ) {
    return minpayImageStyle;
  }
  if (isCasemateAccount(account) && (!style || !lower.includes('#0f172a') || !lower.includes('#1d4ed8'))) {
    return casemateImageStyle;
  }
  if (isFounderAccount(account) && !style) {
    return personalImageStyle;
  }
  return style;
}

export function createInitialWorkspace(): WorkspaceState {
  const settings: AppSettings = {
    linkedinClientId: '',
    linkedinClientSecret: '',
    linkedinClientSecretSaved: false,
    linkedinRedirectUri: canonicalLinkedInRedirectUri,
    defaultTimezone: 'Asia/Kolkata',
    logoUrl: '',
    logoName: '',
    scheduler: {
      enabled: true,
      timezone: 'Asia/Kolkata',
      nextRunAt: '',
      lastRunAt: '',
      lastCreatedCount: 0,
      lastSkippedCount: 0,
      lastErrors: [],
    },
  };

  const accounts: LinkedInAccount[] = [
    {
      id: 'acc_personal',
      name: 'Sanskar Saraf',
      type: 'person',
      handle: '@sanskar',
      linkedInUrl: 'https://linkedin.com/in/sanskarsaraf',
      status: 'connected',
      lastSyncAt: isoDaysFromNow(-1),
      avatarHue: 'var(--sky)',
    },
    {
      id: 'acc_page_1',
      name: 'Minpay Consultants',
      type: 'organization',
      handle: '@minpay-consultants',
      linkedInUrl: 'https://linkedin.com/company/minpay-consultants',
      organizationUrn: 'urn:li:organization:108473075',
      status: 'connected',
      lastSyncAt: isoDaysFromNow(-1),
      avatarHue: 'var(--teal)',
    },
    {
      id: 'acc_page_2',
      name: 'Casemate AI',
      type: 'organization',
      handle: '@casemate-ai',
      linkedInUrl: 'https://linkedin.com/company/casemate-ai',
      organizationUrn: 'urn:li:organization:108147291',
      status: 'connected',
      lastSyncAt: isoDaysFromNow(-2),
      avatarHue: 'var(--sand)',
    },
  ];

  const brandProfiles: BrandProfile[] = [
    {
      accountId: 'acc_personal',
      aboutCompany: 'Personal founder brand focused on AI operators, shipping lessons, and product strategy.',
      voice: 'Founder-led, sharp, practical, reflective',
      tone: 'educational',
      contentPillars: ['AI operators', 'builder lessons', 'product strategy'],
      hashtags: ['#AI', '#BuildInPublic', '#Founder'],
      imageStyle: personalImageStyle,
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
      aboutCompany: 'Minpay Consultants LLP is an India-based debt resolution and legal settlement support company for borrowers dealing with credit card and personal loan dues, lender communication, recovery pressure, and structured settlement processes. It does not provide loans or financing.',
      voice: 'Serious, trustworthy, calm, legally aware, empathetic, and solution-oriented. The voice should feel like a professional consultation environment, not an advertisement or loan product.',
      tone: 'professional',
      contentPillars: ['debt resolution education', 'recovery call handling', 'legal settlement process', 'borrower expectations', 'qualification clarity'],
      hashtags: ['#DebtResolution', '#LoanSettlement', '#FinancialStress'],
      imageStyle: minpayImageStyle,
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
      aboutCompany: 'Casemate AI is an India-based legal AI platform for advocates and litigation teams. It helps with court-ready drafting, source-verified legal research, matter organisation, hearing calendars, WhatsApp reminders, and controlled collaboration inside case folders.',
      voice: 'Institutional, authoritative, structured, professional, court-ready, and never playful. The product should feel like a disciplined legal associate for Indian litigation teams.',
      tone: 'professional',
      contentPillars: ['structured legal drafting', 'source-strict research', 'case-centric workspace', 'hearing calendar and alerts', 'professional responsibility'],
      hashtags: ['#LegalAI', '#IndianLitigation', '#LegalTech'],
      imageStyle: casemateImageStyle,
      writingStyle: 'Precise, legal, structured, and specific to Indian litigation workflows. Emphasize court-ready drafting, verified citations, confidentiality, advocate control, and refusal to fabricate sources.',
      contentThemes: ['court-ready drafting', 'verified Indian case law', 'matter organisation', 'generic AI limitations', 'advocate control', 'confidentiality', 'hearing discipline'],
      ctaStyle: 'Invite advocates to start a 14-day free trial or see how the workflow works.',
      bannedTopics: ['legal advice', 'fabricated citations', 'guaranteed case outcomes', 'playful tone', 'generic AI hype', 'ChatGPT wrapper positioning', 'unverified claims'],
      postingDays: [2, 4],
      postingTimes: ['11:00', '16:00'],
      timezone: 'Asia/Kolkata',
    },
  ];

  const posts: PostDraft[] = [
    {
      id: 'post_1',
      accountId: 'acc_personal',
      title: 'How I think about AI leverage',
      theme: 'operator notes',
      content: 'The best AI systems do not replace judgment. They multiply it. A strong process, clear constraints, and a small set of reusable workflows will outperform a giant pile of prompts every time.',
      cta: 'What workflow has saved you the most time?',
      hashtags: ['#AI', '#Leverage', '#Systems'],
      htmlAsset: createHtmlAsset(
        'How I think about AI leverage',
        'The best AI systems do not replace judgment. They multiply it. A strong process, clear constraints, and reusable workflows beat prompt chaos every time.',
        ['#0f766e', '#dbeafe'],
        'Founder note',
        settings.logoUrl,
      ),
      scheduledAt: isoDaysFromNow(0),
      status: 'scheduled',
      metrics: { impressions: 0, reactions: 0, comments: 0, clicks: 0, shares: 0 },
      notes: 'Scheduled for morning audience window.',
    },
    {
      id: 'post_2',
      accountId: 'acc_page_1',
      title: 'Recovery pressure needs structure',
      theme: 'recovery pressure',
      content: 'When recovery calls become constant, panic usually makes the situation worse. A structured debt resolution process starts with documentation, clear communication, and realistic expectations.',
      cta: 'Check if your case is eligible',
      hashtags: ['#DebtResolution', '#LoanSettlement', '#FinancialStress'],
      htmlAsset: createHtmlAsset(
        'Recovery pressure needs structure',
        'A structured debt resolution process starts with documentation, clear communication, and realistic expectations.',
        ['#0f172a', '#d1fae5'],
        'Debt resolution',
        settings.logoUrl,
      ),
      scheduledAt: isoDaysFromNow(1),
      status: 'draft',
      metrics: { impressions: 0, reactions: 0, comments: 0, clicks: 0, shares: 0 },
      notes: 'Ready for review.',
    },
    {
      id: 'post_3',
      accountId: 'acc_page_2',
      title: 'Drafting needs verified context',
      theme: 'court-ready drafting',
      content: 'A legal draft is only useful when the facts, relief, forum, and supporting authorities are structured correctly. CaseMate is designed around that discipline for Indian litigation teams.',
      cta: 'Start a 14-day free trial',
      hashtags: ['#LegalAI', '#IndianLitigation', '#LegalTech'],
      htmlAsset: createHtmlAsset(
        'Drafting needs verified context',
        'A legal draft is useful when facts, relief, forum, and supporting authorities are structured correctly.',
        ['#0F172A', '#F5F3EF'],
        'Court-ready drafting',
        settings.logoUrl,
      ),
      scheduledAt: isoDaysFromNow(2),
      status: 'scheduled',
      metrics: { impressions: 0, reactions: 0, comments: 0, clicks: 0, shares: 0 },
      notes: 'Use as the template for litigation workflow posts.',
    },
  ];

  return { accounts, brandProfiles, posts, settings };
}

export function normalizeWorkspace(input?: Partial<WorkspaceState> | null): WorkspaceState {
  const fallback = createInitialWorkspace();
  const source = input || {};
  const fallbackBrandById = new Map(fallback.brandProfiles.map(profile => [profile.accountId, profile]));
  const sourceBrandById = new Map((source.brandProfiles || []).map(profile => [profile.accountId, profile]));

  const accounts = (source.accounts?.length ? source.accounts : fallback.accounts).map(account => {
    const fallbackAccount = fallback.accounts.find(item => item.id === account.id) || fallback.accounts[0];
    const organizationUrn = account.type === 'organization' && fallbackAccount.organizationUrn && (!account.organizationUrn || account.organizationUrn.endsWith(':1001') || account.organizationUrn.endsWith(':1002'))
      ? fallbackAccount.organizationUrn
      : account.organizationUrn;
    return {
      ...fallbackAccount,
      ...account,
      organizationUrn,
      linkedInAuth: account.linkedInAuth ? { ...account.linkedInAuth } : null,
    };
  });

  const brandProfiles = accounts.map(account => {
    const fallbackBrand = fallbackBrandById.get(account.id) || fallback.brandProfiles[0];
    const sourceBrand = sourceBrandById.get(account.id);
    return {
      ...fallbackBrand,
      ...(sourceBrand || {}),
      accountId: account.id,
      aboutCompany: sourceBrand?.aboutCompany || fallbackBrand.aboutCompany,
      imageStyle: normalizeBrandImageStyleForAccount(account, sourceBrand?.imageStyle, fallbackBrand.imageStyle),
      contentPillars: sourceBrand?.contentPillars?.length ? sourceBrand.contentPillars : fallbackBrand.contentPillars,
      hashtags: sourceBrand?.hashtags?.length ? sourceBrand.hashtags : fallbackBrand.hashtags,
      contentThemes: sourceBrand?.contentThemes?.length ? sourceBrand.contentThemes : fallbackBrand.contentThemes,
      bannedTopics: sourceBrand?.bannedTopics || fallbackBrand.bannedTopics,
      postingDays: sourceBrand?.postingDays?.length ? sourceBrand.postingDays : fallbackBrand.postingDays,
      postingTimes: sourceBrand?.postingTimes?.length ? sourceBrand.postingTimes : fallbackBrand.postingTimes,
      timezone: sourceBrand?.timezone || fallbackBrand.timezone,
    };
  });

  const posts = (source.posts || fallback.posts).map(post => {
    const sourceMetrics = post.metrics || {};
    const metrics = {
      impressions: sourceMetrics.impressions ?? 0,
      reactions: sourceMetrics.reactions ?? 0,
      comments: sourceMetrics.comments ?? 0,
      clicks: sourceMetrics.clicks ?? 0,
      shares: sourceMetrics.shares ?? 0,
    };
    return {
      ...post,
      theme: post.theme || 'general',
      cta: post.cta || '',
      hashtags: post.hashtags || [],
      htmlAsset: post.htmlAsset || createHtmlAsset(post.title || 'LinkedIn post', post.content || '', ['#2563eb', '#dbeafe'], 'Post asset', source.settings?.logoUrl || ''),
      scheduledAt: post.scheduledAt || new Date().toISOString(),
      metrics,
      notes: post.notes || '',
      retryCount: post.retryCount || 0,
      generatedAt: post.generatedAt || '',
      scheduleSlotKey: post.scheduleSlotKey || '',
      generationSource: post.generationSource || '',
    };
  });

  return {
    accounts,
    brandProfiles,
    posts,
    settings: {
      ...fallback.settings,
      ...(source.settings || {}),
      linkedinRedirectUri: !source.settings?.linkedinRedirectUri || source.settings.linkedinRedirectUri.includes('/api/auth/linkedin/callback')
        ? fallback.settings.linkedinRedirectUri
        : source.settings.linkedinRedirectUri,
      scheduler: {
        ...fallback.settings.scheduler,
        ...(source.settings?.scheduler || {}),
        enabled: source.settings?.scheduler?.enabled ?? fallback.settings.scheduler?.enabled ?? true,
        timezone: source.settings?.scheduler?.timezone || source.settings?.defaultTimezone || fallback.settings.defaultTimezone,
      },
    },
  };
}

export function loadWorkspace(): WorkspaceState {
  const fallback = createInitialWorkspace();
  if (typeof window === 'undefined') {
    return fallback;
  }
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    return normalizeWorkspace(parsed);
  } catch {
    return fallback;
  }
}

export function saveWorkspace(workspace: WorkspaceState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey, JSON.stringify(workspace));
}
