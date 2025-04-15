"use client";
import React, { useState } from 'react';
import { Link as LinkIcon, Check } from 'lucide-react';
import { addToast } from '@heroui/react';
import { Button } from '@heroui/button';
import clsx from 'clsx';

interface CopyLinkProps {
    className?: string;
}

const CopyLink: React.FC<CopyLinkProps> = ({ className }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            addToast({ 
                title: "Успешно",
                description: "Ссылка скопирована!", 
                color: "success",
            }); 
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Ошибка копирования ссылки: ', err);
            addToast({ 
                title: "Ошибка", 
                description: "Не удалось скопировать ссылку", 
                color: "danger" 
            });
        });
    };

    return (
        <Button
            variant="light"
            size="sm"
            onPress={handleCopy}
            className={clsx(
                "flex items-center space-x-2 text-dark hover:text-black transition-colors duration-200 px-2",
                className
            )}
            aria-label={copied ? "ссылка скопирована" : "поделиться ссылкой на товар"}
        >
            {copied ? (
                <Check size={18} className="text-green-500" />
            ) : (
                <LinkIcon size={18} />
            )}
            {copied ? "скопировано" : "поделиться"}
        </Button>
    );
};

export default CopyLink; 