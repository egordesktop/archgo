const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VERCEL_TOKEN = 'Pm1LQvzpaIGtlc5Gsvk975Et';
const PROJECT_NAME = 'site-arch';
const REPO = 'egordesktop/archgo';

console.log('🚀 Запуск полной автоматической настройки деплоя...\n');

async function runCommand(command, description) {
  try {
    console.log(`📋 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} - выполнено успешно\n`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка при ${description}:`, error.message);
    return false;
  }
}

async function setupDeployment() {
  console.log('🔧 Шаг 1: Проверка и установка зависимостей...');
  
  // Установка зависимостей проекта
  if (!await runCommand('npm install', 'Установка зависимостей проекта')) {
    return false;
  }
  
  console.log('🔧 Шаг 2: Настройка Vercel CLI...');
  
  // Установка Vercel CLI
  if (!await runCommand('npm install -g vercel', 'Установка Vercel CLI')) {
    return false;
  }
  
  console.log('🔧 Шаг 3: Настройка проекта Vercel...');
  
  // Создание .vercelignore
  if (!fs.existsSync('.vercelignore')) {
    fs.writeFileSync('.vercelignore', 'node_modules\n.git\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local');
    console.log('✅ Создан .vercelignore\n');
  }
  
  // Создание .vercel директории и конфигурации
  if (!fs.existsSync('.vercel')) {
    fs.mkdirSync('.vercel');
  }
  
  // Обновление project.json
  const projectConfig = {
    projectId: "prj_RWZDf5XEtO0YC94JggPGJvgjgHUO",
    orgId: "team_e6nDO7r8aV6lAVOqMlqzEYRK",
    projectName: PROJECT_NAME
  };
  
  fs.writeFileSync('.vercel/project.json', JSON.stringify(projectConfig, null, 2));
  console.log('✅ Обновлена конфигурация .vercel/project.json\n');
  
  console.log('🔧 Шаг 4: Первый деплой...');
  
  // Первый деплой
  if (!await runCommand(`vercel --prod --token ${VERCEL_TOKEN}`, 'Первый деплой на Vercel')) {
    return false;
  }
  
  console.log('🔧 Шаг 5: Настройка GitHub Secrets...');
  
  // Создание инструкции для GitHub Secrets
  const secretsInstructions = `
# Инструкция по настройке GitHub Secrets

Для автоматического деплоя необходимо добавить секреты в GitHub:

1. Перейдите в: https://github.com/${REPO}/settings/secrets/actions
2. Нажмите "New repository secret"
3. Добавьте секрет с именем: VERCEL_TOKEN
4. Установите значение: ${VERCEL_TOKEN}

После добавления секрета, GitHub Actions будет автоматически деплоить сайт при каждом пуше в ветку main.

🌐 Ссылка на сайт: https://${PROJECT_NAME}.vercel.app
`;

  fs.writeFileSync('GITHUB_SECRETS_SETUP.md', secretsInstructions);
  console.log('✅ Создана инструкция GITHUB_SECRETS_SETUP.md\n');
  
  console.log('🎉 Настройка завершена успешно!');
  console.log('📝 Следующие шаги:');
  console.log('1. Добавьте VERCEL_TOKEN в GitHub Secrets (см. GITHUB_SECRETS_SETUP.md)');
  console.log('2. Сделайте пуш в ветку main для тестирования автоматического деплоя');
  console.log(`3. Сайт будет доступен по адресу: https://${PROJECT_NAME}.vercel.app`);
  
  return true;
}

// Запуск настройки
setupDeployment().then(success => {
  if (success) {
    console.log('\n✅ Все готово для автоматического деплоя!');
  } else {
    console.log('\n❌ Настройка не завершена. Проверьте ошибки выше.');
    process.exit(1);
  }
});
