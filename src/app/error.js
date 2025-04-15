'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Логирование ошибки
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="max-w-md w-full text-center">
                <h1 className="text-6xl font-normal mb-6">
                    ошибка
                </h1>
                <p className="text-xl text-gray-600 mb-10">
                    что-то пошло не так при загрузке страницы
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                        onClick={reset}
                        className="bg-white border border-black text-black hover:bg-gray-100 px-12 py-4 rounded-xl transition-colors w-full sm:w-auto"
                    >
                        попробовать снова
                    </button>
                    <Link href="/" className="bg-black text-white hover:bg-gray-900 px-12 py-4 rounded-xl transition-colors w-full sm:w-auto">
                        на главную
                    </Link>
                </div>
            </div>
        </div>
    );
}
