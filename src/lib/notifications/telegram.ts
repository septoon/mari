import 'server-only';

import type { CreateAppointmentInput, CreatedAppointment } from '@/lib/api/contracts';
import {
  APPOINTMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS
} from '@/lib/appointment-labels';
import { formatCurrency, formatDuration } from '@/lib/format';
import { siteConfig } from '@/lib/site';

const SALON_TIME_ZONE = 'Europe/Simferopol';

const appointmentDateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  timeZone: SALON_TIME_ZONE,
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

const sentAtFormatter = new Intl.DateTimeFormat('ru-RU', {
  timeZone: SALON_TIME_ZONE,
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

const formatAppointmentDateTime = (value: string) => appointmentDateTimeFormatter.format(new Date(value));

const formatSentAt = () => sentAtFormatter.format(new Date());

const buildServicesBlock = (appointment: CreatedAppointment['appointment']) =>
  appointment.services
    .map((service, index) => {
      const basePrice = formatCurrency(service.price);
      const finalPrice = formatCurrency(service.priceWithDiscount);
      const priceLabel =
        service.priceWithDiscount < service.price
          ? `${finalPrice} вместо ${basePrice}`
          : finalPrice;

      return `${index + 1}. ${service.name}
   Длительность: ${formatDuration(service.durationSec)}
   Стоимость: ${priceLabel}`;
    })
    .join('\n');

const buildTelegramAppointmentMessage = ({
  appointment,
  input
}: {
  appointment: CreatedAppointment['appointment'];
  input: CreateAppointmentInput;
}) => {
  const clientName = input.client?.name?.trim() || appointment.client.name?.trim() || 'Не указано';
  const clientPhone = input.client?.phone?.trim() || 'Не указан';
  const comment = input.comment?.trim();
  const promoCode = input.promoCode?.trim() || appointment.promo?.code || null;
  const durationSec = appointment.services.reduce((total, service) => total + service.durationSec, 0);

  const lines = [
    'Новая запись с сайта',
    '',
    `Салон: ${siteConfig.name}`,
    `Адрес: ${siteConfig.address}`,
    `Оформлено: ${formatSentAt()}`,
    'Источник: Онлайн-запись /booking',
    '',
    'Запись:',
    `- Номер: ${appointment.externalId}`,
    `- Статус: ${APPOINTMENT_STATUS_LABELS[appointment.status]}`,
    `- Дата и время: ${formatAppointmentDateTime(appointment.startAt)}`,
    `- Специалист: ${appointment.staff.name}`,
    `- Общая длительность: ${formatDuration(durationSec)}`,
    '',
    'Клиент:',
    `- Имя: ${clientName}`,
    `- Телефон: ${clientPhone}`,
    '',
    'Услуги:',
    buildServicesBlock(appointment),
    '',
    'Стоимость:',
    `- Базовая сумма: ${formatCurrency(appointment.prices.baseTotal)}`,
    `- Скидка: ${formatCurrency(appointment.prices.discountAmount)}`,
    `- К оплате: ${formatCurrency(appointment.prices.finalTotal)}`,
    '',
    'Оплата:',
    `- Статус: ${PAYMENT_STATUS_LABELS[appointment.payment.status]}`,
    `- Способ: ${PAYMENT_METHOD_LABELS[appointment.payment.method]}`,
    `- Оплачено: ${formatCurrency(appointment.payment.paidAmount)}`
  ];

  if (promoCode) {
    lines.push('', `Промокод: ${promoCode}`);
  }

  if (comment) {
    lines.push('', `Комментарий клиента: ${comment}`);
  }

  return lines.join('\n');
};

export const sendAppointmentToTelegramChannel = async ({
  appointment,
  input
}: {
  appointment: CreatedAppointment['appointment'];
  input: CreateAppointmentInput;
}) => {
  const botToken = process.env.NEXT_PUBLIC_BOT_ID?.trim();
  const channelId = process.env.NEXT_PUBLIC_CHANNEL_ID?.trim();

  if (!botToken || !channelId) {
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: channelId,
      text: buildTelegramAppointmentMessage({ appointment, input }),
      disable_web_page_preview: true
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Telegram HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { ok?: boolean; description?: string };

  if (!payload.ok) {
    throw new Error(payload.description || 'Telegram sendMessage failed');
  }
};
