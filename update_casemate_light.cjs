const { MongoClient } = require('mongodb');
const { renderHtmlToPng } = require('./rendering.js');
const fs = require('node:fs');
const path = require('node:path');

const post1Html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Casemate AI – Hearing Management</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; -webkit-font-smoothing: antialiased; border-radius: 0 !important; }
    html, body { width: 1080px; height: 1080px; margin: 0; padding: 0; overflow: hidden; }
    body { background-color: #FDFCF7; padding: 80px 80px 60px 80px; display: flex; flex-direction: column; justify-content: space-between; font-family: 'Inter', sans-serif; color: #0F172A; }
    .container { display: flex; flex-direction: column; height: 100%; }
    .header-section { display: flex; align-items: flex-start; margin-bottom: 60px; gap: 40px; }
    .left-rail { width: 6px; background-color: #C5A059; min-height: 280px; }
    .header-content { flex: 1; }
    .kicker { font-family: 'JetBrains Mono', monospace; font-size: 32px; text-transform: uppercase; letter-spacing: 3px; font-weight: 500; color: #94A3B8; margin: 0 0 24px 0; line-height: 1.2; }
    h1 { font-family: 'Playfair Display', serif; font-size: 86px; line-height: 1.06; letter-spacing: 0; font-weight: 700; color: #0F172A; margin: 0 0 32px 0; max-width: 850px; }
    .supporting-text { font-family: 'Inter', sans-serif; font-size: 38px; line-height: 1.4; font-weight: 400; color: #0F172A; max-width: 850px; margin: 0; }
    .logo { height: 80px; width: auto; object-fit: contain; margin-top: auto; }
    .citation-block { margin-top: auto; padding-top: 40px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: flex-end; }
    .citation-text { font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 400; color: #C5A059; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-section">
      <div class="left-rail"></div>
      <div class="header-content">
        <div class="kicker">How Hearing Management Impacts Outcomes</div>
        <h1>Hearing Management Determines Outcomes</h1>
        <p class="supporting-text">Most advocates treat hearing management as a calendar problem. The ones winning cases treat it as a strategy problem.</p>
      </div>
    </div>
    <div class="citation-block">
      <img src="/linkedin/uploads/logos/1778408882556-Casemate_logo_white_no_bg.png" alt="Casemate AI" class="logo" style="filter: brightness(0.1)">
      <div class="citation-text">CASEMATE.AI</div>
    </div>
  </div>
</body>
</html>`;

const post2Html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Casemate AI - The File Finding Tax</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; -webkit-font-smoothing: antialiased; border-radius: 0 !important; }
    html, body { width: 1080px; height: 1080px; margin: 0; padding: 0; overflow: hidden; }
    body { padding: 80px; display: flex; flex-direction: column; justify-content: space-between; background-color: #FDFCF7; font-family: 'Inter', sans-serif; color: #0F172A; }
    .header-section { display: flex; flex-direction: column; gap: 40px; }
    .logo { height: 60px; width: auto; object-fit: contain; filter: brightness(0.1); }
    .left-border-rail { display: flex; gap: 40px; align-items: flex-start; }
    .accent-border { width: 6px; height: 220px; background-color: #C5A059; flex-shrink: 0; }
    .content-column { display: flex; flex-direction: column; gap: 24px; flex: 1; }
    .kicker { font-size: 32px; text-transform: uppercase; letter-spacing: 4px; font-weight: 700; color: #94A3B8; margin: 0; }
    h1 { font-size: 92px; line-height: 1.06; letter-spacing: 0; font-weight: 700; margin: 0; color: #0F172A; font-family: 'Playfair Display', serif; }
    .supporting-text { font-size: 38px; line-height: 1.4; font-weight: 400; color: #0F172A; margin: 0; max-width: 700px; }
    .visual-split { display: flex; gap: 30px; margin-top: 60px; height: 280px; }
    .chaos-panel { flex: 1; background-color: #F4F6F8; border: 1px solid #E2E8F0; padding: 30px; display: flex; flex-direction: column; gap: 16px; position: relative; overflow: hidden; }
    .file-stack { width: 100%; height: 20px; background-color: #CBD5E1; transform: rotate(-2deg); border: 1px solid #94A3B8; opacity: 0.6; }
    .organized-panel { flex: 1; background-color: #FDFCF7; border: 2px solid #C5A059; padding: 30px; display: flex; flex-direction: column; gap: 12px; }
    .case-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #E2E8F0; }
    .case-indicator { width: 8px; height: 8px; background-color: #C5A059; }
    .case-text { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #0F172A; text-transform: uppercase; }
    .organized-label { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #C5A059; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px; padding-top: 12px; border-top: 1px solid #C5A059; }
    .footer-citation { font-family: 'JetBrains Mono', monospace; font-size: 32px; color: #C5A059; margin-top: 40px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="header-section">
    <img src="/linkedin/uploads/logos/1778408882556-Casemate_logo_white_no_bg.png" alt="Casemate AI" class="logo">
    <div class="left-border-rail">
      <div class="accent-border"></div>
      <div class="content-column">
        <p class="kicker">Disorganized Case Files</p>
        <h1>The File Finding Tax</h1>
        <p class="supporting-text">You're spending 3 hours finding what should take 3 minutes.</p>
      </div>
    </div>
  </div>
  <div class="visual-split">
    <div class="chaos-panel">
      <div class="file-stack"></div><div class="file-stack"></div>
      <span class="chaos-label" style="font-family: 'JetBrains Mono', monospace; color: #94A3B8;">Unstructured</span>
    </div>
    <div class="organized-panel">
      <div class="case-item"><div class="case-indicator"></div><span class="case-text">Case ID: 2024-001</span></div>
      <div class="case-item"><div class="case-indicator"></div><span class="case-text">Pleadings Filed</span></div>
      <span class="organized-label">Structured</span>
    </div>
  </div>
  <div class="footer-citation">→ Casemate Organizes</div>
</body>
</html>`;

async function updatePost(posts, id, html) {
  const post = posts.find(p => p.id === id);
  if (!post) {
    console.log(`Post not found: ${id}`);
    return;
  }
  post.htmlAsset = html;
  
  // Render PNG
  console.log(`Rendering ${id}...`);
  const uploadRoot = path.join(__dirname, 'uploads');
  const postsDir = path.join(uploadRoot, 'posts');
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
  
  const filename = `${id}.png`;
  const fullPath = path.join(postsDir, filename);
  
  // Need to fix image paths in HTML for local rendering if they start with /linkedin
  const renderHtml = html.replace(/\/linkedin\/uploads/g, `file://${uploadRoot}`);
  
  await renderHtmlToPng(renderHtml, filename);
  post.imageUrl = `/linkedin/uploads/posts/${filename}?t=${Date.now()}`;
  console.log(`Done rendering ${id}`);
}

async function run() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();
  const db = client.db('linkedin_ai');
  const workspace = await db.collection('workspaces').findOne({});
  
  await updatePost(workspace.posts, 'post_1778428544404_acc_page_2_0', post1Html);
  await updatePost(workspace.posts, 'post_1778429744473_acc_page_2_0', post2Html);
  
  await db.collection('workspaces').updateOne({}, { $set: { posts: workspace.posts } });
  console.log('Database updated successfully');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
