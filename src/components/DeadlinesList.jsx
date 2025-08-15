import { useEffect, useMemo, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db, storage } from '../firebase'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { format } from 'date-fns'
import EventDetails from './EventDetails.jsx'

export default function DeadlinesList({ role, user }) {
	const [events, setEvents] = useState([])

	useEffect(() => {
		const unsub = onSnapshot(collection(db, 'events'), (snap) => {
			const list = []
			snap.forEach((d) => list.push({ id: d.id, ...d.data() }))
			setEvents(list)
		})
		return () => unsub()
	}, [])

	const sorted = useMemo(() => {
		return [...events].sort((a, b) => a.date.localeCompare(b.date))
	}, [events])

	async function handleUpdate(payload, file) {
		let fileMeta = null
		if (file) {
			const fileRef = ref(storage, `attachments/${payload.createdBy || 'current'}/${Date.now()}_${file.name}`)
			await uploadBytes(fileRef, file)
			const url = await getDownloadURL(fileRef)
			fileMeta = { name: file.name, url, type: file.type, path: fileRef.fullPath }
		}
		const data = {
			...payload,
			attachments: fileMeta ? [...(payload.attachments || []), fileMeta] : (payload.attachments || []),
		}
		await setDoc(doc(db, 'events', payload.id), data)
	}

	async function handleDelete(ev) {
		await deleteDoc(doc(db, 'events', ev.id))
	}

	return (
		<div className="space-y-4">
			{sorted.map((ev) => (
				<div key={ev.id} className="space-y-2">
					<div className="text-sm text-neutral-500">{ev.date}</div>
					<EventDetails event={ev} role={role} user={user} onUpdate={handleUpdate} onDelete={() => handleDelete(ev)} />
				</div>
			))}
		</div>
	)
}


