import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { useGifts } from './hooks/useGifts'
import { Gift } from './types'

import Header from './components/Header'
import Footer from './components/Footer'
import AdminPanel from './components/AdminPanel'
import LoginModal from './components/LoginModal'
import PhotoCarousel from './components/PhotosCarousel'
import OurStory from './components/OurStory'
import RSVP from './components/RSVP'
import SplashScreen from './components/SplashScreen'

import './styles/animations.css'
import WelcomeBanner from './components/WelcomeBanner'
import { DEFAULT_COUPLE_SLUG, getCoupleConfig, normalizeCoupleSlug } from './config/couples'

const GIFT_IMAGE_URL = 'https://i.postimg.cc/sg27fNB9/Whats-App-Image-2026-04-22-at-10-53-29.jpg'

function HomePage() {
  const { coupleSlug } = useParams<{ coupleSlug: string }>()
  const normalizedCoupleSlug = normalizeCoupleSlug(coupleSlug)
  const couple = getCoupleConfig(normalizedCoupleSlug)

  const { isAuthenticated } = useAuth()
  const {
    gifts, addGift, updateGift, removeGift, removeAllGifts,
  } = useGifts(normalizedCoupleSlug)

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [giftToEdit, setGiftToEdit] = useState<Gift | null>(null)

  const handleCancelEdit = () => setGiftToEdit(null)

  const handleSubmitEdit = (data: Omit<Gift, 'id' | 'createdAt' | 'status'>) => {
    if (giftToEdit) { updateGift(giftToEdit.id, data); setGiftToEdit(null) }
    else addGift(data)
  }

  return (
    <div className="bg-custom-header min-h-screen flex flex-col font-lato">
      <WelcomeBanner coupleNames={couple.names} coupleSlug={normalizedCoupleSlug} />

      <Header
        coupleNames={couple.names}
        weddingDate={couple.weddingDateLabel}
        weddingDateISO={couple.weddingDateISO}
      />

      <main className="flex-grow container mx-auto">
        <OurStory />
        <PhotoCarousel />

        {isAuthenticated && (
          <AdminPanel
            gifts={gifts}
            onAddGift={handleSubmitEdit}
            onUpdateGift={updateGift}
            onDeleteGift={removeGift}
            onDeleteAllGifts={removeAllGifts}
            giftToEdit={giftToEdit}
            onCancelEdit={handleCancelEdit}
          />
        )}

      <section id="lista-de-presentes" className="max-w-1xl mx-auto px-4 py-10">
  {/* Alert */}
  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl px-6 py-5 text-center shadow-sm">
    <p className="text-blue-800 font-semibold text-base mb-2">
      Queridos amigos e familiares 💙
    </p>
    <p className="text-blue-700 text-sm leading-relaxed">
      Não teremos lista de presentes. Estamos de mudança para Brasília e, caso queiram nos presentear, uma contribuição via Pix será muito bem-vinda.
    </p>
    <p className="text-blue-700 text-sm leading-relaxed mt-2">
      Disponibilizamos o QR Code para facilitar.<br />
      Agradecemos de coração por todo carinho e apoio!
    </p>
    <p className="text-blue-800 font-medium text-sm mt-3">
      Com amor, Luis Vinicius & Natiele! 🤍
    </p>
  </div>

  {/* Imagem menor e centralizada */}
  <a
    href={GIFT_IMAGE_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="block mx-auto w-64 sm:w-80"
  >
    <img
      src={GIFT_IMAGE_URL}
      alt="QR Code Pix"
      className="w-full h-auto rounded-2xl shadow-lg"
      loading="lazy"
    />
  </a>
</section>
      </main>

      <Footer />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to={`/${DEFAULT_COUPLE_SLUG}`} replace />} />
            <Route path="/rsvp" element={<Navigate to={`/${DEFAULT_COUPLE_SLUG}/rsvp`} replace />} />
            <Route path="/:coupleSlug" element={<HomePage />} />
            <Route path="/:coupleSlug/rsvp" element={<RSVP />} />
            <Route path="*" element={<Navigate to={`/${DEFAULT_COUPLE_SLUG}`} replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}
