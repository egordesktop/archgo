# 🚀 Автоматический деплой на Vercel

Этот проект настроен для автоматического деплоя на Vercel через GitHub Actions.

## 📋 Что уже настроено

✅ GitHub Actions workflow (`.github/workflows/deploy.yml`)  
✅ Конфигурация Vercel (`vercel.json`)  
✅ Автоматические скрипты настройки  
✅ Интеграция с проектом `site-arch` на Vercel  

## 🔧 Быстрая настройка

### 1. Автоматическая настройка (рекомендуется)

```bash
npm run setup-deploy
```

Этот скрипт автоматически:
- Установит Vercel CLI
- Настроит авторизацию
- Свяжет проект с Vercel
- Выполнит первый деплой

### 2. Ручная настройка GitHub Secrets

1. Перейдите в [GitHub Secrets](https://github.com/egordesktop/archgo/settings/secrets/actions)
2. Нажмите "New repository secret"
3. Добавьте секрет:
   - **Name**: `VERCEL_TOKEN`
   - **Value**: `Pm1LQvzpaIGtlc5Gsvk975Et`

## 🌐 Деплой

### Автоматический деплой
При каждом пуше в ветку `main` сайт автоматически деплоится на Vercel.

### Ручной деплой
```bash
npm run deploy
```

## 📁 Структура файлов деплоя

```
project/
├── .github/workflows/deploy.yml    # GitHub Actions workflow
├── .vercel/project.json            # Конфигурация Vercel проекта
├── vercel.json                     # Настройки деплоя Vercel
├── auto-deploy-setup.js            # Скрипт автоматической настройки
├── setup-vercel.js                 # Скрипт настройки Vercel
├── setup-github-secrets.js         # Скрипт настройки GitHub Secrets
└── GITHUB_SECRETS_SETUP.md         # Инструкция по настройке секретов
```

## 🔗 Ссылки

- **Сайт**: https://site-arch.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/egordesktop/archgo

## 🛠️ Команды

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Предпросмотр
npm run preview

# Деплой
npm run deploy

# Настройка автоматического деплоя
npm run setup-deploy
```

## ⚙️ Конфигурация

### Vercel Settings
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### GitHub Actions
- **Trigger**: Push to `main` branch
- **Node.js Version**: 18
- **Cache**: npm dependencies
- **Auto-deploy**: Enabled

## 🚨 Устранение неполадок

### Ошибка авторизации Vercel
```bash
vercel login --token Pm1LQvzpaIGtlc5Gsvk975Et
```

### Ошибка GitHub Actions
1. Проверьте наличие секрета `VERCEL_TOKEN`
2. Убедитесь, что токен действителен
3. Проверьте права доступа к репозиторию

### Ошибка сборки
1. Проверьте зависимости: `npm install`
2. Проверьте сборку локально: `npm run build`
3. Проверьте логи в Vercel Dashboard

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи GitHub Actions
2. Проверьте логи Vercel Dashboard
3. Убедитесь в корректности токенов и настроек
