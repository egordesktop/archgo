// src/utils/buildMonthMatrix.js
import { startOfDay } from './dateUtils';

/**
 * month: 0-11
 * Возвращает массив из 42 элементов (7x6). Пн=0.
 */
export function buildMonthMatrix(year, month) {
  // Нормализуем "опорные" даты к полуночи локального времени
  const firstOfMonth = startOfDay(new Date(year, month, 1));
  const daysInCurr  = new Date(year, month + 1, 0).getDate();

  // Пн=0...Вс=6
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;

  const cells = [];

  // Хвост предыдущего месяца
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = startOfDay(new Date(year, month, -i));
    cells.push({ date: d, inCurrentMonth: false });
  }

  // Текущий месяц
  for (let day = 1; day <= daysInCurr; day++) {
    const d = startOfDay(new Date(year, month, day));
    cells.push({ date: d, inCurrentMonth: true });
  }

  // Хвост следующего месяца до 42 элементов
  let nextDay = 1;
  while (cells.length < 42) {
    const d = startOfDay(new Date(year, month + 1, nextDay++));
    cells.push({ date: d, inCurrentMonth: false });
  }

  return cells;
}
