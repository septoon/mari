const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long'
});

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit'
});

const weekdayFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'short'
});

const parseDate = (value: string) => new Date(value.includes('T') ? value : `${value}T00:00:00`);

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

export const formatBookingDateTime = (iso: string) => dateTimeFormatter.format(parseDate(iso));

export const formatTime = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(parseDate(iso));

export const formatInputDate = (value: Date) => value.toISOString().slice(0, 10);

export const weekdayLabel = (value: string) => weekdayFormatter.format(parseDate(value));
