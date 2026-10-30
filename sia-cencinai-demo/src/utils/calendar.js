export function moveMonth(month, offset) {
  const [year, number] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, number - 1 + offset, 1));
  return date.toISOString().slice(0, 7);
}

export function monthLabel(month) {
  const label = new Intl.DateTimeFormat('es-CR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Monday-first grid. UTC arithmetic keeps local timezone/DST out of date-only keys.
export function calendarDays(month, activities) {
  const [year, number] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, number - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const total = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return Array.from({ length: Math.ceil((offset + total) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    if (day < 1 || day > total) return null;
    const date = `${month}-${String(day).padStart(2, '0')}`;
    return { day, date, activities: activities.filter(item => item.date === date) };
  });
}
