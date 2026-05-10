import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { MongoClient } from 'mongodb';
import { Groq } from 'groq-sdk';
import Anthropic from '@anthropic-ai/sdk';
import cron from 'node-cron';
import fetch from 'node-fetch';
import { renderHtmlToPng } from './rendering.js';

// Storage for Manual Overrides
const manualStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/manual/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const manualUpload = multer({ storage: manualStorage });

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);
const basePath = process.env.APP_BASE_PATH || '/linkedin';
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'linkedin_ai';
const groqKey = process.env.GROQ_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

let generationTracker = new Map();
function getAndIncGenerationOffset(accountId) {
  const now = Date.now();
  const entry = generationTracker.get(accountId) || { count: 0, lastAt: now };
  if (now - entry.lastAt > 120000) entry.count = 0;
  const offset = entry.count;
  entry.count += 1;
  entry.lastAt = now;
  generationTracker.set(accountId, entry);
  return offset;
}
const canonicalRedirectUri = 'https://social.minpay.in/linkedin/api/auth/linkedin/callback';
const publicBaseUrl = process.env.PUBLIC_BASE_URL || 'https://social.minpay.in';
function normalizeLinkedInApiVersion(value) {
  const raw = String(value || '').replace(/\D/g, '');
  if (!raw || raw === '202504' || raw === '20250401') return '202604';
  if (raw.length >= 8) return raw.slice(0, 6);
  return raw;
}

const linkedInApiVersion = normalizeLinkedInApiVersion(process.env.LINKEDIN_API_VERSION);
const schedulerTimezone = process.env.SCHEDULER_TIMEZONE || 'Asia/Kolkata';
const anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';
console.log('Anthropic Model Loaded:', anthropicModel);

const groq = groqKey ? new Groq({ apiKey: groqKey }) : null;
const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

const MINPAY_IMAGE_STYLE = [
  'MinPay Consultants LLP brand kit. Colors: Deep Teal #143D45 as the primary brand color, Mint Teal #47A48B as the accent/checkmark color, White #FFFFFF, Cool Light Gray #F4F6F8, and Charcoal Gray #4A4A4A for secondary text.',
  'Typography: Montserrat Bold for headlines, labels, and key numbers; Roboto Regular for body/supporting text. Use clean, confident, professional spacing with no decorative gradients.',
  'Visual language: calm debt-resolution and consultation brand, not a loan app and not generic SaaS. Use white or light-gray backgrounds, deep-teal panels, mint accents, clean dividers, document/checklist/process motifs, and subtle finance/legal-consultation cues.',
  'Mood board direction: minimalist financial service posters, clean business-card style layouts, flat illustration only when useful, subtle office/document context, and strong trust signals through structure and restraint.',
  'Layout states to rotate: Clean White, Light Gray, Deep Teal, Mint Accent. Keep the logo visible once, preferably top-left or bottom-right depending on contrast.',
  'Avoid: navy/charcoal-heavy palettes not in the kit, emerald substitutes, purple/blue startup gradients, rounded pill-heavy UI, playful illustrations, fear-based debt imagery, stock-photo people, clutter, tiny text, and any promise of guaranteed settlement outcomes.'
].join(' ');

const CASEMATE_IMAGE_STYLE = [
  'Casemate AI brand kit. Colors: Deep Navy #0F172A, Royal Blue #1D4ED8, Warm Off-White #F5F3EF, Slate Grey #334155, and Deep Emerald #065F46 only for success states.',
  'Typography: Playfair Display for headlines, Inter for body, JetBrains Mono for citations or references. Keep the tone court-ready, precise, and disciplined.',
  'Visual language: legal-tech, source-verified, structured, and institutional. Use squared layouts, thin borders, document-style panels, and calm whitespace.',
  'Layout states to rotate: Citation Authority, Two-Column Brief, Vertical Authority, Grid Reference. Do not repeat the same framing every post.',
  'Avoid: playful illustrations, startup gradients, rounded pill-heavy styling, stock imagery, neon accents, and generic AI branding.'
].join(' ');

const PERSONAL_IMAGE_STYLE = [
  'Founder brand visual kit. Colors: Indigo #4F46E5, Off-White #F8F6F1, Charcoal #1F2937, Muted Grey #6B7280.',
  'Typography: Manrope Bold for headlines, Inter for supporting text. Keep the voice crisp, practical, and reflective.',
  'Visual language: editorial but restrained, with clear hierarchy, ample whitespace, subtle dividers, and no decorative clutter.',
  'Layout states to rotate: Bold Left Headline, Magazine Spread, Quote Statement, Data Insight. Each post should feel distinct.',
  'Avoid: gradients, noisy textures, rounded card-heavy design, and filler decoration.'
].join(' ');

const LAYOUT_ARCHETYPES = ['A', 'B', 'C', 'D'];

function normalizeLayoutArchetype(value = 'A') {
  const archetype = String(value || 'A').trim().toUpperCase();
  return LAYOUT_ARCHETYPES.includes(archetype) ? archetype : 'A';
}

function pickLayoutArchetype(index = 0) {
  return LAYOUT_ARCHETYPES[index % LAYOUT_ARCHETYPES.length];
}

function getNextLayoutArchetypeForAccount(workspace, accountId, offset = 0) {
  const recentPosts = (workspace.posts || [])
    .filter(p => p.accountId === accountId && p.status !== 'failed')
    .sort((a, b) => new Date(b.scheduledAt || 0).getTime() - new Date(a.scheduledAt || 0).getTime())
    .slice(0, 3);
  
  const usedArchetypes = recentPosts.map(p => p.layoutArchetype).filter(Boolean);
  const archetypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  let candidateIndex = ((workspace.posts || []).filter(p => p.accountId === accountId).length + offset) % archetypes.length;
  let layout = archetypes[candidateIndex];
  
  let attempts = 0;
  while (usedArchetypes.includes(layout) && attempts < archetypes.length) {
    candidateIndex = (candidateIndex + 1) % archetypes.length;
    layout = archetypes[candidateIndex];
    attempts++;
  }
  
  return layout;
}

function getBrandPalette(accountName = '', visualState = '') {
  const name = accountName.toLowerCase();
  
  if (name.includes('casemate')) {
    // Casemate: Navy (#0F172A), Brass (#C5A059), Cream (#FDFCF7), Royal (#1D4ED8), Slate (#94A3B8)
    if (visualState === 'DARK') {
      return { bg: '#0F172A', accent: '#C5A059', text: '#FDFCF7', secondary: '#1D4ED8', detail: '#94A3B8' };
    }
    return { bg: '#FDFCF7', accent: '#0F172A', text: '#0F172A', secondary: '#C5A059', detail: '#94A3B8' };
  }
  
  if (name.includes('minpay')) {
    // MinPay: Deep Sea (#143D45), Mint (#47A48B), White (#FFFFFF), Trust Blue (#3B82F6), Cool Gray (#F4F6F8)
    if (visualState === 'DARK') {
      return { bg: '#143D45', accent: '#47A48B', text: '#FFFFFF', secondary: '#3B82F6', detail: '#F4F6F8' };
    }
    return { bg: '#FFFFFF', accent: '#143D45', text: '#143D45', secondary: '#47A48B', detail: '#F4F6F8' };
  }
  
  if (name.includes('sanskar') || name.includes('founder') || name.includes('saraf')) {
    // Saraf & Co: Burgundy (#4B1E2F), Gold (#C9A24D), Ivory (#F5F1EA), Charcoal (#1F1F1F), Slate (#6B6B6B)
    if (visualState === 'DARK') {
      return { bg: '#1F1F1F', accent: '#4B1E2F', text: '#F5F1EA', secondary: '#C9A24D', detail: '#6B6B6B' };
    }
    return { bg: '#F5F1EA', accent: '#4B1E2F', text: '#1F1F1F', secondary: '#C9A24D', detail: '#6B6B6B' };
  }
  
  return { bg: '#FFFFFF', accent: '#3B82F6', text: '#1F2937', secondary: '#6366F1', detail: '#F3F4F6' };
}

function getNextVisualStateForAccount(workspace, account, brand, offset = 0) {
  const accountId = account.id;
  const recentPosts = (workspace.posts || [])
    .filter(p => p.accountId === accountId && p.status !== 'failed')
    .sort((a, b) => new Date(b.scheduledAt || 0).getTime() - new Date(a.scheduledAt || 0).getTime())
    .slice(0, 1);
  
  const lastState = recentPosts[0]?.visualState;
  // Strictly alternate: if last was DARK, next is LIGHT
  return lastState === 'DARK' ? 'LIGHT' : 'DARK';
}

async function generateGraphicSummary(postContent) {
  if (!anthropic) return postContent.slice(0, 150);
  
  try {
    const response = await anthropic.messages.create({
      model: anthropicModel,
      max_tokens: 100,
      system: `You are a minimalist copywriter. Summarize the following LinkedIn post into a single, punchy insight of 15-30 words. Focus on the 'Why' or the 'Result'. Do not use emojis.`,
      messages: [{ role: 'user', content: postContent }]
    });
    return response.content?.[0]?.text || postContent.slice(0, 150);
  } catch (err) {
    console.error('Summary error:', err);
    return postContent.slice(0, 150);
  }
}


function isCasemateAccount(account = {}) {
  return String(account.name || account.handle || '').toLowerCase().includes('casemate');
}

function getDefaultBrandImageStyle(account = {}) {
  if (isMinpayAccount(account)) return MINPAY_IMAGE_STYLE;
  if (isCasemateAccount(account)) return CASEMATE_IMAGE_STYLE;
  return PERSONAL_IMAGE_STYLE;
}

function trimContext(text, maxLength = 600) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function cleanMarkdown(text) {
  if (!text) return '';
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n/i, '').replace(/\n```$/m, '');
  }
  return cleaned.trim();
}

function parsePostingTime(value = '09:00') {
  const raw = String(value || '').trim();
  const meridiemMatch = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (meridiemMatch) {
    let hour = Number(meridiemMatch[1]);
    const minute = Number(meridiemMatch[2] || 0);
    const meridiem = meridiemMatch[3].toUpperCase();
    if (meridiem === 'PM' && hour < 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    return {
      hour,
      minute,
      label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    };
  }

  const [hourRaw = '9', minuteRaw = '0'] = raw.split(':');
  const hour = Math.min(Math.max(Number(hourRaw) || 9, 0), 23);
  const minute = Math.min(Math.max(Number(minuteRaw) || 0, 0), 59);
  return {
    hour,
    minute,
    label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  };
}

app.use(cors());
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const uploadRoot = path.join(__dirname, 'uploads');
const uploadDir = path.join(uploadRoot, 'logos');
fs.mkdirSync(uploadDir, { recursive: true });

const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]+/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const logoUpload = multer({ storage: logoStorage });

const mongo = new MongoClient(mongoUri);
await mongo.connect();
const db = mongo.db(dbName);
const workspaces = db.collection('workspaces');

await workspaces.createIndex({ workspaceId: 1 }, { unique: true });

function isoDaysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/** Anthropic Batch API Helpers */
async function submitAnthropicBatch(requests) {
  const response = await fetch('https://api.anthropic.com/v1/messages/batches', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic Batch Submission Error: ${error}`);
  }
  return response.json();
}

async function getAnthropicBatchStatus(batchId) {
  const response = await fetch(`https://api.anthropic.com/v1/messages/batches/${batchId}`, {
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01'
    }
  });
  if (!response.ok) return null;
  return response.json();
}

async function getAnthropicBatchResults(resultsUrl) {
  const response = await fetch(resultsUrl, {
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01'
    }
  });
  if (!response.ok) return null;
  const text = await response.text();
  return text.trim().split('\n').map(line => JSON.parse(line));
}

function escapeHtml(input = '') {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function hashString(input = '') {
  let hash = 0;
  for (let index = 0; index < String(input).length; index += 1) {
    hash = ((hash << 5) - hash) + String(input).charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Named-color palette lookup — brand description words → CSS values.
// No boolean flag chains. The first matching entry wins.
const NAMED_COLOR_PALETTES = [
  { keys: ['maroon', 'wine', 'burgundy', 'crimson'], accent: '#7B1E2D', bg: '#fdf8f5', card: 'rgba(255,255,255,0.94)', text: '#111111', textMuted: '#5a4a45', border: 'rgba(123,30,45,0.06)' },
  { keys: ['gold', 'champagne', 'ochre'], accent: '#B8960C', bg: '#fefdf5', card: 'rgba(255,255,255,0.94)', text: '#111111', textMuted: '#6b6040', border: 'rgba(184,150,12,0.06)' },
  { keys: ['ivory', 'cream', 'warm white', 'linen'], accent: '#7B1E2D', bg: '#FDFAF5', card: 'rgba(255,255,255,0.95)', text: '#111111', textMuted: '#6b6040', border: 'rgba(0,0,0,0.04)' },
  { keys: ['navy', 'midnight', 'prussian'], accent: '#1E3A5F', bg: '#f0f4ff', card: 'rgba(255,255,255,0.93)', text: '#0f172a', textMuted: '#4a5568', border: 'rgba(30,58,95,0.06)' },
  { keys: ['teal', 'emerald', 'jade'], accent: '#0d9488', bg: '#f0fdf4', card: 'rgba(255,255,255,0.93)', text: '#0f172a', textMuted: '#475569', border: 'rgba(13,148,136,0.06)' },
  { keys: ['violet', 'purple', 'plum'], accent: '#7c3aed', bg: '#faf5ff', card: 'rgba(255,255,255,0.93)', text: '#0f172a', textMuted: '#6b7280', border: 'rgba(124,58,237,0.06)' },
  { keys: ['blue', 'sapphire', 'cobalt', 'cerulean', 'indigo'], accent: '#0284c7', bg: '#f0f9ff', card: 'rgba(255,255,255,0.93)', text: '#0f172a', textMuted: '#475569', border: 'rgba(2,132,199,0.06)' },
  { keys: ['dark', 'noir', 'charcoal', 'night', 'black'], accent: '#4f46e5', bg: '#0f172a', card: 'rgba(255,255,255,0.06)', text: '#f1f5f9', textMuted: '#94a3b8', border: 'rgba(255,255,255,0.08)' },
  { keys: ['bold', 'vibrant', 'scarlet'], accent: '#dc2626', bg: '#fff5f5', card: 'rgba(255,255,255,0.93)', text: '#0f172a', textMuted: '#6b7280', border: 'rgba(220,38,38,0.06)' },
  { keys: ['amber', 'warm', 'orange', 'saffron'], accent: '#d97706', bg: '#fefce8', card: 'rgba(255,255,255,0.93)', text: '#0f172a', textMuted: '#6b7280', border: 'rgba(217,119,6,0.06)' },
  { keys: ['data', 'analytics', 'chart'], accent: '#0d9488', bg: '#f0fdf4', card: 'rgba(255,255,255,0.93)', text: '#0f172a', textMuted: '#475569', border: 'rgba(13,148,136,0.06)' },
];

function deriveStylePalette(styleStr = '') {
  const lower = styleStr.toLowerCase();
  if (lower.includes('minpay') || (lower.includes('#143d45') && lower.includes('#47a48b'))) {
    return {
      accent: '#47A48B',
      bg: '#F4F6F8',
      card: '#FFFFFF',
      text: '#143D45',
      textMuted: '#4A4A4A',
      border: 'rgba(20,61,69,0.14)'
    };
  }
  const colorHint = lower.match(/#[0-9a-f]{3,6}/i)?.[0];
  if (colorHint) return { accent: colorHint, bg: '#f8f8f8', card: 'rgba(255,255,255,0.93)', text: '#0f172a', textMuted: '#64748b', border: 'rgba(0,0,0,0.04)' };
  for (const p of NAMED_COLOR_PALETTES) {
    if (p.keys.some(k => lower.includes(k))) return p;
  }
  return { accent: '#4f46e5', bg: '#f5f4ff', card: 'rgba(255,255,255,0.92)', text: '#0f172a', textMuted: '#64748b', border: 'rgba(0,0,0,0.04)' };
}

function createMinpayHtmlAsset(title = 'LinkedIn post', content = '', kicker = 'Debt resolution', logoUrl = '', showFooter = false, accountName = '', accountHandle = '') {
  const headline = String(title || 'LinkedIn post').replace(/[.!?]+$/g, '').slice(0, 72);
  const subheadline = String(content || '')
    .replace(/\s+/g, ' ')
    .split(/[.!?\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 20)
    .find(Boolean)
    ?.slice(0, 132) || '';
  const displayAuthor = accountName || '';
  const displayHandle = accountHandle ? `LinkedIn · ${accountHandle}` : '';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  <style>
    html,body{margin:0;width:100%;height:100%;background:#F4F6F8;font-family:'Roboto',Arial,sans-serif;-webkit-font-smoothing:antialiased;}
    .wrap{width:1080px;height:1080px;background:#F4F6F8;box-sizing:border-box;padding:76px;display:flex;position:relative;overflow:hidden;color:#143D45;}
    .panel{width:100%;height:100%;background:#FFFFFF;border:1px solid rgba(20,61,69,0.14);box-sizing:border-box;padding:76px 78px;display:flex;flex-direction:column;justify-content:space-between;position:relative;}
    .panel:before{content:"";position:absolute;right:0;top:0;width:220px;height:220px;background:#47A48B;opacity:.16;border-bottom-left-radius:110px;}
    .top{display:flex;justify-content:space-between;align-items:flex-start;gap:36px;position:relative;z-index:1;}
    .kicker{font-family:'Montserrat',Arial,sans-serif;font-size:30px;line-height:1.2;letter-spacing:0;text-transform:uppercase;color:#143D45;border-left:10px solid #47A48B;padding-left:22px;max-width:620px;}
    .logo{max-width:190px;max-height:82px;object-fit:contain;}
    .main{position:relative;z-index:1;}
    h1{font-family:'Montserrat',Arial,sans-serif;font-size:82px;line-height:1.04;letter-spacing:0;font-weight:700;color:#143D45;margin:0;max-width:850px;}
    .rule{width:150px;height:8px;background:#47A48B;margin:42px 0 34px 0;}
    .sub{font-size:35px;line-height:1.42;color:#4A4A4A;margin:0;max-width:830px;font-weight:400;}
    .footer{display:flex;justify-content:space-between;align-items:flex-end;gap:28px;color:#4A4A4A;font-size:24px;position:relative;z-index:1;}
    .author-name{font-family:'Montserrat',Arial,sans-serif;color:#143D45;font-size:26px;font-weight:700;}
    .author-handle{font-size:21px;margin-top:6px;}
    .check{width:74px;height:74px;border:8px solid #47A48B;border-top:0;border-left:0;transform:rotate(45deg);margin-right:20px;margin-bottom:10px;}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="panel">
      <div class="top">
        <div class="kicker" data-required="kicker">${escapeHtml(kicker || 'Debt resolution')}</div>
        ${logoUrl ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="Logo" />` : ''}
      </div>
      <div class="main">
        <h1 data-required="headline">${escapeHtml(headline)}</h1>
        <div class="rule"></div>
        ${subheadline ? `<p class="sub" data-required="subheadline">${escapeHtml(subheadline)}</p>` : '<p class="sub" data-required="subheadline"> </p>'}
      </div>
      <div class="footer">
        ${showFooter && displayAuthor ? `<div><div class="author-name">${escapeHtml(displayAuthor)}</div>${displayHandle ? `<div class="author-handle">${escapeHtml(displayHandle)}</div>` : ''}</div>` : '<div></div>'}
        <div class="check" aria-hidden="true"></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function createHtmlAsset(title = 'LinkedIn post', content = '', style = 'Featured', logoUrl = '', showFooter = false, accountName = '', accountHandle = '', layoutArchetype = 'A') {
  const styleText = String(style || '');
  if (styleText.toLowerCase().includes('minpay') || styleText.toLowerCase().includes('#143d45')) {
    return createMinpayHtmlAsset(title, content, 'Debt resolution', logoUrl, showFooter, accountName, accountHandle);
  }

  const { accent, bg, card: cardBg, text, textMuted, border: borderColor } = deriveStylePalette(style);

  const headline = String(title || 'LinkedIn post').replace(/[.!?]+$/g, '').slice(0, 72);
  const subheadline = String(content || '')
    .replace(/\s+/g, ' ')
    .split(/[.!?\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 20)
    .find(Boolean)
    ?.slice(0, 130) || '';
  const displayKicker = (style && !style.includes('/')) ? style : 'Featured';
  const displayAuthor = accountName || '';
  const displayHandle = accountHandle ? `LinkedIn · ${accountHandle}` : '';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    html,body{margin:0;width:100%;height:100%;background:${bg};font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
    .wrap{width:1080px;height:1080px;display:flex;align-items:center;justify-content:center;padding:72px;box-sizing:border-box;position:relative;overflow:hidden;background:${bg};}
    .bg-shape{position:absolute;border-radius:50%;opacity:0.07;background:${accent};}
    .bg-shape.a{width:700px;height:700px;right:-180px;top:-180px;}
    .bg-shape.b{width:350px;height:350px;left:-80px;bottom:-80px;}
    .card{position:relative;z-index:2;background:${cardBg};border-radius:52px;padding:100px;width:100%;height:100%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 28px 72px rgba(0,0,0,0.09);backdrop-filter:blur(8px);border:1px solid ${borderColor};}
    .kicker{display:inline-block;background:${accent};color:#fff;font-family:'Inter',sans-serif;font-size:21px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;padding:12px 28px;border-radius:99px;margin-bottom:60px;align-self:flex-start;}
    h1{font-family:'Manrope',sans-serif;font-size:86px;line-height:1.0;letter-spacing:-0.03em;font-weight:800;color:${text};margin:0;max-width:900px;}
    .line{width:72px;height:5px;background:${accent};border-radius:3px;margin:52px 0;}
    .sub{font-family:'Inter',sans-serif;font-size:34px;line-height:1.5;color:${textMuted};margin:0;max-width:800px;font-weight:400;}
    .footer{display:flex;justify-content:space-between;align-items:center;}
    .author-name{font-family:'Manrope',sans-serif;font-size:24px;font-weight:700;color:${text};}
    .author-handle{font-size:18px;color:${textMuted};margin-top:4px;}
    .logo{max-width:160px;max-height:64px;object-fit:contain;opacity:0.8;}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="bg-shape a"></div>
    <div class="bg-shape b"></div>
    <div class="card">
      <div>
        <div class="kicker" data-required="kicker">${escapeHtml(displayKicker)}</div>
        <h1 data-required="headline">${escapeHtml(headline)}</h1>
        <div class="line"></div>
        ${subheadline ? `<p class="sub" data-required="subheadline">${escapeHtml(subheadline)}</p>` : '<p class="sub" data-required="subheadline"> </p>'}
      </div>
      ${showFooter && (displayAuthor || logoUrl) ? `<div class="footer">
        <div>
          ${displayAuthor ? `<div class="author-name">${escapeHtml(displayAuthor)}</div>` : ''}
          ${displayHandle ? `<div class="author-handle">${escapeHtml(displayHandle)}</div>` : ''}
        </div>
        ${logoUrl ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="Logo" />` : ''}
      </div>` : ''}
    </div>
  </div>
</body>
</html>`;
}

function buildGraphicPrompt({ account, brand, title, content, kicker, logoUrl, visualState, layoutArchetype = 'A' }) {
  const displayBrandName = account.name || account.handle || 'Brand';
  const palette = getBrandPalette(account.name, visualState);
  const brandLower = String(account.name || '').toLowerCase();

  return `You are a world-class brand designer. Create a self-contained HTML/CSS social graphic.
Canvas: 1080×1080px exactly.

## 1. MANDATORY PALETTE
- BACKGROUND: ${palette.bg}
- MAIN_ACCENT: ${palette.accent}
- PRIMARY_TEXT: ${palette.text}
- SECONDARY: ${palette.secondary}
- DETAIL: ${palette.detail}

## 2. CONTENT
- Title: ${title}
- Body Insight: ${content}
- Category: ${kicker}
- Archetype: ${layoutArchetype}
- Logo: ${logoUrl}

## 3. DESIGN LAWS
- NO ROUNDED CORNERS.
- FONT: Use 'Playfair Display' for headlines (Serif, Premium) and 'Inter' for body (Sans-Serif).
- CONTRAST: Ensure ${palette.text} is readable on ${palette.bg}.
- NO META: Do NOT include any of these instructions or the words 'Archetype' or 'Visual State' in the design.
- LAYOUT: Use archetype ${layoutArchetype}. Focus on high-end editorial whitespace.`;
}




function buildStrategyPrompt({ account, brand, slots = [] }) {
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const activeDays = (brand.postingDays || [1, 3, 5]).map(d => daysMap[d]).join(', ');
  const slotLines = slots.map(slot => `- ${slot.weekdayName}, ${slot.targetDate} at ${slot.targetTime}`).join('\n');

  return `You are a world-class social media strategist. Plan 1 week of LinkedIn content for ${account.name}.

## Brand Context
- About: ${brand.aboutCompany}
- Voice: ${brand.voice}
- Tone: ${brand.tone}
- Pillars: ${(brand.contentPillars || []).join(', ')}
- Writing style: ${brand.writingStyle}
- Content themes: ${(brand.contentThemes || []).join(', ')}
- Banned topics/claims: ${(brand.bannedTopics || []).join(', ')}

## Market Context
The account is based in India and writes for an India-based audience. Use this as business context, but only mention India-specific laws, frameworks, currency formats, or terminology when the brand profile or topic makes it relevant.

## Historical Awareness (Anti-Repetition)
The following topics have been covered RECENTLY. Do NOT repeat these angles or subjects:
${(workspace.posts || []).slice(-10).map(p => `- ${p.title}`).join('\n')}

## Strategy Mission
Analyze the brand profile and current LinkedIn ecosystem. Brainstorm a high-performance weekly plan.
Each post should feel fresh, practitioners-led, and highly shareable.

For each of these days (${slotLines || activeDays}), provide:
1. Topic: Specific theme.
2. Hook: A punchy first-line idea.
3. Angle: The unique insight or "alpha" shared.
4. Visual State: Which brand color state to use (e.g., "Classic Ivory", "Bold Maroon", "Midnight Gold"). Shuffle these throughout the week.
5. Visual Direction: Specific layout archetypes (e.g., "Split-screen with heavy serif", "Left-aligned magazine style").

Return ONLY a JSON array of objects with keys: day, topic, hook, angle, visualState, visualDirection.`;
}

function createInitialWorkspace() {
  return {
    workspaceId: 'default',
    accounts: [
      {
        id: 'acc_personal',
        name: 'Sanskar Saraf',
        type: 'person',
        handle: '@sanskar',
        linkedInUrl: 'https://linkedin.com/in/sanskarsaraf/',
        status: 'connected',
        lastSyncAt: isoDaysFromNow(-1),
        avatarHue: '#2563eb',
      },
      {
        id: 'acc_page_1',
        name: 'Minpay Consultants',
        type: 'organization',
        handle: '@minpay-consultants',
        linkedInUrl: 'https://www.linkedin.com/company/minpay-consultants/',
        organizationUrn: 'urn:li:organization:108473075',
        status: 'connected',
        lastSyncAt: isoDaysFromNow(-1),
        avatarHue: '#0f766e',
      },
      {
        id: 'acc_page_2',
        name: 'Casemate AI',
        type: 'organization',
        handle: '@casemate-ai',
        linkedInUrl: 'https://www.linkedin.com/company/casemate-ai/',
        organizationUrn: 'urn:li:organization:108147291',
        status: 'connected',
        lastSyncAt: isoDaysFromNow(-2),
        avatarHue: '#d97706',
      },
    ],
    brandProfiles: [
    {
      accountId: 'acc_personal',
      aboutCompany: 'Personal founder brand focused on AI operators, shipping lessons, and product strategy.',
      voice: 'Founder-led, sharp, practical, reflective',
        tone: 'educational',
      contentPillars: ['AI operators', 'builder lessons', 'product strategy'],
      hashtags: ['#AI', '#BuildInPublic', '#Founder'],
      imageStyle: PERSONAL_IMAGE_STYLE,
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
      imageStyle: MINPAY_IMAGE_STYLE,
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
      imageStyle: CASEMATE_IMAGE_STYLE,
        writingStyle: 'Precise, legal, structured, and specific to Indian litigation workflows. Emphasize court-ready drafting, verified citations, confidentiality, advocate control, and refusal to fabricate sources.',
        contentThemes: ['court-ready drafting', 'verified Indian case law', 'matter organisation', 'generic AI limitations', 'advocate control', 'confidentiality', 'hearing discipline'],
        ctaStyle: 'Invite advocates to start a 14-day free trial or see how the workflow works.',
        bannedTopics: ['legal advice', 'fabricated citations', 'guaranteed case outcomes', 'playful tone', 'generic AI hype', 'ChatGPT wrapper positioning', 'unverified claims'],
        postingDays: [2, 4],
        postingTimes: ['11:00', '16:00'],
        timezone: 'Asia/Kolkata',
      },
    ],
    posts: [],
    settings: {
      linkedinClientId: process.env.LINKEDIN_CLIENT_ID || '',
      linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      linkedinClientSecretSaved: Boolean(process.env.LINKEDIN_CLIENT_SECRET),
      linkedinRedirectUri: process.env.LINKEDIN_REDIRECT_URI || canonicalRedirectUri,
      defaultTimezone: 'Asia/Kolkata',
      logoUrl: '',
      logoName: '',
      scheduler: {
        enabled: true,
        timezone: schedulerTimezone,
        nextRunAt: '',
        lastRunAt: '',
        lastCreatedCount: 0,
        lastSkippedCount: 0,
        lastErrors: [],
      },
    },
  };
}

function isMinpayAccount(account = {}) {
  return String(account.name || account.handle || '').toLowerCase().includes('minpay');
}

function normalizeBrandImageStyleForAccount(account, imageStyle, fallbackStyle) {
  const style = imageStyle || fallbackStyle || '';
  const lower = String(style).toLowerCase();
  if (
    (isMinpayAccount(account) || isCasemateAccount(account) || String(account.name || account.handle || '').toLowerCase().includes('founder'))
    && (
      !style
      || (isMinpayAccount(account) && (!lower.includes('#143d45') || !lower.includes('#47a48b') || lower.includes('navy') || lower.includes('dark slate') || lower.includes('emerald')))
      || (isCasemateAccount(account) && (!lower.includes('#0f172a') || !lower.includes('#1d4ed8') || lower.includes('rounded pill')))
    )
  ) {
    return getDefaultBrandImageStyle(account);
  }
  return style;
}

function getGraphicArchetypeBrief({ account, layoutArchetype = 'A' }) {
  const archetype = normalizeLayoutArchetype(layoutArchetype);
  const isMinpay = isMinpayAccount(account);
  const isCasemate = isCasemateAccount(account);

  if (isMinpay) {
    const briefs = {
      A: 'Checklist/Process. Use a left deep-teal panel with white kicker and 2-3 mint checkmarks. Keep the right side white with a large headline and supporting sentence. The composition should feel like a trusted consultation summary.',
      B: 'Sidebar Authority. Use a mint sidebar or top band for the label, then a wide white content area with a strong headline and one short supporting line. Keep the structure calm, direct, and well-spaced.',
      C: 'Focused Statement. Place the kicker top-left with a mint vertical rule, center the headline, and keep supporting text short and disciplined. The page should feel composed, not promotional.',
      D: 'Data + Trust. Use a prominent stat or statement block with a mint accent bar, then a supporting trust line below. Keep any supporting boxes squared, minimal, and process-oriented.',
    };
    return briefs[archetype];
  }

  if (isCasemate) {
    const briefs = {
      A: 'Citation/Authority. Use a left border or rail, a large authoritative headline, and a small monospace reference line or citation block. The layout should feel court-ready and precise.',
      B: 'Two-Column Brief. Use a dark left column and an off-white right column, with the headline on one side and the supporting argument on the other. Keep the divider thin and intentional.',
      C: 'Vertical Authority. Use a narrow navy panel on the left and a larger content field on the right. The overall tone should feel institutional and disciplined.',
      D: 'Grid Reference. Use a centered kicker and headline with 3 small reference boxes below. This should read like a structured legal framework, not a marketing card.',
    };
    return briefs[archetype];
  }

  const briefs = {
    A: 'Bold Left Headline. Use a two-column or asymmetric composition with the headline dominating the left side and a visual accent on the right. Keep the page editorial and crisp.',
    B: 'Magazine Spread. Center the kicker, let the headline occupy most of the canvas, and add one geometric accent only if it supports balance. Keep the composition airy and premium.',
    C: 'Quote/Statement. Use a centered statement layout with a thin divider and a short supporting line. The page should feel reflective and concise.',
    D: 'Data/Insight Focus. Build a structured grid with 2-3 compact insight boxes or stat chips supporting the headline. Avoid decorative clutter.',
  };
  return briefs[archetype];
}

function normalizeWorkspace(workspace) {
  const fallback = createInitialWorkspace();
  const { _id, createdAt, updatedAt, ...rest } = workspace || {};
  const fallbackBrandById = new Map(fallback.brandProfiles.map(profile => [profile.accountId, profile]));
  const incomingAccounts = Array.isArray(rest.accounts) && rest.accounts.length ? rest.accounts : fallback.accounts;
  const incomingBrands = Array.isArray(rest.brandProfiles) ? rest.brandProfiles : [];
  const incomingBrandById = new Map(incomingBrands.map(profile => [profile.accountId, profile]));
  const settings = {
    ...fallback.settings,
    ...(rest.settings || {}),
    scheduler: {
      ...fallback.settings.scheduler,
      ...((rest.settings || {}).scheduler || {}),
      timezone: ((rest.settings || {}).scheduler || {}).timezone || (rest.settings || {}).defaultTimezone || schedulerTimezone,
    },
  };
  settings.linkedinClientId = settings.linkedinClientId || process.env.LINKEDIN_CLIENT_ID || '';
  settings.linkedinClientSecret = settings.linkedinClientSecret || process.env.LINKEDIN_CLIENT_SECRET || '';
  settings.linkedinClientSecretSaved = Boolean(settings.linkedinClientSecret);
  if (!settings.linkedinRedirectUri || settings.linkedinRedirectUri.includes('/api/auth/linkedin/callback')) {
    settings.linkedinRedirectUri = canonicalRedirectUri;
  }

  const accounts = incomingAccounts.map(account => {
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
    const incomingBrand = incomingBrandById.get(account.id) || {};
    return {
      ...fallbackBrand,
      ...incomingBrand,
      accountId: account.id,
      aboutCompany: incomingBrand.aboutCompany || fallbackBrand.aboutCompany,
      imageStyle: normalizeBrandImageStyleForAccount(account, incomingBrand.imageStyle, fallbackBrand.imageStyle),
      contentPillars: incomingBrand.contentPillars?.length ? incomingBrand.contentPillars : fallbackBrand.contentPillars,
      hashtags: incomingBrand.hashtags?.length ? incomingBrand.hashtags : fallbackBrand.hashtags,
      contentThemes: incomingBrand.contentThemes?.length ? incomingBrand.contentThemes : fallbackBrand.contentThemes,
      bannedTopics: incomingBrand.bannedTopics || fallbackBrand.bannedTopics,
      postingDays: incomingBrand.postingDays?.length ? incomingBrand.postingDays : fallbackBrand.postingDays,
      postingTimes: incomingBrand.postingTimes?.length ? incomingBrand.postingTimes : fallbackBrand.postingTimes,
      timezone: incomingBrand.timezone || fallbackBrand.timezone,
    };
  });

  const accountById = new Map(accounts.map(a => [a.id, a]));
  const brandById = new Map(brandProfiles.map(b => [b.accountId, b]));
  const posts = (Array.isArray(rest.posts) ? rest.posts : fallback.posts).map(post => {
    const postAccount = accountById.get(post.accountId);
    const postAccountName = postAccount?.name || '';
    const postAccountHandle = postAccount?.linkedInUrl
      ? postAccount.linkedInUrl.replace(/\/$/, '').split('/').pop() || postAccountName
      : postAccountName;
    const postKicker = post.theme || post.title?.split(' ').slice(0, 2).join(' ') || 'Featured';
    const postBrand = brandById?.get(post.accountId);
    const postShowFooter = postAccount?.type !== 'person';
    const postImageStyle = postBrand?.imageStyle || postKicker;
    return {
      metrics: { impressions: 0, reactions: 0, comments: 0, clicks: 0, shares: 0 },
      theme: 'general',
      cta: '',
      hashtags: [],
      htmlAsset: createHtmlAsset(post.title, post.content, postImageStyle, settings.logoUrl, postShowFooter, postAccountName, postAccountHandle),
      scheduledAt: new Date().toISOString(),
      notes: '',
      retryCount: 0,
      generatedAt: '',
      scheduleSlotKey: '',
      generationSource: '',
      ...post,
      metrics: { impressions: 0, reactions: 0, comments: 0, clicks: 0, shares: 0, ...(post.metrics || {}) },
    };
  });

  return {
    ...fallback,
    ...rest,
    settings,
    accounts,
    brandProfiles,
    posts,
  };
}

function sanitizeWorkspaceForClient(workspace) {
  const normalized = normalizeWorkspace(workspace);
  return {
    ...normalized,
    settings: {
      ...normalized.settings,
      linkedinClientSecret: '',
      linkedinClientSecretSaved: Boolean(normalized.settings.linkedinClientSecret),
    },
    accounts: normalized.accounts.map(account => ({
      ...account,
      linkedInAuth: account.linkedInAuth
        ? {
            expiresAt: account.linkedInAuth.expiresAt,
            scope: account.linkedInAuth.scope,
            memberUrn: account.linkedInAuth.memberUrn,
            organizationUrn: account.linkedInAuth.organizationUrn,
            lastConnectedAt: account.linkedInAuth.lastConnectedAt,
            connectionError: account.linkedInAuth.connectionError,
          }
        : null,
    })),
  };
}

function linkedinScopesForAccount(account) {
  const configured = process.env.LINKEDIN_OAUTH_SCOPES;
  if (configured) return configured.split(/[,\s]+/).filter(Boolean).join(' ');

  const scopes = ['openid', 'profile', 'email', 'w_member_social'];
  if (account?.type === 'organization') {
    scopes.push('w_organization_social');
  }
  return scopes.join(' ');
}

function buildAuthUrl(workspace, accountId) {
  const account = workspace.accounts.find(item => item.id === accountId);
  const clientId = workspace?.settings?.linkedinClientId || process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = workspace?.settings?.linkedinRedirectUri || process.env.LINKEDIN_REDIRECT_URI || '';
  const state = Buffer.from(JSON.stringify({ accountId, ts: Date.now() })).toString('base64url');
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId || '',
    redirect_uri: redirectUri,
    scope: linkedinScopesForAccount(account),
    state,
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

function linkedInHeaders(accessToken, extra = {}) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'LinkedIn-Version': linkedInApiVersion,
    'X-Restli-Protocol-Version': '2.0.0',
    ...extra,
  };
}

async function readLinkedInError(response) {
  const text = await response.text();
  try {
    return JSON.stringify(JSON.parse(text));
  } catch {
    return text || `${response.status} ${response.statusText}`;
  }
}

async function fetchMemberUrn(accessToken) {
  const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (userInfoResponse.ok) {
    const userInfo = await userInfoResponse.json();
    if (userInfo?.sub) return `urn:li:person:${userInfo.sub}`;
  }

  const response = await fetch('https://api.linkedin.com/v2/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return '';
  const profile = await response.json();
  return profile?.id ? `urn:li:person:${profile.id}` : '';
}

function absolutizeHtmlAssets(html) {
  return String(html || '').replaceAll('src="/linkedin/', `src="${publicBaseUrl}/linkedin/`);
}

function composeLinkedInText(post) {
  return post.content || '';
}

async function uploadLinkedInImage({ accessToken, authorUrn, imagePath }) {
  const initResponse = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
    method: 'POST',
    headers: linkedInHeaders(accessToken, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ initializeUploadRequest: { owner: authorUrn } }),
  });
  if (!initResponse.ok) {
    throw new Error(`LinkedIn image upload init failed: ${await readLinkedInError(initResponse)}`);
  }
  const initData = await initResponse.json();
  const uploadUrl = initData?.value?.uploadUrl;
  const imageUrn = initData?.value?.image;
  if (!uploadUrl || !imageUrn) {
    throw new Error('LinkedIn image upload init returned an incomplete response.');
  }
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: fs.createReadStream(imagePath),
  });
  if (!uploadResponse.ok) {
    throw new Error(`LinkedIn image upload failed: ${await readLinkedInError(uploadResponse)}`);
  }
  return imageUrn;
}

async function createLinkedInPost({ accessToken, authorUrn, post, imageUrn }) {
  const payload = {
    author: authorUrn,
    commentary: composeLinkedInText(post),
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
    content: imageUrn
      ? {
          media: {
            title: post.title || 'LinkedIn post',
            id: imageUrn,
          },
        }
      : undefined,
  };
  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: linkedInHeaders(accessToken, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  console.log(`[LINKEDIN POST] Sent payload with commentary length: ${payload.commentary.length}`);
  if (!response.ok) {
    throw new Error(`LinkedIn post failed: ${await readLinkedInError(response)}`);
  }
  return response.headers.get('x-restli-id') || response.headers.get('X-RestLi-Id') || '';
}

async function publishPost(workspace, postId) {
  const post = workspace.posts.find(item => item.id === postId);
  if (!post) throw new Error('Post not found.');
  const account = workspace.accounts.find(item => item.id === post.accountId);
  if (!account) throw new Error('Account not found.');
  const accessToken = account.linkedInAuth?.accessToken;
  if (!accessToken) throw new Error('LinkedIn account is not connected.');
  const authorUrn = account.type === 'organization'
    ? account.organizationUrn || account.linkedInAuth?.organizationUrn
    : account.linkedInAuth?.memberUrn;
  if (!authorUrn) {
    throw new Error(account.type === 'organization' ? 'Organization URN is missing.' : 'Member URN is missing. Reconnect this account.');
  }

  post.status = 'publishing';
  post.lastError = '';
  post.retryCount = post.retryCount || 0;
  await saveWorkspace(workspace);

  const filename = `${post.id}.png`;
  const imagePath = await renderHtmlToPng(absolutizeHtmlAssets(post.htmlAsset), filename);
  const imageUrl = `${basePath}/uploads/posts/${filename}`;
  const imageUrn = await uploadLinkedInImage({ accessToken, authorUrn, imagePath });
  const linkedinPostUrn = await createLinkedInPost({ accessToken, authorUrn, post, imageUrn });

  post.status = 'posted';
  post.imageUrl = imageUrl;
  post.linkedinPostUrn = linkedinPostUrn;
  post.publishedAt = new Date().toISOString();
  post.postedAt = post.publishedAt;
  post.lastError = '';
  return post;
}

function getZonedParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]));
  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const weekdayNameMap = {
    Sun: 'Sunday',
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
  };
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: weekdayMap[parts.weekday] ?? 0,
    weekdayName: weekdayNameMap[parts.weekday] || '',
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    timeKey: `${parts.hour}:${parts.minute}`,
  };
}

function zonedLocalToUtc({ year, month, day, hour, minute, second = 0 }, timeZone) {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  const actualParts = getZonedParts(new Date(guess), timeZone);
  const actualAsUtc = Date.UTC(
    actualParts.year,
    actualParts.month - 1,
    actualParts.day,
    actualParts.hour,
    actualParts.minute,
    actualParts.second,
  );
  return new Date(guess - (actualAsUtc - guess));
}

function getTomorrowParts(timeZone, now = new Date()) {
  const today = getZonedParts(now, timeZone);
  const tomorrowNoonUtc = Date.UTC(today.year, today.month - 1, today.day + 1, 12, 0, 0);
  return getZonedParts(new Date(tomorrowNoonUtc), timeZone);
}

function getLocalDatePartsFromOffset(baseParts, daysToAdd, timeZone) {
  const noonUtc = Date.UTC(baseParts.year, baseParts.month - 1, baseParts.day + daysToAdd, 12, 0, 0);
  return getZonedParts(new Date(noonUtc), timeZone);
}

function getNextWeekParts(timeZone, now = new Date()) {
  const today = getZonedParts(now, timeZone);
  const daysUntilNextMonday = ((1 - today.weekday + 7) % 7) || 7;
  const monday = getLocalDatePartsFromOffset(today, daysUntilNextMonday, timeZone);
  return Array.from({ length: 7 }, (_, index) => getLocalDatePartsFromOffset(monday, index, timeZone));
}

function nextSchedulerRunIso(timeZone = schedulerTimezone, now = new Date()) {
  const current = getZonedParts(now, timeZone);
  const runTodayUtc = zonedLocalToUtc(
    { year: current.year, month: current.month, day: current.day, hour: 5, minute: 0 },
    timeZone,
  );
  if (runTodayUtc > now) return runTodayUtc.toISOString();
  const tomorrow = getTomorrowParts(timeZone, now);
  return zonedLocalToUtc(
    { year: tomorrow.year, month: tomorrow.month, day: tomorrow.day, hour: 5, minute: 0 },
    timeZone,
  ).toISOString();
}

function nextWeeklySchedulerRunIso(timeZone = schedulerTimezone, now = new Date()) {
  const current = getZonedParts(now, timeZone);
  let daysUntilSaturday = (6 - current.weekday + 7) % 7;
  const runDate = getLocalDatePartsFromOffset(current, daysUntilSaturday, timeZone);
  let runUtc = zonedLocalToUtc(
    { year: runDate.year, month: runDate.month, day: runDate.day, hour: 8, minute: 0 },
    timeZone,
  );
  if (runUtc <= now) {
    daysUntilSaturday = daysUntilSaturday || 7;
    const nextRunDate = getLocalDatePartsFromOffset(current, daysUntilSaturday, timeZone);
    runUtc = zonedLocalToUtc(
      { year: nextRunDate.year, month: nextRunDate.month, day: nextRunDate.day, hour: 8, minute: 0 },
      timeZone,
    );
  }
  return runUtc.toISOString();
}

function choosePostingTime(workspace, accountId, brand) {
  const postingTimes = (Array.isArray(brand.postingTimes) && brand.postingTimes.length ? brand.postingTimes : ['09:00'])
    .map(time => parsePostingTime(time).label);
  const timeUsage = new Map(postingTimes.map(time => [time, 0]));
  for (const post of workspace.posts || []) {
    if (post.accountId !== accountId || !post.scheduledAt) continue;
    const timeKey = getZonedParts(new Date(post.scheduledAt), brand.timezone || schedulerTimezone).timeKey;
    if (timeUsage.has(timeKey)) {
      timeUsage.set(timeKey, (timeUsage.get(timeKey) || 0) + 1);
    }
  }
  return postingTimes.reduce((best, time) => (
    (timeUsage.get(time) || 0) < (timeUsage.get(best) || 0) ? time : best
  ), postingTimes[0]);
}

function buildGenerationPrompt({ account, brand, targetDate, targetTime, strategyItem }) {
  let dayOfWeek = '';
  try {
    dayOfWeek = new Date(targetDate).toLocaleDateString('en-US', { weekday: 'long' });
  } catch { dayOfWeek = targetDate; }
  const pillarsStr = (brand.contentPillars || []).join(', ');
  const themesStr = (brand.contentThemes || []).join(', ');

  return `Write one LinkedIn post for ${account.name}, scheduled for ${dayOfWeek} at ${targetTime}.

${strategyItem ? `## AI Strategy Direction
Topic: ${strategyItem.topic}
Hook Idea: ${strategyItem.hook}
Strategic Angle: ${strategyItem.angle}

Implement this specific idea creatively.` : `## Content Pillars
Pick ONE for this post, vary across the week: ${pillarsStr}`}

## Account context
- Type: ${account.type === 'organization' ? 'Company page' : 'Personal founder/executive profile'}
- About: ${trimContext(brand.aboutCompany || '', 1000)}
- Brand voice: ${trimContext(brand.voice || '', 1000)}
- Tone: ${brand.tone}
- Writing style: ${brand.writingStyle}
- Content themes: ${themesStr}
- CTA style: ${brand.ctaStyle}
- Preferred hashtags: ${(brand.hashtags || []).join(' ')}
- Banned topics: ${(brand.bannedTopics || []).join(', ')}

## LinkedIn post philosophy
The brand voice page is the primary source of truth. Follow the account context, brand voice, writing style, CTA style, content themes, and banned topics above. The company is based in India and writes for an India-based audience, but do not force India-specific legal frameworks, terminology, or currency unless the topic or brand profile calls for it. The best LinkedIn posts feel like a smart practitioner sharing a genuine observation with a colleague, not like a marketer running a campaign.

## Required post structure
1. **Hook (line 1 only)** — A single punchy line that makes a specific claim, shares a surprising observation, or opens a story moment. Good hooks are concrete and specific. Bad hooks: "I'm excited to share", "Here are X tips", "Let's talk about", "The truth about". Make it interesting enough enough that someone would stop scrolling.

2. **Body (2-4 short paragraphs, blank line between each)** — Build on the hook with a story, observation, or practical insight. Ground it in real experience or a specific situation. Include a "why this matters" angle. Each paragraph is 1-3 short sentences. NO bullet lists unless the post is genuinely a framework/checklist (max 4 items even then).

3. **Close (1 line)** — A specific, open-ended question that invites a real conversation. NOT "Save this!", "Like if you agree!", "Drop a comment", or "What do you think?" — it must relate directly to the topic and be specific enough that it has a real answer.

4. **Hashtags** — 3 to 5 relevant hashtags on the final line.

## Hard rules
- Word count: 120-280 words total
- Do NOT use: "I'm thrilled/excited/proud to share/announce", "Game changer", "Disruptive", "Synergy", "Leverage" (as a verb), "Holistic", "Empower", "Transform your X", "Here's the thing", "Let's be real", "At the end of the day"
- Do NOT use fake urgency, engagement bait, or manipulation
- Do NOT use bullet lists for the main content
- Do NOT use **markdown bold**, _italic_, # headers
- Do NOT wrap the post in quotes
- Return only the post text — no title, no label, no preamble

## Format
Plain text. Blank lines between paragraphs. Hashtags on the last line only.`;
}

function buildBatchGenerationPrompt({ account, brand, strategyItem }) {
  const common = buildGenerationPrompt({
    account,
    brand,
    targetDate: strategyItem?.targetDate || '',
    targetTime: strategyItem?.targetTime || '',
    strategyItem,
  });
  return `${common}

## CRITICAL: OUTPUT FORMAT
You MUST return the post in valid JSON format only. Do not include any text outside the JSON.
JSON Structure:
{
  "title": "A short, punchy 3-5 word internal title for this post",
  "content": "The full LinkedIn post text, including the hook, body, close, and hashtags exactly as requested above."
}`;
}

function extractJsonArray(text = '') {
  const raw = String(text || '');
  const jsonStr = raw.includes('[') ? raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1) : '[]';
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to parse strategy JSON; falling back to slot defaults.', {
      error: err instanceof Error ? err.message : String(err),
      preview: raw.slice(0, 400),
    });
    return [];
  }
}

function cleanGeneratedText(value = '') {
  let text = String(value || '').trim();
  text = text.replace(/^```(?:\w+)?\s*/i, '').replace(/\s*```$/i, '').trim();
  text = text.replace(/^caption:\s*/i, '').trim();
  text = text.replace(/^[\s"“”]+/, '').replace(/[\s"“”]+$/, '').trim();

  const quotePairs = [
    ['"', '"'],
    ["'", "'"],
    ['“', '”'],
    ['‘', '’'],
  ];
  let changed = true;
  while (changed && text.length > 1) {
    changed = false;
    for (const [open, close] of quotePairs) {
      if (text.startsWith(open) && text.endsWith(close)) {
        text = text.slice(open.length, -close.length).trim();
        changed = true;
      }
    }
  }
  return text;
}

function cleanGeneratedTitle(value = '') {
  return cleanGeneratedText(value)
    .replace(/^#+\s*/, '')
    .replace(/^title:\s*/i, '')
    .trim()
    .substring(0, 70);
}

function stripCodeFences(value = '') {
  return String(value || '')
    .replace(/^```(?:html)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function normalizeGraphicHtml(html = '') {
  return stripCodeFences(html)
    .replace(/1200x1200/g, '1080x1080')
    .replace(/width:\s*1200px/g, 'width:1080px')
    .replace(/height:\s*1200px/g, 'height:1080px')
    .replace(/width="1200"/g, 'width="1080"')
    .replace(/height="1200"/g, 'height="1080"');
}

function applyLogoContrastCorrection(html, account, visualState, postTitle = '') {
  const brandName = String(account.name || '').toLowerCase();
  let filter = '';
  let colorCorrection = '';

  // Supreme Design Engine Enforcement
  if (brandName.includes('casemate')) {
    colorCorrection = `
      body, .background, [style*="background"] { background-color: #0F172A !important; background-image: none !important; }
      .accent, .divider, [style*="background-color: #800000"], [style*="background-color: red"] { background-color: #1D4ED8 !important; }
      h1, p, span, div { z-index: 10 !important; position: relative !important; }
    `;
    if (visualState === 'WARM OFF-WHITE') {
      filter = 'brightness(0)';
      colorCorrection = `
        body, .background { background-color: #F5F3EF !important; }
        h1, p { color: #334155 !important; }
      `;
    }
  } else if (brandName.includes('minpay')) {
    colorCorrection = `
      body, .background, [style*="background"] { background-color: #143D45 !important; }
      .sidebar, .accent, [style*="background-color: red"] { background-color: #47A48B !important; }
      h1, p { color: #FFFFFF !important; z-index: 10 !important; position: relative !important; }
    `;
  } else if (brandName.includes('saraf') || brandName.includes('founder')) {
    if (visualState === 'INDIGO ACCENT') {
      filter = 'brightness(0) invert(1)';
    }
  }

  const styleInject = `
<style>
  ${colorCorrection}
  .logo, img[src*="logo"], .brand-logo { filter: ${filter} !important; }
  * { border-radius: 0 !important; }
</style>
`;

  if (html.includes('</head>')) return html.replace('</head>', `${styleInject}</head>`);
  if (html.includes('<body>')) return html.replace('<body>', `<head>${styleInject}</head><body>`);
  return html + styleInject;
}

function hasVisiblePosterText(html = '') {
  const withoutCode = String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');
  const plainText = withoutCode
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (
    plainText.length >= 35 &&
    /data-required=["']headline["']/i.test(html) &&
    /data-required=["']subheadline["']/i.test(html)
  );
}

async function generateGraphicHtml({ account, brand, title, content, kicker, logoUrl, layoutArchetype = 'A' }) {
  const visualState = brand.visualState || 'A';
  const palette = getBrandPalette(account.name, visualState);
  const visualSummary = await generateGraphicSummary(content);

  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: anthropicModel,
        max_tokens: 2400,
        system: `You are a senior brand designer. Create a self-contained HTML/CSS social graphic asset.
The CANVAS is 1080x1080px edge-to-edge.
You MUST use these EXACT colors:
- Background: ${palette.bg}
- Main Accent: ${palette.accent}
- Primary Text: ${palette.text}
- Secondary Accent: ${palette.secondary}
- Detail/Grid: ${palette.detail}

CRITICAL:
1. DO NOT include any text from the prompt instructions (like "CRITICAL", "MANDATORY", or "LAYOUT LAWS") in the actual design.
2. Only use the 'Headline' and 'Body Insight' provided.
3. No rounded corners.
4. Minimalist typography only.`,
        messages: [{
          role: 'user',
          content: buildGraphicPrompt({
            account,
            brand,
            title,
            content: visualSummary,
            kicker,
            logoUrl,
            visualState,
            layoutArchetype,
          }),
        }],
      });
      let html = normalizeGraphicHtml(response.content?.[0]?.text || '');
      html = applyLogoContrastCorrection(html, account, visualState, title);
      
      if ((html.includes('<html') || html.includes('<!doctype html')) && hasVisiblePosterText(html)) {
        return html;
      }
    } catch (err) {
      console.error('Graphic generation error:', err);
    }
  }
  // Fallback
  return createHtmlAsset(title, visualSummary, brand.imageStyle || kicker || 'Featured', logoUrl, account.type !== 'person', account.name, '', layoutArchetype);
}


async function generatePostContent({ account, brand, prompt }) {
  let content = '';
  let title = '';

  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: anthropicModel,
        max_tokens: 1200,
        system: `You write LinkedIn posts for ${account.name}. The brand profile is the source of truth. Write for an India-based audience with the voice, tone, writing style, CTA style, and restrictions defined by the brand profile. Do not add claims, offers, legal frameworks, or product promises that are not supported by the brand profile. Brand voice: ${brand.voice}. Tone: ${brand.tone}. Writing style: ${brand.writingStyle}.`,
        messages: [{ role: 'user', content: prompt }],
      });
      content = cleanGeneratedText(response.content?.[0]?.text || '');
      title = cleanGeneratedTitle(content.split('\n').find(Boolean) || '');
    } catch (err) {
      console.error('Anthropic generation error:', err);
    }
  }

  if (!content && groq) {
    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You write LinkedIn posts for ${account.name}. The brand profile is the source of truth. Write for an India-based audience with the voice, tone, writing style, CTA style, and restrictions defined by the brand profile. Do not add claims, offers, legal frameworks, or product promises that are not supported by the brand profile. Brand voice: ${brand.voice}. Tone: ${brand.tone}. Writing style: ${brand.writingStyle}.`,
          },
          { role: 'user', content: prompt },
        ],
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        max_tokens: 600,
        temperature: 0.8,
      });
      content = cleanGeneratedText(response.choices?.[0]?.message?.content || '');
      title = cleanGeneratedTitle(content.split('\n').find(Boolean) || '');
    } catch (err) {
      console.error('Groq generation error:', err);
    }
  }

  if (!content) {
    const theme = (brand.contentThemes || brand.contentPillars || ['growth'])[0];
    content = [
      `Something I keep coming back to with ${theme}:`,
      ``,
      `The teams that consistently outperform aren't doing anything magical. They've turned their best insights into repeatable systems that don't depend on everyone being at their best every day.`,
      ``,
      `Consistency compounds faster than intensity. That's the whole game.`,
      ``,
      `What's one system your team relies on that you'd never give up?`,
      ``,
      (brand.hashtags || []).slice(0, 3).join(' '),
    ].join('\n');
  }
  content = cleanGeneratedText(content);
  if (!title) {
    title = cleanGeneratedTitle(`${(brand.contentThemes || brand.contentPillars || ['Content'])[0]} for ${account.name}`);
  }

  return { content, title };
}

async function createScheduledPostForTomorrow({ workspace, account, brand, targetDate, targetTime, scheduledAt, scheduleSlotKey }) {
  const timeZone = brand.timezone || workspace.settings?.defaultTimezone || schedulerTimezone;
  const targetDay = getZonedParts(new Date(scheduledAt), timeZone);
  const strategyItem = (brand.weeklyStrategy || []).find(s => s.day === targetDay.weekdayName);
  const layoutArchetype = normalizeLayoutArchetype(strategyItem?.layoutArchetype || getNextLayoutArchetypeForAccount(workspace, account.id));
  const visualState = strategyItem?.visualState || getNextVisualStateForAccount(workspace, account, brand);

  const prompt = buildGenerationPrompt({ account, brand, targetDate, targetTime, strategyItem });
  const { content, title } = await generatePostContent({ account, brand, prompt });
  const theme = strategyItem?.topic || brand.contentThemes?.[Math.abs(scheduleSlotKey.length) % Math.max(brand.contentThemes.length, 1)] || brand.contentPillars?.[0] || 'general';

  // Derive a clean kicker from content theme or pillar
  const kicker = theme.charAt(0).toUpperCase() + theme.slice(1);
  const graphicHtml = await generateGraphicHtml({
    account,
    brand: {
      ...brand,
      visualDirection: strategyItem?.visualDirection,
      visualState: visualState
    },
    title,
    content,
    kicker,
    logoUrl: brand.logoUrl || workspace.settings.logoUrl,
    layoutArchetype,
  });
  return {
    id: `post_${Date.now()}_${account.id}`,
    accountId: account.id,
    title,
    theme,
    content,
    cta: brand.ctaStyle || '',
    hashtags: brand.hashtags || [],
    htmlAsset: graphicHtml,
    status: 'scheduled',
    scheduledAt: scheduledAt.toISOString(),
    generatedAt: new Date().toISOString(),
    scheduleSlotKey,
    generationSource: 'daily_5am_scheduler',
    metrics: { impressions: 0, reactions: 0, comments: 0, clicks: 0, shares: 0 },
    notes: 'Generated by the daily 5 AM scheduler.',
    retryCount: 0,
  };
}

function hasExistingPostForSlot(workspace, accountId, targetDate, scheduleSlotKey, timeZone) {
  return (workspace.posts || []).some(post => {
    if (post.accountId !== accountId) return false;
    if (post.scheduleSlotKey && post.scheduleSlotKey === scheduleSlotKey) return true;
    if (!post.scheduledAt) return false;
    return getZonedParts(new Date(post.scheduledAt), timeZone).dateKey === targetDate;
  });
}

async function generateTomorrowPosts(workspace, now = new Date()) {
  const statusTimezone = workspace.settings?.scheduler?.timezone || workspace.settings?.defaultTimezone || schedulerTimezone;
  const tomorrow = getTomorrowParts(statusTimezone, now);
  const tomorrowDate = tomorrow.dateKey;
  const result = {
    checked: 0,
    created: 0,
    skipped: 0,
    errors: [],
    posts: [],
  };

  for (const account of workspace.accounts || []) {
    result.checked += 1;
    const brand = (workspace.brandProfiles || []).find(profile => profile.accountId === account.id);
    if (!brand) {
      result.skipped += 1;
      result.errors.push(`${account.name}: missing brand profile.`);
      continue;
    }

    const timeZone = brand.timezone || workspace.settings?.defaultTimezone || schedulerTimezone;
    const targetDay = getTomorrowParts(timeZone, now);
    const targetDate = targetDay.dateKey;
    if (!Array.isArray(brand.postingDays) || !brand.postingDays.includes(targetDay.weekday)) {
      result.skipped += 1;
      continue;
    }

    const targetTime = choosePostingTime(workspace, account.id, brand);
    const { hour, minute } = parsePostingTime(targetTime);
    const scheduledAt = zonedLocalToUtc(
      { year: targetDay.year, month: targetDay.month, day: targetDay.day, hour, minute },
      timeZone,
    );
    const scheduleSlotKey = `${account.id}:${targetDate}:${targetTime}:${timeZone}`;
    if (hasExistingPostForSlot(workspace, account.id, targetDate, scheduleSlotKey, timeZone)) {
      result.skipped += 1;
      continue;
    }

    try {
      const post = await createScheduledPostForTomorrow({
        workspace,
        account,
        brand,
        targetDate,
        targetTime,
        scheduledAt,
        scheduleSlotKey,
      });
      workspace.posts = [post, ...(workspace.posts || [])];
      brand.lastGeneratedAt = post.generatedAt;
      result.posts.push(post);
      result.created += 1;
    } catch (err) {
      result.skipped += 1;
      result.errors.push(`${account.name}: ${err instanceof Error ? err.message : 'Generation failed.'}`);
    }
  }

  workspace.settings = {
    ...(workspace.settings || {}),
    scheduler: {
      enabled: true,
      timezone: statusTimezone,
      nextRunAt: nextSchedulerRunIso(statusTimezone, now),
      lastRunAt: now.toISOString(),
      lastCreatedCount: result.created,
      lastSkippedCount: result.skipped,
      lastErrors: result.errors,
    },
  };

  return { ...result, tomorrowDate };
}

function getWeeklyBatchSlots({ workspace, account, brand, now = new Date() }) {
  const timeZone = brand.timezone || workspace.settings?.defaultTimezone || schedulerTimezone;
  const postingDays = Array.isArray(brand.postingDays) && brand.postingDays.length ? brand.postingDays : [1, 3, 5];
  const postingTimes = (Array.isArray(brand.postingTimes) && brand.postingTimes.length ? brand.postingTimes : ['09:00'])
    .map(time => parsePostingTime(time).label);
  const weekParts = getNextWeekParts(timeZone, now);
  const slots = [];
  let skipped = 0;

  for (const dayParts of weekParts) {
    if (!postingDays.includes(dayParts.weekday)) continue;

    const postingTime = postingTimes[slots.length % postingTimes.length];
    const { hour, minute, label } = parsePostingTime(postingTime);
    const scheduledAt = zonedLocalToUtc(
      { year: dayParts.year, month: dayParts.month, day: dayParts.day, hour, minute },
      timeZone,
    );
    const scheduleSlotKey = `${account.id}:${dayParts.dateKey}:${label}:${timeZone}`;
    if (hasExistingPostForSlot(workspace, account.id, dayParts.dateKey, scheduleSlotKey, timeZone)) {
      skipped += 1;
      continue;
    }

    slots.push({
      day: dayParts.weekdayName,
      weekday: dayParts.weekday,
      weekdayName: dayParts.weekdayName,
      targetDate: dayParts.dateKey,
      targetTime: label,
      timezone: timeZone,
      scheduledAt: scheduledAt.toISOString(),
      scheduleSlotKey,
    });
  }

  return { slots, skipped, weekStart: weekParts[0]?.dateKey || '', weekEnd: weekParts[6]?.dateKey || '' };
}

function enrichStrategyWithSlots(strategy, slots, brand) {
  return slots.map((slot, index) => {
    const item = strategy[index] || {};
    const fallbackTheme = brand.contentThemes?.[index % Math.max(brand.contentThemes.length, 1)]
      || brand.contentPillars?.[index % Math.max(brand.contentPillars.length, 1)]
      || 'general';
    return {
      day: slot.weekdayName,
      topic: item.topic || fallbackTheme,
      hook: item.hook || `A practical observation about ${fallbackTheme}`,
      angle: item.angle || `Explain why ${fallbackTheme} matters to this audience.`,
      visualState: item.visualState || '',
      visualDirection: item.visualDirection || '',
      layoutArchetype: normalizeLayoutArchetype(item.layoutArchetype || pickLayoutArchetype(index)),
      targetDate: slot.targetDate,
      targetTime: slot.targetTime,
      timezone: slot.timezone,
      scheduledAt: slot.scheduledAt,
      scheduleSlotKey: slot.scheduleSlotKey,
    };
  });
}

async function startWeeklyBatchForBrand(workspace, brand, now = new Date()) {
  if (!anthropic || !anthropicKey) {
    throw new Error('Anthropic API key is required for weekly batch generation.');
  }
  const activeBatchStatus = brand.batchStatus || 'processing_content';
  if (brand.batchId && !['idle', 'ready', 'failed'].includes(activeBatchStatus)) {
    return {
      skipped: 0,
      created: 0,
      batchStatus: brand.batchStatus,
      batchId: brand.batchId,
      strategy: brand.weeklyStrategy || [],
      message: 'Weekly batch is already processing.',
    };
  }

  const account = workspace.accounts.find(a => a.id === brand.accountId);
  if (!account) throw new Error(`Account not found for brand ${brand.accountId}.`);

  const { slots, skipped, weekStart, weekEnd } = getWeeklyBatchSlots({ workspace, account, brand, now });
  if (!slots.length) {
    brand.weeklyStrategy = [];
    brand.batchId = null;
    brand.batchStatus = 'ready';
    brand.strategyGeneratedAt = new Date().toISOString();
    brand.lastGeneratedAt = brand.strategyGeneratedAt;
    return {
      skipped,
      created: 0,
      batchStatus: brand.batchStatus,
      batchId: null,
      strategy: [],
      weekStart,
      weekEnd,
      message: 'No missing weekly slots. Existing posts already cover the selected posting days.',
    };
  }

  const strategyResponse = await anthropic.messages.create({
    model: anthropicModel,
    max_tokens: 1200,
    system: `You are a world-class LinkedIn growth strategist. You analyze brand contexts and build 1-week high-impact content plans.`,
    messages: [{ role: 'user', content: buildStrategyPrompt({ account, brand, slots }) }],
  });

  const strategy = enrichStrategyWithSlots(
    extractJsonArray(strategyResponse.content?.[0]?.text || '[]'),
    slots,
    brand,
  );

  brand.weeklyStrategy = strategy;
  brand.strategyGeneratedAt = new Date().toISOString();

  const requests = strategy.map((item, idx) => ({
    custom_id: `content_${brand.accountId}_${idx}`,
    params: {
      model: anthropicModel,
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: buildBatchGenerationPrompt({
          account,
          brand,
          strategyItem: item,
        }),
      }],
    },
  }));

  const batch = await submitAnthropicBatch(requests);
  brand.batchId = batch.id;
  brand.batchStatus = 'processing_content';
  brand.lastGeneratedAt = brand.strategyGeneratedAt;

  return {
    skipped,
    created: 0,
    batchStatus: brand.batchStatus,
    batchId: batch.id,
    strategy,
    weekStart,
    weekEnd,
    generatedAt: brand.strategyGeneratedAt,
  };
}

function schedulerStatusFromWorkspace(workspace, now = new Date()) {
  const timezone = workspace.settings?.scheduler?.timezone || workspace.settings?.defaultTimezone || schedulerTimezone;
  const tomorrow = getTomorrowParts(timezone, now);
  const tomorrowDate = tomorrow.dateKey;
  const postsDueTomorrow = (workspace.posts || []).filter(post => {
    if (!post.scheduledAt) return false;
    return getZonedParts(new Date(post.scheduledAt), timezone).dateKey === tomorrowDate;
  }).length;
  const metadata = workspace.settings?.scheduler || {};
  return {
    enabled: metadata.enabled !== false,
    timezone,
    nextRunAt: nextWeeklySchedulerRunIso(timezone, now),
    lastRunAt: metadata.lastRunAt || '',
    lastCreatedCount: metadata.lastCreatedCount || 0,
    lastSkippedCount: metadata.lastSkippedCount || 0,
    lastErrors: metadata.lastErrors || [],
    tomorrowDate,
    postsDueTomorrow,
  };
}

async function loadWorkspace() {
  const doc = await workspaces.findOne({ workspaceId: 'default' });
  if (!doc) {
    const seed = createInitialWorkspace();
    await workspaces.insertOne({ ...seed, createdAt: new Date(), updatedAt: new Date() });
    return seed;
  }
  return normalizeWorkspace(doc);
}

async function saveWorkspace(next) {
  const now = new Date();
  const existing = await workspaces.findOne({ workspaceId: 'default' });
  const existingNormalized = existing ? normalizeWorkspace(existing) : null;
  const payload = { ...normalizeWorkspace(next), workspaceId: 'default', updatedAt: now };
  if (!payload.settings.linkedinClientSecret && existingNormalized?.settings?.linkedinClientSecret) {
    payload.settings.linkedinClientSecret = existingNormalized.settings.linkedinClientSecret;
    payload.settings.linkedinClientSecretSaved = true;
  }
  if (!payload.settings.linkedinClientId && existingNormalized?.settings?.linkedinClientId) {
    payload.settings.linkedinClientId = existingNormalized.settings.linkedinClientId;
  }
  if (!payload.settings.linkedinRedirectUri && existingNormalized?.settings?.linkedinRedirectUri) {
    payload.settings.linkedinRedirectUri = existingNormalized.settings.linkedinRedirectUri;
  }
  if (existingNormalized?.accounts?.length) {
    payload.accounts = payload.accounts.map(account => {
      const existingAccount = existingNormalized.accounts.find(item => item.id === account.id);
      if (existingAccount?.linkedInAuth?.accessToken && !account.linkedInAuth?.accessToken) {
        return {
          ...account,
          linkedInAuth: {
            ...existingAccount.linkedInAuth,
            ...(account.linkedInAuth || {}),
          },
        };
      }
      return account;
    });
  }
  await workspaces.updateOne(
    { workspaceId: 'default' },
    { $set: payload, $setOnInsert: { createdAt: now } },
    { upsert: true },
  );
  return payload;
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'linkedin-ai' });
});

app.get('/linkedin/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'linkedin-ai' });
});

app.get(['/api/workspace', '/linkedin/api/workspace'], async (_req, res) => {
  const workspace = await loadWorkspace();
  
  // Retroactive Hot-Fix: Apply Supreme Design Laws to all existing posts on-the-fly
  if (workspace.posts) {
    workspace.posts = workspace.posts.map(post => {
      const account = workspace.accounts.find(a => a.id === post.accountId);
      if (account && post.htmlAsset) {
        post.htmlAsset = applyLogoContrastCorrection(post.htmlAsset, account, post.visualState || 'A', post.title);
      }
      return post;
    });
  }

  res.json(sanitizeWorkspaceForClient(workspace));
});

app.put(['/api/workspace', '/linkedin/api/workspace'], async (req, res) => {
  const workspace = await saveWorkspace(req.body);
  res.json(sanitizeWorkspaceForClient(workspace));
});

app.get(['/api/settings', '/linkedin/api/settings'], async (_req, res) => {
  const workspace = await loadWorkspace();
  res.json(sanitizeWorkspaceForClient(workspace).settings || {});
});

app.put(['/api/settings', '/linkedin/api/settings'], async (req, res) => {
  const workspace = await loadWorkspace();
  const nextSettings = { ...(workspace.settings || {}), ...(req.body || {}) };
  if (!req.body?.linkedinClientSecret) {
    nextSettings.linkedinClientSecret = workspace.settings?.linkedinClientSecret || process.env.LINKEDIN_CLIENT_SECRET || '';
  }
  const next = { ...workspace, settings: nextSettings };
  const saved = await saveWorkspace(next);
  res.json(sanitizeWorkspaceForClient(saved).settings);
});

app.get(['/api/auth/linkedin/start', '/linkedin/api/auth/linkedin/start'], async (req, res) => {
  const workspace = await loadWorkspace();
  const accountId = String(req.query.accountId || workspace.accounts?.[0]?.id || '');
  if (!accountId) {
    res.status(400).json({ error: 'accountId is required' });
    return;
  }
  const url = buildAuthUrl(workspace, accountId);
  res.redirect(url);
});

app.get(['/api/auth/linkedin/callback', '/linkedin/api/auth/linkedin/callback'], async (req, res) => {
  const fail = (message, accountId = '') => {
    const params = new URLSearchParams({
      oauth_error: message || 'LinkedIn connection failed.',
      ...(accountId ? { accountId } : {}),
    });
    res.redirect(`${basePath}/?${params.toString()}`);
  };

  try {
    const { code, state, error, error_description: errorDescription } = req.query;
    if (error) {
      fail(String(errorDescription || error));
      return;
    }
    if (!code || !state) {
      fail('Missing OAuth parameters from LinkedIn.');
      return;
    }

    const workspace = await loadWorkspace();
    let parsedState;
    try {
      parsedState = JSON.parse(Buffer.from(String(state), 'base64url').toString('utf8'));
    } catch {
      fail('OAuth state was invalid. Start the LinkedIn connection again.');
      return;
    }

    const accountId = parsedState.accountId || workspace.accounts?.[0]?.id;
    const accountExists = workspace.accounts.some(account => account.id === accountId);
    if (!accountId || !accountExists) {
      fail('OAuth account was not recognized.');
      return;
    }

    const clientId = workspace?.settings?.linkedinClientId || process.env.LINKEDIN_CLIENT_ID || '';
    const clientSecret = workspace?.settings?.linkedinClientSecret || process.env.LINKEDIN_CLIENT_SECRET || '';
    const redirectUri = workspace?.settings?.linkedinRedirectUri || process.env.LINKEDIN_REDIRECT_URI || canonicalRedirectUri;
    if (!clientId || !clientSecret) {
      fail('LinkedIn Client ID or Client Secret is missing.', accountId);
      return;
    }

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: String(code),
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });
    if (!tokenResponse.ok) {
      fail(`LinkedIn token exchange failed: ${await readLinkedInError(tokenResponse)}`, accountId);
      return;
    }

    const tokenData = await tokenResponse.json();
    const memberUrn = await fetchMemberUrn(tokenData.access_token).catch(() => '');
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + Number(tokenData.expires_in) * 1000).toISOString()
      : '';
    const next = {
      ...workspace,
      accounts: workspace.accounts.map(account => (
        account.id === accountId
          ? {
              ...account,
              status: 'connected',
              lastSyncAt: new Date().toISOString(),
              linkedInAuth: {
                accessToken: tokenData.access_token,
                expiresAt,
                scope: tokenData.scope,
                memberUrn,
                organizationUrn: account.organizationUrn || '',
                lastConnectedAt: new Date().toISOString(),
                connectionError: '',
              },
            }
          : account
      )),
    };
    await saveWorkspace(next);
    res.redirect(`${basePath}/?connected=1&accountId=${encodeURIComponent(accountId)}`);
  } catch (err) {
    console.error('LinkedIn OAuth callback failed:', err);
    fail(err instanceof Error ? err.message : 'LinkedIn OAuth callback failed.');
  }
});

app.post(['/api/settings/logo', '/linkedin/api/settings/logo'], logoUpload.single('logo'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'logo is required' });
    return;
  }
  const workspace = await loadWorkspace();
  const logoUrl = `${basePath}/uploads/logos/${req.file.filename}`;
  const next = {
    ...workspace,
    settings: {
      ...(workspace.settings || {}),
      logoUrl,
      logoName: req.file.originalname,
    },
  };
  await saveWorkspace(next);
  res.json({ url: logoUrl, name: req.file.originalname });
});

app.post(['/api/posts/:postId/refresh-design', '/linkedin/api/posts/:postId/refresh-design'], async (req, res) => {
  const workspace = await loadWorkspace();
  const postIndex = workspace.posts.findIndex(p => p.id === req.params.postId);
  if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });
  
  const post = workspace.posts[postIndex];
  const account = workspace.accounts.find(a => a.id === post.accountId);
  const brand = workspace.brandProfiles.find(b => b.accountId === post.accountId);
  
  const offset = Math.floor(Math.random() * 10); // Randomize layout for refresh
  const layoutArchetype = getNextLayoutArchetypeForAccount(workspace, post.accountId, offset);
  const visualState = getNextVisualStateForAccount(workspace, account, brand, offset);
  
  post.layoutArchetype = layoutArchetype;
  post.visualState = visualState;
  post.htmlAsset = await generateGraphicHtml({
    account,
    brand: { ...brand, visualState },
    title: post.title,
    content: post.content,
    kicker: post.theme || 'Insight',
    logoUrl: brand.logoUrl || workspace.settings.logoUrl,
    layoutArchetype,
  });
  
  await saveWorkspace(workspace);
  res.json(post);
});

app.post(['/api/posts/:postId/image-override', '/linkedin/api/posts/:postId/image-override'], manualUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  
  const workspace = await loadWorkspace();
  const post = workspace.posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  
  const relativePath = `/uploads/manual/${req.file.filename}`;
  post.imageOverrideUrl = relativePath;
  post.imageUrl = relativePath; // Direct replacement
  
  await saveWorkspace(workspace);
  res.json(post);
});


app.post(['/api/generate-post', '/linkedin/api/generate-post'], async (req, res) => {
  const { accountId, prompt } = req.body;
  const workspace = await loadWorkspace();
  const account = workspace.accounts.find(a => a.id === accountId);
  const brand = workspace.brandProfiles.find(b => b.accountId === accountId);

  if (!account || !brand) {
    res.status(400).json({ error: 'Account or brand profile not found' });
    return;
  }

  const generated = await generatePostContent({
    account,
    brand,
    prompt: prompt || buildGenerationPrompt({
      account,
      brand,
      targetDate: getZonedParts(new Date(), brand.timezone || schedulerTimezone).dateKey,
      targetTime: getZonedParts(new Date(), brand.timezone || schedulerTimezone).timeKey,
    }),
  });

  const postTheme = brand.contentThemes?.[0] || brand.contentPillars?.[0] || 'general';
  const kicker = postTheme.charAt(0).toUpperCase() + postTheme.slice(1);
  const offset = getAndIncGenerationOffset(accountId);
  const layoutArchetype = getNextLayoutArchetypeForAccount(workspace, accountId, offset);
  const visualState = getNextVisualStateForAccount(workspace, account, brand, offset);
  const post = {
    id: `post_${Date.now()}`,
    accountId,
    title: generated.title,
    theme: postTheme,
    content: generated.content,
    cta: brand.ctaStyle || '',
    hashtags: brand.hashtags || [],
    htmlAsset: await generateGraphicHtml({
      account,
      brand: { ...brand, visualState },
      title: generated.title,
      content: generated.content,
      kicker,
      logoUrl: brand.logoUrl || workspace.settings.logoUrl,
      layoutArchetype,
    }),
    status: 'draft',
    scheduledAt: new Date().toISOString(),
    metrics: { impressions: 0, reactions: 0, comments: 0, clicks: 0, shares: 0 },
    notes: 'Generated by backend content endpoint.',
    retryCount: 0,
    createdAt: new Date().toISOString(),
  };

  res.json(post);
});

app.post(['/api/strategy/generate', '/linkedin/api/strategy/generate'], async (req, res) => {
  const { accountId } = req.body;
  if (!accountId) return res.status(400).json({ error: 'accountId required' });

  const workspace = await loadWorkspace();
  const account = workspace.accounts.find(a => a.id === accountId);
  const brand = workspace.brandProfiles.find(b => b.accountId === accountId);

  if (!account || !brand) return res.status(404).json({ error: 'Account or brand not found' });

  try {
    const response = await anthropic.messages.create({
      model: anthropicModel,
      max_tokens: 1200,
      system: `You are a world-class LinkedIn growth strategist. You analyze brand contexts and build 1-week high-impact content plans.`,
      messages: [{ role: 'user', content: buildStrategyPrompt({ account, brand }) }],
    });

    const text = response.content?.[0]?.text || '[]';
    const jsonStr = text.includes('[') ? text.slice(text.indexOf('['), text.lastIndexOf(']') + 1) : '[]';
    const strategy = JSON.parse(jsonStr);

    brand.weeklyStrategy = strategy;
    brand.strategyGeneratedAt = new Date().toISOString();

    await saveWorkspace(workspace);
    res.json({ strategy, generatedAt: brand.strategyGeneratedAt });
  } catch (err) {
    console.error('Strategy generation failed:', err);
    res.status(500).json({ error: 'Failed to generate strategy' });
  }
});

app.post(['/api/strategy/batch-week', '/linkedin/api/strategy/batch-week'], async (req, res) => {
  const { accountId } = req.body;
  console.log(`[BATCH] Received request for account: ${accountId}`);
  if (!accountId) return res.status(400).json({ error: 'accountId required' });

  const workspace = await loadWorkspace();
  const account = workspace.accounts.find(a => a.id === accountId);
  const brand = workspace.brandProfiles.find(b => b.accountId === accountId);

  if (!account || !brand) return res.status(404).json({ error: 'Account or brand not found' });

  try {
    const run = await startWeeklyBatchForBrand(workspace, brand);
    await saveWorkspace(workspace);
    res.json({
      ...run,
      generatedAt: brand.strategyGeneratedAt,
    });
  } catch (err) {
    console.error('Weekly Batch Planning failed:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Weekly Batch Planning failed.' });
  }
});

app.get(['/api/scheduler/status', '/linkedin/api/scheduler/status'], async (_req, res) => {
  const workspace = await loadWorkspace();
  res.json(schedulerStatusFromWorkspace(workspace));
});

app.post(['/api/scheduler/generate-tomorrow', '/linkedin/api/scheduler/generate-tomorrow'], async (_req, res) => {
  const workspace = await loadWorkspace();
  try {
    const run = await generateTomorrowPosts(workspace);
    const saved = await saveWorkspace(workspace);
    res.json({
      ...schedulerStatusFromWorkspace(saved),
      ...run,
    });
  } catch (err) {
    console.error('Daily scheduler generation failed:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Daily scheduler generation failed.' });
  }
});

// Weekly Batch Cron: Every Saturday at 8:00 AM IST
cron.schedule('0 8 * * 6', async () => {
  console.log('Starting Automated Weekly Batch Production (Saturday 8:00 AM IST)');
  const workspace = await loadWorkspace();
  if (!workspace) return;

  for (const brand of workspace.brandProfiles) {
    console.log(`Auto-triggering weekly batch for: ${brand.brandName || brand.accountId} (${brand.accountId})`);
    try {
      const run = await startWeeklyBatchForBrand(workspace, brand);
      console.log(`Weekly batch for ${brand.accountId}: ${run.batchStatus}, skipped ${run.skipped}, batch ${run.batchId || 'none'}`);
      await saveWorkspace(workspace);
    } catch (err) {
      console.error(`Error initiating auto-batch for ${brand.accountId}:`, err);
      brand.batchStatus = 'failed';
      await saveWorkspace(workspace);
    }
  }
}, {
  timezone: schedulerTimezone
});

/*
cron.schedule('0 5 * * *', async () => {
  // Disabling daily scheduler as we have moved to a high-fidelity Weekly Batch model.
  // This prevents redundant token usage and ensures all posts follow the strategic plan.
}, { timezone: schedulerTimezone });
*/

// Cron job: Check every minute for posts that need to be published
cron.schedule('* * * * *', async () => {
  const workspace = await loadWorkspace();
  const now = new Date();

  const toPublish = workspace.posts.filter(p =>
    p.status === 'scheduled' &&
    p.scheduledAt &&
    new Date(p.scheduledAt) <= now
  );

  if (toPublish.length === 0) return;

  console.log(`Found ${toPublish.length} posts to publish.`);

  for (const post of toPublish) {
    try {
      await publishPost(workspace, post.id);
    } catch (err) {
      console.error(`Failed to publish post ${post.id}:`, err);
      post.status = 'failed';
      post.retryCount = (post.retryCount || 0) + 1;
      post.lastError = err instanceof Error ? err.message : 'Publish failed.';
    }
  }

  await saveWorkspace(workspace);
});

app.use(`${basePath}/uploads/posts`, express.static(path.join(uploadRoot, 'posts')));
app.use('/uploads/posts', express.static(path.join(uploadRoot, 'posts')));

app.use(`${basePath}/uploads`, express.static(uploadRoot));
app.use('/uploads', express.static(uploadRoot));
app.use(`${basePath}`, express.static(path.join(__dirname, 'dist')));

app.get(`${basePath}/*`, async (req, res) => {
  const distDir = path.join(__dirname, 'dist');
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    res.status(404).send('Build the frontend first.');
    return;
  }
  res.sendFile(indexPath);
});

app.get('/', (_req, res) => {
  res.redirect(`${basePath}/`);
});

async function pollPendingBatches() {
  const workspace = await loadWorkspace();
  let changed = false;

  for (const brand of workspace.brandProfiles) {
    if (!brand.batchId || brand.batchStatus === 'idle' || brand.batchStatus === 'ready') continue;

    console.log(`Checking batch ${brand.batchId} for ${brand.accountId} (Status: ${brand.batchStatus})...`);
    try {
      const status = await getAnthropicBatchStatus(brand.batchId);
      if (!status || status.processing_status !== 'ended') continue;

      console.log(`Batch ${brand.batchId} ended. Results URL: ${status.results_url}`);
      const results = await getAnthropicBatchResults(status.results_url);

      if (brand.batchStatus === 'processing_content') {
        // Content batch finished -> Start Graphics batch
        const graphicsRequests = [];
        const account = workspace.accounts.find(a => a.id === brand.accountId);
        if (!account) {
          brand.batchStatus = 'failed';
          changed = true;
          continue;
        }

        for (const res of results) {
          if (res.result.type !== 'succeeded') continue;

          const idx = parseInt(res.custom_id.split('_').pop());
          const strategyItem = brand.weeklyStrategy?.[idx];
          if (!strategyItem) continue;
          if (hasExistingPostForSlot(
            workspace,
            brand.accountId,
            strategyItem.targetDate,
            strategyItem.scheduleSlotKey,
            strategyItem.timezone || brand.timezone || workspace.settings?.defaultTimezone || schedulerTimezone,
          )) {
            continue;
          }

          const text = res.result.message.content[0].text;
          const jsonStr = text.includes('{') ? text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1) : '{}';
          const generated = JSON.parse(jsonStr);

          // Clean title and content if they have markdown backticks
          if (generated.title) generated.title = cleanMarkdown(generated.title);
          if (generated.content) generated.content = cleanMarkdown(generated.content);

          // Store content temporarily in strategyItem for the next step
          strategyItem.generatedContent = generated;

          const graphicPrompt = buildGraphicPrompt({
            account,
            brand,
            title: generated.title,
            content: generated.content,
            kicker: strategyItem.topic,
            logoUrl: brand.logoUrl || workspace.settings.logoUrl,
            visualState: strategyItem.visualState,
            visualDirection: strategyItem.visualDirection,
            layoutArchetype: strategyItem.layoutArchetype,
          });

          graphicsRequests.push({
            custom_id: `graphic_${brand.accountId}_${idx}`,
            params: {
              model: anthropicModel,
              max_tokens: 3500,
              messages: [{ role: 'user', content: graphicPrompt }]
            }
          });
        }

        if (graphicsRequests.length > 0) {
          const nextBatch = await submitAnthropicBatch(graphicsRequests);
          brand.batchId = nextBatch.id;
          brand.batchStatus = 'processing_graphics';
        } else {
          brand.batchId = null;
          brand.batchStatus = 'ready';
        }
        changed = true;
      } else if (brand.batchStatus === 'processing_graphics') {
        // Graphics batch finished -> Create Posts
        let createdCount = 0;
        for (const res of results) {
          if (res.result.type !== 'succeeded') continue;

          const idx = parseInt(res.custom_id.split('_').pop());
          const strategyItem = brand.weeklyStrategy?.[idx];
          if (!strategyItem || !strategyItem.generatedContent) continue;
          const timeZone = strategyItem.timezone || brand.timezone || workspace.settings?.defaultTimezone || schedulerTimezone;
          if (hasExistingPostForSlot(
            workspace,
            brand.accountId,
            strategyItem.targetDate,
            strategyItem.scheduleSlotKey,
            timeZone,
          )) {
            continue;
          }

          let html = normalizeGraphicHtml(res.result.message.content[0].text);
          if (!(html.includes('<html') || html.includes('<!doctype html')) || !hasVisiblePosterText(html)) {
            const account = workspace.accounts.find(a => a.id === brand.accountId);
            const accountHandle = account?.linkedInUrl
              ? account.linkedInUrl.replace(/\/$/, '').split('/').pop() || account.name
              : account?.name || '';
            html = createHtmlAsset(
              strategyItem.generatedContent.title,
              strategyItem.generatedContent.content,
              brand.imageStyle || strategyItem.topic || 'Featured',
              brand.logoUrl || workspace.settings.logoUrl,
              account?.type !== 'person',
              account?.name || '',
              accountHandle,
              strategyItem.layoutArchetype,
            );
          }

          const post = {
            id: `post_${Date.now()}_${brand.accountId}_${idx}`,
            accountId: brand.accountId,
            title: strategyItem.generatedContent.title,
            theme: strategyItem.topic,
            content: strategyItem.generatedContent.content,
            cta: brand.ctaStyle || '',
            hashtags: brand.hashtags || [],
            htmlAsset: html,
            status: 'scheduled',
            scheduledAt: strategyItem.scheduledAt,
            generatedAt: new Date().toISOString(),
            scheduleSlotKey: strategyItem.scheduleSlotKey,
            generationSource: 'weekly_batch_scheduler',
            metrics: { impressions: 0, reactions: 0, comments: 0, clicks: 0, shares: 0 },
            notes: 'Generated via weekly Claude batch.',
            retryCount: 0,
            createdAt: new Date().toISOString(),
          };
          workspace.posts = [post, ...(workspace.posts || [])];
          createdCount += 1;
        }
        brand.batchId = null;
        brand.batchStatus = 'ready';
        brand.lastGeneratedAt = new Date().toISOString();
        console.log(`Weekly graphics batch completed for ${brand.accountId}; scheduled ${createdCount} posts.`);
        changed = true;
      }
    } catch (err) {
      console.error(`Error polling batch ${brand.batchId}:`, err);
      brand.batchStatus = 'failed';
      changed = true;
    }
  }

  if (changed) {
    await saveWorkspace(workspace);
  }
}

// Poll every 5 minutes for active batches
setInterval(pollPendingBatches, 5 * 60 * 1000);

app.listen(port, () => {
  console.log(`LinkedIn AI server running on port ${port}`);
});
