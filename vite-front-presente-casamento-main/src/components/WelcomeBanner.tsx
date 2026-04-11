import React, { useState, useEffect } from 'react';

type WelcomeBannerProps = {
    coupleNames?: string;
    coupleSlug?: string;
};

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
    coupleNames = 'Luís & Natiele',
    coupleSlug = 'luis-natiele',
}) => {
    const [step, setStep] = useState<0 | 1 | 2 | 'done'>(0);
    const [isVisible, setIsVisible] = useState(false);
    const welcomeSeenKey = `welcome_seen_${coupleSlug}`;

    useEffect(() => {
        if (sessionStorage.getItem(welcomeSeenKey)) {
            setStep('done');
            return;
        }

        const timers = [
            setTimeout(() => setIsVisible(true), 500),
            setTimeout(() => { setIsVisible(false); setTimeout(() => { setStep(1); setIsVisible(true); }, 500); }, 3500),
            setTimeout(() => { setIsVisible(false); setTimeout(() => { setStep(2); setIsVisible(true); }, 500); }, 6500),
        ];

        return () => timers.forEach(clearTimeout);
    }, [welcomeSeenKey]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            setStep('done');
            sessionStorage.setItem(welcomeSeenKey, 'true');
        }, 500);
    };

    if (step === 'done') return null;

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-1000 ease-in-out ${isVisible ? 'bg-slate-950/95 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}>
            <style>{`
                .fade-up { 
                    transform: translateY(${isVisible ? '0' : '20px'}); 
                    opacity: ${isVisible ? '1' : '0'};
                    transition: all 0.8s cubic-bezier(0.2, 1, 0.3, 1);
                }
            `}</style>

            <div className="fade-up max-w-sm w-full px-6 text-center">

                {step === 0 && (
                    <div className="space-y-6">
                        <img src="https://cdn-icons-png.flaticon.com/512/5166/5166470.png" alt="" width={40} className="mx-auto" />
                        <div className="space-y-2">
                            <span className="text-[10px] tracking-[0.4em] uppercase text-slate-500 font-medium">{coupleNames}</span>
                            <h1 className="text-3xl font-light tracking-tight text-slate-100">Bem-vindos ao nosso <br /> pequeno espaço</h1>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-3xl font-light tracking-tight text-slate-100 italic">"O amor é paciente..."</h2>
                        <p className="text-slate-400 text-sm font-light leading-relaxed">
                            Estamos muito felizes em compartilhar esse momento com você. Cada detalhe foi pensado com carinho.
                        </p>
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
                        <img src="https://images.icon-icons.com/3525/PNG/512/web_online_internet_global_earth_world_globe_icon_221254.png" alt="" width={100} className="mx-auto mb-6" />
                        <h2 className="text-xl font-semibold text-slate-100 mb-3">Site</h2>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed font-light">
                            Criamos uma seleção para facilitar caso queira nos presentear, mas sua presença é o que mais importa.
                        </p>
                        <button
                            onClick={handleClose}
                            className="w-full bg-slate-100 hover:bg-white text-slate-950 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-white/5"
                        >
                            Veja nosso site
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WelcomeBanner;
