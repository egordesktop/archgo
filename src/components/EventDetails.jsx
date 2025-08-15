import { useState } from 'react'
import { motion } from 'framer-motion'
import { deleteObject, ref } from 'firebase/storage'
import { storage } from '../firebase'
import Comments from './Comments.jsx'

export default function EventDetails({ event, isCreate, user, role, onUpdate, onDelete }) {
	const isAdmin = role === 'admin'
	const [editing, setEditing] = useState(isCreate || false)
	const [title, setTitle] = useState(event?.title || '')
	const [description, setDescription] = useState(event?.description || '')
	const [file, setFile] = useState(null)

	async function handleSave() {
		const payload = { id: event?.id, title, description, attachments: event?.attachments || [] }
		await onUpdate(payload, file)
		if (isCreate) {
			setTitle('')
			setDescription('')
			setFile(null)
		} else {
			setEditing(false)
			setFile(null)
		}
	}

	async function handleDeleteAttachment(att) {
		if (!event?.attachments) return
		if (!isAdmin && user.uid !== event.createdBy) return
		try {
			await deleteObject(ref(storage, att.path))
			const next = (event.attachments || []).filter((a) => a.path !== att.path)
			await onUpdate({ id: event.id, title: event.title, description: event.description, attachments: next })
		} catch {}
	}

	return (
		<div className="card p-3">
			{editing || isCreate ? (
				<div className="space-y-2">
					<input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Название" />
					<textarea className="input h-24" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Описание" />
					<input type="file" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
					<div className="flex gap-2">
						<button className="btn btn-accent" onClick={handleSave}>Сохранить</button>
						{!isCreate && (
							<button className="btn" onClick={()=>setEditing(false)}>Отмена</button>
						)}
					</div>
				</div>
			) : (
				<div className="space-y-2">
					<div className="flex items-start justify-between">
						<div>
							<div className="font-medium">{event.title}</div>
							<div className="text-sm text-neutral-600 whitespace-pre-wrap">{event.description}</div>
						</div>
						{(isAdmin || user.uid === event.createdBy) && (
							<div className="flex gap-2">
								<button className="btn" onClick={()=>setEditing(true)}>Редактировать</button>
								<button className="btn" onClick={onDelete}>Удалить</button>
							</div>
						)}
					</div>
					{event.attachments?.length ? (
						<div className="space-y-1">
							<div className="text-xs text-neutral-500">Файлы</div>
							<div className="flex flex-wrap gap-2">
								{event.attachments.map((att) => (
									<div key={att.path} className="flex items-center gap-2 text-sm">
										<a className="underline" href={att.url} target="_blank" rel="noreferrer">{att.name}</a>
										{(isAdmin || user.uid === event.createdBy) && (
											<button className="text-xs" onClick={()=>handleDeleteAttachment(att)}>Удалить</button>
										)}
									</div>
								))}
							</div>
						</div>
					) : null}
					{event?.id ? <Comments eventId={event.id} user={user} /> : null}
				</div>
			)}
		</div>
	)
}


