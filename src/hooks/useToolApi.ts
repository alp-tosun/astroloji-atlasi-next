'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { ToolId, Profile } from '@/types/profile';

// Tools that should NOT be cached (unique user input each time)
const NO_CACHE_TOOLS: Set<string> = new Set([
  'ruya',   // dream text changes
  'horar',  // question changes
  'el',     // photo changes
  'uyum',   // partner info changes
  'tarot',  // each draw is unique
]);

const CACHE_PREFIX = 'astro-cache:';

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function profileHash(profile: Profile): string {
  // Simple hash from profile fields that affect results
  const key = [
    profile.burc,
    profile.ad,
    profile['dogum-tarih'],
    profile['dogum-saat'],
    profile['dogum-yer'],
    profile.cinsiyet,
  ].join('|');
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = ((h << 5) - h + key.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

function getCacheKey(tool: ToolId, profile: Profile, lang: string, body: Record<string, unknown>): string {
  // Include body keys that affect the result (exclude profil, uid, crossContext, lang — already covered)
  const bodyKeys = Object.keys(body)
    .filter((k) => !['profil', 'uid', 'crossContext', 'lang'].includes(k))
    .sort()
    .map((k) => `${k}=${JSON.stringify(body[k])}`)
    .join('&');
  return `${CACHE_PREFIX}${tool}:${lang}:${profileHash(profile)}:${getToday()}:${bodyKeys}`;
}

function getCache(key: string): string | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Expire if not from today
    if (parsed.date !== getToday()) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.result || null;
  } catch {
    return null;
  }
}

function setCache(key: string, result: string): void {
  try {
    localStorage.setItem(key, JSON.stringify({ date: getToday(), result }));
  } catch {
    // Storage full — clean old entries and retry
    cleanOldCache();
    try {
      localStorage.setItem(key, JSON.stringify({ date: getToday(), result }));
    } catch { /* give up */ }
  }
}

function cleanOldCache(): void {
  try {
    const today = getToday();
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(CACHE_PREFIX)) keys.push(k);
    }
    for (const k of keys) {
      try {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.date !== today) localStorage.removeItem(k);
        }
      } catch {
        localStorage.removeItem(k);
      }
    }
  } catch { /* ignore */ }
}

interface UseToolApiOptions {
  user: User | null;
  profile: Profile;
  lang: string;
  getCrossContext: (tool: ToolId) => string;
  addCrossResult: (tool: ToolId, result: string) => void;
  t: (key: string) => string;
  onAuthRequired: () => void;
}

export function useToolApi({
  user,
  profile,
  lang,
  getCrossContext,
  addCrossResult,
  t,
  onAuthRequired,
}: UseToolApiOptions) {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [loadingTool, setLoadingTool] = useState<ToolId | null>(null);
  const [streamingTool, setStreamingTool] = useState<ToolId | null>(null);
  const [errorTool, setErrorTool] = useState<Record<string, string>>({});

  const activeToolRef = useRef<ToolId | null>(null);
  activeToolRef.current = activeTool;

  const abortControllerRef = useRef<AbortController | null>(null);

  // Abort in-flight request on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Derived state for current tool
  const result = activeTool ? (results[activeTool] || '') : '';
  const resultLoading = loadingTool === activeTool;
  const streaming = streamingTool === activeTool;
  const error = activeTool ? (errorTool[activeTool] || '') : '';

  const callApi = useCallback(
    async (endpoint: string, body: Record<string, unknown>) => {
      // Abort any previous in-flight request
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const tool = activeToolRef.current;
      if (!tool) return;

      // Check cache for cacheable tools
      if (!NO_CACHE_TOOLS.has(tool)) {
        const cacheKey = getCacheKey(tool, profile, lang, body);
        const cached = getCache(cacheKey);
        if (cached) {
          setResults((prev) => ({ ...prev, [tool]: cached }));
          setErrorTool((prev) => ({ ...prev, [tool]: '' }));
          addCrossResult(tool, cached);
          return;
        }
      }

      setLoadingTool(tool);
      setResults((prev) => ({ ...prev, [tool]: '' }));
      setStreamingTool(null);
      setErrorTool((prev) => ({ ...prev, [tool]: '' }));

      const crossContext = getCrossContext(tool);

      try {
        // Offline detection
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          const offlineMsg = 'İnternet bağlantısı bulunamadı. Lütfen bağlantınızı kontrol edin.';
          setResults((prev) => ({ ...prev, [tool]: '\u274c ' + offlineMsg }));
          setErrorTool((prev) => ({ ...prev, [tool]: offlineMsg }));
          setLoadingTool(null);
          return;
        }

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (user) {
          try {
            const token = await user.getIdToken(true);
            headers['Authorization'] = `Bearer ${token}`;
          } catch {}
        }

        // Timeout: abort after 60 seconds
        const timeoutId = setTimeout(() => controller.abort(), 60_000);

        const requestBody = JSON.stringify({ ...body, profil: profile, lang, uid: user?.uid, crossContext });

        let res: Response;
        try {
          res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: requestBody,
            signal: controller.signal,
          });
        } catch (fetchErr) {
          // Retry once on network error (not abort)
          if (controller.signal.aborted) throw fetchErr;
          await new Promise((r) => setTimeout(r, 1500));
          res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: requestBody,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (res.status === 401) {
          const msg401 = 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.';
          setResults((prev) => ({ ...prev, [tool]: '\u274c ' + msg401 }));
          setErrorTool((prev) => ({ ...prev, [tool]: msg401 }));
          setLoadingTool(null);
          onAuthRequired();
          return;
        }
        if (res.status === 403) {
          const data = await res.json().catch(() => ({ error: 'Erişim reddedildi.' }));
          const msg403 = data.error || 'Bu özelliğe erişim izniniz yok.';
          setResults((prev) => ({ ...prev, [tool]: '\u274c ' + msg403 }));
          setErrorTool((prev) => ({ ...prev, [tool]: msg403 }));
          setLoadingTool(null);
          return;
        }
        if (res.status === 429) {
          const msg429 = 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.';
          setResults((prev) => ({ ...prev, [tool]: '\u274c ' + msg429 }));
          setErrorTool((prev) => ({ ...prev, [tool]: msg429 }));
          setLoadingTool(null);
          return;
        }

        const contentType = res.headers.get('content-type') || '';

        if (contentType.includes('text/event-stream') && res.body) {
          setLoadingTool(null);
          setStreamingTool(tool);
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let lastFull = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n\n');
              buffer = lines.pop() || '';
              for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.error) {
                    setResults((prev) => ({ ...prev, [tool]: '\u274c ' + data.error }));
                    setErrorTool((prev) => ({ ...prev, [tool]: data.error }));
                    setStreamingTool(null);
                    return;
                  }
                  if (data.done) {
                    setResults((prev) => ({ ...prev, [tool]: data.full || '' }));
                    setStreamingTool(null);
                    if (data.full) {
                      addCrossResult(tool, data.full);
                      if (!NO_CACHE_TOOLS.has(tool)) {
                        setCache(getCacheKey(tool, profile, lang, body), data.full);
                      }
                      import('@/lib/capacitor/haptics').then(({ hapticSuccess }) => hapticSuccess()).catch(() => {});
                    }
                    return;
                  }
                  if (data.full) {
                    lastFull = data.full;
                    setResults((prev) => ({ ...prev, [tool]: data.full }));
                  }
                } catch { /* skip malformed chunks */ }
              }
            }
          } catch {
            if (lastFull) {
              setResults((prev) => ({ ...prev, [tool]: lastFull }));
              addCrossResult(tool, lastFull);
              if (!NO_CACHE_TOOLS.has(tool)) {
                setCache(getCacheKey(tool, profile, lang, body), lastFull);
              }
            } else {
              setResults((prev) => ({ ...prev, [tool]: t('err_sunucu') }));
              setErrorTool((prev) => ({ ...prev, [tool]: t('err_sunucu') }));
            }
          }
          setStreamingTool(null);
          return;
        }

        const data = await res.json();
        if (data.ok) {
          setResults((prev) => ({ ...prev, [tool]: data.result }));
          if (data.result) {
            addCrossResult(tool, data.result);
            if (!NO_CACHE_TOOLS.has(tool)) {
              setCache(getCacheKey(tool, profile, lang, body), data.result);
            }
            import('@/lib/capacitor/haptics').then(({ hapticSuccess }) => hapticSuccess()).catch(() => {});
          }
        } else {
          const errMsg = data.error || t('err_sunucu');
          setResults((prev) => ({ ...prev, [tool]: '\u274c ' + errMsg }));
          setErrorTool((prev) => ({ ...prev, [tool]: errMsg }));
          import('@/lib/capacitor/haptics').then(({ hapticError }) => hapticError()).catch(() => {});
        }
      } catch {
        setResults((prev) => ({ ...prev, [tool]: t('err_sunucu') }));
        setErrorTool((prev) => ({ ...prev, [tool]: t('err_sunucu') }));
        import('@/lib/capacitor/haptics').then(({ hapticError }) => hapticError()).catch(() => {});
      } finally {
        setLoadingTool(null);
        setStreamingTool(null);
      }
    },
    [user, profile, lang, getCrossContext, addCrossResult, t, onAuthRequired],
  );

  const clearError = useCallback(() => {
    const tool = activeToolRef.current;
    if (tool) {
      setErrorTool((prev) => ({ ...prev, [tool]: '' }));
    }
  }, []);

  return {
    activeTool,
    setActiveTool,
    result,
    resultLoading,
    streaming,
    error,
    clearError,
    callApi,
  };
}
