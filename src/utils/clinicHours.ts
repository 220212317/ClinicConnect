export type ClinicOpenStatus = 'open' | 'closed' | 'closing_soon' | 'unknown';

export interface ClinicStatusResult {
  status: ClinicOpenStatus;
  label: string;
}

interface DaySegment {
  days: number[]; 
  openMinutes: number;
  closeMinutes: number;
}

const DAY_NAMES: Record<string, number> = {
  mon: 0, monday: 0,
  tue: 1, tues: 1, tuesday: 1,
  wed: 2, weds: 2, wednesday: 2,
  thu: 3, thur: 3, thurs: 3, thursday: 3,
  fri: 4, friday: 4,
  sat: 5, saturday: 5,
  sun: 6, sunday: 6,
};

const DAY_TOKEN_RE = /\b(mon(?:day)?|tue(?:s(?:day)?)?|wed(?:s|nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/gi;

function parseDayList(segment: string): number[] | null {
  const tokens = [...segment.matchAll(DAY_TOKEN_RE)].map((m) => DAY_NAMES[m[1].toLowerCase()]);
  if (tokens.length === 0) return null;

  
  const isRange = /-|–|to/i.test(segment) && tokens.length >= 2 && !segment.includes(',');

  if (isRange) {
    const start = tokens[0];
    const end = tokens[tokens.length - 1];
    const days: number[] = [];
    let d = start;
    
    for (let i = 0; i < 7; i++) {
      days.push(d);
      if (d === end) break;
      d = (d + 1) % 7;
    }
    return days;
  }

  return [...new Set(tokens)];
}

function parseTimeToken(raw: string): number | null {
  const match = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3]?.toLowerCase();

  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;

  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function parseTimeRange(segment: string): { open: number; close: number } | null {
  const match = segment.match(
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|–|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i
  );
  if (!match) return null;

  const open = parseTimeToken(match[1]);
  const close = parseTimeToken(match[2]);
  if (open === null || close === null) return null;

  return { open, close };
}


export function parseOperatingHours(hoursText: string | null | undefined): DaySegment[] | 'always_open' | null {
  if (!hoursText || !hoursText.trim()) return null;

  if (/24\s*\/\s*7|24[\s-]*hours?|open\s*24|round[\s-]the[\s-]clock/i.test(hoursText)) {
    return 'always_open';
  }

  const timeRangeGlobalRe = /\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*(?:-|–|to)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi;
  const timeRangeCount = (hoursText.match(timeRangeGlobalRe) || []).length;

  
  if (timeRangeCount <= 1) {
    const days = parseDayList(hoursText);
    const times = parseTimeRange(hoursText);
    if (days && times) {
      return [{ days, openMinutes: times.open, closeMinutes: times.close }];
    }
    return null;
  }

  const segments: DaySegment[] = [];
  for (const chunk of hoursText.split(/[,;]/)) {
    const days = parseDayList(chunk);
    const times = parseTimeRange(chunk);
    if (days && times) {
      segments.push({ days, openMinutes: times.open, closeMinutes: times.close });
    }
  }

  return segments.length > 0 ? segments : null;
}

const CLOSING_SOON_WINDOW_MINUTES = 30;


export function getClinicStatus(hoursText: string | null | undefined, now: Date = new Date()): ClinicStatusResult {
  const parsed = parseOperatingHours(hoursText);

  if (parsed === null) {
    return { status: 'unknown', label: 'Hours unavailable' };
  }

  if (parsed === 'always_open') {
    return { status: 'open', label: 'Open 24 hours' };
  }

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const weekdayShort = parts.find((p) => p.type === 'weekday')?.value.toLowerCase() ?? '';
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
  const today = DAY_NAMES[weekdayShort];
  const nowMinutes = hour * 60 + minute;

  const todaySegment = parsed.find((seg) => seg.days.includes(today));

  if (!todaySegment) {
    return { status: 'closed', label: 'Closed today' };
  }

  const { openMinutes, closeMinutes } = todaySegment;
  
  const spansMidnight = closeMinutes <= openMinutes;
  const isOpen = spansMidnight
    ? nowMinutes >= openMinutes || nowMinutes < closeMinutes
    : nowMinutes >= openMinutes && nowMinutes < closeMinutes;

  if (!isOpen) {
    return { status: 'closed', label: 'Closed' };
  }

  const minutesUntilClose = spansMidnight && nowMinutes >= openMinutes
    ? (24 * 60 - nowMinutes) + closeMinutes
    : closeMinutes - nowMinutes;

  if (minutesUntilClose <= CLOSING_SOON_WINDOW_MINUTES) {
    return { status: 'closing_soon', label: `Closes in ${minutesUntilClose} min` };
  }

  return { status: 'open', label: 'Open' };
}
