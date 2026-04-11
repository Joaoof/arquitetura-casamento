import React, { useState } from 'react';
import { Gift } from '../types';
import { api } from '../services/api';
import { AlertCircle, Check, Loader2, Heart, Gift as GiftIcon, X, Sparkles } from 'lucide-react';

interface GiftRegistrationFormProps {
    gift: Gift;
    onSuccess: () => void;
    onCancel: () => void;
}

const GiftRegistrationForm: React.FC<GiftRegistrationFormProps> = ({
    gift,
    onSuccess,
    onCancel,
}) => {
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const fullName = `${guestName} <${guestEmail}>`;
            await api.reserveGift(gift.id, fullName);

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro ao registrar o presente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in-95 duration-300 relative">
                {/* Decorative background elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-white to-pink-50/30 pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-200/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200/20 to-transparent rounded-full translate-y-12 -translate-x-12" />

                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
                    disabled={isSubmitting}
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="relative px-8 py-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
                        <Heart size={28} className="text-white" />
                    </div>

                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                        Reservar Presente
                    </h2>

                    <div className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-4 mt-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center">
                                <GiftIcon size={20} className="text-rose-600" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-gray-800 text-lg">{gift.name}</h3>
                                {gift.description && (
                                    <p className="text-gray-600 text-sm">{gift.description}</p>
                                )}
                                {gift.price && (
                                    <p className="text-rose-600 font-semibold mt-1">
                                        R$ {gift.price.toFixed(2).replace('.', ',')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="relative px-8 pb-8 space-y-6">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nome Completo*
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-rose-300 focus:shadow-lg focus:shadow-rose-100/50 transition-all duration-300 text-gray-800 placeholder-gray-400"
                                    placeholder="Digite seu nome completo"
                                    required
                                    disabled={isSubmitting || success}
                                />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-400/0 via-rose-400/0 to-rose-400/0 hover:from-rose-400/5 hover:to-pink-400/5 transition-all duration-300 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                E-mail*
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-rose-300 focus:shadow-lg focus:shadow-rose-100/50 transition-all duration-300 text-gray-800 placeholder-gray-400"
                                    placeholder="seu@email.com"
                                    required
                                    disabled={isSubmitting || success}
                                />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-400/0 via-rose-400/0 to-rose-400/0 hover:from-rose-400/5 hover:to-pink-400/5 transition-all duration-300 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-1 duration-300">
                            <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle size={14} />
                            </div>
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-1 duration-300">
                            <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                                <Check size={14} />
                            </div>
                            <div>
                                <div className="font-semibold flex items-center gap-1">
                                    Presente reservado com sucesso! <Sparkles size={14} />
                                </div>
                                <div className="text-emerald-500 text-xs mt-1">
                                    Você receberá um e-mail de confirmação
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all duration-200 text-sm font-semibold disabled:opacity-50 hover:scale-[0.98] active:scale-95"
                            disabled={isSubmitting || success}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl hover:from-rose-600 hover:to-pink-700 transition-all duration-200 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-rose-200/50 hover:scale-[0.98] active:scale-95"
                            disabled={isSubmitting || success}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Reservando...
                                </>
                            ) : success ? (
                                <>
                                    <Check size={18} />
                                    Confirmado!
                                </>
                            ) : (
                                <>
                                    <Heart size={18} />
                                    Confirmar Reserva
                                </>
                            )}
                        </button>
                    </div>

                    {/* Trust indicators */}
                    <div className="text-center pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            Seus dados estão seguros e protegidos
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GiftRegistrationForm;