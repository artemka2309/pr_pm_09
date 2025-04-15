"use client";

import { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";
import AnimatedDiv from '@/shared/ui/AnimatedDiv';
import type { FormattedGalleryImage } from './Gallery'; // Импортируем тип из серверного компонента
import { ZoomIn } from 'lucide-react'; // Импортируем иконку

// Определяем интерфейс для пропсов
interface GalleryClientProps {
    images: FormattedGalleryImage[];
}

export default function GalleryClient({ images }: GalleryClientProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [inView, setInView] = useState<boolean>(false);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setInView(true);
            }
        }, { threshold: 0.1 });

        const galleryElement = document.getElementById('photo-gallery');
        if (galleryElement) observer.observe(galleryElement);

        return () => {
            if (galleryElement) observer.unobserve(galleryElement);
        };
    }, []);

    // Добавляем тип для index
    const openLightbox = (index: number) => { 
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const closeLightbox = () => {
        setIsOpen(false);
    };

    // Изменяем breakpoints: 4 колонки по умолчанию
    const breakpointColumnsObj: Record<string | number, number> = {
        default: 4, 
        1024: 3,
        768: 2,
        640: 2
    };

    return (
        <div className="" id="photo-gallery">
            <div className="container mx-auto px-4 max-w-screen-xl">
                <AnimatedDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="flex flex-col mb-12 text-left items-start">
                        <span className="text-xs font-medium tracking-widest uppercase text-dark mb-3">
                            фотографии
                        </span>
                        <h2 className="text-5xl md:text-6xl font-normal tracking-tight">
                            галерея
                        </h2>
                    </div>
                </AnimatedDiv>
                
                <div className="overflow-hidden py-1">
                    <Masonry
                        breakpointCols={breakpointColumnsObj}
                        className="flex w-auto"
                        columnClassName="pl-2 bg-clip-padding"
                    >
                        {images.map((image, index) => (
                            <AnimatedDiv
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
                                transition={{ 
                                    duration: 0.5, 
                                    delay: index * 0.05,
                                    ease: [0.22, 1, 0.36, 1] 
                                }}
                            >
                                <div
                                    className="group relative w-full cursor-pointer mb-2 overflow-hidden rounded-2xl 
                                              transform transition-all duration-500 hover:-translate-y-1"
                                    onClick={() => openLightbox(index)} 
                                >
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 z-10"></div>
                                    
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                        <ZoomIn className="w-10 h-10 text-white opacity-70" />
                                    </div>
                                                    
                                    <div className="aspect-[4/3] overflow-hidden">
                                        <img 
                                            src={image.src}
                                            alt={image.alt}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-700 
                                                      group-hover:scale-105 group-hover:rotate-[0.5deg]"
                                        />
                                    </div>
                                </div>
                            </AnimatedDiv>
                        ))}
                    </Masonry>
                </div>
            </div>

            {isOpen && (
                <Lightbox
                    slides={images.map((image) => ({ src: image.src, title: image.alt, description: image.caption || undefined }))} // Добавляем title и description для Captions
                    open={isOpen}
                    index={currentIndex}
                    close={closeLightbox}
                    plugins={[Thumbnails, Zoom, Captions]}
                    thumbnails={{
                        position: "bottom",
                        width: 120,
                        height: 80,
                        border: 0,
                        borderRadius: 8,
                        padding: 4,
                        gap: 16
                    }}
                    zoom={{
                        maxZoomPixelRatio: 3,
                        scrollToZoom: true
                    }}
                    carousel={{
                        padding: 0,
                        spacing: 0,
                        imageFit: "contain" // Меняем на contain для лучшего отображения в лайтбоксе
                    }}
                    styles={{
                        root: {
                            "--yarl__color_backdrop": "rgba(0, 0, 0, 0.9)",
                        },
                        container: {
                            backgroundColor: "rgba(0, 0, 0, 0.95)",
                            backdropFilter: "blur(5px)"
                        },
                        thumbnail: {
                            border: "none",
                            overflow: "hidden",
                            borderRadius: "12px",
                        },
                        thumbnailsContainer: {
                            backgroundColor: "black",
                            backdropFilter: "none",
                            padding: "16px 0"
                        },
                        navigationNext: {
                            backgroundColor: "black",
                            color: "white",
                            borderRadius: "12px",
                            width: "56px",
                            height: "56px"
                        },
                        navigationPrev: {
                            backgroundColor: "white",
                            color: "black",
                            borderRadius: "12px",
                            width: "56px",
                            height: "56px"
                        }
                    }}
                />
            )}
        </div>
    );
} 