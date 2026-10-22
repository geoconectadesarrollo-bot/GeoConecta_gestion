export const formatCurrency = (amount, currency = 'CLP') => {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatHours = (hours) => {
  if (isNaN(hours) || hours === null || hours === undefined) return '0 hrs';
  return `${Number(hours).toFixed(1)} hrs`;
};

export const formatPercent = (fraction) => {
  if (isNaN(fraction) || fraction === null || fraction === undefined) return '0%';
  return `${(fraction * 100).toFixed(1)}%`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    if (day && month && year) {
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};
