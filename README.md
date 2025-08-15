## Architectural Calendar Group Events

Минималистичное веб‑приложение адвент‑календаря для учебной группы:

- Авторизация (Firebase Auth, email+пароль)
- Роли: admin (староста) и user (участник)
- События по датам, загрузка файлов (Storage), комментарии к событиям (Firestore)
- Режим календаря и «Список дедлайнов» с сортировкой по дате
- Реальное время через onSnapshot

### 1) Установка

```bash
npm i
```

Создайте файл `.env` по примеру `.env.example` и заполните ключи Firebase:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Локальный запуск:

```bash
npm run dev
```

### 2) Настройка Firebase

1. Создайте проект в Firebase Console.
2. В разделе Build → Authentication → Sign-in method включите Email/Password.
3. Build → Firestore Database → Create database (Production/Start in test по вашему выбору).
4. Build → Storage → Get started (регион любой, например europe-central2).
5. Project settings → General → Your apps → Web app → получите конфиг и перенесите его в `.env`.

Коллекции:
- `users/{uid}`: { role: "admin" | "user", email }
- `events/{eventId}`: { id, title, description, date: "YYYY-MM-DD", createdBy, createdAt, attachments[] }
- `events/{eventId}/comments/{commentId}`: { content, userId, userEmail, createdAt }

Правила Firestore (пример для базовой защиты; адаптируйте под себя):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    match /events/{eventId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');

      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      }
    }
  }
}
```

Правила Storage (скачивание только авторизованным, запись — админам):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /attachments/{uid}/{allPaths=**} {
      allow read: if request.auth != null; 
      allow write: if request.auth != null &&
        (get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

Создание администратора:
1. Зарегистрируйте пользователя.
2. В коллекции `users` установите документу с `uid` поле `role = "admin"`.

### 3) Скрипты

- `npm run dev` — локальная разработка
- `npm run build` — продакшн сборка (папка `dist/`)
- `npm run preview` — предпросмотр сборки

### 4) Деплой на Vercel

1. Установите Vercel CLI (либо используйте веб‑интерфейс):
   ```bash
   npm i -g vercel
   ```
2. В корне проекта:
   ```bash
   vercel
   ```
3. В настройках проекта на Vercel добавьте переменные окружения:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

4. Установите Framework Preset: Vite. Build Command: `vite build`. Output: `dist`.
5. Запустите деплой:
   ```bash
   vercel --prod
   ```

### 5) UI и цвета

Монохромная база, акценты:
- Terracota `#D06224`
- Chile Rojo `#AE431E`
- Olive `#8A8635`
- Sunset `#EAC891`

Анимации — Framer Motion (разворачивание карточек событий, переходы между режимами).


