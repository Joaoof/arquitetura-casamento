import React from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { Heart } from 'lucide-react'

const allPhotos = [
  { url: '/img3.webp',  caption: 'O começo de tudo'     },
  { url: '/img4.webp',  caption: 'Cada detalhe importa' },
  { url: '/img5.webp',  caption: 'Momentos eternos'     },
  { url: '/img6.webp',  caption: 'Nossa história'        },
  { url: '/img7.webp',  caption: 'Sempre juntos'         },
  { url: '/img8.webp',  caption: 'Amor verdadeiro'       },
  { url: '/img9.webp',  caption: 'Para sempre'           },
  { url: '/img10.JPG', caption: 'O Amor prevaleçera sempre'           },
  { url: '/img12.webp', caption: 'Com Deus no centro'           },
  { url: '/img13.webp', caption: 'Cristo a nosso redor'           },
  { url: '/img14.webp', caption: 'Ainda mais perto de você'           },
  { url: '/img15.webp', caption: 'Minha para sempre'           },
  { url: '/img16.webp', caption: 'Até que Cristo venha'           },
].filter(p => p.url)

type Props = { onClose: () => void }

export default function PhotoGallery({ onClose }: Props) {
  const [lightbox, setLightbox] = React.useState<number | null>(null)

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightbox !== null) setLightbox(null)
        else onClose()
      }
      if (lightbox === null) return
      if (e.key === 'ArrowRight') setLightbox(i => (i! + 1) % allPhotos.length)
      if (e.key === 'ArrowLeft')  setLightbox(i => (i! - 1 + allPhotos.length) % allPhotos.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox, onClose])

  React.useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <>
      {/* ─── MODAL GALERIA ─────────────────────────────── */}
      <div className="fixed inset-0 z-[100] flex flex-col dark:bg-slate-950"
        style={{ background: 'linear-gradient(180deg, #f0f6ff 0%, #ffffff 100%)' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 dark:border-slate-800"
          style={{ borderBottom: '1px solid #e8f1fb' }}>

          <div className="flex items-center gap-3">
            {/* Barra decorativa + ícone */}
            <div className="h-8 w-1 rounded-full"
              style={{ background: 'linear-gradient(to bottom, #1B3A6B, #4A7AB5)' }} />
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.4em]"
                style={{ color: '#4A7AB5' }}>
                Galeria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Badge contador */}
            <span className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'rgba(200,220,240,0.35)', color: '#4A7AB5' }}>
              {allPhotos.length} fotos
            </span>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-all duration-200 hover:scale-105 dark:border-slate-700 dark:bg-slate-800"
              style={{ border: '1px solid #C8DCF0', color: '#1B3A6B' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#4A7AB5')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#C8DCF0')}
              aria-label="Fechar galeria"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* ── Grid de fotos ── */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
            {allPhotos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className="group relative aspect-square overflow-hidden rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-800"
                style={{ background: '#f0f6ff', border: '1px solid #e8f1fb' }}
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Barra superior colorida no hover */}
                <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: 'linear-gradient(to right, #1B3A6B, #4A7AB5)' }} />

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-[#1B3A6B]/40">
                  <div className="flex h-10 w-10 scale-75 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                    <ZoomIn className="text-white" size={18} strokeWidth={1.5} />
                  </div>
                </div>

                {/* Caption no hover */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0"
                  style={{ background: 'linear-gradient(to top, rgba(27,58,107,0.8), transparent)' }}>
                  <p className="font-serif text-xs italic text-white/90">{photo.caption}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 text-center dark:border-slate-800"
          style={{ borderTop: '1px solid #e8f1fb' }}>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-8" style={{ background: '#C8DCF0' }} />
            <p className="text-xs italic" style={{ color: '#7AAFD4' }}>
              Clique em qualquer foto para ampliar
            </p>
            <div className="h-[1px] w-8" style={{ background: '#C8DCF0' }} />
          </div>
        </div>
      </div>

      {/* ─── LIGHTBOX ──────────────────────────────────── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(10, 20, 45, 0.97)' }}
          onClick={() => setLightbox(null)}
        >
          {/* Botão fechar */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white backdrop-blur-sm transition hover:scale-110"
            style={{ background: 'rgba(74,122,181,0.25)', border: '1px solid rgba(74,122,181,0.4)' }}
          >
            <X size={18} />
          </button>

          {/* Contador */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 backdrop-blur-sm"
            style={{ background: 'rgba(27,58,107,0.5)', border: '1px solid rgba(74,122,181,0.3)' }}>
            <span className="text-xs font-medium tracking-widest text-white/70">
              {String(lightbox + 1).padStart(2, '0')} / {String(allPhotos.length).padStart(2, '0')}
            </span>
          </div>

          {/* Seta esquerda */}
          <button
            onClick={e => { e.stopPropagation(); setLightbox(i => (i! - 1 + allPhotos.length) % allPhotos.length) }}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 md:left-6"
            style={{ background: 'rgba(27,58,107,0.4)', border: '1px solid rgba(74,122,181,0.35)' }}
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>

          {/* Foto ampliada */}
          <div
            className="relative max-h-[85vh] max-w-4xl w-full"
            onClick={e => e.stopPropagation()}
          >
            {/* Barra superior colorida */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-0.5 w-24 rounded-full"
              style={{ background: 'linear-gradient(to right, #1B3A6B, #4A7AB5, #7AAFD4)' }} />

            <img
              key={lightbox}
              src={allPhotos[lightbox].url}
              alt={allPhotos[lightbox].caption}
              className="mx-auto max-h-[80vh] w-auto rounded-xl object-contain shadow-2xl"
              style={{ boxShadow: '0 24px 64px rgba(27,58,107,0.5)' }}
            />

            {/* Caption */}
            <div className="mt-4 flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-6" style={{ background: 'rgba(200,220,240,0.4)' }} />
                <Heart className="h-2.5 w-2.5" style={{ fill: '#4A7AB5', color: '#4A7AB5' }} />
                <div className="h-[1px] w-6" style={{ background: 'rgba(200,220,240,0.4)' }} />
              </div>
              <p className="text-center font-serif text-sm italic text-white/50">
                {allPhotos[lightbox].caption}
              </p>
            </div>
          </div>

          {/* Seta direita */}
          <button
            onClick={e => { e.stopPropagation(); setLightbox(i => (i! + 1) % allPhotos.length) }}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 md:right-6"
            style={{ background: 'rgba(27,58,107,0.4)', border: '1px solid rgba(74,122,181,0.35)' }}
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>

          {/* Miniaturas na base */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto px-4">
            {allPhotos.map((p, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setLightbox(i) }}
                className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${
                  i === lightbox ? 'opacity-100 scale-110' : 'opacity-35 hover:opacity-60'
                }`}
                style={i === lightbox ? {
                  outline: '2px solid #4A7AB5',
                  outlineOffset: '2px',
                  boxShadow: '0 0 12px rgba(74,122,181,0.5)',
                } : {}}
              >
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
