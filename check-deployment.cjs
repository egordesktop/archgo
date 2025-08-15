const { execSync } = require('child_process');
const https = require('https');

const SITE_URL = 'https://site-arch.vercel.app';

console.log('🔍 Проверка статуса деплоя...\n');

// Проверка доступности сайта
function checkSite(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      console.log(`✅ Сайт доступен! Статус: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ Сайт недоступен: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('⏰ Таймаут при проверке сайта');
      req.destroy();
      resolve(false);
    });
  });
}

// Получение информации о последнем деплое
async function getDeploymentInfo() {
  try {
    console.log('📋 Получение информации о деплое...');
    const result = execSync('vercel ls --token Pm1LQvzpaIGtlc5Gsvk975Et', { encoding: 'utf8' });
    console.log('📊 Информация о деплоях:');
    console.log(result);
  } catch (error) {
    console.log('⚠️ Не удалось получить информацию о деплоях');
  }
}

async function main() {
  console.log('🌐 Проверка доступности сайта...');
  const isAvailable = await checkSite(SITE_URL);
  
  if (isAvailable) {
    console.log('\n🎉 Деплой успешно завершен!');
    console.log(`🌐 Сайт доступен по адресу: ${SITE_URL}`);
  } else {
    console.log('\n⏳ Сайт еще не готов. Возможно, деплой еще в процессе...');
    console.log('💡 Проверьте статус в Vercel Dashboard: https://vercel.com/dashboard');
  }
  
  console.log('\n📋 Дополнительная информация:');
  console.log('🔗 Vercel Dashboard: https://vercel.com/dashboard');
  console.log('🔗 GitHub Actions: https://github.com/egordesktop/archgo/actions');
  console.log('🔗 GitHub Secrets: https://github.com/egordesktop/archgo/settings/secrets/actions');
  
  await getDeploymentInfo();
  
  console.log('\n📝 Следующие шаги:');
  console.log('1. Добавьте VERCEL_TOKEN в GitHub Secrets для автоматического деплоя');
  console.log('2. При каждом пуше в main ветку сайт будет автоматически обновляться');
  console.log('3. Для ручного деплоя используйте: npm run deploy');
}

main().catch(console.error);
