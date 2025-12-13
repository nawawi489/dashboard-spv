export const getTodayDateJakarta = (): string => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    const now = new Date();
    // Fallback: adjust offset to approximate Jakarta (+7)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const jakarta = new Date(utc + (7 * 60 * 60000));
    const y = jakarta.getFullYear();
    const m = String(jakarta.getMonth() + 1).padStart(2, '0');
    const d = String(jakarta.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
};
