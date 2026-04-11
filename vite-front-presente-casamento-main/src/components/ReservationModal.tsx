import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { User, Mail, Heart, Gift, Check, AlertCircle, X } from 'lucide-react';

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reservedBy: string) => void;
    giftName: string;
    giftPrice?: number;
    giftDescription?: string;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    giftName,
    giftPrice,
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

    const nameInputRef = useRef<HTMLInputElement>(null);

    const validateForm = () => {
        const newErrors: { name?: string; email?: string } = {};
        if (!name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
        }
        if (!email.trim()) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'E-mail inválido';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1200));
            const reservedBy = `${name.trim()} <${email.trim()}>`;

            setIsSuccess(true);

            // Wait for success animation then close
            setTimeout(() => {
                onConfirm(reservedBy);
                resetForm();
                onClose();
            }, 1000);

        } catch (error) {
            console.error('Error submitting reservation:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setErrors({});
        setIsSubmitting(false);
        setIsSuccess(false);
    };

    const handleClose = () => {
        if (!isSubmitting && !isSuccess) {
            resetForm();
            onClose();
        }
    };

    // Focus management
    useEffect(() => {
        if (isOpen) {
            resetForm();
            setTimeout(() => nameInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="w-[95vw] max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-0 p-0 max-h-[85vh] flex flex-col">

                {/* Success Overlay */}
                {isSuccess && (
                    <div className="absolute inset-0 bg-green-500/95 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
                        <div className="text-center text-white">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <Check size={32} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Reserva Confirmada!</h3>
                            <p className="text-green-100">Processando...</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-6 relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
                        disabled={isSubmitting || isSuccess}
                        aria-label="Fechar"
                    >
                        <X size={20} />
                    </button>

                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
                            <Heart size={24} className="text-white" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-white mb-1">
                                Reservar Presente
                            </DialogTitle>
                            <DialogDescription className="text-white/90 text-sm">
                                Confirme seus dados para reservar
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Gift Info */}
                    <div className="px-6 py-4 bg-gray-50 border-b">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Gift size={20} className="text-rose-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-noto monetary-value text-sm leading-tight">{giftName}</h3>
                                {giftPrice && (
                                    <p className="text-rose-600 font-bold text-lg mt-1">
                                        R$ {giftPrice.toFixed(2).replace('.', ',')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome Completo *
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input
                                    ref={nameInputRef}
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                                    }}
                                    placeholder="Seu nome completo"
                                    className={`pl-10 h-12 rounded-xl border-2 transition-all duration-200 ${errors.name
                                        ? 'border-red-300 bg-red-50 focus:border-red-500'
                                        : 'border-gray-200 focus:border-rose-400 hover:border-gray-300'
                                        }`}
                                    disabled={isSubmitting}
                                    autoComplete="name"
                                />
                                {errors.name && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        {errors.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                E-mail *
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                                    }}
                                    placeholder="seu@email.com"
                                    type="email"
                                    className={`pl-10 h-12 rounded-xl border-2 transition-all duration-200 ${errors.email
                                        ? 'border-red-300 bg-red-50 focus:border-red-500'
                                        : 'border-gray-200 focus:border-rose-400 hover:border-gray-300'
                                        }`}
                                    disabled={isSubmitting}
                                    autoComplete="email"
                                />
                                {errors.email && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        {errors.email}
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Fixed Footer */}
                <div className="border-t bg-white px-6 py-4">
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleClose}
                            className="flex-1 h-12 rounded-xl font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
                            disabled={isSubmitting || isSuccess}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            className="flex-1 h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                            disabled={isSubmitting || isSuccess}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Confirmando...
                                </>
                            ) : (
                                <>
                                    <Check size={18} />
                                    Confirmar
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Security Notice */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Dados protegidos e seguros</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ReservationModal;