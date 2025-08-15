import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../firebase'

export function useAuth() {
	const [user, setUser] = useState(null)
	const [role, setRole] = useState('user')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, async (u) => {
			setUser(u)
			if (u) {
				try {
					const ref = doc(db, 'users', u.uid)
					const snap = await getDoc(ref)
					if (snap.exists()) {
						const data = snap.data()
						setRole(data?.role === 'admin' ? 'admin' : 'user')
					} else {
						setRole('user')
					}
				} catch (e) {
					setRole('user')
				}
			} else {
				setRole('user')
			}
			setLoading(false)
		})
		return () => unsub()
	}, [])

	return { user, role, loading }
}


