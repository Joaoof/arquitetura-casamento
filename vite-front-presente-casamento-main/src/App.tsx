import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { useGifts } from './hooks/useGifts'
import { Gift } from './types'

import Header from './components/Header'
import Footer from './components/Footer'
import GiftList from './components/GiftList'
import AdminPanel from './components/AdminPanel'
import LoginModal from './components/LoginModal'
import PhotoCarousel from './components/PhotosCarousel'
import OurStory from './components/OurStory'
import RSVP from './components/RSVP'

import './styles/animations.css'
import WelcomeBanner from './components/WelcomeBanner'
import { DEFAULT_COUPLE_SLUG, getCoupleConfig, normalizeCoupleSlug } from './config/couples'

function HomePage() {
  const { coupleSlug } = useParams<{ coupleSlug: string }>()
  const normalizedCoupleSlug = normalizeCoupleSlug(coupleSlug)
  const couple = getCoupleConfig(normalizedCoupleSlug)

  const { isAuthenticated, logout } = useAuth()
  const {
    gifts, addGift, updateGift, removeGift, reserveGift,
    searchTerm, setSearchTerm, filter, setFilter,
  } = useGifts(normalizedCoupleSlug)

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [giftToEdit, setGiftToEdit] = useState<Gift | null>(null)

  const handleEditGift = (gift: Gift) => setGiftToEdit(gift)
  const handleCancelEdit = () => setGiftToEdit(null)

  const handleSubmitEdit = (data: Omit<Gift, 'id' | 'createdAt' | 'status'>) => {
    if (giftToEdit) { updateGift(giftToEdit.id, data); setGiftToEdit(null) }
    else addGift(data)
  }

  const handleReserveGift = async (id: string, reservedBy: string) => {
    try { await reserveGift(id, reservedBy) }
    catch (error) { console.error('Erro ao reservar presente:', error); throw error }
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
            giftToEdit={giftToEdit}
            onCancelEdit={handleCancelEdit}
          />
        )}

        <GiftList
          isAdmin={isAuthenticated}
          onEditGift={handleEditGift}
          onDeleteGift={removeGift}
          onReserveGift={handleReserveGift}
          coupleNames={couple.names}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filter={filter}
          onFilterChange={setFilter}
          coupleSlug={normalizedCoupleSlug}
        />
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
  return (
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
  )
}
