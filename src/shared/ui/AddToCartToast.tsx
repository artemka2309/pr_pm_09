import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@heroui/react';

interface AddToCartToastProps {
  visible: boolean;
  message?: string;
  productImage?: string | null;
  onDismiss: () => void;
}

const AddToCartToast: React.FC<AddToCartToastProps> = ({
  visible,
  message = 'Товар добавлен в корзину!',
  productImage,
  onDismiss,
}) => {
  const animationClasses = visible ? 'animate-enter' : 'animate-leave';

  return (
    <div
      className={`
        max-w-xs w-full bg-black shadow-lg rounded-2xl pointer-events-auto 
        flex overflow-hidden
        ${animationClasses}
      `}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          {/* Иконка успеха - Ярче */}
          <div className="flex-shrink-0 pt-0.5">
            <CheckCircle className="h-6 w-6 text-green-500" aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            {/* Сообщение */}
            <p className="text-sm font-medium text-white">
              {message}
            </p>
            {/* Кнопка перейти в корзину */}
            <div className="mt-3">
              <Link href="/cart" passHref legacyBehavior>
                <Button
                  variant="light"
                  size="sm"
                  onClick={onDismiss}
                  className="bg-white hover:bg-gray-200 text-black text-xs font-normal px-3 py-1.5 rounded-lg transition-colors"
                >
                  Перейти в корзину
                </Button>
              </Link>
            </div>
          </div>
          {/* Миниатюра товара */}
          {productImage && (
            <div className="ml-4 flex-shrink-0 self-center">
              <Image
                src={productImage}
                alt="Товар"
                width={48}
                height={48}
                className="rounded-lg object-cover"
              />
            </div>
          )}
        </div>
      </div>
      {/* Кнопка закрытия - Обновленные цвета */}
      <div className="flex items-start p-1">
        <button
          onClick={onDismiss}
          className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-500 transition ease-in-out duration-150"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {/* Глобальные стили для анимации (если еще не определены) */}
      <style jsx global>{`
        @keyframes enter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes leave {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(10px);
          }
        }
        .animate-enter {
          animation: enter 0.3s ease-out forwards;
        }
        .animate-leave {
          animation: leave 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default AddToCartToast; 