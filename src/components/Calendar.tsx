type Props = { date: string }

export default function Calendar({ date }: Props) {
  const selected = new Date(date)
  const year = Number.isNaN(selected.getTime()) ? 2026 : selected.getFullYear()
  const month = Number.isNaN(selected.getTime()) ? 10 : selected.getMonth()
  const day = Number.isNaN(selected.getTime()) ? 21 : selected.getDate()
  const first = new Date(year, month, 1).getDay()
  const last = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: first + last }, (_, index) => index < first ? null : index - first + 1)

  return <section className="calendar-section" aria-label={`${year}년 ${month + 1}월 달력`}>
    <p className="eyebrow">WEDDING DAY</p>
    <h2>{year}. {String(month + 1).padStart(2, '0')}</h2>
    <div className="weekdays">{['일', '월', '화', '수', '목', '금', '토'].map(v => <span key={v}>{v}</span>)}</div>
    <div className="days">
      {cells.map((number, index) => number ? <span key={index} className={number === day ? 'selected-day' : ''}>{number}</span> : <span key={index} aria-hidden="true" />)}
    </div>
  </section>
}
