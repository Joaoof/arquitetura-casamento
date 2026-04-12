import { Heart, Menu, X, Clock, MapPin, GlassWater, Music, LogIn, CheckCircle, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import { useNavigate } from "react-router-dom";

type HeaderProps = {
  coupleNames?: string;
  weddingDate?: string;
  weddingDateISO?: string;
};

type TimeLeft = {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
};


export default function Header({
  coupleNames = "Luis & Natiele",
  weddingDate = "25 de Julho de 2026",
  weddingDateISO = "2026-07-25T18:00:00",
}: HeaderProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<'idle' | 'loading'>('idle');
  const navigate = useNavigate();

  // ✅ Dispara o overlay — chamado pelo botão da navbar E pelo botão dentro do modal de acesso
  function handleConfirmarPresenca() {
    setIsAccessModalOpen(false);
    setConfirmState('loading');
    setTimeout(() => setConfirmState('loading'), 2500);
    setTimeout(() => {
      setConfirmState('idle');
      navigate('/rsvp')
    }, 4000);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const targetDate = new Date(weddingDateISO).getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        setTimeLeft({
          dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
          horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutos: Math.floor((difference / 1000 / 60) % 60),
          segundos: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [weddingDateISO]);

  useEffect(() => {
    const anyOpen = isScheduleModalOpen || isAccessModalOpen || isLoginModalOpen;
    document.body.style.overflow = anyOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isScheduleModalOpen, isAccessModalOpen, isLoginModalOpen]);

  function CircleProgress({ percentage, color, value, label }: {
    percentage: number; color: string; value: number; label: string;
  }) {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - percentage * circumference;
    const rotation = percentage * 360;

    return (
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 flex flex-col items-center justify-center bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-blue-100">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} stroke="#dbeafe" strokeWidth="4" fill="none" />
          <circle cx="60" cy="60" r={radius} stroke={color} strokeWidth="4" fill="none"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
          <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '60px 60px' }}
            className="transition-all duration-1000 ease-linear">
            <circle cx="110" cy="60" r="4" fill={color} />
            <circle cx="110" cy="60" r="8" fill={color} opacity="0.25" />
          </g>
        </svg>
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1B3A6B] tracking-wider tabular-nums">
            {value.toString().padStart(2, "0")}
          </span>
          <span className="text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.2em] text-[#4A7AB5] mt-0.5 sm:mt-1 uppercase font-medium">
            {label}
          </span>
        </div>
      </div>
    );
  }

  const diasPct = timeLeft.dias / 365;
  const horasPct = timeLeft.horas / 24;
  const minutosPct = timeLeft.minutos / 60;
  const segundosPct = timeLeft.segundos / 60;

  const cronogramaEventos = [
    { time: "18:00", title: "Cerimônia Religiosa",   desc: "A troca de alianças e votos na igreja.",    icon: Heart },
    { time: "19:00", title: "Recepção e Coquetel",   desc: "Brindes de boas-vindas aos convidados.",    icon: GlassWater },
    { time: "20:30", title: "Jantar Principal",       desc: "Momento para compartilhar.",                icon: MapPin },
    { time: "22:00", title: "Festa e Pista de Dança", desc: "Abertura da pista de dança.",               icon: Music },
  ];

  return (
    <div className="min-h-screen bg-[#4A7AB5] text-slate-800 flex flex-col">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Teko:wght@300..700&display=swap');`}</style>

      {/* ============================================================
          BOTÃO FLUTUANTE — Área do Casal
      ============================================================ */}
      <button
        onClick={() => setIsLoginModalOpen(true)}
        title="Área do Casal"
        className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full flex items-center justify-center group"
      >
        <span className="absolute inline-flex w-full h-full rounded-full bg-[#4A7AB5] opacity-30 animate-ping" />
        <span className="absolute inline-flex w-9 h-9 rounded-full bg-[#4A7AB5] opacity-20 animate-pulse" />
        <span className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-[#1B3A6B] to-[#4A7AB5] flex items-center justify-center shadow-[0_0_12px_3px_rgba(74,122,181,0.6)] border border-[#7AAFD4]/50 group-hover:shadow-[0_0_20px_6px_rgba(74,122,181,0.8)] group-hover:scale-110 transition-all duration-300">
          <Settings className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-500" />
        </span>
      </button>

      {confirmState === 'loading' && (
  <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#1B3A6B]/80 backdrop-blur-md">
    <div className="flex flex-col items-center justify-center gap-6 p-10 rounded-3xl bg-white shadow-2xl w-[280px] transition-all duration-500">

      <div className="relative w-24 h-24 flex items-center justify-center">
        <style>{`
          @keyframes progress-fill {
            from { width: 0%; }
            to   { width: 100%; }
          }
        `}</style>

        <img
          src="https://cdn-icons-png.flaticon.com/512/8296/8296621.png"
          alt=""
        />
      </div>

      <div className="text-center">
        <p
          className="text-[#1B3A6B] font-semibold text-xl leading-snug"
          style={{ fontFamily: "serif", letterSpacing: '0.05em' }}
        >
          Só um instante
        </p>

        <p className="text-[#4A7AB5] text-xs mt-1 animate-pulse">
          Redirecionando...
        </p>
      </div>

      <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#4A7AB5] to-[#1B3A6B] rounded-full"
          style={{ animation: 'progress-fill 1.5s ease-in-out forwards' }}
        />
      </div>

    </div>
  </div>
)}
      {/* ============================================================
          MODAL: CRONOGRAMA
      ============================================================ */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#1B3A6B]/60 backdrop-blur-sm" onClick={() => setIsScheduleModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-blue-50 border-b border-blue-100 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
              <h3 className="text-xl text-[#1B3A6B] flex items-center gap-2 font-semibold">
                <Clock className="w-5 h-5 text-[#4A7AB5]" />
                Cronograma do Dia
              </h3>
              <button onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-[#1B3A6B] transition p-1 rounded-full hover:bg-blue-50">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto">
              <div className="relative border-l-2 border-blue-100 ml-4 space-y-8">
                {cronogramaEventos.map((evento, index) => {
                  const Icon = evento.icon;
                  return (
                    <div key={index} className="relative pl-8 md:pl-10">
                      <div className="absolute -left-[15px] top-0 bg-white border-2 border-[#4A7AB5] w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                        <Icon className="w-4 h-4 text-[#4A7AB5]" />
                      </div>
                      <div className="flex flex-col gap-1 items-start pt-1">
                        <span className="text-[#4A7AB5] font-bold text-sm tracking-widest leading-none">{evento.time}</span>
                        <h4 className="text-lg font-semibold text-[#1B3A6B] leading-tight mt-1">{evento.title}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{evento.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-blue-50 border-t border-blue-100 px-6 py-4 flex justify-end">
              <button onClick={() => setIsScheduleModalOpen(false)}
                className="bg-[#1B3A6B] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#14305a] transition">
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: ACESSO — Confirmar Presença ou Área do Casal
      ============================================================ */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#1B3A6B]/60 backdrop-blur-sm"
            onClick={() => setIsAccessModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-[#1B3A6B] to-[#4A7AB5] px-6 pt-8 pb-10 text-center relative">
              <button onClick={() => setIsAccessModalOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/30">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-serif text-white mb-1">{coupleNames}</h3>
              <p className="text-white/70 text-xs tracking-widest uppercase">{weddingDate}</p>
            </div>
            <div className="h-4 bg-white relative -mt-4 rounded-t-[2rem]" />
            <div className="px-6 pb-8 -mt-1 flex flex-col gap-4">
              <p className="text-center text-slate-500 text-sm mb-2">O que você deseja fazer?</p>

              {/* ✅ Confirmar Presença → dispara o overlay */}
              <button
                onClick={handleConfirmarPresenca}
                className="group w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#C8DCF0] hover:border-[#4A7AB5] hover:bg-blue-50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-[#4A7AB5] flex items-center justify-center transition-colors shrink-0">
                  <CheckCircle className="w-6 h-6 text-[#4A7AB5] group-hover:text-white transition-colors" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[#1B3A6B] text-sm">Confirmar Presença</p>
                  <p className="text-slate-400 text-xs mt-0.5">Sou um convidado e quero confirmar</p>
                </div>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-blue-100" />
                <span className="text-xs text-slate-400 uppercase tracking-widest">ou</span>
                <div className="flex-1 h-px bg-blue-100" />
              </div>

              <button
                onClick={() => { setIsAccessModalOpen(false); setIsLoginModalOpen(true); }}
                className="group w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#C8DCF0] hover:border-[#1B3A6B] hover:bg-[#f0f6ff] transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f0f6ff] group-hover:bg-[#1B3A6B] flex items-center justify-center transition-colors shrink-0">
                  <LogIn className="w-6 h-6 text-[#1B3A6B] group-hover:text-white transition-colors" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[#1B3A6B] text-sm">Área do Casal</p>
                  <p className="text-slate-400 text-xs mt-0.5">Acesso exclusivo para {coupleNames}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* CONTAINER HERO */}
      <div className="w-full flex flex-col min-h-screen relative">
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url("/img1.JPG")' }} />

        {/* NAVBAR */}
        <header className="relative md:sticky md:top-0 z-50 w-full bg-transparent">
          <div className="mx-auto max-w-[1100px] flex items-center justify-between px-6 py-4">
            <img src="https://cdn-icons-png.flaticon.com/512/185/185482.png" alt="Logo" width={40} className="brightness-0 invert" />

            <nav className="hidden lg:flex items-center gap-8 text-sm text-white font-medium drop-shadow-md">
              {["Início", "Nossa História", "O Evento", "Lista de Presentes"].map((item) => (
                <a key={item} href="#" className="hover:text-blue-200 transition">{item}</a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {/* ✅ Botão limpo — só ícone + texto + fundo azul */}
              <button
                onClick={handleConfirmarPresenca}
                className="hidden lg:flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#14305a] text-white px-5 py-2 rounded-full transition border border-white/20 shadow-md"
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span style={{ fontFamily: "serif" }} className="text-lg tracking-wider leading-none">
                  Confirmar Presença
                </span>
              </button>

              <button className="lg:hidden text-white" onClick={() => setIsMobileOpen(!isMobileOpen)}>
                {isMobileOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          {isMobileOpen && (
            <div className="lg:hidden bg-white/95 backdrop-blur absolute w-full left-0 top-full">
              <div className="flex flex-col gap-3 px-6 py-6 text-sm text-[#1B3A6B]">
                {["Início", "Nossa História", "O Evento", "Lista de Presentes"].map((item) => (
                  <button key={item} className="text-left font-medium hover:text-[#4A7AB5] transition">{item}</button>
                ))}
                {/* ✅ Mobile: abre modal de acesso (com as duas opções) */}
                <button
                  onClick={() => { setIsMobileOpen(false); setIsAccessModalOpen(true); }}
                  className="mt-2 flex items-center justify-center gap-2 bg-[#1B3A6B] text-white py-2.5 rounded-full"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span style={{ fontFamily: "'Teko', sans-serif" }} className="text-lg tracking-wider leading-none">
                    Confirmar Presença
                  </span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* HERO */}
        <section className="relative z-10 flex-grow flex flex-col justify-center items-center md:px-6 md:py-16">
          <div className="mx-auto max-w-[1100px] w-full">
            <div className="w-full flex flex-col items-center justify-center text-center text-white px-6 py-16">
              <span className="text-xs tracking-[0.3em] uppercase text-blue-200 mb-4 drop-shadow-md">Reserve a data</span>
              <h1 className="text-3xl md:text-6xl font-serif mb-6 drop-shadow-lg text-white">
                {coupleNames}
              </h1>
              <p className="text-xs md:text-xl text-white mb-8 drop-shadow-lg font-medium tracking-wide">
                {weddingDate}
              </p>
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="bg-[#1B3A6B] backdrop-blur-sm border border-white/40 text-white px-8 py-4 md:py-3 rounded-full text-sm hover:bg-[#14305a] transition shadow-lg w-full max-w-xs md:w-auto flex items-center justify-center gap-2 mx-auto"
              >
                <Clock className="w-4 h-4" />
                Ver cronograma do casamento
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* COUNTDOWN */}
      <section className="py-20 md:py-24 bg-[#f0f6ff] border-t border-blue-100">
        <div className="mx-auto max-w-[900px] text-center px-6 relative">
          <h2 className="text-3xl md:text-4xl font-serif mb-4 text-[#1B3A6B]">O grande dia está chegando</h2>
          <p className="text-[#4A7AB5] mb-12 md:mb-16 text-xs md:text-sm font-medium uppercase tracking-[0.1em] md:tracking-[0.2em]">
            Cada segundo nos aproxima desse momento especial
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center relative z-10 max-w-sm lg:max-w-none mx-auto">
            {[
              { label: "Dias",     value: timeLeft.dias,     percentage: diasPct,     color: "#1B3A6B" },
              { label: "Horas",    value: timeLeft.horas,    percentage: horasPct,    color: "#4A7AB5" },
              { label: "Minutos",  value: timeLeft.minutos,  percentage: minutosPct,  color: "#7AAFD4" },
              { label: "Segundos", value: timeLeft.segundos, percentage: segundosPct, color: "#C8DCF0" },
            ].map((item) => (
              <CircleProgress key={item.label} {...item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
