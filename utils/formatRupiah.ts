export const formatRupiah = (value: number): string => {
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
  } catch {
    const n = Math.round(Number(value) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp${n}`;
  }
};
