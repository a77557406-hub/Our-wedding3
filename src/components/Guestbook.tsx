import { FormEvent, useState } from 'react'
type Entry = { id: number; name: string; message: string; created_at: string }
type Props = {
  entries: Entry[]
  onSubmit: (name: string, message: string) => Promise<void>
  isAdmin?: boolean
  onDelete?: (id: number) => Promise<void>
}
export default function Guestbook({ entries, onSubmit, isAdmin = false, onDelete }: Props) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !message.trim()) { setError('이름과 축하 메시지를 모두 입력해 주세요.'); return }
    try { setSaving(true); setError(''); await onSubmit(name, message); setName(''); setMessage('') }
    catch { setError('방명록을 남기지 못했어요. 잠시 후 다시 시도해 주세요.') }
    finally { setSaving(false) }
  }
  const remove = async (entry: Entry) => {
    if (!onDelete || !window.confirm(`“${entry.name}”님의 방명록을 삭제할까요?`)) return
    try { setDeletingId(entry.id); await onDelete(entry.id) }
    catch { setError('방명록을 삭제하지 못했어요. 다시 시도해 주세요.') }
    finally { setDeletingId(null) }
  }
  return <section className="guestbook section" id="guestbook">
    <p className="eyebrow">GUEST BOOK</p><h2>마음을 남겨주세요</h2>
    <form onSubmit={submit} className="guest-form">
      <label>이름<input value={name} maxLength={24} onChange={e => setName(e.target.value)} placeholder="이름을 입력해 주세요" /></label>
      <label>축하 메시지<textarea value={message} maxLength={300} onChange={e => setMessage(e.target.value)} placeholder="두 사람을 위한 따뜻한 한마디" /></label>
      {error && <p className="inline-error">{error}</p>}
      <button type="submit" disabled={saving}>{saving ? '남기는 중...' : '축하 인사 남기기'}</button>
    </form>
    <div className="entries" aria-live="polite">
      {entries.length === 0 ? <p className="empty">첫 번째 축하 인사를 남겨주세요.</p> : entries.map(entry => <article className="entry" key={entry.id}>
        <div className="entry-head"><strong>{entry.name}</strong>{isAdmin && <button className="delete-entry" type="button" onClick={() => remove(entry)} disabled={deletingId === entry.id}>{deletingId === entry.id ? '삭제 중' : '삭제'}</button>}</div>
        <p>{entry.message}</p><time>{entry.created_at?.slice(0, 10).replaceAll('-', '.')}</time>
      </article>)}
    </div>
  </section>
}
