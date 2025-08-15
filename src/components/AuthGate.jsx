import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'

export default function AuthGate() {
	const [mode, setMode] = useState('signin')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	async function onSubmit(e) {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			if (mode === 'signin') {
				await signInWithEmailAndPassword(auth, email, password)
			} else {
				const cred = await createUserWithEmailAndPassword(auth, email, password)
				await setDoc(doc(db, 'users', cred.user.uid), { role: 'user', email })
			}
		} catch (e) {
			setError(e.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="mx-auto max-w-sm">
			<div className="card p-6">
				<h2 className="text-lg font-semibold mb-4">{mode==='signin'?'Вход':'Регистрация'}</h2>
				<form onSubmit={onSubmit} className="space-y-3">
					<input className="input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
					<input className="input" type="password" placeholder="Пароль" value={password} onChange={e=>setPassword(e.target.value)} required />
					{error ? <div className="text-chile text-sm">{error}</div> : null}
					<button className="btn btn-primary w-full" disabled={loading}>
						{loading ? '...' : (mode==='signin' ? 'Войти' : 'Зарегистрироваться')}
					</button>
				</form>
				<div className="mt-3 text-sm text-neutral-600">
					{mode==='signin' ? (
						<button className="underline" onClick={()=>setMode('signup')}>Нет аккаунта? Регистрация</button>
					) : (
						<button className="underline" onClick={()=>setMode('signin')}>Уже есть аккаунт? Войти</button>
					)}
				</div>
			</div>
		</div>
	)
}


