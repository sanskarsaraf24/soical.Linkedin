import { useEffect, useMemo, useState } from 'react';
import type { AppPage, BrandProfile, LinkedInAccount, PostDraft, SchedulerStatus, WorkspaceState } from './lib/types';
import { loadWorkspace, normalizeWorkspace, saveWorkspace } from './lib/storage';
import { fetchSchedulerStatus, fetchWorkspace, generatePostRemote, generateTomorrowPosts, publishPostNow, saveWorkspaceRemote, uploadLogo, generateWeeklyStrategy, batchWeeklyContent } from './lib/api';

const pages: { id: AppPage; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'accounts', label: 'Identities' },
  { id: 'brand', label: 'Brand Voice' },
  { id: 'scheduler', label: 'Scheduler' },
  { id: 'analytics', label: 'Insights' },
  { id: 'settings', label: 'Settings' },
];

const toneOptions: BrandProfile['tone'][] = ['professional', 'casual', 'witty', 'educational', 'inspirational'];

export default function App() {
  const [page, setPage] = useState<AppPage>('overview');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  const [workspace, setWorkspace] = useState<WorkspaceState>(() => loadWorkspace());
  const [hasHydratedRemote, setHasHydratedRemote] = useState(false);
  const [activeAccountId, setActiveAccountId] = useState(workspace.accounts[0]?.id ?? '');
  const [draftPrompt, setDraftPrompt] = useState('Write a post about operational leverage for founders.');
  const [selectedDraftId, setSelectedDraftId] = useState<string>(workspace.posts[0]?.id ?? '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [publishingIds, setPublishingIds] = useState<string[]>([]);
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    kind: 'post' | 'delete';
    postId: string;
  } | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  const notify = (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(current => [...current, { id, message }]);
    setTimeout(() => {
      setToasts(current => current.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('oauth_error');
    const connected = params.get('connected');
    if (error) {
      notify(`LinkedIn connection failed: ${error}`);
    } else if (connected) {
      notify('LinkedIn account connected.');
    }
    if (error || connected) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedRemote) return;
    saveWorkspace(normalizeWorkspace({
      ...workspace,
      settings: { ...workspace.settings, linkedinClientSecret: '' },
    }));
    saveWorkspaceRemote(workspace).catch(() => {});
  }, [workspace, hasHydratedRemote]);

  useEffect(() => {
    let active = true;
    fetchWorkspace()
      .then(remote => {
        if (active && remote) {
          setWorkspace(normalizeWorkspace(remote));
        }
      })
      .catch(() => {
        if (active) setWorkspace(current => normalizeWorkspace(current));
      })
      .finally(() => {
        if (active) setHasHydratedRemote(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchSchedulerStatus()
      .then(status => {
        if (active) setSchedulerStatus(status);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [workspace.posts.length]);

  useEffect(() => {
    if (!activeAccountId && workspace.accounts[0]) {
      setActiveAccountId(workspace.accounts[0].id);
    }
    if (!selectedDraftId && workspace.posts[0]) {
      setSelectedDraftId(workspace.posts[0].id);
    }
  }, [workspace.accounts, workspace.posts, activeAccountId, selectedDraftId]);

  const activeAccount = workspace.accounts.find(account => account.id === activeAccountId) ?? workspace.accounts[0];
  const activeBrand = workspace.brandProfiles.find(profile => profile.accountId === activeAccount?.id) ?? workspace.brandProfiles[0];
  const selectedDraft = workspace.posts.find(post => post.id === selectedDraftId) ?? workspace.posts[0];
  const previewPost = previewPostId ? workspace.posts.find(post => post.id === previewPostId) : null;

  const stats = useMemo(() => {
    const activePosts = workspace.posts.filter(post => post.accountId === activeAccount?.id);
    const scheduled = activePosts.filter(post => post.status === 'scheduled').length;
    const posted = activePosts.filter(post => post.status === 'posted').length;
    const drafts = activePosts.filter(post => post.status === 'draft').length;
    const totalImpressions = activePosts.reduce((sum, post) => sum + post.metrics.impressions, 0);
    return { scheduled, posted, drafts, totalImpressions };
  }, [workspace.posts, activeAccount?.id]);

  function updateBrandProfile(accountId: string, patch: Partial<BrandProfile>) {
    setWorkspace(current => ({
      ...current,
      brandProfiles: current.brandProfiles.map(profile => (
        profile.accountId === accountId ? { ...profile, ...patch } : profile
      )),
    }));
  }

  function updateSettings(patch: Partial<WorkspaceState['settings']>) {
    setWorkspace(current => ({
      ...current,
      settings: { ...current.settings, ...patch },
    }));
  }

  async function triggerTomorrowGeneration() {
    setIsGenerating(true);
    try {
      const result = await generateTomorrowPosts();
      setSchedulerStatus(result);
      const remote = await fetchWorkspace();
      setWorkspace(normalizeWorkspace(remote));
      if (result.created > 0) {
        notify(`Created ${result.created} post${result.created === 1 ? '' : 's'} for tomorrow.`);
      } else if (result.errors.length) {
        notify(`Scheduler finished with ${result.errors.length} error${result.errors.length === 1 ? '' : 's'}.`);
      } else {
        notify('No posts needed for tomorrow.');
      }
    } catch (err) {
      console.error('Tomorrow generation failed:', err);
      notify(err instanceof Error ? err.message : 'Failed to generate tomorrow’s posts.');
    } finally {
      setIsGenerating(false);
    }
  }

  function updatePost(postId: string, patch: Partial<PostDraft>) {
    setWorkspace(current => ({
      ...current,
      posts: current.posts.map(post => (post.id === postId ? { ...post, ...patch } : post)),
    }));
  }

  function scheduleNow(postId: string) {
    updatePost(postId, { status: 'scheduled', scheduledAt: new Date().toISOString() });
    notify('Post scheduled!');
  }

  async function publishNow(postId: string) {
    setPublishingIds(current => [...current, postId]);
    updatePost(postId, { status: 'publishing', lastError: '' });
    try {
      const nextWorkspace = await publishPostNow(postId);
      const normalized = normalizeWorkspace(nextWorkspace);
      setWorkspace(normalized);
      const updatedPost = normalized.posts.find(post => post.id === postId);
      notify(updatedPost?.status === 'posted' ? 'Post published on LinkedIn.' : 'Publish failed. Check the post error.');
    } catch (err) {
      updatePost(postId, {
        status: 'failed',
        lastError: err instanceof Error ? err.message : 'Publish failed.',
      });
      notify('Publish failed. Check the post error.');
    } finally {
      setPublishingIds(current => current.filter(id => id !== postId));
    }
  }

  function deletePost(postId: string) {
    setWorkspace(current => ({
      ...current,
      posts: current.posts.filter(post => post.id !== postId),
    }));
  }

  function exportHtml(post: PostDraft) {
    const blob = new Blob([post.htmlAsset], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${post.id}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleLogoUpload(file: File | null) {
    if (!file) return;
    uploadLogo(file)
      .then(result => {
        updateSettings({ logoUrl: result.url, logoName: result.name });
      })
      .catch(() => {
        const reader = new FileReader();
        reader.onload = () => {
          const logoUrl = typeof reader.result === 'string' ? reader.result : '';
          updateSettings({ logoUrl, logoName: file.name });
      };
      reader.readAsDataURL(file);
    });
  }

  function connectLinkedInAccount(accountId: string) {
    const base = window.location.pathname.startsWith('/linkedin') ? '/linkedin/api' : '/api';
    window.location.href = `${base}/auth/linkedin/start?accountId=${encodeURIComponent(accountId)}`;
  }

  function confirmSelectedAction() {
    if (!confirmAction) return;
    if (confirmAction.kind === 'delete') {
      deletePost(confirmAction.postId);
      notify('Post deleted.');
    } else {
      publishNow(confirmAction.postId);
    }
    setConfirmAction(null);
  }

  const scheduledByDay = workspace.posts
    .filter(post => post.accountId === activeAccount?.id && post.status !== 'failed')
    .slice(0, 7);

  return (
    <div className="app-shell">
      <aside className={isSidebarCollapsed ? 'sidebar collapsed' : 'sidebar'}>
        <div className="brand-block">
          <div className="brand-mark">C</div>
          <div className="brand-info">
            <span className="eyebrow">Creator OS</span>
            <h1>Enterprise</h1>
          </div>
        </div>

        <nav className="nav-list">
          {pages.map(item => (
            <button key={item.id} className={page === item.id ? 'nav-item active' : 'nav-item'} onClick={() => setPage(item.id)}>
              <div className="nav-item-icon">
                {getIcon(item.id)}
              </div>
              <span className="nav-item-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <footer className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar" />
            <div className="user-info">
              <strong>{activeAccount?.name || 'User'}</strong>
              <span>{activeAccount?.type || 'Standard'}</span>
            </div>
          </div>
          <button className="nav-item" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <div className="nav-item-icon">
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </div>
            <span className="nav-item-label">{theme === 'light' ? 'Appearance' : 'Appearance'}</span>
          </button>
          <button className="nav-item" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
            <div className="nav-item-icon">
              {isSidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </div>
            <span className="nav-item-label">Collapse Sidebar</span>
          </button>
        </footer>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-title">
            <span className="eyebrow">Operating System</span>
            <h2>{activeAccount?.name || pages.find(p => p.id === page)?.label}</h2>
          </div>
          <div className="topbar-actions">
            <div className="select-wrap">
              <span>Active Identity</span>
              <select value={activeAccountId} onChange={event => setActiveAccountId(event.target.value)}>
                {workspace.accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={triggerTomorrowGeneration} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate tomorrow’s posts'}
            </button>
          </div>
        </header>

        {page === 'overview' && (
          <section className="page-grid">
            <Panel title="Network Performance" description="Real-time engagement across your active identities.">
              <div className="kpi-grid">
                <Kpi label="Pipeline" value={stats.scheduled} />
                <Kpi label="Published" value={stats.posted} />
                <Kpi label="Drafts" value={stats.drafts} />
                <Kpi label="Impressions" value={stats.totalImpressions.toLocaleString()} />
              </div>
            </Panel>
            <Panel title="Upcoming Queue" description="Prioritized items for immediate publication.">
              <div className="stack">
                {scheduledByDay.map(post => (
                  <PostRow key={post.id} post={post} onSelect={() => setSelectedDraftId(post.id)} />
                ))}
                {!scheduledByDay.length && <EmptyState text="Your queue is currently empty. Start by generating a plan." />}
              </div>
            </Panel>
          </section>
        )}

        {page === 'accounts' && (
          <section className="page-grid">
            <Panel title="Connected Identities" description="Manage and authenticate your professional LinkedIn profiles.">
              <div className="card-grid">
                {workspace.accounts.map(account => (
                  <article className="card" key={account.id}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                      <div className="user-avatar" style={{ width: '48px', height: '48px' }} />
                      <div className="user-info">
                        <strong>{account.name}</strong>
                        <span>{account.type === 'person' ? 'Executive Profile' : 'Company Page'}</span>
                      </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <small style={{ display: 'block', color: 'var(--text-muted)' }}>{account.linkedInUrl}</small>
                      <small style={{ color: 'var(--brand-primary)', fontWeight: 'bold' }}>{account.status} · Last synced {prettyDate(account.lastSyncAt)}</small>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setActiveAccountId(account.id)}>Activate</button>
                      <button className="btn btn-secondary" onClick={() => connectLinkedInAccount(account.id)}>Sync</button>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
          </section>
        )}

        {page === 'brand' && activeBrand && activeAccount && (
          <section className="page-grid">
            <Panel title={`Brand profile for ${activeAccount.name}`} description="Define voice, style, themes, and writing rules per account.">
              <div className="form-grid">
                <Field label="Footer Brand Name">
                  <input 
                    value={activeBrand.brandName || ''} 
                    placeholder="E.g. Saraf & Co"
                    onChange={event => updateBrandProfile(activeAccount.id, { brandName: event.target.value })} 
                  />
                </Field>
                <Field label="Footer Logo upload">
                  <input type="file" accept="image/*" onChange={async event => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    try {
                      const res = await uploadLogo(file);
                      updateBrandProfile(activeAccount.id, { logoUrl: res.url, logoName: res.name });
                    } catch (e) {
                      console.error('Upload failed', e);
                      alert('Failed to upload logo');
                    }
                  }} />
                </Field>
                {activeBrand.logoUrl && (
                  <Field label="Logo preview">
                    <img src={activeBrand.logoUrl} alt={activeBrand.logoName || 'Logo'} style={{ maxWidth: '180px', maxHeight: '90px', objectFit: 'contain' }} />
                  </Field>
                )}
                <Field label="About the company">
                  <textarea
                    value={activeBrand.aboutCompany}
                    placeholder="Describe the company, offer, audience, market, differentiator, and what this account should sound like."
                    onChange={event => updateBrandProfile(activeAccount.id, { aboutCompany: event.target.value })}
                  />
                </Field>
                <Field label="Brand voice">
                  <textarea value={activeBrand.voice} onChange={event => updateBrandProfile(activeAccount.id, { voice: event.target.value })} />
                </Field>
                <Field label="Tone">
                  <select value={activeBrand.tone} onChange={event => updateBrandProfile(activeAccount.id, { tone: event.target.value as BrandProfile['tone'] })}>
                    {toneOptions.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Content pillars">
                  <TagInput value={activeBrand.contentPillars} onChange={items => updateBrandProfile(activeAccount.id, { contentPillars: items })} />
                </Field>
                <Field label="Hashtags">
                  <TagInput value={activeBrand.hashtags} onChange={items => updateBrandProfile(activeAccount.id, { hashtags: items })} />
                </Field>
                <Field label="Image style">
                  <textarea
                    value={activeBrand.imageStyle}
                    placeholder="Describe brand colors, image composition, typography, logo placement, visual mood, and any do's/don'ts for post graphics."
                    onChange={event => updateBrandProfile(activeAccount.id, { imageStyle: event.target.value })}
                  />
                </Field>
                <Field label="Writing style">
                  <textarea value={activeBrand.writingStyle} onChange={event => updateBrandProfile(activeAccount.id, { writingStyle: event.target.value })} />
                </Field>
                <Field label="Content themes">
                  <TagInput value={activeBrand.contentThemes} onChange={items => updateBrandProfile(activeAccount.id, { contentThemes: items })} />
                </Field>
                <Field label="CTA style">
                  <input value={activeBrand.ctaStyle} onChange={event => updateBrandProfile(activeAccount.id, { ctaStyle: event.target.value })} />
                </Field>
                <Field label="Banned topics">
                  <TagInput value={activeBrand.bannedTopics} onChange={items => updateBrandProfile(activeAccount.id, { bannedTopics: items })} />
                </Field>
                <Field label="Posting days">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <button
                        key={i}
                        className={`btn ${(activeBrand.postingDays || []).includes(i) ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '8px 12px', minWidth: '42px' }}
                        onClick={() => {
                          const currentDays = activeBrand.postingDays || [];
                          const next = currentDays.includes(i)
                            ? currentDays.filter(d => d !== i)
                            : [...currentDays, i];
                          updateBrandProfile(activeAccount.id, { postingDays: next });
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Posting times">
                  <TagInput value={activeBrand.postingTimes || []} onChange={items => updateBrandProfile(activeAccount.id, { postingTimes: items })} />
                </Field>
                <Field label="Timezone">
                  <input value={activeBrand.timezone} onChange={event => updateBrandProfile(activeAccount.id, { timezone: event.target.value })} />
                </Field>
              </div>
            </Panel>
          </section>
        )}

        {page === 'scheduler' && (
          <section className="page-grid" style={{ gridTemplateColumns: '1fr' }}>
            <Panel title="Weekly Content Scheduler" description="Automatically plans and batches next Monday-Sunday LinkedIn posts every Saturday at 8:00 AM IST.">
              <div className="kpi-grid">
                <Kpi label="Weekly batch" value={schedulerStatus?.enabled ? 'On' : 'Off'} />
                <Kpi label="Next check" value={schedulerStatus?.nextRunAt ? prettyDate(schedulerStatus.nextRunAt) : 'Scheduled'} />
                <Kpi label="Due tomorrow" value={schedulerStatus?.postsDueTomorrow ?? 0} />
                <Kpi label="Last generated" value={schedulerStatus?.lastCreatedCount ?? 0} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginTop: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="muted-text">
                  Next publish date: {schedulerStatus?.tomorrowDate || 'calculating'} · Last generation: {schedulerStatus?.lastRunAt ? prettyDate(schedulerStatus.lastRunAt) : 'Not run yet'}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ border: '1px solid #10b981', color: '#059669' }} onClick={async () => {
                    if (!activeAccountId) return;
                    setIsGenerating(true);
                    try {
                      await batchWeeklyContent(activeAccountId);
                      const updated = await fetchWorkspace();
                      setWorkspace(updated);
                    } catch (err) {
                      alert('Weekly batch planning failed');
                    } finally {
                      setIsGenerating(false);
                    }
                  }} disabled={isGenerating || (activeBrand?.batchStatus !== 'idle' && activeBrand?.batchStatus !== 'ready' && activeBrand?.batchStatus !== 'failed' && !!activeBrand?.batchStatus)}>
                    {isGenerating ? 'Submitting Batch...' : 'Plan & Batch Full Week (50% Off)'}
                  </button>
                  <button className="btn btn-secondary" onClick={async () => {
                    if (!activeAccountId) return;
                    setIsGenerating(true);
                    try {
                      await generateWeeklyStrategy(activeAccountId);
                      const updated = await fetchWorkspace();
                      setWorkspace(updated);
                    } catch (err) {
                      alert('Strategy generation failed');
                    } finally {
                      setIsGenerating(false);
                    }
                  }} disabled={isGenerating}>
                    {isGenerating ? 'Planning...' : 'Re-plan week'}
                  </button>
                  <button className="btn btn-primary" onClick={triggerTomorrowGeneration} disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Generate tomorrow’s posts'}
                  </button>
                </div>
              </div>
              
              {activeBrand?.batchStatus && activeBrand.batchStatus !== 'idle' && (
                <div className={`batch-status-banner ${activeBrand.batchStatus}`} style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: activeBrand.batchStatus === 'failed' ? '#fef2f2' : '#ecfdf5',
                  border: `1px solid ${activeBrand.batchStatus === 'failed' ? '#fee2e2' : '#d1fae5'}`,
                  color: activeBrand.batchStatus === 'failed' ? '#b91c1c' : '#065f46',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  <div className="spinner-small" style={{ display: (activeBrand.batchStatus.startsWith('processing')) ? 'block' : 'none' }}></div>
                  <strong>Batch Update:</strong>
                  {activeBrand.batchStatus === 'processing_content' && 'Phase 1: Generating weekly post content (Batch API active)...'}
                  {activeBrand.batchStatus === 'processing_graphics' && 'Phase 2: Designing graphics for the week (Batch API active)...'}
                  {activeBrand.batchStatus === 'ready' && 'Weekly batch completed successfully! Refresh or check your queue.'}
                  {activeBrand.batchStatus === 'failed' && 'Weekly batch failed. Please check logs or try again.'}
                  {activeBrand.batchStatus === 'ready' && <button className="btn btn-secondary" style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: '12px' }} onClick={() => updateBrandProfile(activeAccountId, { batchStatus: 'idle' })}>Dismiss</button>}
                </div>
              )}
              {!!activeBrand.weeklyStrategy?.length && (
                <div className="strategy-summary" style={{ marginTop: '24px' }}>
                  <header style={{ marginBottom: '16px' }}>
                    <span className="eyebrow">AI Content Brain</span>
                    <h4>Weekly Strategy Plan</h4>
                  </header>
                  <div className="strategy-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {activeBrand.weeklyStrategy.map((item, i) => (
                      <div key={i} className="strategy-card" style={{ background: 'var(--panel-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '14px', color: 'var(--primary-color)' }}>{item.day}</strong>
                          <span style={{ fontSize: '11px', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{item.visualState}</span>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{item.topic}</div>
                        <div className="muted-text" style={{ fontSize: '13px', fontStyle: 'italic' }}>"{item.hook}"</div>
                        <div style={{ fontSize: '12px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '8px', color: 'var(--text-secondary)' }}>
                          <strong>Visual:</strong> {item.visualDirection}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!!schedulerStatus?.lastErrors?.length && (
                <div className="error-box" style={{ marginTop: '16px' }}>
                  {schedulerStatus.lastErrors.join('\n')}
                </div>
              )}
            </Panel>
            <Panel title={`Production Queue: ${activeAccount.name}`} description="Full week overview of topics, designs, and schedule.">
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Scheduled</th>
                      <th>Topic</th>
                      <th>Content Preview</th>
                      <th>Design</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workspace.posts
                      .filter(post => post.accountId === activeAccountId)
                      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                      .map(post => (
                        <tr key={post.id}>
                          <td><span className={`status ${post.status}`}>{post.status}</span></td>
                          <td style={{ whiteSpace: 'nowrap' }}><strong>{prettyDate(post.scheduledAt)}</strong></td>
                          <td><span style={{ fontWeight: 700 }}>{post.title}</span></td>
                          <td><div className="content-preview">{post.content}</div></td>
                          <td>
                            <button className="design-thumb" type="button" onClick={() => { setSelectedDraftId(post.id); setPreviewPostId(post.id); }}>
                              <iframe srcDoc={post.htmlAsset} title="thumb" />
                              <div className="thumb-overlay">Preview</div>
                            </button>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                onClick={() => setEditingPostId(post.id)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                disabled={publishingIds.includes(post.id) || post.status === 'publishing'}
                                onClick={() => setConfirmAction({ kind: 'post', postId: post.id })}
                              >
                                {publishingIds.includes(post.id) || post.status === 'publishing' ? 'Posting...' : 'Post'}
                              </button>
                              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', color: '#ef4444' }} onClick={() => setConfirmAction({ kind: 'delete', postId: post.id })}>Delete</button>
                            </div>
                            {post.lastError && <small className="error-text">{post.lastError}</small>}
                          </td>
                        </tr>
                      ))}
                    {workspace.posts.filter(p => p.accountId === activeAccountId).length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px' }}><EmptyState text="No posts found for this identity." /></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </section>
        )}

        {page === 'analytics' && (
          <section className="page-grid">
            <Panel title="Analytics" description="Performance view by account and content pattern.">
              <div className="card-grid">
                {workspace.accounts.map(account => {
                  const accountPosts = workspace.posts.filter(post => post.accountId === account.id);
                  const reactions = accountPosts.reduce((sum, post) => sum + post.metrics.reactions, 0);
                  const impressions = accountPosts.reduce((sum, post) => sum + post.metrics.impressions, 0);
                  const ratio = impressions > 0 ? Math.round((reactions / impressions) * 100) : 0;
                  return (
                    <article className="metric-card" key={account.id}>
                      <strong>{account.name}</strong>
                      <span>{accountPosts.length} posts</span>
                      <div className="metric-big">{impressions.toLocaleString()}</div>
                      <small>{reactions} reactions · {ratio}% reaction rate</small>
                    </article>
                  );
                })}
              </div>
            </Panel>
          </section>
        )}

        {page === 'settings' && (
          <section className="page-grid two-up">
            <Panel title="Settings" description="Connect the LinkedIn developer app and keep the workspace clean.">
              <div className="form-grid">
                <Field label="LinkedIn Client ID">
                  <input value={workspace.settings.linkedinClientId} onChange={event => updateSettings({ linkedinClientId: event.target.value })} />
                </Field>
                <Field label="LinkedIn Client Secret">
                  <input
                    value={workspace.settings.linkedinClientSecret}
                    type="password"
                    placeholder={workspace.settings.linkedinClientSecretSaved ? 'Saved on server' : 'Paste client secret'}
                    onChange={event => updateSettings({ linkedinClientSecret: event.target.value })}
                  />
                </Field>
                <Field label="Redirect URI">
                  <input value={workspace.settings.linkedinRedirectUri} onChange={event => updateSettings({ linkedinRedirectUri: event.target.value })} />
                </Field>
                <Field label="Default timezone">
                  <input value={workspace.settings.defaultTimezone} onChange={event => updateSettings({ defaultTimezone: event.target.value })} />
                </Field>
              </div>
            </Panel>
            <Panel title="Account Readiness" description="Connection and publishing requirements for the active identity.">
              <div className="stack">
                <MetaRow label="Client ID" value={workspace.settings.linkedinClientId ? 'Present' : 'Missing'} />
                <MetaRow label="Client secret" value={workspace.settings.linkedinClientSecret || workspace.settings.linkedinClientSecretSaved ? 'Saved' : 'Missing'} />
                <MetaRow label="Redirect URI" value={workspace.settings.linkedinRedirectUri} />
                <MetaRow label="OAuth status" value={activeAccount?.linkedInAuth?.lastConnectedAt ? `Connected ${prettyDate(activeAccount.linkedInAuth.lastConnectedAt)}` : activeAccount?.status || 'pending'} />
                <MetaRow label="Author type" value={activeAccount?.type === 'organization' ? 'Organization page' : 'Member profile'} />
                <MetaRow label="Author URN" value={activeAccount?.type === 'organization' ? activeAccount.organizationUrn || 'Missing organization URN' : activeAccount?.linkedInAuth?.memberUrn || 'Connect account to resolve member URN'} />
                <MetaRow label="Logo" value={workspace.settings.logoName || 'None'} />
                <MetaRow label="Last selected draft" value={selectedDraft?.title || 'None'} />
              </div>
            </Panel>
          </section>
        )}
      </main>

      {previewPost && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Post preview">
          <div className="modal large">
            <header className="modal-head">
              <div>
                <span className="eyebrow">Preview</span>
                <h3>{previewPost.title}</h3>
              </div>
              <button className="btn btn-secondary" onClick={() => setPreviewPostId(null)}>Close</button>
            </header>
            <div className="preview-grid">
              <div className="preview-frame">
                <iframe srcDoc={previewPost.htmlAsset} title={`${previewPost.title} preview`} />
              </div>
              <div className="stack">
                <MetaRow label="Account" value={workspace.accounts.find(account => account.id === previewPost.accountId)?.name || 'Unknown'} />
                <MetaRow label="Scheduled" value={prettyDate(previewPost.scheduledAt)} />
                <MetaRow label="Status" value={previewPost.status} />
                <div className="preview-copy">{previewPost.content}</div>
                {previewPost.cta && <MetaRow label="CTA" value={previewPost.cta} />}
                <MetaRow label="Hashtags" value={previewPost.hashtags?.join(' ') || 'None'} />
                {previewPost.lastError && <div className="error-box">{previewPost.lastError}</div>}
                <button className="btn btn-primary" onClick={() => exportHtml(previewPost)}>Export HTML</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingPostId && (
        <EditPostModal
          post={workspace.posts.find(p => p.id === editingPostId)!}
          onClose={() => setEditingPostId(null)}
          onSave={updates => {
            setWorkspace(current => ({
              ...current,
              posts: current.posts.map(p => p.id === editingPostId ? { ...p, ...updates } : p)
            }));
            setEditingPostId(null);
            notify('Post updated.');
          }}
        />
      )}

      {confirmAction && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Confirm action">
          <div className="modal">
            <header className="modal-head">
              <div>
                <span className="eyebrow">{confirmAction.kind === 'post' ? 'Confirm post' : 'Confirm delete'}</span>
                <h3>{workspace.posts.find(post => post.id === confirmAction.postId)?.title || 'Post'}</h3>
              </div>
            </header>
            <p className="modal-copy">
              {confirmAction.kind === 'post'
                ? `Publish this post for ${activeAccount?.name || 'the active account'} now?`
                : 'Delete this scheduled post? This cannot be undone.'}
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button className={confirmAction.kind === 'delete' ? 'btn btn-danger' : 'btn btn-primary'} onClick={confirmSelectedAction}>
                {confirmAction.kind === 'delete' ? 'Delete' : 'Post now'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast">
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <header className="panel-head">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="kpi">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AccountCard({ account, brand }: { account: LinkedInAccount; brand?: BrandProfile }) {
  return (
    <article className="account-mini">
      <div className="avatar small" />
      <div>
        <strong>{account.name}</strong>
        <p>{account.type} · {account.status}</p>
        <small>{brand?.tone ?? 'No brand profile yet'}</small>
      </div>
    </article>
  );
}

function PostRow({ post, onSelect }: { post: PostDraft; onSelect: () => void }) {
  return (
    <button className="post-row" onClick={onSelect}>
      <div>
        <strong>{post.title}</strong>
        <span>{prettyDate(post.scheduledAt)}</span>
      </div>
      <span className={`status ${post.status}`}>{post.status}</span>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function TagInput({ value, onChange }: { value: string[]; onChange: (items: string[]) => void }) {
  const [draft, setDraft] = useState(value.join(', '));
  useEffect(() => {
    setDraft(value.join(', '));
  }, [value]);
  return (
    <input
      value={draft}
      placeholder="Comma-separated values"
      onChange={event => {
        const next = event.target.value;
        setDraft(next);
        onChange(next.split(',').map(item => item.trim()).filter(Boolean));
      }}
    />
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="meta-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Note({ text }: { text: string }) {
  return <div className="note">{text}</div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state">{text}</div>;
}

function getIcon(id: AppPage) {
  switch (id) {
    case 'overview': return <LayoutIcon />;
    case 'accounts': return <UsersIcon />;
    case 'brand': return <BriefcaseIcon />;
    case 'scheduler': return <CalendarIcon />;
    case 'analytics': return <BarChartIcon />;
    case 'settings': return <SettingsIcon />;
    default: return <CircleIcon />;
  }
}

const LayoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
);

const PenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
);

const PaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.5 2-1.2l.4-.6c.3-.5.8-.8 1.3-.8h1.4c2.5 0 4.8-1.5 5.7-3.8.3-.9.2-1.9-.3-2.7l-.5-.7c-.4-.5-.6-1.2-.6-1.8 0-4.4-3.6-8-8-8z"/></svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.17a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

const CircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

function prettyDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
}
function EditPostModal({ post, onClose, onSave }: { post: PostDraft; onClose: () => void; onSave: (updates: Partial<PostDraft>) => void }) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [date, setDate] = useState(post.scheduledAt.split('T')[0]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit post">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <header>
          <h3>Edit Post Refinement</h3>
          <p>Modify the AI-generated draft before publication.</p>
        </header>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Post Title / Theme">
            <input value={title} onChange={e => setTitle(e.target.value)} />
          </Field>
          <Field label="Post Content (Draft)">
            <textarea style={{ height: '200px' }} value={content} onChange={e => setContent(e.target.value)} />
          </Field>
          <Field label="Scheduled Date">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </Field>
        </div>
        <footer>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave({ title, content, scheduledAt: `${date}T09:00:00.000Z` })}>Save Changes</button>
        </footer>
      </div>
    </div>
  );
}
