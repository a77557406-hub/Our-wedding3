import { useCallback, useEffect, useState } from 'react'
import { api } from './lib/api'
import Calendar from './components/Calendar'
import Guestbook from './components/Guestbook'
import Editor from './components/Editor'
import WeddingPhoto from './components/WeddingPhoto'
import AccountInfo from './components/AccountInfo'
import AdminLogin from './components/AdminLogin'
import ShareInvitation from './components/ShareInvitation'
import BrideReception from './components/BrideReception'
import WeddingGallery from './components/WeddingGallery'
type Invitation = {
  parents: string; groom: string; bride: string; wedding_date: string; venue: string; address: string; guide_text: string
  parent_account: string; bride_parent_account: string; groom_account: string; bride_account: string; photo_url: string
}
type Entry = { id: number; name: string; message: string; created_at: string }
export default function App() {
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([api('invitation'), api('guestbook')])
      if (!a.ok || !b.ok) throw new Error()
      setInvitation(await a.json())
      setEntries(await b.json())
    } catch { setError('청첩장 정보를 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.') }
  }, [])
  useEffect(() => { load() }, [load])
  const authenticateAdmin = async (password: string) => {
    const response = await api('admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const result = await response.json().catch(() => null)
    if (!response.ok || !result?.token) throw new Error(result?.detail || '관리자 인증에 실패했어요.')
    setAdminToken(result.token)
    setShowAdminLogin(false)
    setEditing(true)
  }
  const adminHeaders = () => ({ 'Content-Type': 'application/json', 'X-Admin-Token': adminToken })
  const save = async (value: Invitation) => {
    const response = await api('invitation', { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(value) })
    if (!response.ok) {
      const detail = await response.json().catch(() => null)
      if (response.status === 401) setAdminToken('')
      throw new Error(detail?.detail || '저장에 실패했어요.')
    }
    const savedInvitation = await response.json() as Invitation
    setInvitation(savedInvitation)
    setEditing(false)
  }
  const addGuestbook = async (name: string, message: string) => {
    const response = await api('guestbook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, message }) })
    if (!response.ok) throw new Error()
    const entry = await response.json()
    setEntries(current => [entry, ...current])
  }
  const deleteGuestbook = async (id: number) => {
    const response = await api(`guestbook/${id}`, { method: 'DELETE', headers: { 'X-Admin-Token': adminToken } })
    if (!response.ok) {
      const detail = await response.json().catch(() => null)
      if (response.status === 401) setAdminToken('')
      throw new Error(detail?.detail || '삭제하지 못했어요.')
    }
    setEntries(current => current.filter(entry => entry.id !== id))
  }
  if (error) return <main className="state"><p>{error}</p><button onClick={load}>다시 불러오기</button></main>
  if (!invitation) return <main className="state"><p>청첩장을 준비하고 있어요…</p></main>
  const date = new Date(invitation.wedding_date)
  const isAdminView = new URLSearchParams(window.location.search).has('admin')
  const prettyDate = Number.isNaN(date.getTime()) ? invitation.wedding_date : `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours() < 12 ? '오전' : '오후'} ${String(date.getHours() % 12 || 12).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  return <main className="page">
    <header className="hero">
      <nav><span>OUR WEDDING</span><div><a href="#location">오시는 길</a><a href="#guestbook">방명록</a></div></nav>
      <p className="parents">{invitation.parents}</p>
      <p className="invite-copy">서로의 가장 빛나는 계절에<br />소중한 분들을 초대합니다</p>
      <h1>{invitation.groom} <i>&</i> {invitation.bride}</h1>
      <ShareInvitation title={`${invitation.groom} · ${invitation.bride} 결혼식에 초대합니다`} text={`${prettyDate} · ${invitation.venue}`} />
      <p className="hero-date">{prettyDate}</p>
      {isAdminView && <button className="edit-trigger" type="button" onClick={() => adminToken ? setEditing(true) : setShowAdminLogin(true)}>청첩장 정보 수정</button>}
    </header>
    <Calendar date={invitation.wedding_date} />
    <WeddingPhoto groom={invitation.groom} bride={invitation.bride} />
    <section className="section promise"><span>❦</span><p>두 사람이 함께 걸어갈 첫걸음,<br />따뜻한 축복으로 함께해 주세요.</p></section>
    <section className="section location" id="location"><p className="eyebrow">LOCATION</p><h2>{invitation.venue}</h2><p className="address">{invitation.address}</p><iframe className="map-embed" title={`${invitation.venue} 위치 지도`} src={`https://www.google.com/maps?q=${encodeURIComponent(invitation.address)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><div className="map-links"><a className="map-link naver-map-link" href="https://naver.me/F74k0m9y" target="_blank" rel="noreferrer"><span className="map-brand" aria-hidden="true">N</span> 네이버맵 <span aria-hidden="true">↗</span></a><a className="map-link kakao-map-link" href={`https://map.kakao.com/link/search/${encodeURIComponent(invitation.address)}`} target="_blank" rel="noreferrer"><span className="map-brand" aria-hidden="true">K</span> 카카오맵 <span aria-hidden="true">↗</span></a></div><p className="guide">{invitation.guide_text}</p></section>
    <BrideReception />
    <AccountInfo groomParentAccount={invitation.parent_account} brideParentAccount={invitation.bride_parent_account} groomAccount={invitation.groom_account} brideAccount={invitation.bride_account} />
    <WeddingGallery />
    <Guestbook entries={entries} onSubmit={addGuestbook} isAdmin={Boolean(adminToken)} onDelete={deleteGuestbook} />
    <footer>with love, {invitation.groom} & {invitation.bride}</footer>
    {showAdminLogin && <AdminLogin onAuthenticated={authenticateAdmin} onClose={() => setShowAdminLogin(false)} />}
    {editing && <Editor invitation={invitation} onSave={save} onClose={() => setEditing(false)} />}
  </main>
}
