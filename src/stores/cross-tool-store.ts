import { create } from 'zustand';

interface ToolResult {
  tool: string;
  summary: string;
  timestamp: number;
}

interface CrossToolState {
  results: ToolResult[];
  addResult: (tool: string, fullText: string) => void;
  getContext: (excludeTool?: string) => string;
  clear: () => void;
}

function extractSummary(text: string, maxLen = 300): string {
  // Try to extract the "Kısa Özet" / "Summary" section first
  const summaryMatch = text.match(/##\s*(Kısa Özet|Summary)\s*\n([\s\S]*?)(?=\n##|$)/i);
  if (summaryMatch) {
    return summaryMatch[2].trim().substring(0, maxLen);
  }
  // Fallback: first meaningful paragraph
  const lines = text.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
  return lines.slice(0, 3).join(' ').substring(0, maxLen);
}

const TOOL_LABELS: Record<string, string> = {
  burc: 'Burç Analizi',
  gunluk: 'Günlük Yorum',
  uyum: 'Uyum Analizi',
  num: 'Numeroloji',
  yuk: 'Yükselen Analizi',
  kosm: 'Kozmik Enerji',
  ruya: 'Rüya Yorumu',
  horar: 'Horary Analiz',
  el: 'El Falı',
  'ay-takvimi': 'Ay Takvimi',
  'gezegen-saatleri': 'Gezegen Saatleri',
  rituel: 'Günlük Ritüel',
};

export const useCrossToolStore = create<CrossToolState>((set, get) => ({
  results: [],

  addResult: (tool, fullText) => {
    const summary = extractSummary(fullText);
    if (!summary) return;
    set((state) => {
      // Replace existing result for same tool, keep max 5
      const filtered = state.results.filter((r) => r.tool !== tool);
      return {
        results: [...filtered, { tool, summary, timestamp: Date.now() }].slice(-5),
      };
    });
  },

  getContext: (excludeTool) => {
    const results = get().results.filter((r) => r.tool !== excludeTool);
    if (results.length === 0) return '';
    const lines = results.map(
      (r) => `[${TOOL_LABELS[r.tool] || r.tool}]: ${r.summary}`,
    );
    return `\n\nÖnceki Analizlerden Bağlam (bu bilgileri mevcut analizle ilişkilendir, "önceki analizinize göre" gibi referanslar ver):\n${lines.join('\n')}`;
  },

  clear: () => set({ results: [] }),
}));
