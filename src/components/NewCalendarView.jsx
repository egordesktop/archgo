import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, setDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar } from 'react-icons/fi';
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
  
  // Состояние для выделения сегодняшней даты
  const [highlightedToday, setHighlightedToday] = useState(false);
  const [todayElement, setTodayElement] = useState(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Состояние для формы нового события
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    description: ''
  });
  const [selectedDate, setSelectedDate] = useState(null);

  // Функции для управления модальным окном
  const openModal = (date) => {
    setSelectedDate(date);
    setNewEventForm({ title: '', description: '' });
    document.getElementById('modal').classList.add('active');
  };

  const closeModal = () => {
    document.getElementById('modal').classList.remove('active');
    setSelectedDate(null);
    setNewEventForm({ title: '', description: '' });
  };

  // Обработчик изменения полей формы
  const handleFormChange = (field, value) => {
    setNewEventForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Обработчик сохранения нового события
  const handleSaveEvent = async () => {
    if (!newEventForm.title.trim() || !selectedDate) {
      return;
    }

    const eventData = {
      id: Date.now().toString(),
      title: newEventForm.title.trim(),
      description: newEventForm.description.trim(),
      date: toDateOnlyString(selectedDate),
      createdBy: user?.uid || 'anonymous',
      createdAt: Date.now(),
      attachments: []
    };

    try {
      await setDoc(doc(db, 'events', eventData.id), eventData);
      closeModal();
    } catch (error) {
      console.error('Ошибка при сохранении события:', error);
    }
  };

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

  // useEffect для навешивания обработчиков событий на модальное окно
  useEffect(() => {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
          closeModal();
        }
      });
    }

    // Очистка обработчиков
    return () => {
      if (closeBtn) {
        closeBtn.removeEventListener('click', closeModal);
      }
      if (modal) {
        modal.removeEventListener('click', closeModal);
      }
    };
  }, []);

  // useEffect для обработки кликов вне сегодняшней ячейки
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (highlightedToday && todayElement && !isFadingOut) {
        // Проверяем, что клик был вне сегодняшней ячейки
        if (!todayElement.contains(event.target)) {
          // Начинаем процесс плавного исчезновения
          setIsFadingOut(true);
          
          // Через 800мс убираем оба класса, чтобы анимация успела завершиться
          setTimeout(() => {
            setHighlightedToday(false);
            setTodayElement(null);
            setIsFadingOut(false);
            
            // Удаляем классы с элемента
            if (todayElement) {
              todayElement.classList.remove("today-highlight", "active");
            }
          }, 800);
        }
      }
    };

    // Добавляем обработчик клика на весь документ
    document.addEventListener('click', handleClickOutside);

    // Очистка обработчика
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [highlightedToday, todayElement, isFadingOut]);

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
    
    // Сбрасываем подсветку сегодняшнего дня при смене месяца
    if (highlightedToday) {
      setIsFadingOut(true);
      setTimeout(() => {
        setHighlightedToday(false);
        setTodayElement(null);
        setIsFadingOut(false);
        
        // Удаляем классы с элемента
        if (todayElement) {
          todayElement.classList.remove("today-highlight", "active");
        }
      }, 800);
    }
    
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
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    
    // Удаляем предыдущие подсветки
    document.querySelectorAll(".today-highlight").forEach(el => {
      el.classList.remove("today-highlight", "active");
    });
    
    // Всегда заново находим элемент сегодняшней даты после рендера
    setTimeout(() => {
      const todayDateString = toDateOnlyString(today);
      const todayElement = document.querySelector(`[data-date="${todayDateString}"]`);
      if (todayElement) {
        setTodayElement(todayElement);
        setHighlightedToday(true);
        setIsFadingOut(false);
        
        // Добавляем классы для плавного появления
        todayElement.classList.add("today-highlight");
        requestAnimationFrame(() => {
          todayElement.classList.add("active");
        });
      }
    }, 100);
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
    openModal(day);
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
                        data-date={day ? toDateOnlyString(day) : ''}
                        className={`calendar-day calendar-date ${
                          !day ? 'empty' : ''
                        } ${
                          dayEvents.length > 0 ? 'has-events' : ''
                        } ${
                          day && day.getMonth() !== currentMonth.getMonth() ? 'other-month' : ''
                        } ${
                          day && isCurrentDay && highlightedToday ? `today-highlight${isFadingOut ? ' fade-out' : ' active'}` : ''
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

          {/* Иконка календаря для перехода к сегодняшней дате */}
          <div className="today-button-container">
            <button
              onClick={goToToday}
              className="today-icon-btn"
              title="Перейти к сегодняшней дате"
            >
              <FiCalendar />
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

      {/* Модальное окно для добавления нового события */}
      <div className="modal-overlay" id="modal">
        <div className="modal-window">
          <button className="close-modal">&times;</button>
          <h2>Новое событие</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSaveEvent();
          }}>
            <div className="form-group">
              <label htmlFor="eventTitle">Название события:</label>
              <input
                type="text"
                id="eventTitle"
                value={newEventForm.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="eventDescription">Описание:</label>
              <textarea
                id="eventDescription"
                value={newEventForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </div>
            <button type="submit" className="save-event-btn">Сохранить событие</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewCalendarView;
