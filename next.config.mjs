import path from 'path';
import { fileURLToPath } from 'url';

// Convert file URL to path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@heroui/react'],
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'tovarka22.ru',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'tovarka22.ru',
                pathname: '**',
            },
        ],
        domains: ['tovarka22.ru','localhost'],
    },
};

export default nextConfig;