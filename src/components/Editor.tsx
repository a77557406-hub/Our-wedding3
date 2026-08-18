import { FormEvent, useEffect, useState } from 'react'
type Invitation = {
  parents: string; groom: string; bride: string; wedding_date: string; venue: string; address: string; guide_text: string
  parent_account: string; bride_parent_account: string; groom_account: string; bride_account: string; photo_url: string
}
type Props = { invitation: Invitation; onSave: (value: Invitation) => Promise<void>; onClose: () => void }
export default function Editor({ invitation, onSave, onClose }: Props) {
  const [form, setForm] = useState(invitation)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => setForm(invitation), [invitation])
  const field = (key: keyof Invitation, label: string, type = 'text') => <label>{label}<input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (Object.values(form).some(v => !String(v ?? '').trim())) { setError('모든 항목을 입력해 주세요.'); return }
    try { setSaving(true); setError(''); await onSave(form) } catch (err) { setError(err instanceof Error ? err.message : '저장에 실패했어요. 다시 시도해 주세요.') } finally { setSaving(false) }
  }
  return <div className="modal-backdrop" role="presentation"><section className="editor modal" role="dialog" aria-modal="true" aria-label="청첩장 정보 수정"><button className="close" onClick={onClose} aria-label="닫기">×</button><p className="eyebrow">EDIT INVITATION</p><h2>예식 정보 수정</h2><form onSubmit={submit}>
    <label>혼주 정보<textarea value={form.parents} onChange={e => setForm({ ...form, parents: e.target.value })} /></label>
    <div className="form-grid">{field('groom', '신랑 이름')}{field('bride', '신부 이름')}</div>
    {field('wedding_date', '예식 일시', 'datetime-local')}{field('venue', '예식장')}{field('address', '주소')}{field('guide_text', '오시는 길 안내')}
    <div className="account-fields"><p>축의금 계좌</p>{field('parent_account', '신랑측 혼주 계좌번호')}{field('bride_parent_account', '신부측 혼주 계좌번호')}{field('groom_account', '신랑 계좌번호')}{field('bride_account', '신부 계좌번호')}</div>
    <label>대표 사진 주소 <input type="url" value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} placeholder="예: /wedding-photo.jpg" /><small>사진 파일을 전달받아 프로젝트에 넣은 뒤, 관리자에게 받은 경로를 입력해 주세요. 비워두면 기본 대표 이미지가 표시됩니다.</small></label>
    {error && <p className="inline-error">{error}</p>}<button disabled={saving}>{saving ? '저장 중...' : '저장하기'}</button>
  </form></section></div>
}
