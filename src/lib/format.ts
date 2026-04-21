export const SALON_TIME_ZONE = 'Europe/Moscow';

const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  timeZone: SALON_TIME_ZONE
});

const datePartsFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: SALON_TIME_ZONE
});

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: SALON_TIME_ZONE
});

const weekdayFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'short',
  timeZone: SALON_TIME_ZONE
});

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: SALON_TIME_ZONE
});

const timePartsFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: SALON_TIME_ZONE
});

const parseDate = (value: string) =>
  new Date(value.includes('T') ? value : `${value}T00:00:00+03:00`);

export const getSalonMinutesFromMidnight = (iso: string) => {
  const parts = timePartsFormatter.formatToParts(parseDate(iso));
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');

  return hour * 60 + minute;
};

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatPriceRange = (min: number, max: number | null) =>
  max && max > min ? `${formatCurrency(min)} - ${formatCurrency(max)}` : formatCurrency(min);

export const formatDuration = (durationSec: number) => {
  const minutes = Math.round(durationSec / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const restMinutes = minutes % 60;
    return restMinutes > 0 ? `${hours} ч ${restMinutes} мин` : `${hours} ч`;
  }
  return `${minutes} мин`;
};

export const formatBookingDate = (iso: string) => dateFormatter.format(parseDate(iso));

export const getSalonDate = (value: string) => {
  const parts = datePartsFormatter.formatToParts(parseDate(value));
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const year = parts.find((part) => part.type === 'year')?.value ?? '1970';

  return `${year}-${month}-${day}`;
};

export const formatBookingDateTime = (iso: string) => dateTimeFormatter.format(parseDate(iso));

export const formatTime = (iso: string) => timeFormatter.format(parseDate(iso));

export const formatInputDate = (value: Date) => value.toISOString().slice(0, 10);

export const weekdayLabel = (value: string) => weekdayFormatter.format(parseDate(value));
