import { useEffect, useMemo, useState, useRef } from 'react'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore'
import { db, storage } from '../firebase'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { AnimatePresence, motion } from 'framer-motion'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
	formatDay,
	formatMonthYear,
	isSameDaySafe,
	isSameMonthSafe,
	isTodaySafe,
	nextMonth,
	prevMonth,
	startOfMonthGrid,
	toDateOnlyString,
} from '../utils/date'
import EventDetails from './EventDetails.jsx'
import EventModal from './EventModal.jsx'

export default function CalendarView({ role, user }) {
	const [currentMonth, setCurrentMonth] = useState(new Date())
	const [selectedDate, setSelectedDate] = useState(null)
	const [events, setEvents] = useState([])
	const [expandedEventId, setExpandedEventId] = useState(null)
	const [direction, setDirection] = useState(0)
	const [selectedEvent, setSelectedEvent] = useState(null)
	const [isModalOpen, setModalOpen] = useState(false)
	const isAdmin = role === 'admin'

	useEffect(() => {
		const q = query(collection(db, 'events'))
		const unsub = onSnapshot(q, (snap) => {
			const list = []
			snap.forEach((d) => list.push({ id: d.id, ...d.data() }))
			setEvents(list)
		})
		return () => unsub()
	}, [])

	const gridDays = useMemo(() => startOfMonthGrid(currentMonth), [currentMonth])

	const eventsByDate = useMemo(() => {
		const map = new Map()
		for (const ev of events) {
			const key = ev.date
			if (!map.has(key)) map.set(key, [])
			map.get(key).push(ev)
		}
		return map
	}, [events])

	async function handleCreateOrUpdate(dateOnly, payload, file) {
		let fileMeta = null
		if (file) {
			const fileRef = ref(storage, `attachments/${user.uid}/${Date.now()}_${file.name}`)
			await uploadBytes(fileRef, file)
			const url = await getDownloadURL(fileRef)
			fileMeta = { name: file.name, url, type: file.type, path: fileRef.fullPath }
		}
		const id = payload.id || crypto.randomUUID()
		const data = {
			id,
			title: payload.title,
			description: payload.description,
			date: dateOnly,
			createdBy: user.uid,
			createdAt: Date.now(),
			attachments: fileMeta ? [...(payload.attachments || []), fileMeta] : (payload.attachments || []),
		}
		await setDoc(doc(db, 'events', id), data, { merge: true })
	}

	async function handleDelete(event) {
		if (event.createdBy !== user.uid && !isAdmin) return
		await deleteDoc(doc(db, 'events', event.id))
	}

	const changeMonth = (dir) => {
		setDirection(dir)
		setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + dir, 1))
	}

	const goToToday = () => {
		const today = new Date()
		const direction = today > currentMonth ? 1 : (today < currentMonth ? -1 : 1)
		changeMonth(direction)
	}

	const handleDayClick = (day, events) => {
		console.log('Day cell clicked', day, events)
		// Создаем объект с информацией о дате
		const dateInfo = {
			day: day.getDate(),
			month: day.getMonth() + 1,
			year: day.getFullYear()
		}
		
		console.log("Кнопка дня нажата", dateInfo, events);
		console.log("handleDayClick вызван для даты:", dateInfo.day, dateInfo.month, dateInfo.year);
		
		if (events && events.length > 0) {
			console.log("События для этой даты:", events.length);
			console.log(...events);
			console.log('Устанавливаю selectedEvent:', events[0]);
			setSelectedEvent(events[0]) // пока берём первое событие
			console.log('Открываю модалку');
			setModalOpen(true)
		} else {
			// поведение как раньше при клике на пустой день
			setSelectedDate(day)
		}
	}

	return (
		<div className="max-w-4xl mx-auto relative overflow-hidden">
			<div className="text-center text-2xl font-semibold mb-4">
				{formatMonthYear(currentMonth)}
			</div>

			{/* Calendar with Navigation Arrows */}
			<div className="relative w-full flex items-center justify-between">
				<motion.div
					initial={{ opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.3 }}
				>
					<ChevronLeft
						className="mx-2 cursor-pointer text-gray-700 hover:text-black transition-colors"
						size={24}
						onClick={() => changeMonth(-1)}
					/>
				</motion.div>

				<div className="flex-1">
					<div className="grid grid-cols-7 gap-2.5 mb-4 max-w-4xl mx-auto">
						{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d) => (
							<div key={d} className="text-center font-bold text-xs text-gray-500 py-2">{d}</div>
						))}
					</div>

					<AnimatePresence mode="wait">
						<motion.div
							key={currentMonth.toISOString()}
							initial={{ opacity: 0, x: direction === 1 ? 100 : -100 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: direction === 1 ? -100 : 100 }}
							transition={{ duration: 0.3 }}
							className="grid grid-cols-7 gap-2.5 max-w-4xl mx-auto"
						>
							{gridDays.map((d, idx) => {
								const key = d ? toDateOnlyString(d) : `empty-${idx}`
								const list = d ? (eventsByDate.get(toDateOnlyString(d)) || []) : []
								const isSelected = d && selectedDate && isSameDaySafe(d, selectedDate)
								const isCurrentDay = d && isTodaySafe(d)
								
								return (
									<div 
										key={key} 
										className={`border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-center aspect-square bg-white text-sm min-h-[88px] relative ${
											!d ? 'border-transparent bg-transparent' : ''
										} ${
											isCurrentDay ? 'bg-amber-50' : ''
										} ${
											d ? 'hover:bg-gray-50' : ''
										}`}
									>
										{d ? (
											<button 
												className={`w-full flex items-center justify-between cursor-pointer ${
													isSelected ? 'font-semibold' : ''
												}`}
												style={{ pointerEvents: 'auto' }}
												onClick={() => handleDayClick(d, list)}
											>
												<span>{formatDay(d)}</span>
												{isAdmin && (
													<span className="text-xs text-gray-500">{list.length} событий</span>
												)}
											</button>
										) : null}
										<AnimatePresence>
											{d && isSelected ? (
												<motion.div 
													initial={{ height: 0, opacity: 0 }} 
													animate={{ height: 'auto', opacity: 1 }} 
													exit={{ height: 0, opacity: 0 }} 
													className="mt-2 flex flex-col gap-2"
												>
													{list.length === 0 ? (
														<div className="text-xs text-gray-500">Нет событий</div>
													) : (
														list.map((ev) => (
															<EventDetails 
																key={ev.id} 
																event={ev} 
																user={user} 
																role={role} 
																onUpdate={(payload, file) => handleCreateOrUpdate(toDateOnlyString(d), payload, file)} 
																onDelete={() => handleDelete(ev)} 
															/>
														))
													)}
													{isAdmin && (
														<EventDetails 
															isCreate 
															dateOnly={toDateOnlyString(d)} 
															user={user} 
															role={role} 
															onUpdate={(payload, file) => handleCreateOrUpdate(toDateOnlyString(d), payload, file)} 
														/>
													)}
												</motion.div>
											) : null}
										</AnimatePresence>
									</div>
								)
							})}
						</motion.div>
					</AnimatePresence>
				</div>

				<motion.div
					initial={{ opacity: 0, x: 10 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.3 }}
				>
					<ChevronRight
						className="mx-2 cursor-pointer text-gray-700 hover:text-black transition-colors"
						size={24}
						onClick={() => changeMonth(1)}
					/>
				</motion.div>
			</div>

			{/* Today Button - Centered below grid */}
			<div className="flex justify-center mt-4">
				<button onClick={goToToday} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Сегодня</button>
			</div>

			{isModalOpen && selectedEvent && (
				<>
					{console.log('Проверка перед рендером EventModal:', isModalOpen, selectedEvent)}
					<EventModal
						isOpen={isModalOpen}
						onClose={() => setModalOpen(false)}
						event={selectedEvent}
					/>
				</>
			)}
		</div>
	)
}


