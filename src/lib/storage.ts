import type { AppSettings, BrandProfile, LinkedInAccount, PostDraft, WorkspaceState } from './types';

const storageKey = 'linkedin-ai-dashboard:v1';
export const canonicalLinkedInRedirectUri = 'https://social.minpay.in/linkedin/api/auth/linkedin/callback';

const now = new Date();

function isoDaysFromNow(days: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function createHtmlAsset(title: string, content: string, colors: string[], style: string, logoUrl = ''): string {
  const [primary = '#0f766e', secondary = '#e2e8f0'] = colors;
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body { margin:0; width:100%; height:100%; background:#f7f4ef; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
    .card {
      width: 1200px;
      height: 1200px;
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
      imageStyle: 'gradient',
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
      aboutCompany: 'Minpay Consultants helps businesses with payment workflows, operational efficiency, and AI-driven systems.',
      voice: 'Clear, polished, enterprise-friendly',
      tone: 'professional',
      contentPillars: ['product updates', 'case studies', 'AI workflows'],
      hashtags: ['#Product', '#AIWorkflow', '#B2B'],
      imageStyle: 'data-driven',
      writingStyle: 'Value-first, concise, outcome-focused',
      contentThemes: ['launches', 'process wins', 'customer results'],
      ctaStyle: 'Invite demos and comments',
      bannedTopics: ['internal drama'],
      postingDays: [1, 2, 3, 4, 5],
      postingTimes: ['10:00', '14:00', '17:30'],
      timezone: 'Asia/Kolkata',
    },
    {
      accountId: 'acc_page_2',
      aboutCompany: 'Casemate AI builds modern AI workflows, systems, and automation experiences for teams that want clean execution.',
      voice: 'Modern, visual, design-aware',
      tone: 'inspirational',
      contentPillars: ['automation', 'systems', 'design'],
      hashtags: ['#Automation', '#SystemsThinking', '#Design'],
      imageStyle: 'bold',
      writingStyle: 'Story-first with visual emphasis',
      contentThemes: ['frameworks', 'playbooks', 'before/after'],
      ctaStyle: 'Drive saves and shares',
      bannedTopics: ['unverified claims'],
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
      title: 'Launch update: AI workflow layer',
      theme: 'launch',
      content: 'We shipped a workflow layer for teams that need clarity, automation, and measurable output from their operating system. The focus is simple: fewer manual steps, more signal, better execution.',
      cta: 'Explore the workflow model',
      hashtags: ['#ProductLaunch', '#AI', '#B2B'],
      htmlAsset: createHtmlAsset(
        'Launch update: AI workflow layer',
        'We shipped a workflow layer for teams that need clarity, automation, and measurable output from their operating system.',
        ['#0f172a', '#e0f2fe'],
        'Product update',
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
      title: 'The three-layer content system',
      theme: 'framework',
      content: 'The easiest way to stay consistent is to separate ideas, production, and distribution. When those layers are distinct, the team can move faster without creative chaos.',
      cta: 'Save this framework for later',
      hashtags: ['#Automation', '#ContentSystem', '#LinkedIn'],
      htmlAsset: createHtmlAsset(
        'The three-layer content system',
        'Separate ideas, production, and distribution. That is how consistency becomes operational instead of emotional.',
        ['#7c3aed', '#fee2e2'],
        'Framework card',
        settings.logoUrl,
      ),
      scheduledAt: isoDaysFromNow(2),
      status: 'scheduled',
      metrics: { impressions: 0, reactions: 0, comments: 0, clicks: 0, shares: 0 },
      notes: 'Use as the template for system-style posts.',
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
