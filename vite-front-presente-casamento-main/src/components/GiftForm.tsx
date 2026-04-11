import React, { useState, useRef } from 'react';
import { Gift as GiftType } from '../types';
import { Gift, ImagePlus, AlertCircle, X, DollarSign, AlignLeft, Flame, Minus, ChevronUp } from 'lucide-react';

interface GiftFormProps {
  onSubmit: (gift: Omit<GiftType, 'id' | 'createdAt' | 'status'>) => void;
  onCancel: () => void;
  initialData?: Partial<GiftType>;
  isEdit?: boolean;
}

// ── Campo reutilizável ────────────────────────────────────────
const Field: React.FC<{
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}> = ({ label, required, children, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-xs font-semibold" style={{ color: '#1B3A6B' }}>
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

// ── Estilo base dos inputs ────────────────────────────────────
const inputCls = `
  w-full rounded-md border px-3 py-2 text-sm outline-none transition-all
  placeholder:text-gray-300 text-gray-700
  focus:border-[#4A7AB5] focus:ring-2 focus:ring-[#4A7AB5]/15
`
const inputStyle = { borderColor: '#d0dff0', background: 'white' }

const GiftForm: React.FC<GiftFormProps> = ({
  onSubmit, onCancel, initialData = {}, isEdit = false,
}) => {
  const [name, setName] = useState(initialData.name || '')
  const [description, setDescription] = useState(initialData.description || '')
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl || '')
  const [price, setPrice] = useState(initialData.price?.toString() || '')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(initialData.priority || 'medium')
  const [previewError, setPreviewError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      description,
      imageUrl: imageUrl || undefined,
      price: price ? Number(price) : undefined,
      priority,
    })
    setName(''); setDescription(''); setImageUrl(''); setPrice(''); setPriority('medium')
  }

  const priorityConfig = {
    high: { label: 'Alta', dot: '#ef4444' },
    medium: { label: 'Média', dot: '#f59e0b' },
    low: { label: 'Baixa', dot: '#22c55e' },
  }

  return (
    <>
      <style>{`
        .gf-input:focus { border-color: #4A7AB5 !important; box-shadow: 0 0 0 3px rgba(74,122,181,0.12) !important; }
        .gf-input::placeholder { color: #c0d0e0; font-size: 12px; }
        .gf-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234A7AB5' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px !important; }
      `}</style>

      {/* ── Wrapper modal-like ── */}
      <div className="flex flex-col" style={{ minHeight: 0 }}>

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-4 rounded-t-xl"
          style={{ background: 'linear-gradient(135deg,#1B3A6B,#2a5298)' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'rgba(200,220,240,0.15)' }}>
              <Gift size={15} style={{ color: '#C8DCF0' }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {isEdit ? 'Editar Presente' : 'Novo Presente'}
              </h2>
              <p className="text-[10px]" style={{ color: 'rgba(200,220,240,0.6)' }}>
                Preencha os detalhes abaixo
              </p>
            </div>
          </div>
          <button onClick={onCancel}
            className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
            style={{ color: 'rgba(200,220,240,0.6)' }}>
            <X size={16} />
          </button>
        </div>

        {/* ── FORM BODY ── */}
        <form onSubmit={handleSubmit}
          className="flex flex-col gap-0 overflow-hidden rounded-b-xl"
          style={{ background: '#f4f7fb', border: '1px solid #dbe9f8', borderTop: 'none' }}>

          {/* Seção principal — grid 2 colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 px-5 pt-5 pb-4">

            {/* Nome */}
            <Field label="Nome do Presente" required className="sm:col-span-2">
              <div className="relative">
                <Gift size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7AAFD4' }} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Conjunto de Taças"
                  required
                  className={`${inputCls} gf-input pl-9`}
                  style={inputStyle}
                />
              </div>
            </Field>

            {/* Preço */}
            <Field label="Preço (R$)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: '#7AAFD4' }}>
                  R$
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0,00"
                  className={`${inputCls} gf-input pl-9`}
                  style={inputStyle}
                />
              </div>
            </Field>

            {/* Prioridade */}
            <Field label="Prioridade">
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(priorityConfig) as [string, { label: string; dot: string }][]).map(([val, { label, dot }]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPriority(val as 'high' | 'medium' | 'low')}
                    className="flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition-all"
                    style={priority === val ? {
                      background: '#1B3A6B',
                      color: 'white',
                      border: '1.5px solid #1B3A6B',
                    } : {
                      background: 'white',
                      color: '#4A7AB5',
                      border: '1.5px solid #d0dff0',
                    }}>
                    <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: priority === val ? 'white' : dot }} />
                    {label}
                  </button>
                ))}
              </div>
            </Field>

            {/* URL da imagem */}
            <Field label="URL da Imagem" className="sm:col-span-2">
              <div className="relative">
                <ImagePlus size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7AAFD4' }} />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => { setImageUrl(e.target.value); setPreviewError(false) }}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className={`${inputCls} gf-input pl-9`}
                  style={inputStyle}
                />
              </div>
              {imageUrl && (
                <div className="mt-2 flex items-start gap-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg"
                    style={{ border: '1px solid #d0dff0', background: '#f0f6ff' }}>
                    {previewError ? (
                      <div className="flex h-full w-full flex-col items-center justify-center">
                        <AlertCircle size={16} style={{ color: '#7AAFD4' }} />
                      </div>
                    ) : (
                      <img src={imageUrl} alt="Preview" onError={() => setPreviewError(true)}
                        className="h-full w-full object-contain" />
                    )}
                  </div>
                  <div className="flex-1 rounded-md px-3 py-2 text-xs" style={{ background: previewError ? 'rgba(220,38,38,0.06)' : 'rgba(74,122,181,0.06)', color: previewError ? '#dc2626' : '#4A7AB5', border: `1px solid ${previewError ? 'rgba(220,38,38,0.2)' : 'rgba(74,122,181,0.15)'}` }}>
                    {previewError ? '⚠ Imagem não pôde ser carregada' : '✓ Pré-visualização carregada'}
                  </div>
                </div>
              )}
            </Field>
          </div>

          {/* Separador */}
          <div style={{ height: 1, background: '#dbe9f8', margin: '0 20px' }} />

          {/* Descrição */}
          <div className="px-5 pt-4 pb-5">
            <Field label="Descrição" required>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descreva o presente, onde encontrar, sugestões..."
                required
                rows={3}
                className={`${inputCls} gf-input resize-none`}
                style={inputStyle}
              />
            </Field>
          </div>

          {/* Separador */}
          <div style={{ height: 1, background: '#dbe9f8' }} />

          {/* ── RODAPÉ ── */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ background: 'white', borderTop: '1px solid #dbe9f8', borderRadius: '0 0 12px 12px' }}>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-5 py-2 text-sm font-semibold transition-all hover:bg-gray-100 active:scale-95"
              style={{ color: '#4A7AB5', border: '1.5px solid #d0dff0' }}>
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-lg px-6 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5 active:scale-95"
              style={{
                background: 'linear-gradient(135deg,#1B3A6B,#4A7AB5)',
                boxShadow: '0 4px 16px rgba(27,58,107,0.35)',
              }}>
              {isEdit ? 'Salvar Alterações' : 'Adicionar Presente'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default GiftForm
