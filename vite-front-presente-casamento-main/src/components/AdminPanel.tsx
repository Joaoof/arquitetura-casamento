import React, { useState, useEffect, useRef } from 'react';
import { Gift as GiftType } from '../types';
import GiftForm from './GiftForm';
import {
  PlusCircle, Download, Edit, Trash2, Settings,
  Package, BarChart3, X, List, Eye, Users, DollarSign,
  Activity, Calendar, Heart, Sparkles, ArrowLeft, Gift,
  TrendingUp, TrendingDown, Bell, Search, RefreshCw,
  CheckCircle, Clock, AlertCircle, Star, Filter,
  ChevronUp, Percent, Mail, Send, Loader2,
} from 'lucide-react';
import { exportToPdf } from '../helpers/export.helper';
import { api, Attendance } from '../services/api';

interface AdminSidebarProps {
  gifts: GiftType[];
  onAddGift: (gift: Omit<GiftType, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateGift: (id: string, gift: Partial<GiftType>) => void;
  onDeleteGift: (id: string) => void;
  giftToEdit: GiftType | null;
  onCancelEdit: () => void;
}

type Tab = 'dashboard' | 'manage' | 'form' | 'analytics' | 'attendance'

// ── Mini sparkline SVG ──────────────────────────────────────
const Sparkline: React.FC<{ values: number[]; color: string; height?: number }> = ({
  values, color, height = 32,
}) => {
  const w = 80, h = height
  const max = Math.max(...values, 1)
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - (v / max) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polyline points={`0,${h} ${pts} ${w},${h}`}
        fill={color} opacity="0.12" stroke="none" />
    </svg>
  )
}

// ── Donut chart SVG ─────────────────────────────────────────
const DonutChart: React.FC<{ pct: number; color: string; size?: number }> = ({
  pct, color, size = 72,
}) => {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth="8" strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x="50%" y="54%" textAnchor="middle" fill="white"
        fontSize="13" fontWeight="800">{Math.round(pct)}%</text>
    </svg>
  )
}

// ── Bar chart mini ──────────────────────────────────────────
const MiniBarChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map(({ label, value, color }) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t-sm transition-all duration-700"
            style={{ height: `${(value / max) * 52}px`, background: color, minHeight: 4 }} />
          <span className="text-[8px]" style={{ color: 'rgba(200,220,240,0.5)' }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────
const AdminSidebar: React.FC<AdminSidebarProps> = ({
  gifts = [], onAddGift, onUpdateGift, onDeleteGift, giftToEdit, onCancelEdit,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [showExportMsg, setShowExportMsg] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'reserved'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')
  const [now, setNow] = useState(new Date())
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [attendanceSearch, setAttendanceSearch] = useState('')
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'confirmed' | 'declined'>('all')
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceError, setAttendanceError] = useState('')
  const [deletingAttendanceId, setDeletingAttendanceId] = useState<string | null>(null)
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false)
  const [bulkSubject, setBulkSubject] = useState('')
  const [bulkMessage, setBulkMessage] = useState('')
  const [bulkFilter, setBulkFilter] = useState<'all' | 'confirmed' | 'declined'>('all')
  const [bulkStatus, setBulkStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [bulkResult, setBulkResult] = useState<{ sent: number; failed: number; total: number } | null>(null)
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    confirmed: 0,
    declined: 0,
    totalExpectedGuests: 0,
  })
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    tickRef.current = setInterval(() => setNow(new Date()), 1000)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const loadAttendanceData = async () => {
      setAttendanceLoading(true)
      setAttendanceError('')
      try {
        const [attendanceResponse, statsResponse] = await Promise.all([
          api.getAttendanceAdmin({ page: 1, limit: 100 }),
          api.getAttendanceStats(),
        ])
        setAttendances(attendanceResponse.data ?? [])
        setAttendanceStats(statsResponse)
      } catch (error) {
        console.error('Erro ao carregar confirmações de presença:', error)
        setAttendanceError('Não foi possível carregar os RSVPs agora.')
      } finally {
        setAttendanceLoading(false)
      }
    }

    loadAttendanceData()
  }, [isOpen])

  const stats = {
    total: gifts.length,
    available: gifts.filter(g => g.status === 'available').length,
    reserved: gifts.filter(g => g.status === 'reserved').length,
    totalValue: gifts.reduce((s, g) => s + (g.price || 0), 0),
    avgPrice: gifts.length ? gifts.reduce((s, g) => s + (g.price || 0), 0) / gifts.length : 0,
    reservationRate: gifts.length
      ? (gifts.filter(g => g.status === 'reserved').length / gifts.length) * 100 : 0,
    topGift: gifts.length
      ? [...gifts].sort((a, b) => (b.price || 0) - (a.price || 0))[0] : null,
  }

  const filteredGifts = gifts
    .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(g => statusFilter === 'all' || g.status === statusFilter)
    .sort((a, b) => sortBy === 'price'
      ? (b.price || 0) - (a.price || 0)
      : a.name.localeCompare(b.name))

  const priceRanges = [
    { label: 'Jan', value: gifts.filter(g => (g.price || 0) < 100).length },
    { label: 'Fev', value: gifts.filter(g => (g.price || 0) >= 100 && (g.price || 0) < 200).length },
    { label: 'Mar', value: gifts.filter(g => (g.price || 0) >= 200 && (g.price || 0) < 300).length },
    { label: 'Abr', value: gifts.filter(g => (g.price || 0) >= 300 && (g.price || 0) < 400).length },
    { label: 'Mai', value: gifts.filter(g => (g.price || 0) >= 400 && (g.price || 0) < 500).length },
    { label: '500+', value: gifts.filter(g => (g.price || 0) >= 500).length },
  ]

  const sparkData = Array.from({ length: 8 }, (_, i) =>
    gifts.filter((_, j) => j % 8 === i).length || Math.floor(Math.random() * 3) + 1
  )

  const handleExport = async () => {
    if (!gifts.length) { alert('Nenhum presente para exportar'); return }
    setIsExporting(true)
    try {
      await exportToPdf(gifts)
      setShowExportMsg(true)
      setTimeout(() => setShowExportMsg(false), 3000)
    } finally { setIsExporting(false) }
  }

  const handleSubmit = async (giftData: Omit<GiftType, 'id' | 'createdAt' | 'status'>) => {
    await onAddGift(giftData)
    setActiveTab('manage')
  }

  const handleUpdate = async (id: string, gift: Partial<GiftType>) => {
    if (window.confirm('Atualizar este presente?')) await onUpdateGift(id, gift)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir este presente?')) onDeleteGift(id)
  }

  const handleDeleteAttendance = async (id: string) => {
    if (!window.confirm('Remover esta confirmação de presença?')) return
    setDeletingAttendanceId(id)
    try {
      await api.deleteAttendance(id)
      setAttendances(prev => prev.filter(a => a.id !== id))
      setAttendanceStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }))
    } catch {
      alert('Erro ao remover confirmação.')
    } finally {
      setDeletingAttendanceId(null)
    }
  }

  const handleSendBulkEmail = async () => {
    if (!bulkSubject.trim() || !bulkMessage.trim()) return
    setBulkStatus('loading')
    setBulkResult(null)
    try {
      const result = await api.sendBulkEmail({ subject: bulkSubject, message: bulkMessage, filter: bulkFilter })
      setBulkResult(result)
      setBulkStatus('success')
    } catch {
      setBulkStatus('error')
    }
  }

  const closeBulkEmail = () => {
    setBulkEmailOpen(false)
    setBulkStatus('idle')
    setBulkResult(null)
  }

  const NAV = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: <BarChart3 size={15} />, badge: null },
    { id: 'analytics' as Tab, label: 'Analytics', icon: <Activity size={15} />, badge: null },
    { id: 'attendance' as Tab, label: 'RSVP', icon: <Users size={15} />, badge: attendanceStats.total > 0 ? String(attendanceStats.total) : null },
    { id: 'manage' as Tab, label: 'Gerenciar', icon: <List size={15} />, badge: stats.total > 0 ? String(stats.total) : null },
    { id: 'form' as Tab, label: 'Novo Item', icon: <PlusCircle size={15} />, badge: null },
  ]

  const filteredAttendances = attendances
    .filter((attendance) => {
      const term = attendanceSearch.trim().toLowerCase()
      if (!term) return true
      return attendance.fullName.toLowerCase().includes(term) || attendance.email.toLowerCase().includes(term)
    })
    .filter((attendance) => {
      if (attendanceFilter === 'confirmed') return attendance.isAttending
      if (attendanceFilter === 'declined') return !attendance.isAttending
      return true
    })

  return (
    <>
      <style>{`
        @keyframes slideAdmin { from { opacity:0; transform:translateX(100%) } to { opacity:1; transform:translateX(0) } }
        @keyframes fadeUp     { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulseGlow  { 0%,100% { box-shadow:0 0 0 0 rgba(74,122,181,0.5) } 50% { box-shadow:0 0 0 8px rgba(74,122,181,0) } }
        .adm-panel   { animation: slideAdmin 0.4s cubic-bezier(0.34,1.1,0.64,1) both }
        .adm-fadeup  { animation: fadeUp 0.35s ease both }
        .adm-row:hover { background: rgba(200,220,240,0.06) !important }
        .adm-nav:hover { background: rgba(255,255,255,0.07) !important }
        .adm-fab     { animation: pulseGlow 2.5s infinite }
        ::-webkit-scrollbar { width: 4px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: rgba(200,220,240,0.2); border-radius: 4px }
      `}</style>

      {/* ── FAB ── */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-40">
        <button onClick={() => setIsOpen(o => !o)}
          className="adm-fab group flex h-13 w-13 items-center justify-center rounded-2xl text-white transition-all duration-300 hover:scale-110"
          style={{ background: 'linear-gradient(135deg,#1B3A6B,#4A7AB5)', width: 52, height: 52 }}>
          <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          {stats.reserved > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-white"
              style={{ background: '#e07c3a' }}>{stats.reserved}</span>
          )}
        </button>
      </div>

      {/* ── Backdrop ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 transition-all duration-300"
          style={{ background: 'rgba(5,12,30,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => { setIsOpen(false); onCancelEdit() }} />
      )}

      {/* ── PAINEL ── */}
      {isOpen && (
        <div className="adm-panel fixed right-0 top-0 z-[60] flex h-full"
          style={{ width: 'min(100vw, 900px)', boxShadow: '-8px 0 48px rgba(0,0,0,0.6)' }}>

          {/* ════ SIDEBAR ESCURA ════ */}
          <div className="flex w-[200px] flex-shrink-0 flex-col"
            style={{ background: 'linear-gradient(180deg,#080f24 0%,#0d1e3d 50%,#0a1628 100%)' }}>

            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: '1px solid rgba(200,220,240,0.08)' }}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg,#1B3A6B,#4A7AB5)' }}>
                <Heart size={16} fill="white" style={{ color: 'white' }} />
              </div>
              <div>
                <p className="text-xs font-black text-white">Admin Panel</p>
                <p className="text-[9px]" style={{ color: 'rgba(200,220,240,0.4)' }}>Luís &amp; Natiele</p>
              </div>
            </div>

            {/* Relógio */}
            <div className="px-4 py-3 text-center" style={{ borderBottom: '1px solid rgba(200,220,240,0.06)' }}>
              <p className="text-lg font-black tabular-nums" style={{ color: '#7AAFD4' }}>
                {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-[9px]" style={{ color: 'rgba(200,220,240,0.35)' }}>
                {now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}
              </p>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              <p className="px-2 mb-3 text-[8px] font-bold uppercase tracking-widest"
                style={{ color: 'rgba(200,220,240,0.25)' }}>NAVEGAÇÃO</p>
              {NAV.map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className="adm-nav w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all duration-150"
                  style={{
                    background: activeTab === item.id
                      ? 'linear-gradient(90deg,rgba(74,122,181,0.25),rgba(74,122,181,0.08))' : 'transparent',
                    borderLeft: activeTab === item.id ? '3px solid #4A7AB5' : '3px solid transparent',
                    color: activeTab === item.id ? 'white' : 'rgba(200,220,240,0.5)',
                  }}>
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-black"
                      style={{ background: 'rgba(74,122,181,0.3)', color: '#7AAFD4' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              <div className="pt-4" style={{ borderTop: '1px solid rgba(200,220,240,0.06)', marginTop: 12 }}>
                <p className="px-2 mb-3 text-[8px] font-bold uppercase tracking-widest"
                  style={{ color: 'rgba(200,220,240,0.25)' }}>AÇÕES</p>
                <button onClick={handleExport} disabled={isExporting}
                  className="adm-nav w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all"
                  style={{ color: isExporting ? 'rgba(200,220,240,0.3)' : 'rgba(200,220,240,0.5)' }}>
                  {isExporting
                    ? <RefreshCw size={15} className="animate-spin" />
                    : <Download size={15} />}
                  <span className="text-xs font-semibold">{isExporting ? 'Exportando...' : 'Exportar PDF'}</span>
                </button>
              </div>
            </nav>

            {/* Mini stats sidebar */}
            <div className="px-3 pb-3 space-y-2">
              <div className="rounded-xl p-3" style={{ background: 'rgba(74,122,181,0.1)', border: '1px solid rgba(74,122,181,0.2)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(200,220,240,0.5)' }}>
                    Reservas
                  </span>
                  <span className="text-[9px] font-black" style={{ color: '#7AAFD4' }}>
                    {stats.reservationRate.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: 'rgba(200,220,240,0.1)' }}>
                  <div className="h-1 rounded-full transition-all duration-700"
                    style={{ width: `${stats.reservationRate}%`, background: 'linear-gradient(90deg,#4A7AB5,#7AAFD4)' }} />
                </div>
              </div>
              <button onClick={() => { setIsOpen(false); onCancelEdit() }}
                className="adm-nav w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs transition-all"
                style={{ color: 'rgba(200,220,240,0.3)' }}>
                <X size={13} /> Fechar
              </button>
            </div>
          </div>

          {/* ════ ÁREA PRINCIPAL ════ */}
          <div className="flex flex-1 flex-col overflow-hidden"
            style={{ background: '#0b1628' }}>

            {/* Topbar */}
            <div className="flex flex-shrink-0 items-center justify-between px-5 py-3.5"
              style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(200,220,240,0.07)' }}>
              <div>
                <h2 className="text-sm font-black text-white">
                  {activeTab === 'dashboard' && '👋 Bem-vindo ao Dashboard'}
                  {activeTab === 'analytics' && '📊 Analytics Detalhado'}
                  {activeTab === 'attendance' && '📝 Confirmações de Presença (RSVP)'}
                  {activeTab === 'manage' && '🎁 Gerenciar Presentes'}
                  {activeTab === 'form' && (giftToEdit ? '✏️ Editar Presente' : '➕ Novo Presente')}
                </h2>
                <p className="text-[10px]" style={{ color: 'rgba(200,220,240,0.35)' }}>
                  Casamento · 25/07/2026 · Araguaína, TO
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{ background: 'rgba(200,220,240,0.06)', border: '1px solid rgba(200,220,240,0.1)' }}>
                  <Bell size={14} style={{ color: 'rgba(200,220,240,0.4)' }} />
                  {stats.reserved > 0 && (
                    <span className="text-[9px] font-black" style={{ color: '#e07c3a' }}>
                      {stats.reserved} reserva(s)
                    </span>
                  )}
                </div>
                <button onClick={() => { setIsOpen(false); onCancelEdit() }}
                  className="rounded-xl p-2 transition-colors hover:bg-white/10"
                  style={{ color: 'rgba(200,220,240,0.4)' }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto px-5 py-5">

              {/* ══ DASHBOARD ══ */}
              {activeTab === 'dashboard' && (
                <div className="space-y-5 adm-fadeup">

                  {/* KPI cards */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      { label: 'Total Presentes', value: stats.total, sub: 'itens cadastrados', icon: <Package size={20} />, grad: 'linear-gradient(135deg,#1B3A6B,#3a6ea8)', glow: 'rgba(27,58,107,0.5)', spark: sparkData, sparkColor: '#7AAFD4' },
                      { label: 'Disponíveis', value: stats.available, sub: 'prontos para reserva', icon: <CheckCircle size={20} />, grad: 'linear-gradient(135deg,#0e5c40,#1a9b6c)', glow: 'rgba(14,92,64,0.5)', spark: sparkData.map(v => v * 1.2 | 0), sparkColor: '#4ade80' },
                      { label: 'Reservados', value: stats.reserved, sub: `${stats.reservationRate.toFixed(0)}% do total`, icon: <Star size={20} />, grad: 'linear-gradient(135deg,#7c2d12,#c0500e)', glow: 'rgba(192,80,14,0.5)', spark: sparkData.map(v => v * 0.8 | 0), sparkColor: '#fb923c' },
                      { label: 'Valor Total', value: `R$\u00a0${stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, sub: `~R$\u00a0${stats.avgPrice.toFixed(0)} médio`, icon: <DollarSign size={20} />, grad: 'linear-gradient(135deg,#4a1d96,#7c3aed)', glow: 'rgba(124,58,237,0.5)', spark: sparkData.map(v => v * 1.5 | 0), sparkColor: '#c084fc' },
                    ].map(({ label, value, sub, icon, grad, glow, spark, sparkColor }) => (
                      <div key={label} className="relative overflow-hidden rounded-2xl p-4 text-white"
                        style={{ background: grad, boxShadow: `0 4px 20px ${glow}` }}>
                        {/* Circles deco */}
                        <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20"
                          style={{ background: 'rgba(255,255,255,0.3)' }} />
                        <div className="pointer-events-none absolute -right-2 -bottom-6 h-24 w-24 rounded-full opacity-10"
                          style={{ background: 'white' }} />
                        <div className="relative flex flex-col gap-2">
                          <div className="flex items-start justify-between">
                            <div className="opacity-80">{icon}</div>
                            <Sparkline values={spark} color={sparkColor} height={28} />
                          </div>
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-widest opacity-70">{label}</p>
                            <p className="text-xl font-black leading-tight">{value}</p>
                            <p className="text-[9px] opacity-60 mt-0.5">{sub}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Middle row */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* Donut */}
                    <div className="rounded-2xl p-4"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,220,240,0.08)' }}>
                      <p className="mb-3 text-xs font-bold text-white flex items-center gap-2">
                        <Percent size={13} style={{ color: '#7AAFD4' }} /> Taxa de Reserva
                      </p>
                      <div className="flex items-center gap-4">
                        <DonutChart pct={stats.reservationRate} color="#4A7AB5" size={76} />
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ background: '#4A7AB5' }} />
                            <p className="text-[10px]" style={{ color: 'rgba(200,220,240,0.6)' }}>Reservados</p>
                            <span className="text-[10px] font-black text-white ml-auto">{stats.reserved}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ background: 'rgba(200,220,240,0.2)' }} />
                            <p className="text-[10px]" style={{ color: 'rgba(200,220,240,0.6)' }}>Disponíveis</p>
                            <span className="text-[10px] font-black text-white ml-auto">{stats.available}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bar chart */}
                    <div className="rounded-2xl p-4"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,220,240,0.08)' }}>
                      <p className="mb-3 text-xs font-bold text-white flex items-center gap-2">
                        <BarChart3 size={13} style={{ color: '#7AAFD4' }} /> Por Faixa de Preço
                      </p>
                      <MiniBarChart data={priceRanges.map((p, i) => ({
                        label: p.label,
                        value: p.value,
                        color: ['#4A7AB5', '#7AAFD4', '#1B3A6B', '#3a6ea8', '#5b8fca', '#2d5a9e'][i],
                      }))} />
                    </div>

                    {/* Top presente */}
                    <div className="rounded-2xl p-4"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,220,240,0.08)' }}>
                      <p className="mb-3 text-xs font-bold text-white flex items-center gap-2">
                        <TrendingUp size={13} style={{ color: '#7AAFD4' }} /> Destaque
                      </p>
                      {stats.topGift ? (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                              style={{ background: 'linear-gradient(135deg,#1B3A6B,#4A7AB5)' }}>
                              <Gift size={16} style={{ color: 'white' }} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-white">{stats.topGift.name}</p>
                              <p className="text-[10px]" style={{ color: '#7AAFD4' }}>Maior valor</p>
                            </div>
                          </div>
                          <p className="text-xl font-black" style={{ color: '#C8DCF0' }}>
                            R$ {stats.topGift.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold"
                            style={stats.topGift.status === 'available'
                              ? { background: 'rgba(14,92,64,0.3)', color: '#4ade80' }
                              : { background: 'rgba(192,80,14,0.3)', color: '#fb923c' }}>
                            {stats.topGift.status === 'available' ? '● Disponível' : '● Reservado'}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs" style={{ color: 'rgba(200,220,240,0.3)' }}>Nenhum cadastrado</p>
                      )}
                    </div>
                  </div>

                  {/* Tabela recente */}
                  <div className="rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,220,240,0.08)' }}>
                    <div className="flex items-center justify-between px-5 py-4"
                      style={{ borderBottom: '1px solid rgba(200,220,240,0.07)' }}>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <Clock size={13} style={{ color: '#7AAFD4' }} /> Últimos Cadastrados
                      </h4>
                      <button onClick={() => setActiveTab('manage')}
                        className="text-[10px] font-semibold transition-colors hover:underline"
                        style={{ color: '#4A7AB5' }}>Ver todos →</button>
                    </div>
                    <div className="grid px-5 py-2 text-[9px] font-bold uppercase tracking-widest"
                      style={{ gridTemplateColumns: '1fr 80px 80px', color: 'rgba(200,220,240,0.3)', borderBottom: '1px solid rgba(200,220,240,0.05)' }}>
                      <span>Presente</span><span className="text-right">Preço</span><span className="text-center">Status</span>
                    </div>
                    {gifts.slice(-5).reverse().map((gift, i) => (
                      <div key={gift.id}
                        className="adm-row grid px-5 py-3 items-center transition-colors"
                        style={{ gridTemplateColumns: '1fr 80px 80px', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(200,220,240,0.04)' }}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-6 w-6 rounded-lg flex-shrink-0 flex items-center justify-center"
                            style={{ background: 'rgba(74,122,181,0.2)' }}>
                            <Gift size={11} style={{ color: '#7AAFD4' }} />
                          </div>
                          <span className="truncate text-xs font-medium" style={{ color: 'rgba(200,220,240,0.85)' }}>
                            {gift.name}
                          </span>
                        </div>
                        <span className="text-right text-xs font-bold" style={{ color: '#C8DCF0' }}>
                          R${gift.price?.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                        <div className="flex justify-center">
                          <span className="rounded-full px-2 py-0.5 text-[8px] font-bold"
                            style={gift.status === 'available'
                              ? { background: 'rgba(14,92,64,0.3)', color: '#4ade80' }
                              : { background: 'rgba(192,80,14,0.3)', color: '#fb923c' }}>
                            {gift.status === 'available' ? '● Live' : '● Taken'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {gifts.length === 0 && (
                      <p className="py-8 text-center text-xs" style={{ color: 'rgba(200,220,240,0.25)' }}>
                        Nenhum presente cadastrado ainda
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ══ ANALYTICS ══ */}
              {activeTab === 'analytics' && (
                <div className="space-y-4 adm-fadeup">

                  {/* Resumo analytics */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Ticket Médio', value: `R$ ${stats.avgPrice.toFixed(0)}`, icon: <TrendingUp size={16} />, color: '#4A7AB5' },
                      { label: 'Taxa de Engaj.', value: `${stats.reservationRate.toFixed(1)}%`, icon: <Percent size={16} />, color: '#7c3aed' },
                      { label: 'Presentes VIP', value: String(gifts.filter(g => (g.price || 0) >= 500).length), icon: <Star size={16} />, color: '#c0500e' },
                    ].map(({ label, value, icon, color }) => (
                      <div key={label} className="rounded-2xl p-4 text-center"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,220,240,0.08)' }}>
                        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl"
                          style={{ background: `${color}22`, color }}>
                          {icon}
                        </div>
                        <p className="text-lg font-black text-white">{value}</p>
                        <p className="text-[9px]" style={{ color: 'rgba(200,220,240,0.4)' }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Distribuição completa */}
                  <div className="rounded-2xl p-5"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,220,240,0.08)' }}>
                    <h4 className="mb-4 text-xs font-bold text-white">Distribuição de Preços</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Até R$ 100', count: gifts.filter(g => (g.price || 0) < 100).length, color: '#4A7AB5' },
                        { label: 'R$ 100 – R$ 200', count: gifts.filter(g => (g.price || 0) >= 100 && (g.price || 0) < 200).length, color: '#3a6ea8' },
                        { label: 'R$ 200 – R$ 300', count: gifts.filter(g => (g.price || 0) >= 200 && (g.price || 0) < 300).length, color: '#7AAFD4' },
                        { label: 'R$ 300 – R$ 500', count: gifts.filter(g => (g.price || 0) >= 300 && (g.price || 0) < 500).length, color: '#7c3aed' },
                        { label: 'Acima de R$ 500', count: gifts.filter(g => (g.price || 0) >= 500).length, color: '#c0500e' },
                      ].map(({ label, count, color }) => (
                        <div key={label} className="flex items-center gap-3">
                          <span className="w-32 text-[10px]" style={{ color: 'rgba(200,220,240,0.6)' }}>{label}</span>
                          <div className="flex-1 overflow-hidden rounded-full h-2" style={{ background: 'rgba(200,220,240,0.08)' }}>
                            <div className="h-2 rounded-full transition-all duration-700"
                              style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`, background: color }} />
                          </div>
                          <span className="w-5 text-right text-[10px] font-black" style={{ color }}>{count}</span>
                          <span className="w-8 text-right text-[9px]" style={{ color: 'rgba(200,220,240,0.3)' }}>
                            {stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : 0}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reservados */}
                  {gifts.filter(g => g.status === 'reserved').length > 0 && (
                    <div className="rounded-2xl overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,220,240,0.08)' }}>
                      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(200,220,240,0.07)' }}>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <Users size={13} style={{ color: '#fb923c' }} /> Presentes Reservados
                        </h4>
                      </div>
                      {gifts.filter(g => g.status === 'reserved').map((gift, i) => (
                        <div key={gift.id}
                          className="adm-row flex items-center justify-between px-5 py-3 transition-colors"
                          style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(200,220,240,0.04)' }}>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold" style={{ color: 'rgba(200,220,240,0.9)' }}>{gift.name}</p>
                            {gift.reservedBy && (
                              <p className="text-[9px]" style={{ color: 'rgba(200,220,240,0.4)' }}>por {gift.reservedBy}</p>
                            )}
                          </div>
                          <span className="text-xs font-black" style={{ color: '#fb923c' }}>
                            R$ {gift.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ══ ATTENDANCE ══ */}
              {activeTab === 'attendance' && (
                <div className="space-y-4 adm-fadeup">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: 'Total respostas', value: attendanceStats.total, color: '#4A7AB5' },
                      { label: 'Confirmados', value: attendanceStats.confirmed, color: '#4ade80' },
                      { label: 'Recusados', value: attendanceStats.declined, color: '#fb923c' },
                      { label: 'Público esperado', value: attendanceStats.totalExpectedGuests, color: '#C8DCF0' },
                    ].map(card => (
                      <div key={card.label} className="rounded-2xl p-4"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,220,240,0.08)' }}>
                        <p className="text-[10px]" style={{ color: 'rgba(200,220,240,0.5)' }}>{card.label}</p>
                        <p className="text-2xl font-black" style={{ color: card.color }}>{card.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 min-w-0"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,220,240,0.1)' }}>
                      <Search size={13} style={{ color: 'rgba(200,220,240,0.4)', flexShrink: 0 }} />
                      <input value={attendanceSearch} onChange={e => setAttendanceSearch(e.target.value)}
                        placeholder="Buscar por nome ou e-mail..."
                        className="flex-1 bg-transparent text-xs outline-none min-w-0"
                        style={{ color: 'rgba(200,220,240,0.85)', caretColor: '#4A7AB5' }} />
                    </div>
                    <select value={attendanceFilter} onChange={e => setAttendanceFilter(e.target.value as any)}
                      className="rounded-xl px-3 py-2.5 text-xs outline-none appearance-none cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,220,240,0.1)', color: 'rgba(200,220,240,0.7)' }}>
                      <option value="all">Todos</option>
                      <option value="confirmed">Confirmados</option>
                      <option value="declined">Recusados</option>
                    </select>
                    <button
                      onClick={() => { setBulkEmailOpen(true); setBulkStatus('idle'); setBulkResult(null) }}
                      className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg,#1B3A6B,#4A7AB5)', boxShadow: '0 4px 16px rgba(27,58,107,0.5)' }}>
                      <Mail size={13} /> E-mail em Massa
                    </button>
                  </div>

                  <div className="rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,220,240,0.08)' }}>
                    <div className="grid px-5 py-3 text-[9px] font-bold uppercase tracking-widest"
                      style={{ gridTemplateColumns: '1.2fr 1fr 80px 80px 90px 44px', color: 'rgba(200,220,240,0.3)', borderBottom: '1px solid rgba(200,220,240,0.06)' }}>
                      <span>Nome</span><span>E-mail</span><span className="text-center">Acomp.</span>
                      <span className="text-center">Status</span><span className="text-right">Data</span><span />
                    </div>
                    <div className="max-h-[420px] overflow-y-auto">
                      {attendanceLoading && (
                        <div className="py-12 text-center text-xs" style={{ color: 'rgba(200,220,240,0.5)' }}>
                          Carregando confirmações...
                        </div>
                      )}

                      {!attendanceLoading && attendanceError && (
                        <div className="py-12 text-center text-xs" style={{ color: '#fca5a5' }}>
                          {attendanceError}
                        </div>
                      )}

                      {!attendanceLoading && !attendanceError && filteredAttendances.length === 0 && (
                        <div className="py-12 text-center text-xs" style={{ color: 'rgba(200,220,240,0.5)' }}>
                          Nenhuma confirmação encontrada.
                        </div>
                      )}

                      {!attendanceLoading && !attendanceError && filteredAttendances.map((attendance, index) => (
                        <div key={attendance.id}
                          className="adm-row grid px-5 py-3 items-center transition-colors"
                          style={{ gridTemplateColumns: '1.2fr 1fr 80px 80px 90px 44px', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(200,220,240,0.04)' }}>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold" style={{ color: 'rgba(200,220,240,0.9)' }}>{attendance.fullName}</p>
                            {attendance.message && (
                              <p className="truncate text-[9px]" style={{ color: 'rgba(200,220,240,0.35)' }}>{attendance.message}</p>
                            )}
                          </div>
                          <p className="truncate text-xs" style={{ color: 'rgba(200,220,240,0.7)' }}>{attendance.email}</p>
                          <p className="text-center text-xs font-bold" style={{ color: '#C8DCF0' }}>{attendance.companions}</p>
                          <div className="flex justify-center">
                            <span className="rounded-full px-2 py-0.5 text-[8px] font-bold"
                              style={attendance.isAttending
                                ? { background: 'rgba(14,92,64,0.3)', color: '#4ade80' }
                                : { background: 'rgba(192,80,14,0.3)', color: '#fb923c' }}>
                              {attendance.isAttending ? '● Confirmado' : '● Recusado'}
                            </span>
                          </div>
                          <p className="text-right text-[10px]" style={{ color: 'rgba(200,220,240,0.5)' }}>
                            {new Date(attendance.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleDeleteAttendance(attendance.id)}
                              disabled={deletingAttendanceId === attendance.id}
                              className="flex items-center justify-center rounded-lg p-1.5 transition-all hover:scale-110 disabled:opacity-40"
                              style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)', color: '#f87171' }}
                              title="Remover confirmação">
                              {deletingAttendanceId === attendance.id
                                ? <Loader2 size={11} className="animate-spin" />
                                : <Trash2 size={11} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ MANAGE ══ */}
              {activeTab === 'manage' && (
                <div className="space-y-4 adm-fadeup">

                  {/* Search + filter toolbar */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 min-w-0"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,220,240,0.1)' }}>
                      <Search size={13} style={{ color: 'rgba(200,220,240,0.4)', flexShrink: 0 }} />
                      <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar presente..."
                        className="flex-1 bg-transparent text-xs outline-none min-w-0"
                        style={{ color: 'rgba(200,220,240,0.85)', caretColor: '#4A7AB5' }} />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                      className="rounded-xl px-3 py-2.5 text-xs outline-none appearance-none cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,220,240,0.1)', color: 'rgba(200,220,240,0.7)' }}>
                      <option value="all">Todos</option>
                      <option value="available">Disponíveis</option>
                      <option value="reserved">Reservados</option>
                    </select>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                      className="rounded-xl px-3 py-2.5 text-xs outline-none appearance-none cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,220,240,0.1)', color: 'rgba(200,220,240,0.7)' }}>
                      <option value="name">Nome</option>
                      <option value="price">Preço</option>
                    </select>
                    <button onClick={() => setActiveTab('form')}
                      className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg,#1B3A6B,#4A7AB5)', boxShadow: '0 4px 16px rgba(27,58,107,0.5)' }}>
                      <PlusCircle size={13} /> Novo
                    </button>
                  </div>

                  {/* Counter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color: 'rgba(200,220,240,0.4)' }}>
                      {filteredGifts.length} de {gifts.length} presente(s)
                    </span>
                  </div>

                  {/* Tabela */}
                  <div className="rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,220,240,0.08)' }}>
                    <div className="grid px-5 py-3 text-[9px] font-bold uppercase tracking-widest"
                      style={{ gridTemplateColumns: '1fr 80px 80px 100px', color: 'rgba(200,220,240,0.3)', borderBottom: '1px solid rgba(200,220,240,0.06)' }}>
                      <span>Presente</span><span className="text-right">Preço</span>
                      <span className="text-center">Status</span><span className="text-center">Ações</span>
                    </div>
                    <div className="max-h-[420px] overflow-y-auto">
                      {filteredGifts.length > 0 ? filteredGifts.map((gift, i) => (
                        <div key={gift.id}
                          className="adm-row grid px-5 py-3 items-center transition-colors"
                          style={{ gridTemplateColumns: '1fr 80px 80px 100px', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(200,220,240,0.04)' }}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                              style={{ background: 'rgba(74,122,181,0.15)' }}>
                              <Gift size={12} style={{ color: '#7AAFD4' }} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold" style={{ color: 'rgba(200,220,240,0.9)' }}>{gift.name}</p>
                              {gift.reservedBy && (
                                <p className="truncate text-[9px]" style={{ color: 'rgba(200,220,240,0.35)' }}>{gift.reservedBy}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-right text-xs font-black" style={{ color: '#C8DCF0' }}>
                            R${gift.price?.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                          </span>
                          <div className="flex justify-center">
                            <span className="rounded-full px-2 py-0.5 text-[8px] font-bold"
                              style={gift.status === 'available'
                                ? { background: 'rgba(14,92,64,0.3)', color: '#4ade80' }
                                : { background: 'rgba(192,80,14,0.3)', color: '#fb923c' }}>
                              {gift.status === 'available' ? '● Live' : '● Taken'}
                            </span>
                          </div>
                          <div className="flex justify-center gap-1">
                            <button onClick={() => handleUpdate(gift.id, gift)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[9px] font-bold text-white transition-all hover:scale-105"
                              style={{ background: 'rgba(74,122,181,0.3)', border: '1px solid rgba(74,122,181,0.4)' }}>
                              <Edit size={9} /> Edit
                            </button>
                            <button onClick={() => handleDelete(gift.id)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[9px] font-bold transition-all hover:scale-105"
                              style={{ background: 'rgba(220,38,38,0.15)', color: '#f87171', border: '1px solid rgba(220,38,38,0.25)' }}>
                              <Trash2 size={9} /> Del
                            </button>
                          </div>
                        </div>
                      )) : (
                        <div className="py-16 text-center">
                          <Package size={32} className="mx-auto mb-3" style={{ color: 'rgba(200,220,240,0.15)' }} />
                          <p className="text-xs font-medium text-white opacity-30">
                            {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum presente cadastrado'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ FORM ══ */}
              {activeTab === 'form' && (
                <div className="adm-fadeup rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,220,240,0.08)' }}>
                  <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(200,220,240,0.08)' }}>
                    <h4 className="text-xs font-bold text-white">
                      {giftToEdit ? 'Editar Presente' : 'Cadastrar Novo Presente'}
                    </h4>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(200,220,240,0.35)' }}>
                      Preencha os campos abaixo
                    </p>
                  </div>
                  <div className="p-5">
                    <GiftForm
                      onSubmit={handleSubmit}
                      onCancel={() => { setActiveTab('manage'); onCancelEdit() }}
                      initialData={giftToEdit || {}}
                      isEdit={giftToEdit !== null}
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── Modal E-mail em Massa ── */}
      {bulkEmailOpen && (
        <>
          <div className="fixed inset-0 z-[80]" style={{ background: 'rgba(5,12,30,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={closeBulkEmail} />
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'linear-gradient(160deg,#0d1f3c,#162d52)' }}>

              {/* Header do modal */}
              <div className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid rgba(200,220,240,0.08)', background: 'linear-gradient(135deg,#1B3A6B,#2a5298)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: 'rgba(200,220,240,0.15)' }}>
                    <Mail size={15} style={{ color: '#C8DCF0' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">E-mail em Massa</h3>
                    <p className="text-[10px]" style={{ color: 'rgba(200,220,240,0.5)' }}>
                      Envie um recado para seus convidados
                    </p>
                  </div>
                </div>
                <button onClick={closeBulkEmail}
                  className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
                  style={{ color: 'rgba(200,220,240,0.6)' }}>
                  <X size={16} />
                </button>
              </div>

              {/* Corpo do modal */}
              {bulkStatus === 'success' && bulkResult ? (
                <div className="px-6 py-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}>
                    <CheckCircle size={28} style={{ color: '#4ade80' }} />
                  </div>
                  <p className="text-base font-bold text-white mb-1">E-mails enviados!</p>
                  <p className="text-sm mb-4" style={{ color: 'rgba(200,220,240,0.6)' }}>
                    <span style={{ color: '#4ade80' }}>{bulkResult.sent}</span> enviados
                    {bulkResult.failed > 0 && (
                      <> · <span style={{ color: '#fb923c' }}>{bulkResult.failed}</span> falharam</>
                    )}
                    {' '}de {bulkResult.total} no total
                  </p>
                  <button onClick={closeBulkEmail}
                    className="rounded-xl px-6 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg,#1B3A6B,#4A7AB5)' }}>
                    Fechar
                  </button>
                </div>
              ) : (
                <div className="px-6 py-5 space-y-4">
                  {/* Filtro de destinatários */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block"
                      style={{ color: 'rgba(200,220,240,0.5)' }}>Enviar para</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { val: 'all', label: 'Todos', count: attendanceStats.total },
                        { val: 'confirmed', label: 'Confirmados', count: attendanceStats.confirmed },
                        { val: 'declined', label: 'Recusados', count: attendanceStats.declined },
                      ] as const).map(({ val, label, count }) => (
                        <button key={val} type="button"
                          onClick={() => setBulkFilter(val)}
                          className="rounded-xl py-2 px-2 text-[11px] font-bold transition-all"
                          style={bulkFilter === val ? {
                            background: 'linear-gradient(135deg,#1B3A6B,#4A7AB5)',
                            color: 'white', border: '1px solid #4A7AB5',
                          } : {
                            background: 'rgba(255,255,255,0.05)', color: 'rgba(200,220,240,0.6)',
                            border: '1px solid rgba(200,220,240,0.1)',
                          }}>
                          {label}
                          <span className="block text-[10px] font-normal opacity-75">{count} pessoa(s)</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assunto */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block"
                      style={{ color: 'rgba(200,220,240,0.5)' }}>Assunto</label>
                    <input
                      value={bulkSubject}
                      onChange={e => setBulkSubject(e.target.value)}
                      placeholder="Ex: Novidade sobre o casamento!"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,220,240,0.1)', color: 'rgba(200,220,240,0.9)', caretColor: '#4A7AB5' }}
                    />
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block"
                      style={{ color: 'rgba(200,220,240,0.5)' }}>Mensagem</label>
                    <textarea
                      value={bulkMessage}
                      onChange={e => setBulkMessage(e.target.value)}
                      placeholder="Olá! Temos uma novidade para compartilhar com vocês..."
                      rows={5}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,220,240,0.1)', color: 'rgba(200,220,240,0.9)', caretColor: '#4A7AB5' }}
                    />
                    <p className="text-[10px] mt-1" style={{ color: 'rgba(200,220,240,0.35)' }}>
                      A mensagem será enviada com o template visual do casamento.
                    </p>
                  </div>

                  {bulkStatus === 'error' && (
                    <p className="text-xs flex items-center gap-1.5 rounded-xl px-3 py-2"
                      style={{ background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.2)' }}>
                      <AlertCircle size={13} /> Erro ao enviar e-mails. Verifique as configurações de SMTP.
                    </p>
                  )}

                  {/* Botões */}
                  <div className="flex gap-3 pt-1">
                    <button onClick={closeBulkEmail}
                      className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(200,220,240,0.7)', border: '1px solid rgba(200,220,240,0.1)' }}>
                      Cancelar
                    </button>
                    <button
                      onClick={handleSendBulkEmail}
                      disabled={!bulkSubject.trim() || !bulkMessage.trim() || bulkStatus === 'loading'}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg,#1B3A6B,#4A7AB5)', boxShadow: '0 4px 16px rgba(27,58,107,0.4)' }}>
                      {bulkStatus === 'loading'
                        ? <><Loader2 size={14} className="animate-spin" /> Enviando...</>
                        : <><Send size={14} /> Enviar</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Toast ── */}
      {showExportMsg && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 rounded-2xl px-5 py-3.5 text-white shadow-2xl"
          style={{ background: 'linear-gradient(135deg,#0e5c40,#1a9b6c)', boxShadow: '0 8px 32px rgba(14,92,64,0.5)' }}>
          <CheckCircle size={18} />
          <p className="text-sm font-bold">PDF exportado com sucesso!</p>
        </div>
      )}
    </>
  )
}

export default AdminSidebar
