import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, setDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../firebase';
import { formatMonthYear, startOfMonthGrid, toDateOnlyString, isTodaySafe } from '../utils/date';
import DeadlinesList from './DeadlinesList';
import EventModal from './EventModal';
import './NewCalendarView.css';

const NewCalendarView = ({ role, user }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 7, 1)); // Август 2025
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' или 'deadlines'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  
  // Состояние для анимации перелистывания
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState(''); // 'left' или 'right'

  // Загрузка событий из Firebase
  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setEvents(list);
      
      // Если событий нет, создаем тестовые события
      if (list.length === 0) {
        createTestEvents();
      }
    });
    return () => unsub();
  }, []);

  // Функция для создания тестовых событий
  const createTestEvents = async () => {
    const testEvents = [
      {
        id: 'test-event-1',
        title: 'Встреча команды',
        description: 'Обсуждение проекта архитектурного календаря',
        date: '2025-08-14',
        createdBy: user?.uid || 'test-user',
        createdAt: Date.now(),
        attachments: []
      },
      {
        id: 'test-event-2',
        title: 'Презентация проекта',
        description: 'Демонстрация готового календаря',
        date: '2025-08-14',
        createdBy: user?.uid || 'test-user',
        createdAt: Date.now(),
        attachments: []
      }
    ];

    try {
      for (const event of testEvents) {
        await setDoc(doc(db, 'events', event.id), event);
      }
    } catch (error) {
      console.error('Ошибка при создании тестовых событий:', error);
    }
  };

  const gridDays = useMemo(() => startOfMonthGrid(currentMonth), [currentMonth]);

  const eventsByDate = useMemo(() => {
    const map = new Map();
    for (const ev of events) {
      const key = ev.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    return map;
  }, [events]);

  const changeMonth = (dir) => {
    if (isAnimating) return; // Блокируем клики во время анимации
    
    setIsAnimating(true);
    setAnimationDirection(dir > 0 ? 'right' : 'left');
    
    // Запускаем анимацию с задержкой для плавного перехода
    setTimeout(() => {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
      // Сбрасываем анимацию после смены данных
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDirection('');
      }, 50);
    }, 300); // Длительность анимации
  };

  const goToToday = () => {
    setCurrentMonth(new Date(2025, 7, 1)); // Возвращаем к августу 2025 для демонстрации
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const handleDayClick = (day, dayEvents) => {
    if (dayEvents && dayEvents.length > 0) {
      setSelectedEvent(dayEvents[0]); // Показываем первое событие
      setModalOpen(true);
    }
  };

  const handleAddEvent = (day) => {
    console.log('Добавить событие для даты:', toDateOnlyString(day));
  };

  // SVG иконки стрелок навигации
  const ArrowLeft = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const ArrowRight = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="calendar-container">
      {/* Верхний заголовок */}
      <div className="app-header">
        <h1 className="app-title">
          Architectural Calendar Group Events
        </h1>
        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Выйти
        </button>
      </div>

      {/* Панель переключения */}
      <div className="tabs-container">
        <div className="tabs-wrapper">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
          >
            Календарь
          </button>
          <button
            onClick={() => setActiveTab('deadlines')}
            className={`tab-button ${activeTab === 'deadlines' ? 'active' : ''}`}
          >
            Список дедлайнов
          </button>
        </div>
      </div>

      {/* Контент в зависимости от активной вкладки */}
      {activeTab === 'calendar' ? (
        <div className="calendar-view">
          {/* Заголовок месяца */}
          <div className="month-header">
            {formatMonthYear(currentMonth)}
          </div>

          {/* Контейнер календаря с анимацией */}
          <div className="calendar-wrapper">
            {/* Левая стрелка навигации */}
            <button
              onClick={() => changeMonth(-1)}
              className="calendar-nav-arrow calendar-nav-arrow-left"
              disabled={isAnimating}
            >
              <ArrowLeft />
            </button>

            {/* Основной контент календаря с Framer Motion */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
                className="calendar-content"
                initial={{ 
                  x: animationDirection === 'right' ? 300 : -300,
                  opacity: 0 
                }}
                animate={{ 
                  x: 0,
                  opacity: 1 
                }}
                exit={{ 
                  x: animationDirection === 'right' ? -300 : 300,
                  opacity: 0 
                }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeInOut"
                }}
              >
                {/* Заголовки дней недели */}
                <div className="weekdays-header">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                    <div key={day} className="weekday">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Сетка календаря */}
                <div className="calendar-grid">
                  {gridDays.map((day, index) => {
                    const key = day ? toDateOnlyString(day) : `empty-${index}`;
                    const dayEvents = day ? (eventsByDate.get(toDateOnlyString(day)) || []) : [];
                    const isCurrentDay = day && isTodaySafe(day);
                    const isCurrentMonth = day && day.getMonth() === currentMonth.getMonth();

                    return (
                      <div
                        key={key}
                        className={`calendar-day calendar-date ${
                          !day ? 'empty' : ''
                        } ${
                          dayEvents.length > 0 ? 'has-events' : ''
                        } ${
                          day && day.getMonth() !== currentMonth.getMonth() ? 'other-month' : ''
                        }`}
                        onClick={() => day && handleDayClick(day, dayEvents)}
                      >
                        {day && (
                          <>
                            <div className="day-number">
                              {day.getDate()}
                              {dayEvents.length > 0 && (
                                <span className="event-indicator">•</span>
                              )}
                            </div>
                            {dayEvents.length > 0 && (
                              <div className="events-count">
                                {dayEvents.length} событий
                              </div>
                            )}
                            <button
                              className="add-event-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddEvent(day);
                              }}
                              title="Добавить событие"
                            >
                              +
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Правая стрелка навигации */}
            <button
              onClick={() => changeMonth(1)}
              className="calendar-nav-arrow calendar-nav-arrow-right"
              disabled={isAnimating}
            >
              <ArrowRight />
            </button>
          </div>

          {/* Кнопка "Сегодня" */}
          <div className="today-button-container">
            <button
              onClick={goToToday}
              className="today-button"
            >
              Сегодня
            </button>
          </div>
        </div>
      ) : (
        <DeadlinesList role={role} user={user} />
      )}

      {/* Модальное окно для событий */}
      {isModalOpen && selectedEvent && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          event={selectedEvent}
        />
      )}
    </div>
  );
};

export default NewCalendarView;
