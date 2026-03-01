import * as Astronomy from 'astronomy-engine';

export interface PlanetaryHour {
  planet: string;
  start: Date;
  end: Date;
  isDayHour: boolean;
  index: number;
}

export interface PlanetaryHoursResult {
  dayRuler: string;
  sunrise: Date;
  sunset: Date;
  hours: PlanetaryHour[];
  currentHourIndex: number;
}

// Chaldean order (slowest to fastest)
const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

// Day ruler by day-of-week: Sun=0, Mon=1, ...
const DAY_RULERS: Record<number, string> = {
  0: 'Sun',
  1: 'Moon',
  2: 'Mars',
  3: 'Mercury',
  4: 'Jupiter',
  5: 'Venus',
  6: 'Saturn',
};

// Default observer: Istanbul
const defaultObserver = new Astronomy.Observer(41.01, 28.98, 0);

export function calculatePlanetaryHours(date?: Date, observer?: Astronomy.Observer): PlanetaryHoursResult {
  const now = date || new Date();
  const obs = observer || defaultObserver;

  // Get today's sunrise and sunset
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const sunriseResult = Astronomy.SearchRiseSet('Sun' as Astronomy.Body, obs, +1, todayStart, 1);
  const sunsetResult = Astronomy.SearchRiseSet('Sun' as Astronomy.Body, obs, -1, todayStart, 1);

  const sunrise = sunriseResult ? sunriseResult.date : new Date(todayStart.getTime() + 6 * 3600000);
  const sunset = sunsetResult ? sunsetResult.date : new Date(todayStart.getTime() + 18 * 3600000);

  // Next day sunrise for night hours
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const nextSunriseResult = Astronomy.SearchRiseSet('Sun' as Astronomy.Body, obs, +1, tomorrowStart, 1);
  const nextSunrise = nextSunriseResult ? nextSunriseResult.date : new Date(tomorrowStart.getTime() + 6 * 3600000);

  const dayDuration = sunset.getTime() - sunrise.getTime();
  const nightDuration = nextSunrise.getTime() - sunset.getTime();
  const dayHourMs = dayDuration / 12;
  const nightHourMs = nightDuration / 12;

  // Day ruler
  const dayOfWeek = now.getDay();
  const dayRuler = DAY_RULERS[dayOfWeek];

  // Find starting index in Chaldean order for the day ruler
  const rulerIdx = CHALDEAN_ORDER.indexOf(dayRuler);

  const hours: PlanetaryHour[] = [];
  let currentHourIndex = -1;

  // 12 day hours + 12 night hours
  for (let i = 0; i < 24; i++) {
    const isDayHour = i < 12;
    const start = isDayHour
      ? new Date(sunrise.getTime() + i * dayHourMs)
      : new Date(sunset.getTime() + (i - 12) * nightHourMs);
    const end = isDayHour
      ? new Date(sunrise.getTime() + (i + 1) * dayHourMs)
      : new Date(sunset.getTime() + (i - 11) * nightHourMs);

    const planetIdx = (rulerIdx + i) % 7;
    const planet = CHALDEAN_ORDER[planetIdx];

    if (now >= start && now < end) {
      currentHourIndex = i;
    }

    hours.push({ planet, start, end, isDayHour, index: i });
  }

  return { dayRuler, sunrise, sunset, hours, currentHourIndex };
}
