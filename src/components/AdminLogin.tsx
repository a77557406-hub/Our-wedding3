import { FormEvent, useState } from 'react'

type Props = {
  onAuthenticated: (password: string) => Promise<void>
  onClose: () => void
}

export default function AdminLogin({ onAuthenticated, onClose }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!password.trim()) {
      setError('관리자 비밀번호를 입력해 주세요.')
      return
    }
    try {
      setSubmitting(true)
      setError('')
      await onAuthenticated(password)
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return <div className="modal-backdrop" role="presentation">
    <section className="admin-login modal" role="dialog" aria-modal="true" aria-labelledby="admin-login-title">
      <button className="close" type="button" onClick={onClose} aria-label="닫기">×</button>
      <p className="eyebrow">ADMIN ONLY</p>
      <h2 id="admin-login-title">관리자 인증</h2>
      <p className="admin-login-copy">청첩장 정보 수정과 방명록 관리를 위해 비밀번호를 입력해 주세요.</p>
      <form onSubmit={submit}>
        <label>관리자 비밀번호
          <input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" />
        </label>
        {error && <p className="inline-error">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? '확인 중...' : '관리자 확인'}</button>
      </form>
    </section>
  </div>
}
