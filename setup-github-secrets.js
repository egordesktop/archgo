const { execSync } = require('child_process');

const VERCEL_TOKEN = 'Pm1LQvzpaIGtlc5Gsvk975Et';
const REPO = 'egordesktop/archgo';

console.log('🔐 Настройка GitHub Secrets...');

try {
  // Проверка установки GitHub CLI
  try {
    execSync('gh --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('📦 Установка GitHub CLI...');
    // Для Windows
    if (process.platform === 'win32') {
      execSync('winget install GitHub.cli', { stdio: 'inherit' });
    } else {
      execSync('curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg', { stdio: 'inherit' });
      execSync('echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null', { stdio: 'inherit' });
      execSync('sudo apt update && sudo apt install gh', { stdio: 'inherit' });
    }
  }
  
  // Логин в GitHub (потребует интерактивного ввода)
  console.log('🔑 Авторизация в GitHub...');
  execSync('gh auth login --web', { stdio: 'inherit' });
  
  // Установка VERCEL_TOKEN secret
  console.log('🔐 Установка VERCEL_TOKEN secret...');
  execSync(`gh secret set VERCEL_TOKEN --repo ${REPO} --body "${VERCEL_TOKEN}"`, { stdio: 'inherit' });
  
  console.log('✅ GitHub Secrets настроены успешно!');
  
} catch (error) {
  console.error('❌ Ошибка при настройке GitHub Secrets:', error.message);
  console.log('💡 Для ручной настройки:');
  console.log('1. Перейдите в https://github.com/egordesktop/archgo/settings/secrets/actions');
  console.log('2. Добавьте новый secret с именем VERCEL_TOKEN');
  console.log('3. Установите значение: Pm1LQvzpaIGtlc5Gsvk975Et');
}
