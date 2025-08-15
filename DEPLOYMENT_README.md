# 🚀 Автоматический деплой на Vercel

Этот проект настроен для автоматического деплоя на Vercel с использованием GitHub Actions.

## 📋 Предварительные требования

1. **GitHub CLI** - установите с [cli.github.com](https://cli.github.com/)
2. **Node.js** - версия 18 или выше
3. **Git** - для работы с репозиторием
4. **Vercel аккаунт** - с настроенным проектом

## 🛠️ Быстрая настройка

### 1. Запуск автоматической настройки

```powershell
# В директории проекта
.\auto-deploy.ps1
```

Скрипт автоматически:
- ✅ Проверит наличие GitHub CLI
- ✅ Настроит переменные окружения
- ✅ Обновит конфигурационные файлы
- ✅ Настроит GitHub Secrets
- ✅ Создаст GitHub Actions workflow
- ✅ Выполнит первый деплой
- ✅ Откроет сайт в браузере

### 2. Ручная настройка (если автоматическая не сработала)

#### Настройка GitHub CLI
```bash
gh auth login
```

#### Настройка переменных окружения
Создайте файл `.env`:
```env
VERCEL_TOKEN=your_vercel_token
VERCEL_TEAM_ID=your_team_id
VERCEL_PROJECT_ID=your_project_id
```

#### Настройка GitHub Secrets
```bash
gh secret set VERCEL_TOKEN --body "your_vercel_token"
gh secret set VERCEL_TEAM_ID --body "your_team_id"
gh secret set VERCEL_PROJECT_ID --body "your_project_id"
```

## 🔄 Рабочий процесс

### Обычный деплой
После настройки для деплоя достаточно:

```bash
git add .
git commit -m "Your commit message"
git push
```

GitHub Actions автоматически:
1. Соберет проект
2. Задеплоит на Vercel
3. Обновит production версию

### Локальная разработка
```bash
npm run dev          # Запуск dev сервера
npm run build        # Сборка проекта
npm run preview      # Предварительный просмотр
```

## 📁 Структура файлов

```
project/
├── auto-deploy.ps1          # Автоматический скрипт настройки
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions workflow
├── vercel.json              # Конфигурация Vercel
├── package.json             # NPM скрипты и зависимости
└── .env                     # Переменные окружения (не в git)
```

## 🔧 Конфигурация

### Vercel (vercel.json)
```json
{
  "version": 2,
  "scope": "team_e6nD07t8aV61vAQqMIqzEYRk",
  "projectId": "prj_RW2Df5XteE00YC94JpgPGJvgj9HU0",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### GitHub Actions (.github/workflows/deploy.yml)
- Автоматический деплой при push в main/master ветки
- Использует Node.js 18
- Кэширование npm зависимостей
- Продакшн деплой на Vercel

## 🚨 Устранение неполадок

### Ошибка "GitHub CLI не найден"
```bash
# Установите GitHub CLI
winget install GitHub.cli
# или скачайте с https://cli.github.com/
```

### Ошибка авторизации
```bash
gh auth login
```

### Ошибка деплоя
1. Проверьте токен Vercel
2. Убедитесь, что проект существует в Vercel
3. Проверьте логи в GitHub Actions

### Ошибка сборки
```bash
npm install
npm run build
```

## 📊 Мониторинг

- **GitHub Actions**: https://github.com/your-repo/actions
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Логи деплоя**: В GitHub Actions или Vercel Dashboard

## 🔐 Безопасность

- Токены Vercel хранятся в GitHub Secrets
- Файл `.env` добавлен в `.gitignore`
- Переменные окружения не попадают в репозиторий

## 📝 Полезные команды

```bash
# Проверка статуса деплоя
vercel ls

# Локальный деплой
vercel

# Продакшн деплой
vercel --prod

# Просмотр логов
vercel logs

# Удаление деплоя
vercel remove
```

## 🎯 Результат

После успешной настройки:
- ✅ Автоматический деплой при каждом push
- ✅ Быстрая разработка с hot reload
- ✅ Продакшн готовый сайт
- ✅ Мониторинг и логи
- ✅ Простое управление версиями

---

**Примечание**: Убедитесь, что у вас есть права на запись в репозиторий и настройка GitHub Secrets.
