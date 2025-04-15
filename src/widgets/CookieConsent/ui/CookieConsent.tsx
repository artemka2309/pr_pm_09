"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@heroui/react";
import AnimatedDiv from '@/shared/ui/AnimatedDiv';

// Компонент не принимает пропсы, используем React.FC
const CookieConsentBanner: React.FC = () => {
    // Добавляем типы для состояний
    const [consentGiven, setConsentGiven] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    useEffect(() => {
        // Используем try-catch на случай, если localStorage недоступен (например, в SSR сценариях или из-за настроек безопасности)
        try {
            const consent = localStorage.getItem('cookieConsent');
            if (consent === 'true') { // Явная проверка на 'true'
                setConsentGiven(true);
            }
        } catch (error) {
            console.error("Error accessing localStorage:", error);
            // В случае ошибки доступа к localStorage, возможно, лучше скрыть баннер,
            // чтобы избежать неожиданного поведения.
            setConsentGiven(true); 
        }
        setIsInitialized(true);
    }, []);

    const handleConsent = () => {
        try {
            localStorage.setItem('cookieConsent', 'true');
            setConsentGiven(true);
        } catch (error) {
            console.error("Error setting localStorage item:", error);
            // Уведомить пользователя об ошибке? Или просто не скрывать баннер?
        }
    };

    // Не рендерим ничего до инициализации или если согласие дано
    if (!isInitialized || consentGiven) {
        return null;
    }

    // Рендерим баннер, если инициализация прошла и согласия нет
    return (
        <div className="fixed bottom-0 left-0 w-full z-[999] p-4 pointer-events-none">
            <div className="container mx-auto flex justify-center md:justify-start">
                {/* Добавляем pointer-events-auto только к самому блоку баннера */}
                <AnimatedDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="pointer-events-auto" 
                >
                    <div className="w-full max-w-md bg-black rounded-2xl overflow-hidden">
                        <div className="p-6 md:p-8">
                            <div className="text-xs font-medium tracking-widest uppercase mb-3 text-light/70">
                                файлы cookie
                            </div>
                            <h3 className="text-xl md:text-2xl font-normal mb-3 text-white tracking-tight">
                                мы заботимся о вашей приватности
                            </h3>
                            <p className="text-light text-sm md:text-base mb-6">
                                мы используем файлы cookie для улучшения работы нашего сайта.
                                продолжая использовать наш сайт, вы соглашаетесь с нашей политикой конфиденциальности.
                            </p>
                            <div className="flex justify-start">
                                <Button
                                    onPress={handleConsent}
                                    className="bg-white hover:bg-light text-black text-sm font-normal py-2 px-6 rounded-xl transition-all duration-300"
                                >
                                    принимаю
                                </Button>
                            </div>
                        </div>
                    </div>
                </AnimatedDiv>
            </div>
        </div>
    );
};

export default CookieConsentBanner; 