import React from 'react';
import { Gift as GiftType } from '../types';
import { Heart, Edit, Trash2, Gift, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditGiftModal from './EditGiftModal';

interface GiftItemProps {
  gift: GiftType;
  isAdmin: boolean;
  onEdit: (updatedGift: GiftType) => void;
  onDelete: () => void;
  onReserve: () => void;
  coupleNames: string;
}

const GiftItem: React.FC<GiftItemProps> = ({
  gift,
  isAdmin,
  onEdit,
  onDelete,
  onReserve,
  coupleNames,
}) => {
  const isReserved = gift.status === 'reserved';
  const [isEditing, setIsEditing] = React.useState(false);

  const handleSave = (updatedGift: GiftType) => {
    onEdit(updatedGift);
    toast.success('Presente atualizado com sucesso!');
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-sm p-3 sm:p-2 hover:shadow transition-all duration-200 relative ${isReserved ? 'ring-2 ring-green-200 bg-green-50/30' : ''}`}
      >
        {/* Badge de Reservado */}
        {isReserved && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
              <Heart size={12} className="fill-current" />
              Reservado
            </div>
          </div>
        )}

        {/* Imagem do Presente */}
        <div
          className={`w-full aspect-square mb-2 overflow-hidden rounded-md bg-white relative ${isReserved ? 'opacity-75' : ''}`}
        >
          {gift.imageUrl ? (
            <img
              src={gift.imageUrl}
              alt={gift.name}
              className="w-full h-full object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <Gift size={24} className="text-gray-300" />
          )}
        </div>

        {/* Nome do Presente */}
        <h3
          className={`text-xs sm:text-[13px] font-medium mb-1 line-clamp-2 min-h-[2.5em] ${isReserved ? 'text-gray-600' : 'text-gray-800'}`}
        >
          {gift.name}
        </h3>

        {/* Preço */}
        <p className={`text-sm font-medium mb-2 ${isReserved ? 'text-gray-500' : 'text-gray-900'}`}>
          R$ {gift.price?.toFixed(2).replace('.', ',')}
        </p>

        {/* Botão para presentear */}
        {gift.status === 'available' && !isAdmin && (
          <button
            onClick={onReserve}
            className="w-full bg-[#A88B7C] text-white py-1.5 rounded text-xs font-medium hover:bg-[#97796A] transition-colors transform hover:scale-105 active:scale-95"
          >
            Presentear
          </button>
        )}

        {/* Mensagem de reservado */}
        {isReserved && !isAdmin && (
          <div className="w-full bg-green-100 text-green-700 py-1.5 rounded text-xs font-medium text-center border border-green-200 mt-2">
            ✓ Reservado
          </div>
        )}

        {/* Botões Admin */}
        {isAdmin && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium flex items-center justify-center gap-1 shadow-sm"
            >
              <Edit size={14} /> Editar
            </button>
            <button
              onClick={() => {
                onDelete();
                toast.success('Presente excluído com sucesso');
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }}
              className="flex-1 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-xs font-medium flex items-center justify-center gap-1 shadow-sm"
            >
              <Trash2 size={14} /> Excluir
            </button>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {isEditing && (
        <EditGiftModal
          gift={gift}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default GiftItem;