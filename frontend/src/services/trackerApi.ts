import { fetchApi } from '@/utils/apiClient';

export interface TrackerProblem {
  id: string;
  title: string;
  title_slug: string;
  topic: string;
  difficulty: string;
  playlists: string[];
  leetcode_url: string | null;
  gfg_url: string | null;
  article_url?: string | null;
  video_url?: string | null;
}

/**
 * Fetch problems from the DSA tracker table with optional filters.
 * The fetchApi helper already attaches JWT auth and the /api/v1 base URL.
 */
export const fetchTrackerProblems = async (
  playlist?: string,
  topic?: string,
  difficulty?: string
): Promise<TrackerProblem[]> => {
  try {
    const params = new URLSearchParams();
    if (playlist && playlist !== 'all' && playlist !== 'undefined' && playlist !== 'null') {
      params.append('playlist', playlist);
    }
    if (topic && topic !== 'all' && topic !== 'undefined' && topic !== 'null') {
      params.append('topic', topic);
    }
    if (difficulty && difficulty !== 'all' && difficulty !== 'undefined' && difficulty !== 'null') {
      params.append('difficulty', difficulty);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/tracker/problems?${queryString}` : '/tracker/problems';

    console.log('[TrackerAPI] Fetching problems:', endpoint);
    const res = await fetchApi(endpoint);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[TrackerAPI] Problems fetch failed:', res.status, errorText);
      throw new Error(`Failed to fetch tracker problems: ${res.status}`);
    }

    const data = await res.json();
    console.log(`[TrackerAPI] Loaded ${data.data?.length || 0} problems`);
    return data.data || [];
  } catch (e) {
    console.error('[TrackerAPI] fetchTrackerProblems error:', e);
    throw e;
  }
};

export interface TrackerMetadata {
  topics: string[];
  difficulties: string[];
  playlist_counts?: Record<string, number>;
}

/**
 * Fetch unique topics and difficulties from /tracker/metadata.
 */
export const fetchTrackerMetadata = async (): Promise<TrackerMetadata> => {
  try {
    console.log('[TrackerAPI] Fetching metadata...');
    const res = await fetchApi('/tracker/metadata');

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[TrackerAPI] Metadata fetch failed:', res.status, errorText);
      throw new Error(`Failed to fetch tracker metadata: ${res.status}`);
    }

    const data = await res.json();
    return {
      topics: data.topics || [],
      difficulties: data.difficulties || [],
      playlist_counts: data.playlist_counts || {},
    };
  } catch (e) {
    console.error('[TrackerAPI] fetchTrackerMetadata error:', e);
    throw e;
  }
};

/**
 * Fetch the authenticated user's progress map: { question_id: is_completed }
 */
export const fetchUserProgress = async (): Promise<Record<string, boolean>> => {
  try {
    console.log('[TrackerAPI] Fetching user progress...');
    const res = await fetchApi('/tracker/progress');

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[TrackerAPI] Progress fetch failed:', res.status, errorText);
      throw new Error(`Failed to fetch user progress: ${res.status}`);
    }

    const data = await res.json();
    console.log(`[TrackerAPI] Progress loaded for ${Object.keys(data.data || {}).length} items`);
    return data.data || {};
  } catch (e) {
    console.error('[TrackerAPI] fetchUserProgress error:', e);
    return {};  // Graceful fallback — don't crash the page if progress fails
  }
};

/**
 * Toggle a single problem's completion status via POST.
 */
export const toggleProblemProgress = async (
  question_id: string,
  is_completed: boolean
): Promise<any> => {
  try {
    console.log(`[TrackerAPI] Toggling ${question_id} -> ${is_completed}`);
    const res = await fetchApi('/tracker/progress', {
      method: 'POST',
      body: JSON.stringify({ question_id, is_completed }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[TrackerAPI] Toggle failed:', res.status, errorText);
      throw new Error(`Failed to update progress: ${res.status}`);
    }

    const data = await res.json();
    console.log('[TrackerAPI] Toggle success:', data);
    return data;
  } catch (e) {
    console.error('[TrackerAPI] toggleProblemProgress error:', e);
    throw e;
  }
};

/**
 * Fetch Analytics Overview
 */
export const fetchAnalyticsOverview = async () => {
  const res = await fetchApi('/analytics/overview');
  if (!res.ok) {
    const errorText = await res.text();
    console.error('[Analytics] overview failed:', res.status, errorText);
    throw new Error('Failed to fetch analytics overview');
  }
  return res.json();
};

/**
 * Fetch Analytics Distribution
 */
export const fetchAnalyticsDistribution = async () => {
  const res = await fetchApi('/analytics/distribution');
  if (!res.ok) throw new Error('Failed to fetch analytics distribution');
  return res.json();
};
