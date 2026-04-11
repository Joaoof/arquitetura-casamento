import React, { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastProps {
    id?: string;
    show: boolean;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onClose?: () => void;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

const Toast: React.FC<ToastProps> = ({
    show,
    message,
    type = 'success',
    duration = 4000,
    onClose,
    position = 'top-right'
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            setIsLeaving(false);

            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [show, duration]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, 300);
    };

    if (!show && !isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <Check size={20} className="text-emerald-600" />;
            case 'error':
                return <X size={20} className="text-red-600" />;
            case 'warning':
                return <AlertTriangle size={20} className="text-amber-600" />;
            case 'info':
                return <Info size={20} className="text-blue-600" />;
            default:
                return <Check size={20} className="text-emerald-600" />;
        }
    };

    const getColorClasses = () => {
        switch (type) {
            case 'success':
                return 'bg-emerald-50 border-emerald-200 text-emerald-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-amber-50 border-amber-200 text-amber-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            default:
                return 'bg-emerald-50 border-emerald-200 text-emerald-800';
        }
    };

    const getPositionClasses = () => {
        switch (position) {
            case 'top-right':
                return 'top-4 right-4';
            case 'top-left':
                return 'top-4 left-4';
            case 'bottom-right':
                return 'bottom-4 right-4';
            case 'bottom-left':
                return 'bottom-4 left-4';
            case 'top-center':
                return 'top-4 left-1/2 -translate-x-1/2';
            default:
                return 'top-4 right-4';
        }
    };

    const getAnimationClasses = () => {
        if (isLeaving) {
            return 'animate-toast-out';
        }
        return 'animate-toast-in';
    };

    return (
        <div className={`fixed z-[60] ${getPositionClasses()}`}>
            <div
                className={`
          flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm
          ${getColorClasses()}
          ${getAnimationClasses()}
          min-w-[300px] max-w-[400px]
        `}
            >
                <div className="flex-shrink-0">
                    {getIcon()}
                </div>

                <div className="flex-1">
                    <p className="text-sm font-medium leading-relaxed">
                        {message}
                    </p>
                </div>

                <button
                    onClick={handleClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white/50 rounded"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default Toast;