import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function Comments({ eventId, user }) {
	const [comments, setComments] = useState([])
	const [text, setText] = useState('')

	useEffect(() => {
		const q = query(collection(db, 'events', eventId, 'comments'), orderBy('createdAt', 'asc'))
		const unsub = onSnapshot(q, (snap) => {
			const list = []
			snap.forEach((d) => list.push({ id: d.id, ...d.data() }))
			setComments(list)
		})
		return () => unsub()
	}, [eventId])

	async function createComment() {
		const content = text.trim()
		if (!content) return
		setText('')
		await addDoc(collection(db, 'events', eventId, 'comments'), {
			content,
			userId: user.uid,
			userEmail: user.email,
			createdAt: serverTimestamp(),
		})
	}

	async function updateComment(c, content) {
		if (c.userId !== user.uid) return
		await setDoc(doc(db, 'events', eventId, 'comments', c.id), { ...c, content })
	}

	async function deleteComment(c) {
		if (c.userId !== user.uid) return
		await deleteDoc(doc(db, 'events', eventId, 'comments', c.id))
	}

	return (
		<div className="mt-3 border-t border-neutral-200 pt-3">
			<div className="text-sm font-medium mb-2">Комментарии</div>
			<div className="space-y-2">
				{comments.map((c) => (
					<CommentRow key={c.id} c={c} user={user} onSave={updateComment} onDelete={deleteComment} />
				))}
				<div className="flex gap-2">
					<input className="input" value={text} onChange={(e)=>setText(e.target.value)} placeholder="Оставьте комментарий..." />
					<button className="btn btn-primary" onClick={createComment}>Отправить</button>
				</div>
			</div>
		</div>
	)
}

function CommentRow({ c, user, onSave, onDelete }) {
	const [editing, setEditing] = useState(false)
	const [value, setValue] = useState(c.content)
	const canEdit = c.userId === user.uid
	return (
		<div className="rounded-md bg-neutral-50 p-2">
			<div className="flex items-start justify-between gap-3">
				<div className="text-sm">
					<div className="text-neutral-500">{c.userEmail}</div>
					{editing ? (
						<textarea className="input h-20 mt-1" value={value} onChange={(e)=>setValue(e.target.value)} />
					) : (
						<div className="whitespace-pre-wrap">{c.content}</div>
					)}
				</div>
				{canEdit && (
					<div className="flex gap-2">
						{editing ? (
							<button className="btn btn-accent" onClick={() => { onSave(c, value); setEditing(false) }}>Сохранить</button>
						) : (
							<button className="btn" onClick={() => setEditing(true)}>Редактировать</button>
						)}
						<button className="btn" onClick={() => onDelete(c)}>Удалить</button>
					</div>
				)}
			</div>
		</div>
	)
}


