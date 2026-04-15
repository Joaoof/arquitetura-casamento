import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Heart, Images } from 'lucide-react'
import PhotoGallery from './PhotoGallery'

const photos = [
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


export default function PhotoCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 35, align: 'center' })
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [isHovering, setIsHovering] = React.useState(false)
  const [showGallery, setShowGallery] = React.useState(false)

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi, onSelect])

  React.useEffect(() => {
    if (!emblaApi || isHovering) return
    const timer = setInterval(() => emblaApi.scrollNext(), 5000)
    return () => clearInterval(timer)
  }, [emblaApi, isHovering])

  return (
    <>
      <section
        className="relative w-full overflow-hidden py-24 dark:bg-slate-900"
        style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f6ff 50%, #ffffff 100%)' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Fundo decorativo — blobs azuis */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl"
            style={{ background: 'rgba(200,220,240,0.35)' }} />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl"
            style={{ background: 'rgba(74,122,181,0.12)' }} />
        </div>

        {/* ── Título ── */}
        <div className="relative mb-14 px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-[1px] w-10" style={{ background: '#C8DCF0' }} />
            <Heart className="h-3.5 w-3.5" style={{ fill: '#4A7AB5', color: '#4A7AB5' }} />
            <div className="h-[1px] w-10" style={{ background: '#C8DCF0' }} />
          </div>

          <span className="mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.35em]"
            style={{ borderColor: '#C8DCF0', color: '#4A7AB5', background: 'rgba(200,220,240,0.2)' }}>
            <Heart className="h-2.5 w-2.5" style={{ fill: '#4A7AB5' }} />
            Galeria
          </span>

          <h2 className="mt-2 font-serif text-3xl font-bold dark:text-white md:text-4xl"
            style={{ color: '#1B3A6B' }}>
            Nossos Momentos
          </h2>

          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <div className="h-[1px] w-12" style={{ background: '#C8DCF0' }} />
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#4A7AB5' }} />
            <div className="h-[1px] w-12" style={{ background: '#C8DCF0' }} />
          </div>
        </div>

        {/* ── Carrossel ── */}
        <div className="relative mx-auto max-w-7xl">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y items-center">
              {photos.map((photo, index) => {
                const isActive = index === selectedIndex
                return (
                  <div
                    key={index}
                    className="relative flex-[0_0_88%] min-w-0 px-2 transition-all duration-700 ease-out sm:flex-[0_0_70%] md:flex-[0_0_55%] lg:flex-[0_0_45%] md:px-4"
                    style={{ opacity: isActive ? 1 : 0.35, transform: isActive ? 'scale(1)' : 'scale(0.88)' }}
                  >
                    <div className={`relative overflow-hidden rounded-2xl transition-shadow duration-700 ${isActive ? 'shadow-[0_30px_80px_rgba(27,58,107,0.2)]' : 'shadow-md'
                      }`}>
                      {/* Borda superior colorida no card ativo */}
                      {isActive && (
                        <div className="absolute top-0 left-0 right-0 h-1 z-10 rounded-t-2xl"
                          style={{ background: 'linear-gradient(to right, #1B3A6B, #4A7AB5, #7AAFD4)' }} />
                      )}

                      <div className="aspect-[4/5] md:aspect-[16/10]">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="h-full w-full object-cover transition-transform duration-[2500ms] ease-out hover:scale-105"
                          loading="lazy"
                          decoding="async"
                          style={{ contentVisibility: 'auto' }}
                        />
                      </div>

                      {/* Legenda */}
                      <div className={`absolute inset-0 flex flex-col justify-end p-6 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                        style={{ background: 'linear-gradient(to top, rgba(27,58,107,0.7) 0%, rgba(27,58,107,0.1) 50%, transparent 100%)' }}>
                        <p className="font-serif text-base font-medium italic text-white/90 drop-shadow md:text-lg">
                          {photo.caption}
                        </p>
                        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.3em] text-white/50">
                          {String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Seta esquerda */}
          <button
            onClick={scrollPrev}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 dark:bg-slate-800/90 dark:text-white sm:left-6 md:h-12 md:w-12"
            style={{ border: '1px solid #C8DCF0', color: '#1B3A6B' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#4A7AB5')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#C8DCF0')}
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>

          {/* Seta direita */}
          <button
            onClick={scrollNext}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 dark:bg-slate-800/90 dark:text-white sm:right-6 md:h-12 md:w-12"
            style={{ border: '1px solid #C8DCF0', color: '#1B3A6B' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#4A7AB5')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#C8DCF0')}
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Barra de progresso + dots + botão ── */}
        <div className="relative mt-10 flex flex-col items-center gap-4 px-4">

          {/* Barra de progresso */}
          <div className="h-[2px] w-32 overflow-hidden rounded-full dark:bg-slate-700"
            style={{ background: '#dbeafe' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((selectedIndex + 1) / photos.length) * 100}%`,
                background: 'linear-gradient(to right, #1B3A6B, #4A7AB5)',
              }}
            />
          </div>

          {/* Dots */}
          <div className="flex items-center gap-3">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Foto ${index + 1}`}
                className="group relative flex h-5 w-5 items-center justify-center"
              >
                <span
                  className="block rounded-full transition-all duration-300"
                  style={{
                    height: index === selectedIndex ? '8px' : '6px',
                    width: index === selectedIndex ? '20px' : '6px',
                    background: index === selectedIndex ? '#4A7AB5' : '#C8DCF0',
                  }}
                />
              </button>
            ))}
          </div>

          {/* Botão Ver Todas */}
          <button
            onClick={() => setShowGallery(true)}
            className="group mt-2 flex items-center gap-2.5 rounded-full bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-800"
            style={{
              border: '1px solid #C8DCF0',
              color: '#4A7AB5',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#4A7AB5'
              e.currentTarget.style.background = '#f0f6ff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#C8DCF0'
              e.currentTarget.style.background = 'white'
            }}
          >
            <Images size={14} strokeWidth={1.5} />
            Ver todas as fotos
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: 'rgba(200,220,240,0.4)', color: '#4A7AB5' }}>
              {photos.length}
            </span>
          </button>
        </div>
      </section>

      {showGallery && <PhotoGallery onClose={() => setShowGallery(false)} />}
    </>
  )
}
