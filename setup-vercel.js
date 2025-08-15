const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VERCEL_TOKEN = 'Pm1LQvzpaIGtlc5Gsvk975Et';
const PROJECT_NAME = 'site-arch';

console.log('🚀 Настройка автоматического деплоя на Vercel...');

try {
  // Установка Vercel CLI глобально
  console.log('📦 Установка Vercel CLI...');
  execSync('npm install -g vercel', { stdio: 'inherit' });
  
  // Логин в Vercel с токеном
  console.log('🔐 Авторизация в Vercel...');
  execSync(`vercel login --token ${VERCEL_TOKEN}`, { stdio: 'inherit' });
  
  // Создание .vercelignore если не существует
  if (!fs.existsSync('.vercelignore')) {
    fs.writeFileSync('.vercelignore', 'node_modules\n.git\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local');
  }
  
  // Настройка проекта Vercel
  console.log('⚙️ Настройка проекта Vercel...');
  execSync(`vercel link --token ${VERCEL_TOKEN} --project ${PROJECT_NAME} --yes`, { stdio: 'inherit' });
  
  // Первый деплой
  console.log('🚀 Выполнение первого деплоя...');
  execSync(`vercel --prod --token ${VERCEL_TOKEN}`, { stdio: 'inherit' });
  
  console.log('✅ Настройка завершена успешно!');
  console.log('🌐 Сайт будет автоматически деплоиться при пуше в ветку main');
  
} catch (error) {
  console.error('❌ Ошибка при настройке:', error.message);
  process.exit(1);
}
