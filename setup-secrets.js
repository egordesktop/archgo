const https = require('https');
const crypto = require('crypto');

// Конфигурация
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'ghp_your_github_token_here'; // Нужен GitHub Personal Access Token
const REPO_OWNER = 'egordesktop';
const REPO_NAME = 'archgo';
const VERCEL_TOKEN = 'Pm1LQvzpaIGtlc5Gsvk975Et';

// Функция для шифрования secret
function encryptSecret(secret, publicKey) {
    const buffer = Buffer.from(secret, 'utf8');
    const encrypted = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        buffer
    );
    return encrypted.toString('base64');
}

// Функция для получения public key репозитория
function getPublicKey() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${REPO_OWNER}/${REPO_NAME}/actions/secrets/public-key`,
            method: 'GET',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'Node.js',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const response = JSON.parse(data);
                    resolve(response);
                } else {
                    reject(new Error(`Failed to get public key: ${res.statusCode} ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Функция для создания secret
function createSecret(secretName, secretValue, keyId, publicKey) {
    return new Promise((resolve, reject) => {
        const encryptedValue = encryptSecret(secretValue, publicKey);
        
        const postData = JSON.stringify({
            encrypted_value: encryptedValue,
            key_id: keyId
        });

        const options = {
            hostname: 'api.github.com',
            path: `/repos/${REPO_OWNER}/${REPO_NAME}/actions/secrets/${secretName}`,
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'Node.js',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 201 || res.statusCode === 204) {
                    resolve();
                } else {
                    reject(new Error(`Failed to create secret: ${res.statusCode} ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Основная функция
async function setupSecrets() {
    try {
        console.log('Получение public key...');
        const { key_id, key } = await getPublicKey();
        
        console.log('Создание VERCEL_TOKEN secret...');
        await createSecret('VERCEL_TOKEN', VERCEL_TOKEN, key_id, key);
        
        console.log('GitHub Secrets настроены успешно!');
    } catch (error) {
        console.error('Ошибка при настройке secrets:', error.message);
        console.log('\nДля ручной настройки:');
        console.log('1. Перейдите в https://github.com/egordesktop/archgo/settings/secrets/actions');
        console.log('2. Создайте новый secret с именем VERCEL_TOKEN');
        console.log('3. Установите значение: Pm1LQvzpaIGtlc5Gsvk975Et');
    }
}

setupSecrets();
