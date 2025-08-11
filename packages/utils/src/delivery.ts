import { format, addHours, isAfter, parse, addDays } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { nl } from 'date-fns/locale';
import { DeliveryEstimate, PurmerendDetection } from '@lekker/shared-types';

const TIMEZONE = 'Europe/Amsterdam';
const PURMEREND_POSTAL_PREFIXES = ['1441', '1442', '1443', '1444', '1445', '1446', '1447', '1448'];

export function calculateETA(prepTimeHours: number, cutoffTime: string): DeliveryEstimate {
  const now = utcToZonedTime(new Date(), TIMEZONE);
  const cutoff = parse(cutoffTime, 'HH:mm', now);
  
  let baseDate = now;
  if (isAfter(now, cutoff)) {
    baseDate = addDays(now, 1);
  }
  
  const eta = addHours(baseDate, prepTimeHours);
  
  return {
    eta_iso: zonedTimeToUtc(eta, TIMEZONE).toISOString(),
    eta_label: getLabel(eta, now),
    eta_range: getTimeRange(eta)
  };
}

function getLabel(eta: Date, now: Date): string {
  const etaDate = format(eta, 'yyyy-MM-dd');
  const todayDate = format(now, 'yyyy-MM-dd');
  const tomorrowDate = format(addDays(now, 1), 'yyyy-MM-dd');
  
  if (etaDate === todayDate) return 'Vandaag';
  if (etaDate === tomorrowDate) return 'Morgen';
  return format(eta, 'EEEE d MMMM', { locale: nl });
}

function getTimeRange(eta: Date): string {
  const startHour = eta.getHours();
  const endHour = Math.min(startHour + 3, 21);
  const startTime = startHour.toString().padStart(2, '0') + ':00';
  const endTime = endHour.toString().padStart(2, '0') + ':00';
  return `${startTime}–${endTime}`;
}

export function isPurmerend(city?: string, postalCode?: string): PurmerendDetection {
  if (city?.toLowerCase() === 'purmerend') {
    return { isPurmerend: true, reason: 'city' };
  }
  
  if (postalCode) {
    const prefix = postalCode.substring(0, 4);
    if (PURMEREND_POSTAL_PREFIXES.includes(prefix)) {
      return { isPurmerend: true, reason: 'postal_code' };
    }
  }
  
  return { isPurmerend: false, reason: 'none' };
}

export function formatPrice(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency
  }).format(amount / 100);
}

export function getCurrentTimeInAmsterdam(): Date {
  return utcToZonedTime(new Date(), TIMEZONE);
}