import React from 'react';
import { Gift } from '../types';
import { toast } from 'react-toastify';

interface EditGiftModalProps {
    gift: Gift;
    onClose: () => void;
    onSave: (updatedGift: Gift) => void;
}

const EditGiftModal: React.FC<EditGiftModalProps> = ({ gift, onClose, onSave }) => {
    const [name, setName] = React.useState(gift.name);
    const [price, setPrice] = React.useState(gift.price?.toString() || '');
    const [imageUrl, setImageUrl] = React.useState(gift.imageUrl || '');

    // Validação simples antes de salvar
    const isFormValid = name.trim() !== '' && price.trim() !== '';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            toast.error('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        onSave({
            ...gift,
            name,
            price: parseFloat(price),
            imageUrl,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Editar Presente</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nome
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A88B7C]"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                            Preço
                        </label>
                        <input
                            id="price"
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A88B7C]"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                            URL da Imagem
                        </label>
                        <input
                            id="imageUrl"
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A88B7C]"
                        />
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className={`px-4 py-2 text-sm bg-[#A88B7C] text-white rounded transition-colors ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGiftModal;