import { useState } from 'react'
type Account = { label: string; account: string }
type Props = { groomParentAccount: string; brideParentAccount: string; groomAccount: string; brideAccount: string }
export default function AccountInfo({ groomParentAccount, brideParentAccount, groomAccount, brideAccount }: Props) {
  const [copied, setCopied] = useState('')
  const accounts: Account[] = [
    { label: '신랑측 혼주', account: groomParentAccount },
    { label: '신랑', account: groomAccount },
    { label: '신부측 혼주', account: brideParentAccount },
    { label: '신부', account: brideAccount },
  ]
  const copy = async (label: string, account: string) => {
    try {
      await navigator.clipboard.writeText(account)
      setCopied(label)
      window.setTimeout(() => setCopied(''), 1800)
    } catch {
      setCopied('error')
    }
  }
  return <section className="section account-section" aria-labelledby="account-title">
    <p className="eyebrow">GIFT ACCOUNT</p>
    <h2 id="account-title">마음을 전하는 곳</h2>
    <p className="account-note">축하의 마음을 보내주실 분은 아래 계좌를 이용해 주세요.</p>
    <div className="account-list">
      {accounts.map(({ label, account }) => <article className="account-card" key={label}>
        <span className="account-label">{label}</span>
        <p>{account}</p>
        <button className="copy-button" type="button" onClick={() => copy(label, account)} aria-label={`${label} 계좌번호 복사`}>
          <span aria-hidden="true">⧉</span> {copied === label ? '복사됨' : '복사하기'}
        </button>
      </article>)}
    </div>
    {copied === 'error' && <p className="inline-error account-feedback">복사하지 못했어요. 계좌번호를 길게 눌러 복사해 주세요.</p>}
  </section>
}
