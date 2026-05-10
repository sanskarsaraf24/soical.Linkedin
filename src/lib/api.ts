import type { SchedulerRunResult, SchedulerStatus, WorkspaceState } from './types';

function apiBase(): string {
  if (typeof window === 'undefined') return '/api';
  return window.location.pathname.startsWith('/linkedin') ? '/linkedin/api' : '/api';
}

async function requestJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    headers: {
      ...(init?.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchWorkspace(): Promise<WorkspaceState> {
  return requestJSON<WorkspaceState>('/workspace');
}

export async function saveWorkspaceRemote(workspace: WorkspaceState): Promise<WorkspaceState> {
  return requestJSON<WorkspaceState>('/workspace', {
    method: 'PUT',
    body: JSON.stringify(workspace),
  });
}

export async function uploadLogo(file: File): Promise<{ url: string; name: string }> {
  const formData = new FormData();
  formData.append('logo', file);
  return requestJSON<{ url: string; name: string }>('/settings/logo', {
    method: 'POST',
    body: formData,
  });
}

export async function generatePostRemote(accountId: string, prompt: string): Promise<any> {
  return requestJSON<any>('/generate-post', {
    method: 'POST',
    body: JSON.stringify({ accountId, prompt }),
  });
}

export async function generateTomorrowPosts(): Promise<SchedulerRunResult> {
  return requestJSON<SchedulerRunResult>('/scheduler/generate-tomorrow', {
    method: 'POST',
  });
}

export async function fetchSchedulerStatus(): Promise<SchedulerStatus> {
  return requestJSON<SchedulerStatus>('/scheduler/status');
}

export async function publishPostNow(postId: string): Promise<WorkspaceState> {
  return requestJSON<WorkspaceState>(`/posts/${encodeURIComponent(postId)}/publish-now`, {
    method: 'POST',
  });
}

export async function generateWeeklyStrategy(accountId: string): Promise<any> {
  return requestJSON<any>('/strategy/generate', {
    method: 'POST',
    body: JSON.stringify({ accountId }),
  });
}

export async function batchWeeklyContent(accountId: string): Promise<any> {
  return requestJSON<any>('/strategy/batch-week', {
    method: 'POST',
    body: JSON.stringify({ accountId }),
  });
}
