"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import { motion } from 'framer-motion';
import { formatPrice } from '@/shared/lib/formatPrice'; // Обновлен путь
import { PackageCheck, Clock, CheckCircle2, XCircle, PackageX } from 'lucide-react'; // Добавил PackageX
import Image from "next/image";
import { 
    NEXT_PUBLIC_BASE_API_URL_CLIENT, 
    API_URL_GET_ORDERS, 
    NEXT_PUBLIC_STATIC_URL 
} from "@/shared/config/api";

// Интерфейсы для типов данных
interface OrderItemType {
  product_id: number; // Или string, в зависимости от API
  name: string;
  model: string; // Цвет/модель
  quantity: number;
  price: number;
  image?: string; // Добавлено для удобства, хотя в API может быть отдельный массив
}

interface OrderType {
  id: number; // Или string
  created_at: string; // Дата в виде строки
  total_price: number;
  status: "В обработке" | "Подтвержден" | "Завершен" | "Отклонен"; // Строго типизируем статус
  products: OrderItemType[];
  images: string[]; // Массив URL изображений, соответствующий products по индексу
}

// Конфигурация статусов
const statusConfig: Record<OrderType['status'], {
    color: string;
    icon: React.ReactElement;
    textColor: string;
}> = {
    "В обработке": {
        color: "border-yellow-400 bg-white",
        icon: <Clock size={16} className="text-yellow-500" />,
        textColor: "text-yellow-700"
    },
    "Подтвержден": {
        color: "border-green-400 bg-white",
        icon: <PackageCheck size={16} className="text-green-500" />,
        textColor: "text-green-700"
    },
    "Завершен": {
        color: "border-blue-400 bg-white",
        icon: <CheckCircle2 size={16} className="text-blue-500" />,
        textColor: "text-blue-700"
    },
    "Отклонен": {
        color: "border-red-400 bg-white",
        icon: <XCircle size={16} className="text-red-500" />,
        textColor: "text-red-700"
    }
};

interface OrderListProps {
    refresh: boolean; // Проп для запуска обновления
}

export default function OrderList({ refresh }: OrderListProps): React.ReactElement {
    const [applications, setApplications] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApplications = async () => {
            setLoading(true);
            setError(null);
            try {
                // Временный путь к API
                const apiUrl = `${NEXT_PUBLIC_BASE_API_URL_CLIENT}${API_URL_GET_ORDERS}`;
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    credentials: 'include', // Важно для куки аутентификации
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    // Обработка ошибок HTTP
                    let errorMsg = `Ошибка ${response.status}`;
                     try { const errData = await response.json(); errorMsg = errData.message || errData.error || errorMsg; } catch(e){}                    
                    throw new Error(errorMsg);
                }
                const data = await response.json();
                // Добавляем URL изображения к каждому продукту для удобства
                 const ordersWithImages = (data.orders as OrderType[]).map(order => ({
                     ...order,
                     products: order.products.map((product, index) => ({
                         ...product,
                         image: order.images[index] // Добавляем соответствующее изображение
                     }))
                 }));
                setApplications(ordersWithImages);
            } catch (err) {
                 console.error('Ошибка при загрузке заказов:', err);
                 setError(err instanceof Error ? err.message : "Неизвестная ошибка загрузки");
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [refresh]);

    // Анимации Framer Motion
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    // Форматирование даты
    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date);
        } catch (e) {
            console.error("Ошибка форматирования даты:", dateString, e);
            return "неверная дата";
        }
    };
    
    // Функция для правильного склонения слова "позиция"
    const getPositionWord = (count: number): string => {
        if (count % 10 === 1 && count % 100 !== 11) {
            return 'позиция';
        } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
            return 'позиции';
        } else {
            return 'позиций';
        }
    };
    
    // Генерация скелетона
    const renderSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 animate-pulse h-52">
                    <div className="flex justify-between items-center mb-3">
                        <div className="h-5 bg-skeleton rounded w-1/3"></div>
                        <div className="h-6 bg-skeleton rounded-full w-1/4"></div>
                    </div>
                    <div className="space-y-1 mb-4">
                        <div className="h-4 bg-skeleton rounded w-1/2"></div>
                        <div className="h-4 bg-skeleton rounded w-1/3"></div>
                    </div>
                    <div className="h-20 bg-light rounded"></div>
                </div>
            ))}
        </div>
    );

    // Рендеринг ошибки
    if (error) {
         return (
             <div className="my-10 bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                 <PackageX size={36} className="text-red-400 mx-auto mb-4" />
                 <p className="text-red-700 font-medium mb-1">Не удалось загрузить заказы</p>
                 <p className="text-red-600 text-sm">{error}</p>
                 {/* Можно добавить кнопку повторной попытки */}
            </div>
        );
    }

    // Рендеринг пустого состояния
    if (!loading && applications.length === 0) {
        return (
            <motion.div
                className="my-10 bg-light rounded-2xl p-8 text-center border border-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <PackageCheck size={36} className="text-dark mx-auto mb-4" />
                <p className="text-dark">У вас пока нет заказов</p>
            </motion.div>
        );
    }

    return (
        <div className="my-10">
            <div className="flex flex-col mb-6">
                <span className="text-xs font-medium tracking-widest uppercase text-dark mb-3">
                    история покупок
                </span>
                <h2 className="text-4xl md:text-5xl font-normal tracking-tight">
                    ваши заказы
                </h2>
            </div>

            {loading ? renderSkeleton() : (
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {applications.map((application, index) => {
                         // Получаем конфиг статуса, или дефолтный, если статус неизвестен
                         const currentStatus = application.status;
                         const statusInfo = statusConfig[currentStatus] || {
                              color: "border-gray-400 bg-gray-50",
                              icon: <PackageX size={16} className="text-gray-500" />,
                              textColor: "text-gray-700"
                         };
                         
                         return (
                            <motion.div
                                key={`order-${application.id || index}`}
                                className="bg-light rounded-3xl p-4 border border-light hover:border-gray-200 transition-colors duration-300"
                                variants={itemVariants}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-xs text-dark block mb-1">Заказ</span>
                                        <h3 className="text-base font-normal">№{index + 1}</h3>
                                    </div>
                                    <div className={`flex items-center px-3 py-1.5 rounded-xl border text-xs ${statusInfo.color} ${statusInfo.textColor}`}>
                                        {statusInfo.icon}
                                        <span className="ml-1.5">{currentStatus.toLowerCase()}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div className="bg-white rounded-2xl p-3">
                                        <span className="text-xs text-dark block mb-1">Дата</span>
                                        <span className="text-black font-normal">{formatDate(application.created_at)}</span>
                                    </div>
                                    <div className="bg-white rounded-2xl p-3">
                                        <span className="text-xs text-dark block mb-1">Сумма</span>
                                        <span className="text-lg font-normal">{formatPrice(application.total_price)}</span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs text-dark">Содержимое заказа</span>
                                        <span className="text-xs font-medium bg-white px-2 py-0.5 rounded-full">{application.products.length} {getPositionWord(application.products.length)}</span>
                                    </div>
                                    
                                    {/* Показываем миниатюры товаров */}
                                    {application.products && application.products.length > 0 ? (
                                        <div className="space-y-3">
                                            {/* Свайпер с миниатюрами */}
                                            <Swiper
                                                slidesPerView={3.5}
                                                spaceBetween={8}
                                                freeMode={true}
                                                className="order-product-swiper -mx-1 px-1"
                                            >
                                                {application.products.map((product, productIndex) => (
                                                    <SwiperSlide key={`product-${application.id}-${product.product_id || productIndex}`}>
                                                        <div className="group relative aspect-square rounded-lg overflow-hidden bg-white cursor-pointer">
                                                             {product.image ? (
                                                                <Image
                                                                    src={`${NEXT_PUBLIC_STATIC_URL}${product.image}`}
                                                                    alt={product.name}
                                                                    fill
                                                                    sizes="100px"
                                                                    style={{ objectFit: 'cover' }}
                                                                    className="group-hover:scale-105 transition-transform duration-300"
                                                                    onError={(e) => { 
                                                                         e.currentTarget.src = '/img/catalog-img/no_image.png';
                                                                     }}
                                                                />
                                                            ) : (
                                                                 <div className="w-full h-full flex items-center justify-center bg-light">
                                                                     <PackageX size={24} className="text-dark" />
                                                                 </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center p-2 text-white text-center text-[10px] leading-tight transition-opacity duration-200">
                                                                <p className="font-normal line-clamp-2">{product.name.toLowerCase()}</p>
                                                                <p className="opacity-80 line-clamp-1">{product.model}</p>
                                                                <p>{product.quantity} шт.</p>
                                                                <p className="font-normal mt-0.5">{formatPrice(product.price * product.quantity)}</p>
                                                            </div>
                                                        </div>
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                            
                                            {/* Список товаров (видимый только на больших экранах) */}
                                            <div className="hidden sm:block bg-white rounded-2xl p-3 mt-3">
                                                <div className="space-y-2 max-h-24 overflow-y-auto text-xs">
                                                    {application.products.map((product, idx) => (
                                                        <div key={`list-${application.id}-${idx}`} className="flex justify-between">
                                                            <div className="flex-1 truncate mr-2">
                                                                <span className="font-normal">{product.name.toLowerCase()}</span>
                                                                <span className="text-dark ml-1">({product.model}, {product.quantity} шт.)</span>
                                                            </div>
                                                            <span className="flex-shrink-0 font-normal">{formatPrice(product.price * product.quantity)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                     ) : (
                                         <div className="bg-white rounded-2xl p-3 text-center">
                                             <p className="text-xs text-dark italic">Нет информации о товарах в заказе</p>
                                         </div>
                                     )}
                                </div>
                            </motion.div>
                         );
                    })}
                </motion.div>
            )}
        </div>
    );
} 