/**
 * Shared birth date/time parser for rising and moon-sign use cases.
 * Handles range formats like "06:00-08:00" by taking the midpoint.
 */
export function parseBirthDateTime(dateStr?: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  let hours = 12; // default to noon if no time
  if (timeStr) {
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      hours = parseInt(match[1]);
      const rangeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
      if (rangeMatch) {
        hours = Math.round((parseInt(rangeMatch[1]) + parseInt(rangeMatch[3])) / 2);
      }
    }
  }
  const d = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:00:00`);
  return isNaN(d.getTime()) ? null : d;
}
