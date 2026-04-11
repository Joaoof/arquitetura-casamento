import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Heart, Send, ChevronDown, ChevronRight, Home, Sparkles, Loader2, ArrowLeft } from "lucide-react"
import { getCoupleConfig, normalizeCoupleSlug } from "../config/couples"

type FormData = {
  fullName: string
  email: string
  attendance: "yes" | "no"
  guests: string
  dietary: string
  message: string
}

type Status = "idle" | "loading" | "success" | "error"

const GUEST_OPTIONS = ["1 Convidado", "2 Convidados", "3 Convidados", "4 Convidados"]

const ATTENDANCE_OPTIONS = [
  { value: "yes", label: "Confirmo Presença 🎉" },
  { value: "no", label: "Não Poderei Comparecer" },
] as const

const INPUT_CLASS =
  "w-full rounded-lg border border-[#C8DCF0] bg-white " +
  "focus:border-[#4A7AB5] focus:ring-1 focus:ring-[#4A7AB5] h-14 px-4 text-base outline-none transition text-slate-800 placeholder:text-slate-400"

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-[#C8DCF0] bg-white " +
  "focus:border-[#4A7AB5] focus:ring-1 focus:ring-[#4A7AB5] p-4 text-base outline-none resize-none transition text-slate-800 placeholder:text-slate-400"

const EMPTY_FORM: FormData = {
  fullName: "", email: "", attendance: "yes",
  guests: "1 Convidado", dietary: "", message: "",
}

// ─── Tela de Sucesso separada ─────────────────────────────
function SuccessScreen({
  name,
  attendance,
  onBack,
  coupleHomePath,
  coupleNames,
  weddingDate,
  cityLabel,
}: {
  name: string
  attendance: "yes" | "no"
  onBack: () => void
  coupleHomePath: string
  coupleNames: string
  weddingDate: string
  cityLabel: string
}) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0f6ff' }}>

      {/* Marquee */}
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .rsvp-marquee { display: flex; width: max-content; animation: marquee 28s linear infinite; }
        @keyframes successPop {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
        .success-pop { animation: successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      <div className="sticky top-0 z-50 w-full overflow-hidden py-2 shadow-md"
        style={{ background: 'linear-gradient(90deg, #1B3A6B, #4A7AB5, #1B3A6B)' }}>
        <div className="rsvp-marquee flex items-center whitespace-nowrap text-white">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-6 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.25em]">
              <span style={{ color: 'rgba(200,220,240,0.6)' }}>✦</span>
              confirmação recebida
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-0.5 font-bold tracking-widest">
                {coupleNames}
              </span>
              {weddingDate}
              <span style={{ color: 'rgba(200,220,240,0.6)' }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="text-center max-w-md w-full">

          {/* Ícone animado */}
          <div className="success-pop mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #1B3A6B, #4A7AB5)', boxShadow: '0 8px 32px rgba(27,58,107,0.35)' }}>
            <Heart className="w-11 h-11" style={{ color: 'white', fill: 'white' }} />
          </div>

          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: '#7AAFD4' }}>
            confirmação recebida
          </p>
          <h2 className="font-serif text-3xl font-bold mb-3" style={{ color: '#1B3A6B' }}>
            Obrigado, {name}!
          </h2>
          <p className="text-slate-500 leading-relaxed mb-2">
            {attendance === "yes"
              ? "Mal podemos esperar para celebrar este momento especial com você! 🎉"
              : "Sentiremos sua falta, mas agradecemos imensamente pela resposta."}
          </p>

          <div className="my-6 flex items-center gap-4 justify-center">
            <div className="h-[1px] w-10" style={{ background: '#C8DCF0' }} />
            <Heart className="w-3.5 h-3.5" style={{ color: '#4A7AB5', fill: '#4A7AB5' }} />
            <div className="h-[1px] w-10" style={{ background: '#C8DCF0' }} />
          </div>

          <p className="font-serif text-sm italic mb-8" style={{ color: '#7AAFD4' }}>
            {weddingDate} · {cityLabel}
          </p>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(coupleHomePath)}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #1B3A6B, #4A7AB5)',
                boxShadow: '0 4px 20px rgba(27,58,107,0.3)',
              }}
            >
              <Home className="w-4 h-4" />
              Voltar ao início
            </button>

            {/* Botão "Editar resposta" — volta ao form preenchido */}
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold transition-all hover:-translate-y-0.5"
              style={{
                border: '1.5px solid #4A7AB5',
                color: '#4A7AB5',
                background: 'white',
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Editar resposta
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center" style={{ borderTop: '1px solid #C8DCF0' }}>
        <div className="mb-3 flex justify-center gap-5">
          <Sparkles className="w-4 h-4" style={{ color: 'rgba(74,122,181,0.35)' }} />
          <Heart className="w-4 h-4" style={{ color: 'rgba(74,122,181,0.35)', fill: 'rgba(74,122,181,0.35)' }} />
          <Sparkles className="w-4 h-4" style={{ color: 'rgba(74,122,181,0.35)' }} />
        </div>
        <p className="font-serif text-base font-bold" style={{ color: '#1B3A6B' }}>{coupleNames}</p>
        <p className="mt-1 text-xs" style={{ color: '#7AAFD4' }}>{weddingDate} · {cityLabel}</p>
      </footer>
    </div>
  )
}

// ─── Formulário principal ─────────────────────────────────
export default function RSVP() {
  const [form, setForm] = useState<FormData>(() => {
    // Recupera rascunho salvo (caso o user volte pela seta do browser)
    try {
      const saved = sessionStorage.getItem('rsvp_draft')
      return saved ? JSON.parse(saved) : EMPTY_FORM
    } catch { return EMPTY_FORM }
  })
  const [status, setStatus] = useState<Status>("idle")

  const { coupleSlug } = useParams<{ coupleSlug: string }>()
  const normalizedCoupleSlug = normalizeCoupleSlug(coupleSlug)
  const couple = getCoupleConfig(normalizedCoupleSlug)
  const coupleHomePath = `/${normalizedCoupleSlug}`
  const coupleNames = couple.names
  const weddingDate = couple.weddingDateLabel
  const cityLabel = couple.cityLabel


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [])

  // Salva rascunho a cada alteração
  useEffect(() => {
    try { sessionStorage.setItem('rsvp_draft', JSON.stringify(form)) } catch { }
  }, [form])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    try {
      await fetch(`/api/rsvp?couple=${encodeURIComponent(normalizedCoupleSlug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      sessionStorage.removeItem('rsvp_draft') // limpa rascunho após envio
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  // Voltar ao form a partir da tela de sucesso
  const handleBackToForm = () => {
    setStatus("idle")
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  // ─── Tela de sucesso ──────────────────────────────────
  if (status === "success") {
    return (
      <SuccessScreen
        name={form.fullName}
        attendance={form.attendance}
        onBack={handleBackToForm}
        coupleHomePath={coupleHomePath}
        coupleNames={couple.names}
        weddingDate={couple.weddingDateLabel}
        cityLabel={couple.cityLabel}
      />
    )
  }

  // ─── Formulário ───────────────────────────────────────
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-sans"
      style={{ background: '#f0f6ff', color: '#1B3A6B' }}>

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .rsvp-marquee { display: flex; width: max-content; animation: marquee 28s linear infinite; }
      `}</style>

      {/* Marquee banner */}
      <div className="sticky top-0 z-50 w-full overflow-hidden py-2 shadow-md"
        style={{ background: 'linear-gradient(90deg, #1B3A6B, #4A7AB5, #1B3A6B)' }}>
        <div className="rsvp-marquee flex items-center whitespace-nowrap text-white">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-6 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.25em]">
              <span style={{ color: 'rgba(200,220,240,0.6)' }}>✦</span>
              confirme sua presença
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-0.5 font-bold tracking-widest">
                {coupleNames}
              </span>
              {weddingDate}
              <span style={{ color: 'rgba(200,220,240,0.6)' }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      <main className="flex flex-1 justify-center px-4 py-10 md:px-40">
        <div className="flex w-full max-w-[800px] flex-col">

          {/* Botão voltar */}
          <Link
            to={coupleHomePath}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#1B3A6B] w-fit"
            style={{ color: '#4A7AB5' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>

          {/* HERO BANNER */}
          <div className="mb-8 min-h-[300px] overflow-hidden rounded-2xl flex flex-col justify-end relative"
            style={{ boxShadow: '0 8px 40px rgba(27,58,107,0.18)' }}>
            <img src="/img9.JPG" alt="Luís e Natiele"
              className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(27,48,96,0.92) 0%, rgba(27,48,96,0.2) 60%)' }} />
            <div className="pointer-events-none absolute top-0 right-0 opacity-30">
              <svg width="140" height="140" viewBox="0 0 200 200" fill="none">
                <ellipse cx="145" cy="40" rx="8" ry="22" transform="rotate(45 145 40)" stroke="#C8DCF0" strokeWidth="1.2" />
                <ellipse cx="120" cy="20" rx="8" ry="24" transform="rotate(25 120 20)" stroke="#C8DCF0" strokeWidth="1.2" />
                <ellipse cx="90" cy="15" rx="9" ry="26" transform="rotate(5 90 15)" stroke="#C8DCF0" strokeWidth="1.2" />
              </svg>
            </div>
            <div className="relative p-8">
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.4em]"
                style={{ color: 'rgba(200,220,240,0.6)' }}>
                {weddingDate} · {cityLabel}
              </p>
              <h1 className="font-serif text-4xl font-bold text-white drop-shadow-lg md:text-5xl">
                Confirme sua Presença
              </h1>
              <p className="mt-2 font-medium" style={{ color: '#C8DCF0' }}>
                Mal podemos esperar para celebrar com você!
              </p>
            </div>
          </div>

          {/* FORM CARD */}
          <div className="rounded-2xl p-6 shadow-sm md:p-10"
            style={{ background: 'white', border: '1px solid #e8f1fb' }}>

            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-[1px] w-8" style={{ background: '#C8DCF0' }} />
                <Heart className="h-3.5 w-3.5" style={{ color: '#4A7AB5', fill: '#4A7AB5' }} />
                <div className="h-[1px] w-8" style={{ background: '#C8DCF0' }} />
              </div>
              <p className="font-serif text-xl font-bold" style={{ color: '#1B3A6B' }}>{coupleNames}</p>
              <p className="text-sm mt-1" style={{ color: '#7AAFD4' }}>Preencha o formulário abaixo</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Nome + Email */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="fullName" className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>
                    Nome Completo
                  </label>
                  <input id="fullName" name="fullName" type="text" required
                    value={form.fullName} onChange={handleChange}
                    placeholder="Digite seu nome completo" className={INPUT_CLASS} />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>
                    E-mail
                  </label>
                  <input id="email" name="email" type="email" required
                    value={form.email} onChange={handleChange}
                    placeholder="seuemail@exemplo.com" className={INPUT_CLASS} />
                </div>
              </div>

              {/* Presença */}
              <div className="space-y-4">
                <p className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>Você vai comparecer?</p>
                <div className="flex flex-wrap gap-4">
                  {ATTENDANCE_OPTIONS.map(({ value, label }) => (
                    <label key={value}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-5 py-3 transition-all"
                      style={{
                        border: form.attendance === value ? '1.5px solid #4A7AB5' : '1.5px solid #C8DCF0',
                        background: form.attendance === value ? 'rgba(74,122,181,0.07)' : 'white',
                      }}
                    >
                      <input type="radio" name="attendance" value={value}
                        checked={form.attendance === value} onChange={handleChange}
                        className="size-4" style={{ accentColor: '#4A7AB5' }} />
                      <span className="text-sm font-medium" style={{ color: '#1B3A6B' }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Nº convidados */}
              <div className="flex max-w-xs flex-col gap-2">
                <label htmlFor="guests" className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>
                  Número de Convidados
                </label>
                <div className="relative">
                  <select id="guests" name="guests" value={form.guests} onChange={handleChange}
                    className={`${INPUT_CLASS} appearance-none pr-10`}>
                    {GUEST_OPTIONS.map(g => <option key={g}>{g}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 w-5 h-5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Restrições */}
              <div className="flex flex-col gap-2">
                <label htmlFor="dietary" className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>
                  Restrições Alimentares
                </label>
                <textarea id="dietary" name="dietary" rows={3}
                  value={form.dietary} onChange={handleChange}
                  placeholder="Informe alergias ou restrições alimentares (ex: Vegano, Sem Glúten)"
                  className={TEXTAREA_CLASS} />
              </div>

              {/* Mensagem */}
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>
                  Mensagem ao Casal{" "}
                  <span className="font-normal" style={{ color: '#7AAFD4' }}>(Opcional)</span>
                </label>
                <textarea id="message" name="message" rows={4}
                  value={form.message} onChange={handleChange}
                  placeholder="Uma mensagem especial para Luís e Natiele..."
                  className={TEXTAREA_CLASS} />
              </div>

              {/* Erro */}
              {status === "error" && (
                <div className="rounded-xl p-4 text-sm"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}>
                  Algo deu errado. Por favor, tente novamente.
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button type="submit" disabled={status === "loading"}
                  className="flex w-full items-center justify-center gap-2 rounded-full px-12 py-4 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed md:w-auto"
                  style={{
                    background: 'linear-gradient(135deg, #1B3A6B, #4A7AB5)',
                    boxShadow: '0 4px 24px rgba(27,58,107,0.3)',
                  }}
                >
                  {status === "loading" ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>Enviando...</span></>
                  ) : (
                    <><span>Confirmar Presença</span><Send className="w-5 h-5" /></>
                  )}
                </button>
                <p className="mt-4 text-sm italic text-center md:text-left" style={{ color: '#7AAFD4' }}>
                  Responda até <strong style={{ color: '#4A7AB5' }}>15 de junho de 2026</strong>
                </p>
              </div>

            </form>
          </div>

          {/* Footer */}
          <footer className="mt-20 py-10 text-center" style={{ borderTop: '1px solid #C8DCF0' }}>
            <div className="mb-4 flex justify-center gap-6">
              <Sparkles className="w-4 h-4" style={{ color: 'rgba(74,122,181,0.35)' }} />
              <Heart className="w-4 h-4" style={{ color: 'rgba(74,122,181,0.35)', fill: 'rgba(74,122,181,0.35)' }} />
              <Sparkles className="w-4 h-4" style={{ color: 'rgba(74,122,181,0.35)' }} />
            </div>
            <p className="font-serif text-lg font-bold" style={{ color: '#1B3A6B' }}>{coupleNames}</p>
            <p className="mt-1 text-sm" style={{ color: '#7AAFD4' }}>{weddingDate} · {cityLabel}</p>
          </footer>

        </div>
      </main>
    </div>
  )
}
