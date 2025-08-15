// src/utils/dateFormat.js
export const formatMonthYear = (date) => {
  const month = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date); // только месяц => НОМИНАТИВ
  const year = date.getFullYear();
  const capitalized = month.replace(/^\p{L}/u, (c) => c.toUpperCase());
  return `${capitalized} ${year}`;
};
