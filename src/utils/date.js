import { addMonths, endOfMonth, format, getDay, isSameDay, isSameMonth, isToday, parseISO, startOfMonth, subMonths } from 'date-fns'

// Массив названий месяцев в именительном падеже
const monthsNominative = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

export function startOfMonthGrid(currentDate) {
	const start = startOfMonth(currentDate)
	const end = endOfMonth(currentDate)
	const days = []
	const startWeekday = (getDay(start) + 6) % 7 // make Monday=0
	for (let i = 0; i < startWeekday; i++) {
		days.push(null)
	}
	for (let d = 1; d <= end.getDate(); d++) {
		days.push(new Date(start.getFullYear(), start.getMonth(), d))
	}
	return days
}

export function formatDay(date) {
	return format(date, 'dd')
}

export function formatMonthYear(date) {
	const monthName = monthsNominative[date.getMonth()]
	const year = date.getFullYear()
	return `${monthName} ${year}`
}

export function prevMonth(date) {
	return subMonths(date, 1)
}

export function nextMonth(date) {
	return addMonths(date, 1)
}

export function isSameDaySafe(a, b) {
	if (!a || !b) return false
	return isSameDay(a, b)
}

export function isTodaySafe(d) {
	if (!d) return false
	return isToday(d)
}

export function isSameMonthSafe(date, monthRef) {
	return isSameMonth(date, monthRef)
}

export function toDateOnlyString(date) {
	return format(date, 'yyyy-MM-dd')
}

export function fromDateOnlyString(value) {
	return parseISO(value)
}


