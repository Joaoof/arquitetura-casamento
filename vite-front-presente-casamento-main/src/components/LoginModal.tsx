import React, { useState } from 'react';
import { X, Lock, Mail, Heart } from 'lucide-react';
import Toast from './Toast';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setUsername('');
      setPassword('');
      setError('');
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await api.login(username, password);
      login(data.accessToken);
      setShowToast(true);
      setTimeout(() => { handleClose(); }, 1500);
    } catch (err) {
      setError('Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;600&display=swap');

        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .glass-modal {
          animation: modal-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* Input underline — tom azul */
        .glass-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(200,220,240,0.5);
          color: rgba(255,255,255,0.92);
          outline: none;
          width: 100%;
          padding: 8px 0 8px 32px;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        .glass-input::placeholder {
          color: rgba(200,220,240,0.5);
        }
        .glass-input:focus {
          border-bottom-color: rgba(200,220,240,0.95);
        }
      `}</style>

      {/* ── Backdrop azul marinho degradê ── */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0f2444 30%, #1B3A6B 65%, #1a3060 100%)',
        }}
      >
        {/* Blobs decorativos — tons de azul */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Blob azul médio — canto superior esquerdo */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-35"
            style={{ background: 'radial-gradient(circle, #4A7AB5 0%, transparent 70%)' }} />
          {/* Blob azul claro — canto inferior direito */}
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #7AAFD4 0%, transparent 70%)' }} />
          {/* Blob azul escuro — centro */}
          <div className="absolute top-1/2 right-1/3 w-56 h-56 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #C8DCF0 0%, transparent 70%)' }} />
        </div>

        {/* ── Card de vidro — azul ── */}
        <div
          className={`glass-modal relative w-full max-w-[320px] rounded-3xl overflow-hidden transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : ''}`}
          style={{
            background: 'rgba(200,220,240,0.08)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(200,220,240,0.2)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(200,220,240,0.15)',
          }}
        >
          {/* Barra superior decorativa */}
          <div className="h-0.5 w-full"
            style={{ background: 'linear-gradient(to right, transparent, rgba(200,220,240,0.6), transparent)' }} />

          {/* Botão fechar */}
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="absolute right-4 top-4 z-10 transition p-1 rounded-full"
            style={{ color: 'rgba(200,220,240,0.5)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(200,220,240,0.9)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(200,220,240,0.5)')}
          >
            <X size={18} />
          </button>

          {/* ── Avatar ── */}
          <div className="flex flex-col items-center pt-10 pb-6 px-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
              style={{
                background: 'rgba(74,122,181,0.2)',
                border: '1px solid rgba(200,220,240,0.25)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2), 0 0 20px rgba(74,122,181,0.2)',
              }}
            >
              <svg viewBox="0 0 64 64" className="w-14 h-14" fill="rgba(200,220,240,0.4)">
                <circle cx="32" cy="22" r="12" />
                <path d="M8 56c0-13.3 10.7-24 24-24s24 10.7 24 24" />
              </svg>
            </div>

            {/* Nome do casal abaixo do avatar */}
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.3em]"
              style={{ color: 'rgba(200,220,240,0.55)' }}>
              Área do Casal
            </p>

            {/* ── Formulário ── */}
            <form onSubmit={handleSubmit} className="w-full space-y-6">

              {/* Email */}
              <div className="relative">
                <Mail size={15} className="absolute left-0 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(200,220,240,0.5)' }} />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="glass-input"
                  placeholder="Email ID"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Senha */}
              <div className="relative">
                <Lock size={15} className="absolute left-0 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(200,220,240,0.5)' }} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input"
                  placeholder="Password"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Erro */}
              {error && (
                <div className="text-xs text-center rounded-lg py-2 px-3"
                  style={{
                    color: '#fca5a5',
                    background: 'rgba(220,38,38,0.1)',
                    border: '1px solid rgba(220,38,38,0.2)',
                  }}>
                  {error}
                </div>
              )}

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    className="w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer"
                    style={{
                      background: rememberMe ? 'rgba(200,220,240,0.25)' : 'transparent',
                      border: `1px solid ${rememberMe ? 'rgba(200,220,240,0.7)' : 'rgba(200,220,240,0.3)'}`,
                    }}
                  >
                    {rememberMe && (
                      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none"
                        stroke="rgba(200,220,240,0.9)" strokeWidth="2">
                        <polyline points="1,6 4,9 11,2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs select-none transition"
                    style={{ color: 'rgba(200,220,240,0.6)' }}>
                    Remember me
                  </span>
                </label>

                <button type="button" className="text-xs italic transition"
                  style={{ color: 'rgba(200,220,240,0.5)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(200,220,240,0.85)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(200,220,240,0.5)')}>
                  Forgot Password?
                </button>
              </div>

              {/* Botão LOGIN — gradiente azul marinho */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-medium tracking-widest text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "'Teko', sans-serif",
                  fontSize: '16px',
                  letterSpacing: '0.15em',
                  background: 'linear-gradient(90deg, #1B3A6B 0%, #4A7AB5 50%, #2a5298 100%)',
                  boxShadow: '0 4px 20px rgba(27,58,107,0.6)',
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Autenticando...
                  </div>
                ) : (
                  'LOGIN'
                )}
              </button>

              <p className="text-center text-[10px] pb-2"
                style={{ color: 'rgba(200,220,240,0.3)' }}>
                Apenas noivos autorizados podem acessar esta área
              </p>

            </form>
          </div>
        </div>
      </div>

      <Toast
        show={showToast}
        message="Autenticação realizada com sucesso! Redirecionando..."
        type="success"
        duration={2000}
        onClose={() => setShowToast(false)}
        position="top-center"
      />
    </>
  );
};

export default LoginModal;
