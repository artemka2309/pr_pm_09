"use client";
import React from 'react';
import { Telegram } from '@mui/icons-material';
import { TELEGRAM_LINK } from '@/shared/config/constants'; // Исправленный путь

const TelegramDisplay: React.FC = () => {
    // TODO: Перенести стили и, возможно, логику из TgModel.js
    return (
        <a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-5 right-5 z-50 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300"
            aria-label="Наш Telegram канал"
        >
            <Telegram fontSize="large" />
        </a>
    );
};

export default TelegramDisplay; 