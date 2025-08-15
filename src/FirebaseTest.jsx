import { useEffect, useState } from 'react';
import { auth, db, storage } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadString, listAll, deleteObject } from 'firebase/storage';

export default function FirebaseTest() {
  const [docsList, setDocsList] = useState([]);
  const [filesList, setFilesList] = useState([]);

  // Загрузка данных
  async function loadData() {
    // Firestore
    try {
      const colRef = collection(db, 'test');
      const snapshot = await getDocs(colRef);
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setDocsList(docs);

      if (snapshot.empty) {
        console.warn('⚠️ Firestore пуст, создаём тестовый документ...');
        await addDoc(colRef, {
          createdAt: new Date().toISOString(),
          message: 'Hello from FirebaseTest!'
        });
        await loadData(); // перезагрузка
      }
    } catch (e) {
      console.error('❌ Ошибка Firestore:', e);
    }

    // Storage
    try {
      const listRef = ref(storage, '/');
      const res = await listAll(listRef);
      const files = res.items.map(item => item.name);
      setFilesList(files);

      if (res.items.length === 0) {
        console.warn('⚠️ Storage пуст, загружаем тестовый файл...');
        const fileRef = ref(storage, 'test.txt');
        await uploadString(fileRef, 'Hello from FirebaseTest!', 'raw');
        await loadData(); // перезагрузка
      }
    } catch (e) {
      console.error('❌ Ошибка Storage:', e);
    }
  }

  // Очистка данных
  async function clearTestData() {
    try {
      // Firestore
      const colRef = collection(db, 'test');
      const snapshot = await getDocs(colRef);
      for (let d of snapshot.docs) {
        await deleteDoc(doc(db, 'test', d.id));
      }
      console.log('🗑 Firestore очищен');

      // Storage
      const listRef = ref(storage, '/');
      const res = await listAll(listRef);
      for (let item of res.items) {
        await deleteObject(item);
      }
      console.log('🗑 Storage очищен');

      // Обновить списки
      setDocsList([]);
      setFilesList([]);
    } catch (e) {
      console.error('❌ Ошибка очистки:', e);
    }
  }

  useEffect(() => {
    // Авторизация
    signInAnonymously(auth)
      .then(() => {
        console.log('✅ Авторизация успешна');
        loadData();
      })
      .catch((error) => console.error('❌ Ошибка Auth:', error));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🔍 Firebase Test</h1>

      <h2>📄 Firestore документы:</h2>
      {docsList.length > 0 ? (
        <ul>
          {docsList.map(d => (
            <li key={d.id}>
              <strong>{d.id}</strong>: {d.message} <em>({d.createdAt})</em>
            </li>
          ))}
        </ul>
      ) : (
        <p>Пусто</p>
      )}

      <h2>📦 Storage файлы:</h2>
      {filesList.length > 0 ? (
        <ul>
          {filesList.map(name => <li key={name}>{name}</li>)}
        </ul>
      ) : (
        <p>Пусто</p>
      )}

      <button
        onClick={clearTestData}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          background: 'red',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '5px'
        }}
      >
        🗑 Очистить тестовые данные
      </button>
    </div>
  );
}
