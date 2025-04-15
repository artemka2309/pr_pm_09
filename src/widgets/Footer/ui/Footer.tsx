"use client"
import React, { useEffect, useState } from 'react';
import Link from "next/link";
// Заменяем относительный путь на alias
import { getCategories } from '@/shared/api/categories'; 
import { MapPinIcon, PhoneCallIcon, Clock } from 'lucide-react';
import { Accordion, AccordionItem } from "@heroui/react"; // Убедитесь, что эта библиотека совместима и нужна

// Определяем тип для категории
interface Category {
    id?: string | number; // ID может быть не нужен для отображения, но полезен как key
    slug: string;
    name: string;
}

// Определяем тип для ответа API (предполагаемый)
interface CategoriesResponse {
    categories: Category[];
}

export default function Footer(): React.ReactElement {
    // Типизируем состояние
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Типизируем ответ
                const response: CategoriesResponse = await getCategories();
                setCategories(response.categories);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <footer className="bg-black text-white pt-16 pb-6 rounded-t-3xl relative overflow-hidden">
            <div className="max-w-screen-xl mx-auto px-4">
                {/* Основные секции футера - 3 колонки */} 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 mb-12">
                    
                    {/* Колонка 1: О нас + Категории (переехали) */} 
                    <div>
                        <div className="mb-6">
                            <Link href="/" className="inline-block mb-6">
                                <img
                                    src='/img/logo/logo-w.png'
                                    alt="PANDA WEAR"
                                    className="w-48"
                                    width={192} 
                                    height={46} 
                                />
                            </Link>
                            <p className="text-sm text-light mb-6">
                                добро пожаловать в мир моды и стиля с нашим магазином одежды &quot;PANDA WEAR&quot;! мы предлагаем широкий выбор современной и модной одежды...
                            </p>
                        </div>
                        {/* Блок Категории - теперь здесь */} 
                        <div>
                            <h3 className="text-lg font-normal mb-4 text-light">категории</h3>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <Link
                                        key={category.slug} 
                                        href={`/category/${category.slug}`}
                                        /* Используем цвета из конфига: светлый фон, темный текст, инверсия при наведении */
                                        className="text-xs font-normal py-1.5 px-3 bg-light text-black hover:bg-black hover:text-white rounded-lg transition-colors"
                                    >
                                        {category.name.toLowerCase()}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Колонка 2: Информация + FAQ */}
                    <div>
                        <h3 className="text-lg font-normal mb-6 text-light">информация</h3>
                        <ul className="space-y-3 text-sm mb-8">
                            <li><Link href="/category" className="text-light hover:text-white transition-colors">каталог</Link></li>
                            <li><Link href="/privacy-policy" className="text-light hover:text-white transition-colors">политика конфиденциальности</Link></li>
                        </ul>

                        <h3 className="text-lg font-normal mb-4 text-light">частые вопросы</h3>
                        <div className="bg-white rounded-xl p-4 text-black">
                            <Accordion 
                                className="px-0" 
                                variant="light" 
                                selectionMode="multiple"
                            >
                                <AccordionItem key="1" aria-label="Оплата" title="оплата">
                                    <p className="text-sm text-dark">оплата производится наличными, переводом, картой либо на расчетный счет.</p>
                                </AccordionItem>
                                <AccordionItem key="2" aria-label="Доставка" title="доставка">
                                    <ul className="space-y-1 text-sm text-dark">
                                        <li>- доставка по барнаулу от 150р.</li>
                                        <li>- отправка на такси/курьером.</li>
                                        <li>- отправка по россии ТК.</li>
                                        <li>- поможем выбрать выгодный вариант.</li>
                                    </ul>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>

                    {/* Колонка 3: Контакты + Соцсети (переехали) */} 
                    <div>
                        <h3 className="text-lg font-normal mb-6 text-light">контакты</h3>
                        <div className="space-y-4 mb-8">
                            <a href="tel:+79628191796" className="flex items-center text-sm text-light hover:text-white transition-colors group">
                                <div className="w-9 h-9 rounded-xl bg-white group-hover:bg-light flex items-center justify-center mr-3 transition-colors">
                                    <PhoneCallIcon size={16} className="text-black" />
                                </div>
                                <span>+7 (962) 819-17-96</span>
                            </a>
                            {/* TODO: Обновить ссылку 2GIS или убрать */}
                            <a href="https://go.2gis.com/75f6u" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-light hover:text-white transition-colors group">
                                <div className="w-9 h-9 rounded-xl bg-white group-hover:bg-light flex items-center justify-center mr-3 transition-colors">
                                    <MapPinIcon size={16} className="text-black" />
                                </div>
                                <span>г. Барнаул, ул. Попова, 82 (ТЦ «Малина», 1 этаж)</span>
                            </a>
                            {/* TODO: Обновить время работы или убрать */}
                            <div className="flex items-start text-sm text-light">
                                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center mr-3 mt-0.5">
                                    <Clock size={16} className="text-black" />
                                </div>
                                <div>
                                    <p>пн-пт: 11:00-19:00</p>
                                    <p>сб-вс: 11:00-18:00</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Соцсети перенесены сюда */} 
                        <div>
                            <h3 className="text-base font-normal mb-3 text-light">мы в соцсетях</h3>
                            <div className="flex space-x-3">
                                <a href="https://t.me/PandaWear_22" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-white text-black rounded-xl hover:bg-light transition-colors" aria-label="Telegram">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M22.122 10.040c0.006-0 0.014-0 0.022-0 0.209 0 0.403 0.065 0.562 0.177l-0.003-0.002c0.116 0.101 0.194 0.243 0.213 0.403l0 0.003c0.020 0.122 0.031 0.262 0.031 0.405 0 0.065-0.002 0.129-0.007 0.193l0-0.009c-0.225 2.369-1.201 8.114-1.697 10.766-0.21 1.123-0.623 1.499-1.023 1.535-0.869 0.081-1.529-0.574-2.371-1.126-1.318-0.865-2.063-1.403-3.342-2.246-1.479-0.973-0.52-1.51 0.322-2.384 0.221-0.23 4.052-3.715 4.127-4.031 0.004-0.019 0.006-0.040 0.006-0.062 0-0.078-0.029-0.149-0.076-0.203l0 0c-0.052-0.034-0.117-0.053-0.185-0.053-0.045 0-0.088 0.009-0.128 0.024l0.002-0.001q-0.198 0.045-6.316 4.174c-0.445 0.351-1.007 0.573-1.619 0.599l-0.006 0c-0.867-0.105-1.654-0.298-2.401-0.573l0.074 0.024c-0.938-0.306-1.683-0.467-1.619-0.985q0.051-0.404 1.114-0.827 6.548-2.853 8.733-3.761c1.607-0.853 3.47-1.555 5.429-2.010l0.157-0.031z"></path></svg>
                                </a>
                                <a href="https://vk.com/pandawear22" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-white text-black rounded-xl hover:bg-light transition-colors" aria-label="VK">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M25.217 22.402h-2.179c-0.825 0-1.080-0.656-2.562-2.158-1.291-1.25-1.862-1.418-2.179-1.418-0.445 0-0.572 0.127-0.572 0.741v1.968c0 0.53-0.169 0.847-1.566 0.847-2.818-0.189-5.24-1.726-6.646-3.966l-0.021-0.035c-1.632-2.027-2.835-4.47-3.43-7.142l-0.022-0.117c0-0.317 0.127-0.614 0.741-0.614h2.179c0.55 0 0.762 0.254 0.975 0.846 1.078 3.112 2.878 5.842 3.619 5.842 0.275 0 0.402-0.127 0.402-0.825v-3.219c-0.085-1.482-0.868-1.608-0.868-2.137 0.009-0.283 0.241-0.509 0.525-0.509 0.009 0 0.017 0 0.026 0.001l-0.001-0h3.429c0.466 0 0.635 0.254 0.635 0.804v4.34c0 0.465 0.212 0.635 0.339 0.635 0.275 0 0.509-0.17 1.016-0.677 1.054-1.287 1.955-2.759 2.642-4.346l0.046-0.12c0.145-0.363 0.493-0.615 0.9-0.615 0.019 0 0.037 0.001 0.056 0.002l-0.003-0h2.179c0.656 0 0.805 0.337 0.656 0.804-0.874 1.925-1.856 3.579-2.994 5.111l0.052-0.074c-0.232 0.381-0.317 0.55 0 0.975 0.232 0.317 0.995 0.973 1.503 1.566 0.735 0.727 1.351 1.573 1.816 2.507l0.025 0.055c0.212 0.612-0.106 0.93-0.72 0.93z"></path></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Большой логотип PANDA WEAR внизу */}
                <div className="mb-4">
                    <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-center text-white text-opacity-5 whitespace-nowrap tracking-tighter uppercase">
                        panda wear
                    </h1>
                </div>

                {/* Копирайт и разработчики внизу - возвращен старый вид */}
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-light pt-6 border-t border-gray">
                    <p className="mb-2 md:mb-0">© 2024 ИП СМИРНОВ АЛЕКСЕЙ ВЛАДИМИРОВИЧ</p>
                    <div className="flex items-center">
                        <span className="mr-2">разработчики сайта:</span>
                        <a href='https://t.me/epp23f' target="_blank" rel="noopener noreferrer" className='text-blue hover:text-white transition-colors mr-1'>АРТЁМ</a>
                        <span className="mx-1">и</span>
                        <a href='https://t.me/sikukuo' target="_blank" rel="noopener noreferrer" className='text-blue hover:text-white transition-colors ml-1'>ДМИТРИЙ</a>
                    </div>
                </div>
            </div>
        </footer>
    );
} 