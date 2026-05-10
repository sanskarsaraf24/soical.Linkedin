export type AccountType = 'person' | 'organization';
export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'posted' | 'failed';
export type AppPage =
  | 'overview'
  | 'accounts'
  | 'brand'
  | 'content'
  | 'design'
  | 'scheduler'
  | 'analytics'
  | 'settings';

export interface LinkedInAccount {
  id: string;
  name: string;
  type: AccountType;
  handle: string;
  linkedInUrl: string;
  organizationUrn?: string | null;
  status: 'connected' | 'pending' | 'error';
  lastSyncAt: string;
  avatarHue: string;
  linkedInAuth?: LinkedInAuth | null;
}

export interface LinkedInAuth {
  accessToken?: string;
  expiresAt?: string;
  scope?: string;
  memberUrn?: string;
  organizationUrn?: string;
  lastConnectedAt?: string;
  connectionError?: string;
}

export interface StrategyItem {
  day: string;
  topic: string;
  hook: string;
  angle: string;
  visualDirection: string;
  visualState?: string;
  layoutArchetype?: 'A' | 'B' | 'C' | 'D';
  targetDate?: string;
  targetTime?: string;
  timezone?: string;
  scheduledAt?: string;
  scheduleSlotKey?: string;
  generatedContent?: {
    title?: string;
    content?: string;
  };
}

export interface BrandProfile {
  accountId: string;
  brandName?: string;
  logoUrl?: string;
  logoName?: string;
  aboutCompany: string;
  voice: string;
  tone: 'professional' | 'casual' | 'witty' | 'educational' | 'inspirational';
  contentPillars: string[];
  hashtags: string[];
  imageStyle: string;
  writingStyle: string;
  contentThemes: string[];
  ctaStyle: string;
  bannedTopics: string[];
  postingDays: number[]; // 0-6 (Sun-Sat)
  postingTimes: string[];
  timezone: string;
  lastGeneratedAt?: string;
  weeklyStrategy?: StrategyItem[];
  strategyGeneratedAt?: string;
  batchId?: string | null;
  batchStatus?: 'idle' | 'processing_content' | 'processing_graphics' | 'ready' | 'failed';
}

export interface SchedulerSettings {
  enabled: boolean;
  timezone: string;
  nextRunAt?: string;
  lastRunAt?: string;
  lastCreatedCount?: number;
  lastSkippedCount?: number;
  lastErrors?: string[];
}

export interface PostMetrics {
  impressions: number;
  reactions: number;
  comments: number;
  clicks: number;
  shares: number;
}

export interface PostDraft {
  id: string;
  accountId: string;
  title: string;
  theme: string;
  content: string;
  cta: string;
  hashtags: string[];
  htmlAsset: string;
  scheduledAt: string;
  status: PostStatus;
  metrics: PostMetrics;
  notes: string;
  imageUrl?: string;
  publishedAt?: string;
  postedAt?: string;
  linkedinPostUrn?: string;
  lastError?: string;
  retryCount?: number;
  generatedAt?: string;
  scheduleSlotKey?: string;
  generationSource?: string;
}

export interface WorkspaceState {
  accounts: LinkedInAccount[];
  brandProfiles: BrandProfile[];
  posts: PostDraft[];
  settings: AppSettings;
}

export interface AppSettings {
  linkedinClientId: string;
  linkedinClientSecret: string;
  linkedinClientSecretSaved?: boolean;
  linkedinRedirectUri: string;
  defaultTimezone: string;
  logoUrl: string;
  logoName: string;
  scheduler?: SchedulerSettings;
}

export interface SchedulerStatus {
  enabled: boolean;
  timezone: string;
  nextRunAt: string;
  lastRunAt: string;
  lastCreatedCount: number;
  lastSkippedCount: number;
  lastErrors: string[];
  tomorrowDate: string;
  postsDueTomorrow: number;
}

export interface SchedulerRunResult extends SchedulerStatus {
  checked: number;
  created: number;
  skipped: number;
  errors: string[];
  posts: PostDraft[];
}
