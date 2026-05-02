import { useState, useCallback } from "react";

/**
 * useProgress — persists watched video IDs in localStorage, keyed per user.
 *
 * Storage key: `lms_progress_<userId>`
 * Value: Set of video IDs (stored as JSON array)
 *
 * Returns:
 *   watchedIds   — Set of watched video IDs
 *   markWatched  — (videoId) => void
 *   clearProgress — () => void
 *   getCoursePct — (courseVideos) => 0-100
 */
export function useProgress(userId) {
  const storageKey = `lms_progress_${userId}`;

  const load = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  };

  const [watchedIds, setWatchedIds] = useState(load);

  const markWatched = useCallback((videoId) => {
    setWatchedIds((prev) => {
      if (prev.has(videoId)) return prev;
      const next = new Set(prev);
      next.add(videoId);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, [storageKey]);

  const clearProgress = useCallback(() => {
    localStorage.removeItem(storageKey);
    setWatchedIds(new Set());
  }, [storageKey]);

  const getCoursePct = useCallback((videos = []) => {
    if (!videos.length) return 0;
    const watched = videos.filter((v) => watchedIds.has(v.id)).length;
    return Math.round((watched / videos.length) * 100);
  }, [watchedIds]);

  return { watchedIds, markWatched, clearProgress, getCoursePct };
}