type Props = { groom: string; bride: string }
export default function WeddingPhoto({ groom, bride }: Props) {
  const resolvedPhotoUrl = '/images/hero-wedding.jpg'
  const hasPhoto = true
  return <section className="wedding-photo-section" aria-labelledby="photo-title">
    <p className="eyebrow">OUR MOMENT</p>
    <h2 id="photo-title">두 사람의 시작</h2>
    {hasPhoto ? <figure className="wedding-photo real-photo">
      <img src={resolvedPhotoUrl} alt={`${groom}과 ${bride}의 웨딩 사진`} onError={event => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('photo-load-error') }} />
      <figcaption>with all our love</figcaption>
    </figure> : <div className="wedding-photo" role="img" aria-label="꽃과 베일을 활용해 구성한 웨딩 대표 이미지">
      <div className="photo-light" />
      <div className="photo-arch" />
      <div className="photo-bouquet bouquet-left">✿</div>
      <div className="photo-bouquet bouquet-right">❀</div>
      <div className="photo-couple">
        <span className="photo-veil" />
        <span className="photo-groom" />
        <span className="photo-bride" />
      </div>
      <p>with all our love</p>
    </div>}
  </section>
}
