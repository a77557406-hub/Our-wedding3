const galleryPhotos = [
  { src: '/images/gallery-01.jpg', label: '웨딩 갤러리 사진 1' },
  { src: '/images/gallery-02.jpg', label: '웨딩 갤러리 사진 2' },
  { src: '/images/gallery-03.jpg', label: '웨딩 갤러리 사진 3' },
  { src: '/images/gallery-04.jpg', label: '웨딩 갤러리 사진 4' },
  { src: '/images/gallery-05.jpg', label: '웨딩 갤러리 사진 5' },
  { src: '/images/gallery-06.jpg', label: '웨딩 갤러리 사진 6' },
]
export default function WeddingGallery() {
  return <section className="section wedding-gallery" aria-labelledby="gallery-title">
    <p className="eyebrow">WEDDING GALLERY</p>
    <h2 id="gallery-title">우리의 순간들</h2>
    <p className="gallery-intro">소중한 순간을 함께 나눕니다.</p>
    <div className="gallery-grid">
      {galleryPhotos.map((photo, index) => <figure className="gallery-card" key={photo.src}>
        <img
          src={photo.src}
          alt={photo.label}
          onError={event => event.currentTarget.parentElement?.classList.add('gallery-photo-missing')}
        />
        <figcaption>{index + 1}</figcaption>
      </figure>)}
    </div>
  </section>
}
