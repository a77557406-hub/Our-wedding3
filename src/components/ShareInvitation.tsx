import { useState } from 'react'

type Props = { title: string; text: string }

export default function ShareInvitation({ title, text }: Props) {
  const [notice, setNotice] = useState('')

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2200)
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showNotice('청첩장 주소를 복사했어요.')
    } catch {
      showNotice('주소를 복사하지 못했어요. 주소창에서 직접 복사해 주세요.')
    }
  }

  const shareKakao = async () => {
    const shareText = `${title}\n${text}\n${window.location.href}`
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `${text}\n${window.location.href}` })
        return
      }
      await navigator.clipboard.writeText(shareText)
      showNotice('카카오톡에 붙여넣을 공유 문구를 복사했어요.')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      showNotice('공유 문구를 복사하지 못했어요.')
    }
  }

  return <div className="share-wrap">
    <div className="share-actions" aria-label="청첩장 공유">
      <button className="share-button copy-share" type="button" onClick={copyAddress}>
        <span aria-hidden="true">⧉</span> 주소 복사
      </button>
      <button className="share-button kakao-share" type="button" onClick={shareKakao}>
        <span className="kakao-share-icon" aria-hidden="true">K</span> 카카오톡 공유
      </button>
    </div>
    {notice && <p className="share-notice" role="status">{notice}</p>}
  </div>
}
