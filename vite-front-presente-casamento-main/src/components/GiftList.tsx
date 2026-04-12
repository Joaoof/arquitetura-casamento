import React, { useState, useEffect, useMemo } from 'react';
import { Gift } from '../types';
import GiftItem from './GiftItem';
import { ChevronLeft, ChevronRight, PresentationIcon, Search } from 'lucide-react';
import ReservationModal from './ReservationModal';

interface GiftListProps {
  isAdmin: boolean;
  onEditGift: (gift: Gift) => void;
  onDeleteGift: (id: string) => void;
  onReserveGift: (id: string, reservedBy: string) => void;
  coupleNames: string;
  filter: 'all' | 'available' | 'reserved';
  searchTerm: string;
  onFilterChange: (filter: 'all' | 'available' | 'reserved') => void;
  onSearchChange: (term: string) => void;
  coupleSlug?: string;
}

const ITEMS_PER_PAGE = 12;

const GiftList: React.FC<GiftListProps> = ({
  isAdmin,
  onEditGift,
  onDeleteGift,
  onReserveGift,
  coupleNames,
  filter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  coupleSlug,
}) => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [hasError, setHasError] = useState(false);

  const fetchGifts = async () => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/gifts${coupleSlug ? `?couple=${encodeURIComponent(coupleSlug)}` : ''}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });
      if (!response.ok) {
        if (!hasError) { alert('Erro ao carregar lista de presentes.'); setHasError(true); }
        return;
      }
      const result = await response.json();
      setGifts(Array.isArray(result) ? result : []);
      setHasError(false);
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (!hasError) { alert('Erro ao carregar lista de presentes.'); setHasError(true); }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchGifts(); }, [filter, coupleSlug]);

  const filteredGifts = useMemo(() => {
    return gifts
      .filter((gift) => {
        if (filter === 'available') return gift.status === 'available';
        if (filter === 'reserved')  return gift.status === 'reserved';
        return true;
      })
      .filter((gift) => gift.name.toLowerCase().includes(searchTerm.toLowerCase().trim()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [gifts, filter, searchTerm]);

  const totalPages = Math.ceil(filteredGifts.length / ITEMS_PER_PAGE);
  const paginatedGifts = useMemo(() => {
    return filteredGifts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredGifts, currentPage]);

  const handleOpenModal   = (gift: Gift) => { setSelectedGift(gift); setModalOpen(true); };
  const handleViewDetails = (gift: Gift) => { setSelectedGift(gift); setDetailsModalOpen(true); };
  const handlePageChange  = (page: number) => setCurrentPage(page);

  const showSuccessToast = (giftName: string) => {
    const toast = document.createElement('div');
    toast.className =
      'fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white border text-green-800 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ease-out opacity-0 translate-y-[-10px]';
    toast.style.maxWidth = '90%';
    toast.style.borderColor = '#C8DCF0';
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 rounded-full" style="background:#4A7AB5"></div>
        <span class="text-sm font-medium" style="color:#1B3A6B">Presente reservado com sucesso, confira mais informações em seu e-mail</span>
      </div>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-10px)';
      setTimeout(() => { if (document.body.contains(toast)) document.body.removeChild(toast); }, 300);
    }, 3000);
  };

  const handleConfirmReservation = async (reservedBy: string) => {
    if (selectedGift) {
      try {
        await onReserveGift(selectedGift.id, reservedBy);
        showSuccessToast(selectedGift.name);
      } catch (err) {
        alert('Erro ao reservar. Tente novamente.');
      } finally {
        setModalOpen(false);
        setSelectedGift(null);
        fetchGifts();
      }
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisiblePages = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage   = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages)
      startPage = Math.max(1, endPage - maxVisiblePages + 1);

    // Botão Anterior
    if (currentPage > 1)
      pages.push(
        <button key="prev" onClick={() => handlePageChange(currentPage - 1)}
          className="flex items-center justify-center w-8 h-8 rounded transition-all duration-200 hover:scale-105"
          style={{ color: '#4A7AB5' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f0f6ff')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <ChevronLeft size={16} />
        </button>
      );

    // Primeira página + reticências
    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => handlePageChange(1)}
          className="w-8 h-8 rounded text-sm transition-all duration-200"
          style={{ color: '#4A7AB5' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f0f6ff')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          1
        </button>
      );
      if (startPage > 2)
        pages.push(<span key="ellipsis1" className="px-2 text-sm" style={{ color: '#7AAFD4' }}>...</span>);
    }

    // Páginas numeradas
    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPage;
      pages.push(
        <button key={i} onClick={() => handlePageChange(i)}
          className="w-8 h-8 rounded text-sm font-medium transition-all duration-200"
          style={{
            background: isActive ? '#1B3A6B' : 'transparent',
            color: isActive ? '#ffffff' : '#4A7AB5',
            boxShadow: isActive ? '0 2px 8px rgba(27,58,107,0.3)' : 'none',
          }}
          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f0f6ff'; }}
          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
          {i}
        </button>
      );
    }

    // Última página + reticências
    if (endPage < totalPages) {
      if (endPage < totalPages - 1)
        pages.push(<span key="ellipsis2" className="px-2 text-sm" style={{ color: '#7AAFD4' }}>...</span>);
      pages.push(
        <button key={totalPages} onClick={() => handlePageChange(totalPages)}
          className="w-8 h-8 rounded text-sm transition-all duration-200"
          style={{ color: '#4A7AB5' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f0f6ff')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          {totalPages}
        </button>
      );
    }

    // Botão próximo
    if (currentPage < totalPages)
      pages.push(
        <button key="next" onClick={() => handlePageChange(currentPage + 1)}
          className="flex items-center justify-center w-8 h-8 rounded transition-all duration-200 hover:scale-105"
          style={{ color: '#4A7AB5' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f0f6ff')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <ChevronRight size={16} />
        </button>
      );

    return (
      <div className="flex items-center justify-center gap-1 mt-8 mb-4">
        <div className="flex items-center gap-1 rounded-xl p-1.5"
          style={{ background: '#f0f6ff', border: '1px solid #e8f1fb' }}>
          {pages}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4">

      {/* ── Título e imagem ── */}
      <div className="text-center mb-1">
        <img
          src="https://i.postimg.cc/s24p309j/Noivos-em-Silhueta-e-Flores.png"
          alt="Noivos em silhueta decorativa"
          className="w-44 mx-auto mb-6 opacity-80"
          style={{ filter: 'hue-rotate(200deg) saturate(0.8)' }} // ← tinge a imagem de azul suavemente
        />

        {/* Badge título */}
        <div className="inline-flex flex-col items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em]"
            style={{ borderColor: '#C8DCF0', color: '#4A7AB5', background: 'rgba(200,220,240,0.2)' }}>
            Lista de Presentes
          </span>
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-10" style={{ background: '#C8DCF0' }} />
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#4A7AB5' }} />
            <div className="h-[1px] w-10" style={{ background: '#C8DCF0' }} />
          </div>
        </div>
      </div>

      {/* ── Aviso de preços ── */}
      <div className="rounded-xl p-3 mb-6 max-w-md mx-auto"
        style={{ background: 'rgba(200,220,240,0.2)', border: '1px solid #C8DCF0' }}>
        <p className="text-xs text-center leading-relaxed" style={{ color: '#4A7AB5' }}>
          <strong style={{ color: '#1B3A6B' }}>Atenção:</strong> Preços sujeitos a alteração.
          Os valores indicados são válidos para pagamento à vista (débito).
        </p>
      </div>

      {/* ── Filtros e instrução ── */}
      <div className="flex items-center justify-between gap-5 mb-6">
        {/* Botão instrução */}
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: '#f0f6ff', border: '1px solid #C8DCF0', color: '#4A7AB5' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#4A7AB5')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#C8DCF0')}
        >
          <PresentationIcon size={15} />
          <span>Reserve seu presente</span>
        </button>

        {/* Select de filtro */}
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#7AAFD4' }}>Ordenar por:</span>
          <select
            onChange={(e) => onFilterChange(e.target.value as 'all' | 'available' | 'reserved')}
            value={filter}
            className="text-sm rounded-lg px-3 py-1.5 outline-none transition-all duration-200"
            style={{
              border: '1px solid #C8DCF0',
              color: '#1B3A6B',
              background: '#f0f6ff',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#4A7AB5')}
            onBlur={e  => (e.currentTarget.style.borderColor = '#C8DCF0')}
          >
            <option value="all">Todos os presentes</option>
            <option value="available">Disponíveis</option>
            <option value="reserved">Reservados</option>
          </select>
        </div>
      </div>

      {/* ── Campo de pesquisa ── */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none"
            style={{ color: '#7AAFD4' }} />
          <input
            type="text"
            placeholder="Pesquisar presentes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all duration-200"
            style={{
              border: '1px solid #C8DCF0',
              background: '#f0f6ff',
              color: '#1B3A6B',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#4A7AB5')}
            onBlur={e  => (e.currentTarget.style.borderColor = '#C8DCF0')}
          />
        </div>
      </div>

      {/* ── Contador de resultados ── */}
      {filteredGifts.length > 0 && (
        <div className="text-center mb-4">
          <span className="inline-block rounded-full px-4 py-1 text-xs font-medium"
            style={{ background: 'rgba(200,220,240,0.3)', color: '#4A7AB5' }}>
            Mostrando{' '}
            {paginatedGifts.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredGifts.length)} de{' '}
            {filteredGifts.length} presentes
          </span>
        </div>
      )}

      {/* ── Estados: carregando / vazio / grid ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          {/* Spinner azul */}
          <svg className="w-10 h-10 animate-spin" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" stroke="#C8DCF0" strokeWidth="4" fill="none" />
            <circle cx="20" cy="20" r="16" stroke="#4A7AB5" strokeWidth="4" fill="none"
              strokeDasharray="40 80" strokeLinecap="round" />
          </svg>
          <p className="text-sm" style={{ color: '#7AAFD4' }}>Carregando presentes...</p>
        </div>
      ) : paginatedGifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          {!isAdmin && gifts.length === 0 ? (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-1"
                style={{ background: 'rgba(200,220,240,0.15)', border: '1.5px dashed rgba(200,220,240,0.3)' }}>
                <span style={{ fontSize: 36 }}>🎁</span>
              </div>
              <p className="text-base font-semibold text-center" style={{ color: '#C8DCF0', fontFamily: 'Playfair Display, serif' }}>
                Em breve…
              </p>
              <p className="text-sm text-center max-w-xs" style={{ color: '#7AAFD4' }}>
                Logo mais disponibilizaremos os presentes!
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(200,220,240,0.3)' }}>
                <Search size={24} style={{ color: '#7AAFD4' }} />
              </div>
              <p className="text-sm" style={{ color: '#7AAFD4' }}>
                {gifts.length === 0 ? 'Nenhum presente encontrado.' : 'Nenhum presente corresponde aos filtros.'}
              </p>
              {isAdmin && gifts.length === 0 && (
                <p className="text-xs" style={{ color: '#7AAFD4' }}>
                  Adicione presentes à lista clicando no botão acima.
                </p>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3 sm:gap-4">
            {paginatedGifts.map((gift) => (
              <GiftItem
                key={gift.id}
                gift={gift}
                isAdmin={isAdmin}
                onEdit={() => onEditGift(gift)}
                onDelete={() => onDeleteGift(gift.id)}
                onReserve={() => handleOpenModal(gift)}
                coupleNames={coupleNames}
              />
            ))}
          </div>
          {renderPagination()}
        </>
      )}

      {/* ── Modal de reserva ── */}
      {selectedGift && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => { setModalOpen(false); setSelectedGift(null); }}
          onConfirm={handleConfirmReservation}
          giftName={selectedGift.name}
        />
      )}
    </div>
  );
};

export default GiftList;
