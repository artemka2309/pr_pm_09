"use client"; // Добавляем use client, так как используется AnimatedDiv

import React from 'react';
import AnimatedDiv from '@/shared/ui/AnimatedDiv';

const SocialMediaBlock: React.FC = () => { // Используем React.FC для типизации
    return (
        <section className="py-8 md:py-12"> {/* Добавляем вертикальные отступы */}
            <div className="container mx-auto px-4 max-w-screen-xl ">
                <AnimatedDiv
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 rounded-2xl overflow-hidden">
                        <div className="bg-black text-white p-6 md:p-10 lg:p-12 flex flex-col justify-center md:col-span-2">
                            <span className="text-xs font-medium tracking-widest uppercase mb-3 text-gray-400">
                                наши социальные сети
                            </span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal mb-4 md:mb-6 tracking-tight !leading-tight"> {/* Уменьшаем размер, !leading-tight */}
                                присоединяйтесь к сообществу
                            </h2>
                            <p className="text-base md:text-lg text-gray-300 max-w-xl leading-relaxed mb-6 md:mb-8"> {/* Уменьшаем размер */}
                                Подпишитесь на наши социальные сети и будьте в курсе новинок и акций. Первыми получайте интересный контент и эксклюзивные предложения.
                            </p>
                        </div>
                        
                        <div className="bg-light flex items-center justify-center p-6 md:p-8">
                            <div className="grid grid-cols-2 gap-4"> {/* Увеличиваем gap */}
                                <a href="https://t.me/PandaWear_22" 
                                   className="group flex flex-col items-center text-center" 
                                   aria-label="Telegram">
                                    <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-white group-hover:bg-black transition-all duration-300 rounded-xl mb-2">
                                        <svg className="w-12 h-12 md:w-16 md:h-16 text-black group-hover:text-white transition-all duration-300" 
                                            fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                            <title>telegram</title>
                                            <path d="M22.122 10.040c0.006-0 0.014-0 0.022-0 0.209 0 0.403 0.065 0.562 0.177l-0.003-0.002c0.116 0.101 0.194 0.243 0.213 0.403l0 0.003c0.020 0.122 0.031 0.262 0.031 0.405 0 0.065-0.002 0.129-0.007 0.193l0-0.009c-0.225 2.369-1.201 8.114-1.697 10.766-0.21 1.123-0.623 1.499-1.023 1.535-0.869 0.081-1.529-0.574-2.371-1.126-1.318-0.865-2.063-1.403-3.342-2.246-1.479-0.973-0.52-1.51 0.322-2.384 0.221-0.23 4.052-3.715 4.127-4.031 0.004-0.019 0.006-0.040 0.006-0.062 0-0.078-0.029-0.149-0.076-0.203l0 0c-0.052-0.034-0.117-0.053-0.185-0.053-0.045 0-0.088 0.009-0.128 0.024l0.002-0.001q-0.198 0.045-6.316 4.174c-0.445 0.351-1.007 0.573-1.619 0.599l-0.006 0c-0.867-0.105-1.654-0.298-2.401-0.573l0.074 0.024c-0.938-0.306-1.683-0.467-1.619-0.985q0.051-0.404 1.114-0.827 6.548-2.853 8.733-3.761c1.607-0.853 3.47-1.555 5.429-2.010l0.157-0.031z"></path>
                                        </svg>
                                    </div>
                                    <span className="font-medium text-black text-xs md:text-sm group-hover:underline">telegram</span>
                                </a>
                                
                                <a href="https://vk.com/pandawear22" 
                                   className="group flex flex-col items-center text-center" 
                                   aria-label="ВКонтакте">
                                    <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-white group-hover:bg-black transition-all duration-300 rounded-xl mb-2">
                                        <svg className="w-12 h-12 md:w-16 md:h-16 text-black group-hover:text-white transition-all duration-300" 
                                            fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                            <title>vk</title>
                                            <path d="M25.217 22.402h-2.179c-0.825 0-1.080-0.656-2.562-2.158-1.291-1.25-1.862-1.418-2.179-1.418-0.445 0-0.572 0.127-0.572 0.741v1.968c0 0.53-0.169 0.847-1.566 0.847-2.818-0.189-5.24-1.726-6.646-3.966l-0.021-0.035c-1.632-2.027-2.835-4.47-3.43-7.142l-0.022-0.117c0-0.317 0.127-0.614 0.741-0.614h2.179c0.55 0 0.762 0.254 0.975 0.846 1.078 3.112 2.878 5.842 3.619 5.842 0.275 0 0.402-0.127 0.402-0.825v-3.219c-0.085-1.482-0.868-1.608-0.868-2.137 0.009-0.283 0.241-0.509 0.525-0.509 0.009 0 0.017 0 0.026 0.001l-0.001-0h3.429c0.466 0 0.635 0.254 0.635 0.804v4.34c0 0.465 0.212 0.635 0.339 0.635 0.275 0 0.509-0.17 1.016-0.677 1.054-1.287 1.955-2.759 2.642-4.346l0.046-0.12c0.145-0.363 0.493-0.615 0.9-0.615 0.019 0 0.037 0.001 0.056 0.002l-0.003-0h2.179c0.656 0 0.805 0.337 0.656 0.804-0.874 1.925-1.856 3.579-2.994 5.111l0.052-0.074c-0.232 0.381-0.317 0.55 0 0.975 0.232 0.317 0.995 0.973 1.503 1.566 0.735 0.727 1.351 1.573 1.816 2.507l0.025 0.055c0.212 0.612-0.106 0.93-0.72 0.93z"></path>
                                        </svg>
                                    </div>
                                    <span className="font-medium text-black text-xs md:text-sm group-hover:underline">vkontakte</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </AnimatedDiv>
            </div>
        </section>
    );
};

export default SocialMediaBlock; 