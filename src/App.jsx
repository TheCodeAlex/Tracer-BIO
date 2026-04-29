import { useMemo, useState } from 'react'
import {
  Bell,
  Check,
  Flame,
  Grid3X3,
  Leaf,
  Palette,
  Plus,
  Repeat2,
  Search,
  Settings,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import './App.css'

const today = '2026-04-29'

const starterHabits = [
  {
    id: 1,
    title: 'Утренняя вода',
    emoji: '💧',
    category: 'Здоровье',
    frequency: 'daily',
    reminder: '08:00',
    theme: 'mint',
    completions: [
      '2026-04-22',
      '2026-04-23',
      '2026-04-24',
      '2026-04-25',
      '2026-04-26',
      '2026-04-27',
      '2026-04-28',
    ],
  },
  {
    id: 2,
    title: '20 минут чтения',
    emoji: '📚',
    category: 'Развитие',
    frequency: 'daily',
    reminder: '21:30',
    theme: 'ocean',
    completions: ['2026-04-24', '2026-04-25', '2026-04-27', '2026-04-28', today],
  },
  {
    id: 3,
    title: 'Тренировка',
    emoji: '🏃',
    category: 'Форма',
    frequency: 'weekly',
    reminder: '19:00',
    theme: 'sun',
    completions: ['2026-04-16', '2026-04-18', '2026-04-21', '2026-04-23', '2026-04-26'],
  },
  {
    id: 4,
    title: 'Дневник самочувствия',
    emoji: '🧠',
    category: 'BIO',
    frequency: 'daily',
    reminder: '22:00',
    theme: 'violet',
    completions: ['2026-04-25', '2026-04-26', '2026-04-27'],
  },
]

const emptyHabit = {
  title: '',
  emoji: '🌱',
  category: 'BIO',
  frequency: 'daily',
  reminder: '09:00',
  theme: 'mint',
}

const tabs = [
  { id: 'today', label: 'Сегодня', icon: Sparkles },
  { id: 'habits', label: 'Привычки', icon: Repeat2 },
  { id: 'stats', label: 'Статистика', icon: Grid3X3 },
  { id: 'settings', label: 'Настройки', icon: Settings },
]

const themeOptions = [
  { value: 'mint', label: 'Minty' },
  { value: 'ocean', label: 'Oceanic' },
  { value: 'sun', label: 'Classic' },
  { value: 'violet', label: 'Powder' },
]

function dateShift(dateValue, offset) {
  const date = new Date(`${dateValue}T00:00:00`)
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(dateValue))
}

function getStreak(habit, startDate = today) {
  let streak = 0

  for (let index = 0; index < 60; index += 1) {
    const date = dateShift(startDate, -index)

    if (!habit.completions.includes(date)) {
      break
    }

    streak += 1
  }

  return streak
}

function getLongestStreak(habit) {
  const sortedDates = [...habit.completions].sort()
  let longest = 0
  let current = 0
  let previousDate = null

  sortedDates.forEach((date) => {
    if (!previousDate || dateShift(previousDate, 1) === date) {
      current += 1
    } else {
      current = 1
    }

    longest = Math.max(longest, current)
    previousDate = date
  })

  return longest
}

function getWeekProgress(habit) {
  const week = Array.from({ length: 7 }, (_, index) => dateShift(today, index - 6))
  const completed = week.filter((date) => habit.completions.includes(date)).length
  const goal = habit.frequency === 'daily' ? 7 : 3

  return Math.min(100, Math.round((completed / goal) * 100))
}

function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [habits, setHabits] = useState(starterHabits)
  const [habitForm, setHabitForm] = useState(emptyHabit)
  const [query, setQuery] = useState('')
  const [activeTheme, setActiveTheme] = useState('mint')

  const heatmapDates = useMemo(
    () => Array.from({ length: 28 }, (_, index) => dateShift(today, index - 27)),
    [],
  )

  const filteredHabits = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return habits
    }

    return habits.filter(
      (habit) =>
        habit.title.toLowerCase().includes(normalizedQuery) ||
        habit.category.toLowerCase().includes(normalizedQuery),
    )
  }, [habits, query])

  const todayDone = habits.filter((habit) => habit.completions.includes(today)).length
  const totalToday = habits.length
  const todayProgress = totalToday ? Math.round((todayDone / totalToday) * 100) : 0
  const bestStreak = habits.reduce((best, habit) => Math.max(best, getStreak(habit)), 0)

  const toggleHabit = (id, date = today) => {
    setHabits((currentHabits) =>
      currentHabits.map((habit) => {
        if (habit.id !== id) {
          return habit
        }

        const completed = habit.completions.includes(date)
        const completions = completed
          ? habit.completions.filter((item) => item !== date)
          : [...habit.completions, date]

        return { ...habit, completions }
      }),
    )
  }

  const saveHabit = (event) => {
    event.preventDefault()

    const title = habitForm.title.trim()
    if (!title) {
      return
    }

    setHabits((currentHabits) => [
      {
        id: Date.now(),
        ...habitForm,
        title,
        category: habitForm.category.trim() || 'BIO',
        completions: [],
      },
      ...currentHabits,
    ])
    setHabitForm(emptyHabit)
    setActiveTab('today')
  }

  const removeHabit = (id) => {
    setHabits((currentHabits) => currentHabits.filter((habit) => habit.id !== id))
  }

  return (
    <main className={`app-shell theme-${activeTheme}`}>
      <aside className="sidebar" aria-label="Навигация Tracker BIO">
        <div className="brand">
          <span className="brand-mark">
            <Leaf size={24} aria-hidden="true" />
          </span>
          <div>
            <strong>Tracker BIO</strong>
            <small>Habit operating system</small>
          </div>
        </div>

        <nav className="nav-list">
          {tabs.map((tab) => {
            const Icon = tab.icon

            return (
              <button
                className={activeTab === tab.id ? 'nav-link active' : 'nav-link'}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon size={18} aria-hidden="true" />
                {tab.label}
              </button>
            )
          })}
        </nav>

        <div className="theme-card">
          <Palette size={18} aria-hidden="true" />
          <span>{themeOptions.find((theme) => theme.value === activeTheme)?.label}</span>
        </div>
      </aside>

      <section className="workspace">
        {activeTab === 'today' && (
          <TodayPage
            bestStreak={bestStreak}
            habits={habits}
            heatmapDates={heatmapDates}
            setActiveTab={setActiveTab}
            todayDone={todayDone}
            todayProgress={todayProgress}
            toggleHabit={toggleHabit}
          />
        )}
        {activeTab === 'habits' && (
          <HabitsPage
            filteredHabits={filteredHabits}
            habitForm={habitForm}
            query={query}
            removeHabit={removeHabit}
            saveHabit={saveHabit}
            setHabitForm={setHabitForm}
            setQuery={setQuery}
            toggleHabit={toggleHabit}
          />
        )}
        {activeTab === 'stats' && (
          <StatsPage habits={habits} heatmapDates={heatmapDates} todayProgress={todayProgress} />
        )}
        {activeTab === 'settings' && (
          <SettingsPage activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
        )}
      </section>
    </main>
  )
}

function TodayPage({
  bestStreak,
  habits,
  heatmapDates,
  setActiveTab,
  todayDone,
  todayProgress,
  toggleHabit,
}) {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Tracker BIO</p>
          <h1>Твой день в одном экране</h1>
        </div>
        <button className="primary-action" onClick={() => setActiveTab('habits')} type="button">
          <Plus size={18} aria-hidden="true" />
          Новая привычка
        </button>
      </header>

      <section className="hero-card">
        <div>
          <p className="eyebrow">Сегодня</p>
          <h2>Маленькое действие сильнее идеального плана</h2>
          <p>{todayDone} из {habits.length} привычек отмечено. Продолжай цепочку спокойно.</p>
        </div>
        <ProgressRing value={todayProgress} label={`${todayProgress}%`} />
      </section>

      <section className="stats-grid" aria-label="Краткая статистика">
        <MetricCard icon={Check} label="Выполнено сегодня" value={`${todayDone}/${habits.length}`} />
        <MetricCard icon={Flame} label="Лучший streak" value={`${bestStreak} дн.`} />
        <MetricCard icon={Target} label="Фокус" value="BIO" />
      </section>

      <section className="today-layout">
        <div className="habit-stack">
          <div className="section-title">
            <h2>Сегодняшние привычки</h2>
            <span>{formatDate(today)}</span>
          </div>

          {habits.map((habit) => (
            <HabitCheckCard habit={habit} key={habit.id} onToggle={() => toggleHabit(habit.id)} />
          ))}
        </div>

        <aside className="side-panel">
          <div className="section-title">
            <h2>4-недельная heatmap</h2>
          </div>
          <Heatmap habits={habits} dates={heatmapDates} />
          <div className="reminder-card">
            <Bell size={20} aria-hidden="true" />
            <div>
              <strong>Напоминания включены</strong>
              <p>Привычки мягко сбрасываются каждое утро.</p>
            </div>
          </div>
        </aside>
      </section>
    </>
  )
}

function HabitsPage({
  filteredHabits,
  habitForm,
  query,
  removeHabit,
  saveHabit,
  setHabitForm,
  setQuery,
  toggleHabit,
}) {
  const updateForm = (field, value) => {
    setHabitForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Привычки</p>
          <h1>Создание и управление</h1>
        </div>
      </header>

      <div className="habits-layout">
        <section className="editor-panel">
          <div className="section-title">
            <h2>Новая привычка</h2>
            <span>emoji + frequency</span>
          </div>

          <form className="habit-form" onSubmit={saveHabit}>
            <label>
              Название
              <input
                value={habitForm.title}
                onChange={(event) => updateForm('title', event.target.value)}
                placeholder="Например: медитация"
              />
            </label>

            <div className="form-row">
              <label>
                Emoji
                <input
                  maxLength="2"
                  value={habitForm.emoji}
                  onChange={(event) => updateForm('emoji', event.target.value)}
                />
              </label>
              <label>
                Категория
                <input
                  value={habitForm.category}
                  onChange={(event) => updateForm('category', event.target.value)}
                />
              </label>
            </div>

            <div className="segmented-control" aria-label="Частота привычки">
              <button
                className={habitForm.frequency === 'daily' ? 'active' : ''}
                onClick={() => updateForm('frequency', 'daily')}
                type="button"
              >
                Daily
              </button>
              <button
                className={habitForm.frequency === 'weekly' ? 'active' : ''}
                onClick={() => updateForm('frequency', 'weekly')}
                type="button"
              >
                Weekly
              </button>
            </div>

            <label>
              Напоминание
              <input
                type="time"
                value={habitForm.reminder}
                onChange={(event) => updateForm('reminder', event.target.value)}
              />
            </label>

            <label>
              Тема карточки
              <select value={habitForm.theme} onChange={(event) => updateForm('theme', event.target.value)}>
                {themeOptions.map((theme) => (
                  <option key={theme.value} value={theme.value}>{theme.label}</option>
                ))}
              </select>
            </label>

            <button className="primary-action" type="submit">
              <Plus size={18} aria-hidden="true" />
              Добавить привычку
            </button>
          </form>
        </section>

        <section className="list-panel">
          <div className="search-field">
            <Search size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск привычек"
            />
          </div>

          <div className="habit-list">
            {filteredHabits.map((habit) => (
              <HabitManageCard
                habit={habit}
                key={habit.id}
                onRemove={() => removeHabit(habit.id)}
                onToggle={() => toggleHabit(habit.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

function StatsPage({ habits, heatmapDates, todayProgress }) {
  const averageWeekProgress = habits.length
    ? Math.round(habits.reduce((sum, habit) => sum + getWeekProgress(habit), 0) / habits.length)
    : 0

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Статистика</p>
          <h1>Consistency dashboard</h1>
        </div>
        <span className="date-pill">{formatDate(today)}</span>
      </header>

      <section className="stats-grid">
        <MetricCard icon={Trophy} label="Средняя неделя" value={`${averageWeekProgress}%`} />
        <MetricCard icon={Flame} label="Сегодня" value={`${todayProgress}%`} />
        <MetricCard icon={Repeat2} label="Всего привычек" value={habits.length} />
      </section>

      <section className="analytics-grid">
        <article className="analysis-panel">
          <div className="section-title">
            <h2>Weekly rings</h2>
            <span>прогресс по привычкам</span>
          </div>
          <div className="ring-list">
            {habits.map((habit) => (
              <div className="ring-row" key={habit.id}>
                <ProgressRing value={getWeekProgress(habit)} label={`${getWeekProgress(habit)}%`} small />
                <div>
                  <strong>{habit.emoji} {habit.title}</strong>
                  <p>Текущий streak: {getStreak(habit)} дн. · лучший: {getLongestStreak(habit)} дн.</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="analysis-panel">
          <div className="section-title">
            <h2>4-week history</h2>
            <span>паттерны и пропуски</span>
          </div>
          <Heatmap habits={habits} dates={heatmapDates} large />
        </article>
      </section>
    </>
  )
}

function SettingsPage({ activeTheme, setActiveTheme }) {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Настройки</p>
          <h1>Персонализация Tracker BIO</h1>
        </div>
      </header>

      <section className="settings-grid">
        <article className="settings-panel">
          <div className="section-title">
            <h2>Темы</h2>
            <span>как в мобильном habit tracker</span>
          </div>
          <div className="theme-options">
            {themeOptions.map((theme) => (
              <button
                className={activeTheme === theme.value ? `theme-swatch ${theme.value} active` : `theme-swatch ${theme.value}`}
                key={theme.value}
                onClick={() => setActiveTheme(theme.value)}
                type="button"
              >
                <span />
                {theme.label}
              </button>
            ))}
          </div>
        </article>

        <article className="settings-panel">
          <div className="section-title">
            <h2>Widget preview</h2>
            <span>виджет на главный экран</span>
          </div>
          <div className="widget-preview">
            <Leaf size={22} aria-hidden="true" />
            <strong>Tracker BIO</strong>
            <p>Сегодня: 2/4 · streak 7</p>
          </div>
        </article>
      </section>
    </>
  )
}

function HabitCheckCard({ habit, onToggle }) {
  const done = habit.completions.includes(today)

  return (
    <article className={`habit-check-card ${habit.theme}`}>
      <button className={done ? 'check-button done' : 'check-button'} onClick={onToggle} type="button">
        {done ? <Check size={22} aria-hidden="true" /> : habit.emoji}
      </button>
      <div>
        <h3>{habit.title}</h3>
        <p>{habit.category} · {habit.frequency} · {habit.reminder}</p>
      </div>
      <div className="habit-stats">
        <strong>{getStreak(habit)}</strong>
        <span>streak</span>
      </div>
    </article>
  )
}

function HabitManageCard({ habit, onRemove, onToggle }) {
  return (
    <article className="habit-manage-card">
      <div className="habit-icon">{habit.emoji}</div>
      <div>
        <h3>{habit.title}</h3>
        <p>{habit.category} · {habit.frequency} · reminder {habit.reminder}</p>
        <div className="mini-week">
          {Array.from({ length: 7 }, (_, index) => {
            const date = dateShift(today, index - 6)
            return <span className={habit.completions.includes(date) ? 'active' : ''} key={date} />
          })}
        </div>
      </div>
      <div className="card-actions">
        <button onClick={onToggle} type="button">Check</button>
        <button onClick={onRemove} type="button">Delete</button>
      </div>
    </article>
  )
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <article className="metric-card">
      <Icon size={22} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function ProgressRing({ label, small = false, value }) {
  return (
    <div
      className={small ? 'progress-ring small' : 'progress-ring'}
      style={{ '--value': `${value * 3.6}deg` }}
      aria-label={`Прогресс ${value}%`}
    >
      <span>{label}</span>
    </div>
  )
}

function Heatmap({ dates, habits, large = false }) {
  return (
    <div className={large ? 'heatmap large' : 'heatmap'}>
      {dates.map((date) => {
        const completed = habits.filter((habit) => habit.completions.includes(date)).length
        const level = completed === 0 ? 'empty' : completed < habits.length / 2 ? 'soft' : 'strong'

        return (
          <button
            className={`heat-cell ${level}`}
            key={date}
            title={`${formatDate(date)}: ${completed}/${habits.length}`}
            type="button"
          />
        )
      })}
    </div>
  )
}

export default App
