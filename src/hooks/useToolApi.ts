'use client';

import { useState, useRef, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { ToolId, Profile } from '@/types/profile';

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

  const activeToolRef = useRef<ToolId | null>(null);
  activeToolRef.current = activeTool;

  // Derived state for current tool
  const result = activeTool ? (results[activeTool] || '') : '';
  const resultLoading = loadingTool === activeTool;
  const streaming = streamingTool === activeTool;

  const callApi = useCallback(
    async (endpoint: string, body: Record<string, unknown>) => {
      const tool = activeToolRef.current;
      if (!tool) return;

      setLoadingTool(tool);
      setResults((prev) => ({ ...prev, [tool]: '' }));
      setStreamingTool(null);

      const crossContext = getCrossContext(tool);

      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (user) {
          try {
            const token = await user.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
          } catch {}
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({ ...body, profil: profile, lang, uid: user?.uid, crossContext }),
        });

        if (res.status === 401) {
          setResults((prev) => ({ ...prev, [tool]: '\u274c Oturum süresi dolmuş. Lütfen tekrar giriş yapın.' }));
          setLoadingTool(null);
          onAuthRequired();
          return;
        }
        if (res.status === 403) {
          const data = await res.json().catch(() => ({ error: 'Erişim reddedildi.' }));
          setResults((prev) => ({ ...prev, [tool]: '\u274c ' + (data.error || 'Bu özelliğe erişim izniniz yok.') }));
          setLoadingTool(null);
          return;
        }
        if (res.status === 429) {
          setResults((prev) => ({ ...prev, [tool]: '\u274c Çok fazla istek gönderildi. Lütfen biraz bekleyin.' }));
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
                    setStreamingTool(null);
                    return;
                  }
                  if (data.done) {
                    setResults((prev) => ({ ...prev, [tool]: data.full || '' }));
                    setStreamingTool(null);
                    if (data.full) {
                      addCrossResult(tool, data.full);
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
            } else {
              setResults((prev) => ({ ...prev, [tool]: t('err_sunucu') }));
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
            import('@/lib/capacitor/haptics').then(({ hapticSuccess }) => hapticSuccess()).catch(() => {});
          }
        } else {
          setResults((prev) => ({ ...prev, [tool]: '\u274c ' + (data.error || t('err_sunucu')) }));
          import('@/lib/capacitor/haptics').then(({ hapticError }) => hapticError()).catch(() => {});
        }
      } catch {
        setResults((prev) => ({ ...prev, [tool]: t('err_sunucu') }));
        import('@/lib/capacitor/haptics').then(({ hapticError }) => hapticError()).catch(() => {});
      } finally {
        setLoadingTool(null);
        setStreamingTool(null);
      }
    },
    [user, profile, lang, getCrossContext, addCrossResult, t, onAuthRequired],
  );

  return {
    activeTool,
    setActiveTool,
    result,
    resultLoading,
    streaming,
    callApi,
  };
}
