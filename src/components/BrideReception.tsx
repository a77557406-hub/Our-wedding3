export default function BrideReception() {
  return <section className="section bride-reception" aria-labelledby="reception-title">
    <div className="reception-couple" aria-hidden="true">
      <span className="reception-groom">🤵</span>
      <span className="reception-heart">♥</span>
      <span className="reception-bride">👰</span>
    </div>
    <p className="eyebrow">BRIDE'S RECEPTION</p>
    <h2 id="reception-title">신부측 피로연 안내</h2>
    <p className="reception-message">
      먼 거리로 인해 본식에 참석하기 어려우신 분들을 위해<br />
      작은 피로연 자리를 마련했습니다.<br />
      귀한 걸음 하시어 함께 축하해 주신다면<br />
      두 사람에게 큰 기쁨이 되겠습니다.
    </p>
    <div className="reception-family">
      <p>혼주 <strong>(故)강보순 · 박인순(만정)</strong></p>
      <p>신랑 <strong>한재호</strong><span aria-hidden="true">　</span>신부 <strong>강지희</strong></p>
    </div>
    <dl className="reception-details">
      <div><dt>일시</dt><dd>2026년 11월 9일 월요일 오후 6시</dd></div>
      <div><dt>장소</dt><dd>우성회관 뷔페<br /><small>고창읍 중앙로 232 6층</small></dd></div>
    </dl>
  </section>
}
