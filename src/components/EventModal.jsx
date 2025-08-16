import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function EventModal({ isOpen, onClose, event, events }) {
	console.log('=== Рендер EventModal ===', event, events);

	// Используем events если есть, иначе fallback на event
	const eventsToShow = events || (event ? [event] : []);
	
	if (eventsToShow.length === 0) return null

	const [isDesktop, setIsDesktop] = useState(false)

	useEffect(() => {
		const checkScreenSize = () => {
			setIsDesktop(window.innerWidth >= 768)
		}
		
		checkScreenSize()
		window.addEventListener('resize', checkScreenSize)
		
		return () => window.removeEventListener('resize', checkScreenSize)
	}, [])

	// Блокировка прокрутки при открытой модалке
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
		
		return () => {
			document.body.style.overflow = ''
		}
	}, [isOpen])

	// Анимация фона
	const backdropVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 0.5, transition: { duration: 0.4, ease: "easeOut" } },
		exit: { opacity: 0, transition: { duration: 0.4, ease: "easeOut" } }
	};

	// Анимация модалки - всегда выезжает справа
	const modalVariants = {
		hidden: { x: "100%", opacity: 0 },
		visible: { x: "0%", opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
		exit: { x: "100%", opacity: 0, transition: { duration: 0.4, ease: "easeOut" } }
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Фон-затемнение */}
					<motion.div
						className="fixed inset-0 bg-black z-40"
						variants={backdropVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						onClick={onClose}
					/>
					
					{/* Модальное окно */}
					<motion.div
						className={`fixed z-50 bg-white shadow-lg ${
							isDesktop
								? "top-0 right-0 h-full w-[384px] rounded-none"
								: "bottom-4 right-4 w-[320px] h-auto rounded-xl"
						}`}
						variants={modalVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						onClick={(e) => e.stopPropagation()}
					>
						<div className={`overflow-y-auto ${
							isDesktop ? "h-full p-6" : "p-4"
						}`}>
							<div className="space-y-4">
								<div className="flex items-start justify-between">
									<h2 className="text-xl font-semibold text-gray-900 pr-4">
										{eventsToShow.length > 1 ? `События (${eventsToShow.length})` : eventsToShow[0].title}
									</h2>
									<button
										onClick={onClose}
										className="text-gray-400 hover:text-gray-600"
									>
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
								
								{eventsToShow.map((eventItem, index) => (
									<div key={eventItem.id || index} className="border-b border-gray-200 pb-4 last:border-b-0">
										{eventsToShow.length > 1 && (
											<div className="text-sm text-gray-600 mb-2">
												<strong>Дата:</strong> {format(new Date(eventItem.date), 'dd MMMM yyyy', { locale: ru })}
											</div>
										)}
										{eventsToShow.length === 1 && (
											<div className="text-sm text-gray-600">
												<strong>Дата:</strong> {format(new Date(eventItem.date), 'dd MMMM yyyy', { locale: ru })}
											</div>
										)}
										{eventsToShow.length > 1 && (
											<h3 className="text-lg font-medium text-gray-900 mb-2">
												{eventItem.title}
											</h3>
										)}
										{eventItem.description && (
											<div>
												<h3 className="text-sm font-medium text-gray-700 mb-2">Описание:</h3>
												<div className="text-gray-600 whitespace-pre-wrap">
													{eventItem.description}
												</div>
											</div>
										)}
										{eventItem.attachments?.length > 0 && (
											<div>
												<h3 className="text-sm font-medium text-gray-700 mb-2">Файлы:</h3>
												<div className="space-y-2">
													{eventItem.attachments.map((attachment, index) => (
														<div key={index} className="flex items-center gap-2">
															<a
																href={attachment.url}
																target="_blank"
																rel="noopener noreferrer"
																className="text-blue-600 hover:text-blue-800 underline text-sm"
															>
																{attachment.name}
															</a>
														</div>
													))}
												</div>
											</div>
										)}
										<div className="text-xs text-gray-500 pt-2 border-t">
											Создано: {format(new Date(eventItem.createdAt), 'dd.MM.yyyy в HH:mm', { locale: ru })}
										</div>
									</div>
								))}
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	)
}
