export const normalizePhoneDigits = (value: string) => {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if ((digits.startsWith('7') || digits.startsWith('8')) && digits.length > 10) {
    return digits.slice(1, 11);
  }

  return digits.slice(0, 10);
};

export const normalizePhonePaste = (value: string) => {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return digits.slice(1);
  }

  return digits.length > 10 ? digits.slice(-10) : digits;
};

export const toPhoneE164 = (phoneTail: string) => {
  const digits = phoneTail.trim();
  return digits ? `+7${digits}` : '';
};

export const fromPhoneE164 = (value: string | null | undefined) => {
  if (!value) {
    return '';
  }

  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return digits.slice(1);
  }

  return digits.slice(-10);
};
