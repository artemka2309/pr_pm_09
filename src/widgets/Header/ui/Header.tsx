'use client'
import Link from "next/link";
import { useState, useEffect } from 'react';
import { PhoneCallIcon, MapPinIcon, Clock, ShoppingBag, Search, Phone, X, Info } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  useDisclosure
} from "@heroui/react";
import { searchProducts } from '@/shared/api/products';
import type { ProductSearchResult } from '@/shared/types/product';
import { NEXT_PUBLIC_STATIC_URL } from '@/shared/config/api';
import { formatPrice } from '@/shared/lib/formatPrice';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const totalItems = useCartStore((state) => Array.isArray(state.cartItems) ? state.cartItems.reduce((total, item) => total + item.quantity, 0) : 0);

  const { isOpen: isContactsModalOpen, onOpen: onContactsModalOpen, onClose: onContactsModalClose } = useDisclosure();
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      setMaxPage(1);
      setSearchResults([]);
      if (searchQuery.trim() !== '') {
        setDebouncedSearchQuery(searchQuery);
      } else {
        setDebouncedSearchQuery('');
        setHasSearched(false);
        setSearchError(null);
        setSearchLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
          setSearchResults([]);
          setHasSearched(false);
          setSearchLoading(false);
          setSearchError(null);
          setCurrentPage(1);
          setMaxPage(1);
          return;
      }

      setSearchLoading(true);
      setSearchError(null);
      setHasSearched(true);
      setCurrentPage(1);
      try {
        const result = await searchProducts(debouncedSearchQuery, 1);
        if (result && Array.isArray(result.products)) {
          setSearchResults(result.products);
          setMaxPage(result.max_page || 1);
        } else {
          setSearchResults([]);
          setMaxPage(1);
          console.warn('Search results are not in expected format or null:', result);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchError('Ошибка поиска. Попробуйте позже.');
        setSearchResults([]);
        setMaxPage(1);
      } finally {
        setSearchLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  const loadMoreResults = async () => {
    if (loadMoreLoading || currentPage >= maxPage) return;

    setLoadMoreLoading(true);
    setSearchError(null);
    const nextPage = currentPage + 1;
    try {
      const result = await searchProducts(debouncedSearchQuery, nextPage);
      if (result && Array.isArray(result.products) && result.products.length > 0) {
        setSearchResults(prevResults => [...prevResults, ...result.products]);
        setCurrentPage(nextPage);
      } else {
          setMaxPage(currentPage);
          console.warn('Load more results are not in expected format or empty:', result);
      }
    } catch (error) {
      console.error('Load more failed:', error);
      setSearchError('Ошибка загрузки доп. результатов.');
    } finally {
      setLoadMoreLoading(false);
    }
  };

  const closeSearchPanelAndReset = () => {
      setIsSearchVisible(false);
      setSearchQuery('');
      setDebouncedSearchQuery('');
      setSearchResults([]);
      setCurrentPage(1);
      setMaxPage(1);
      setSearchLoading(false);
      setLoadMoreLoading(false);
      setSearchError(null);
      setHasSearched(false);
  };

  const toggleSearchVisibility = () => {
    if (isSearchVisible) {
      closeSearchPanelAndReset();
    } else {
      setIsSearchVisible(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg relative overflow-visible">
        <div className="bg-black text-white py-1">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4 text-xs">
                <a href="https://go.2gis.com/75f6u" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-gray-300 transition-colors">
                  <MapPinIcon size={14} className="mr-1" />
                  <span className="sm:hidden">ТЦ Малина, 1 этаж</span>
                  <span className="hidden sm:inline">г. Барнаул, ул. Попова, 82 (ТЦ «Малина», 1 этаж)</span>
                </a>
                <div className="hidden sm:flex items-center">
                  <Clock size={14} className="mr-1" />
                  <span>11:00-19:00</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a href="tel:+79628191796" className="flex items-center hover:text-gray-300 text-xs transition-colors">
                  <PhoneCallIcon size={14} className="mr-1" />
                  <span>+7 (962) 819-17-96</span>
                </a>
                <div className="flex space-x-3">
                  <a
                      href="https://t.me/PandaWear_22"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="Telegram"
                  >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                         <path d="M22.122 10.040c0.006-0 0.014-0 0.022-0 0.209 0 0.403 0.065 0.562 0.177l-0.003-0.002c0.116 0.101 0.194 0.243 0.213 0.403l0 0.003c0.020 0.122 0.031 0.262 0.031 0.405 0 0.065-0.002 0.129-0.007 0.193l0-0.009c-0.225 2.369-1.201 8.114-1.697 10.766-0.21 1.123-0.623 1.499-1.023 1.535-0.869 0.081-1.529-0.574-2.371-1.126-1.318-0.865-2.063-1.403-3.342-2.246-1.479-0.973-0.52-1.51 0.322-2.384 0.221-0.23 4.052-3.715 4.127-4.031 0.004-0.019 0.006-0.040 0.006-0.062 0-0.078-0.029-0.149-0.076-0.203l0 0c-0.052-0.034-0.117-0.053-0.185-0.053-0.045 0-0.088 0.009-0.128 0.024l0.002-0.001q-0.198 0.045-6.316 4.174c-0.445 0.351-1.007 0.573-1.619 0.599l-0.006 0c-0.867-0.105-1.654-0.298-2.401-0.573l0.074 0.024c-0.938-0.306-1.683-0.467-1.619-0.985q0.051-0.404 1.114-0.827 6.548-2.853 8.733-3.761c1.607-0.853 3.47-1.555 5.429-2.010l0.157-0.031z"></path>
                      </svg>
                  </a>
                  <a
                      href="https://vk.com/pandawear22"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="VK"
                  >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                         <path d="M25.217 22.402h-2.179c-0.825 0-1.080-0.656-2.562-2.158-1.291-1.25-1.862-1.418-2.179-1.418-0.445 0-0.572 0.127-0.572 0.741v1.968c0 0.53-0.169 0.847-1.566 0.847-2.818-0.189-5.24-1.726-6.646-3.966l-0.021-0.035c-1.632-2.027-2.835-4.47-3.43-7.142l-0.022-0.117c0-0.317 0.127-0.614 0.741-0.614h2.179c0.55 0 0.762 0.254 0.975 0.846 1.078 3.112 2.878 5.842 3.619 5.842 0.275 0 0.402-0.127 0.402-0.825v-3.219c-0.085-1.482-0.868-1.608-0.868-2.137 0.009-0.283 0.241-0.509 0.525-0.509 0.009 0 0.017 0 0.026 0.001l-0.001-0h3.429c0.466 0 0.635 0.254 0.635 0.804v4.34c0 0.465 0.212 0.635 0.339 0.635 0.275 0 0.509-0.17 1.016-0.677 1.054-1.287 1.955-2.759 2.642-4.346l0.046-0.12c0.145-0.363 0.493-0.615 0.9-0.615 0.019 0 0.037 0.001 0.056 0.002l-0.003-0h2.179c0.656 0 0.805 0.337 0.656 0.804-0.874 1.925-1.856 3.579-2.994 5.111l0.052-0.074c-0.232 0.381-0.317 0.55 0 0.975 0.232 0.317 0.995 0.973 1.503 1.566 0.735 0.727 1.351 1.573 1.816 2.507l0.025 0.055c0.212 0.612-0.106 0.93-0.72 0.93z"></path>
                      </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="border-b-[1px] border-light py-2 bg-white/95 backdrop-blur-lg">
            <nav className="max-w-screen-xl mx-auto px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link href="/" className="flex items-center mr-8">
                    <img
                      src='/img/logo/logo-b.png'
                      alt="LogoPC"
                      className="w-16  sm:block"
                    />
                    
                  </Link>
                  <div className="hidden md:flex items-center space-x-6">
                    <Link href="/" className="text-sm font-normal text-black hover:text-gray-600 transition-colors">
                      главная
                    </Link>
                    <Link href="/#categories" className="text-sm font-normal text-black hover:text-gray-600 transition-colors">
                      каталог
                    </Link>
                    <Link href="/delivery" className="text-sm font-normal text-black hover:text-gray-600 transition-colors">
                      доставка
                    </Link>
                  </div>
                </div>

                <div className="flex items-center space-x-2 md:space-x-3">
                  <button
                      onClick={toggleSearchVisibility}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${isSearchVisible ? 'bg-gray-200' : 'bg-light hover:bg-gray-200'}`}
                      aria-label="Поиск по сайту"
                  >
                    <Search size={18} strokeWidth={1.5} className="text-black" />
                  </button>

                  <button
                      onClick={onContactsModalOpen}
                      className="w-10 h-10 flex items-center justify-center bg-light hover:bg-gray-200 rounded-xl transition-colors"
                      aria-label="Связаться с нами"
                  >
                    <Info size={18} strokeWidth={1.5} className="text-black" />
                  </button>

                  <div className="relative">
                    <Link href="/cart">
                      <button
                          className="w-10 h-10 flex items-center justify-center bg-black hover:bg-gray-900 rounded-xl transition-colors"
                          aria-label="Корзина"
                      >
                        <ShoppingBag size={18} strokeWidth={1.5} className="text-white" />
                        {totalItems > 0 && (
                          <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] md:text-xs font-normal rounded-full w-5 h-5 flex items-center justify-center">
                            {totalItems}
                          </span>
                        )}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          <AnimatePresence>
            {isSearchVisible && (
              <motion.div
                key="search-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute top-full left-0 right-0 w-full bg-white shadow-md overflow-hidden z-40"
              >
                 <div className="max-w-screen-xl mx-auto px-4 py-4">
                    <div className="flex gap-2 mb-4 items-center">
                        <Input
                            isClearable
                            radius="lg"
                            placeholder="Введите название товара..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            onClear={() => {
                                setSearchQuery('');
                            }}
                            startContent={<Search size={18} strokeWidth={1.5} className="text-gray-400" />}
                            className="flex-grow"
                            classNames={{ inputWrapper: "bg-gray-100 focus-within:bg-white" }}
                            autoFocus
                        />
                        <Button
                            isIconOnly
                            variant="light"
                            onPress={closeSearchPanelAndReset}
                            className="rounded-lg text-gray-500 hover:text-black flex-shrink-0"
                            aria-label="Закрыть поиск"
                        >
                            <X size={20} />
                        </Button>
                    </div>
                     <div className="max-h-[60vh] overflow-y-auto pr-1">
                         {searchLoading && !loadMoreLoading && searchResults.length === 0 && (
                             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4 animate-pulse">
                                 {[...Array(4)].map((_, index) => (
                                     <div key={index} className="flex items-center gap-2 bg-light rounded-2xl p-2">
                                         <div className="w-14 h-14 rounded-lg bg-skeleton flex-shrink-0"></div>
                                         <div className="flex-grow space-y-1.5">
                                             <div className="h-3 w-full rounded bg-skeleton"></div>
                                             <div className="h-3 w-3/4 rounded bg-skeleton"></div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                         {searchError && <p className="text-center text-red-500 py-4">{searchError}</p>}
                         {!searchLoading && !loadMoreLoading && hasSearched && searchResults.length === 0 && (
                             <p className="text-center text-gray-500 py-4">По вашему запросу ничего не найдено.</p>
                         )}
                         {searchResults.length > 0 && (
                             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                                 {searchResults.map((product) => (
                                 <Link
                                    key={`${product.slug}-${product.category_slug}`}
                                    href={`/category/${product.category_slug || 'all'}/${product.slug}`}
                                    onClick={closeSearchPanelAndReset}
                                    className="flex items-center gap-2 bg-light rounded-2xl p-2 hover:bg-gray-200 transition-colors duration-150"
                                 >
                                     <img
                                         src={`${NEXT_PUBLIC_STATIC_URL}${product.image_logo}`}
                                         alt={product.name}
                                         className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                                     />
                                     <div className="flex-grow overflow-hidden">
                                         <p className="font-medium text-xs truncate mb-0.5">{product.name}</p>
                                         <div className="flex items-baseline gap-1 text-xs">
                                             {product.price_discount && product.price_discount < product.price ? (
                                             <>
                                                 <span className="font-semibold text-black">{formatPrice(product.price_discount)}</span>
                                                 <span className="text-gray-500 line-through">{formatPrice(product.price)}</span>
                                             </>
                                             ) : (
                                             <span className="font-semibold text-black">{formatPrice(product.price)}</span>
                                             )}
                                         </div>
                                     </div>
                                 </Link>
                                 ))}
                             </div>
                         )}
                         {currentPage < maxPage && !searchLoading && (
                             <div className="text-center mt-4">
                                 <Button
                                     variant="light"
                                     onPress={loadMoreResults}
                                     isLoading={loadMoreLoading}
                                     disabled={loadMoreLoading}
                                     className="text-sm text-gray-600 hover:text-black disabled:opacity-50"
                                 >
                                     {loadMoreLoading ? 'Загрузка...' : 'Загрузить ещё'}
                                 </Button>
                             </div>
                         )}
                     </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <Modal
          isOpen={isContactsModalOpen}
          onClose={onContactsModalClose}
          placement="center"
          backdrop="opaque"
          classNames={{
              base: "border-none shadow-none bg-white rounded-2xl",
              closeButton: "hover:bg-gray-100 active:bg-gray-200",
          }}
      >
           <ModalContent>
              <ModalHeader className="flex items-center justify-between gap-1">
               <span>Свяжитесь с нами</span>
             </ModalHeader>
             <ModalBody>
               <div className="space-y-4">
                 <a href="tel:+79628191796" className="flex items-center text-base text-black hover:text-gray-700 transition-colors group">
                   <div className="w-10 h-10 rounded-xl bg-light group-hover:bg-gray-200 flex items-center justify-center mr-3 transition-colors">
                       <PhoneCallIcon size={18} className="text-black" />
                   </div>
                   <span>+7 (962) 819-17-96</span>
                 </a>
                 <a href="https://go.2gis.com/75f6u" target="_blank" rel="noopener noreferrer" className="flex items-center text-base text-black hover:text-gray-700 transition-colors group">
                   <div className="w-10 h-10 rounded-xl bg-light group-hover:bg-gray-200 flex items-center justify-center mr-3 transition-colors">
                       <MapPinIcon size={18} className="text-black" />
                   </div>
                   <span>г. Барнаул, ул. Попова, 82 (ТЦ «Малина», 1 этаж)</span>
                 </a>
                  <div className="flex items-start text-base text-black">
                      <div className="w-10 h-10 rounded-xl bg-light flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <Clock size={18} className="text-black" />
                      </div>
                      <div>
                          <p>пн-пт: 11:00-19:00</p>
                          <p>сб-вс: 11:00-18:00</p>
                      </div>
                  </div>
   
                 <div className="pt-2">
                   <h3 className="text-sm font-medium mb-3 text-gray-600">Мы в соцсетях</h3>
                   <div className="flex space-x-3">
                     <a href="https://t.me/PandaWear_22" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-light text-black rounded-xl hover:bg-gray-200 transition-colors" aria-label="Telegram">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M22.122 10.040c0.006-0 0.014-0 0.022-0 0.209 0 0.403 0.065 0.562 0.177l-0.003-0.002c0.116 0.101 0.194 0.243 0.213 0.403l0 0.003c0.020 0.122 0.031 0.262 0.031 0.405 0 0.065-0.002 0.129-0.007 0.193l0-0.009c-0.225 2.369-1.201 8.114-1.697 10.766-0.21 1.123-0.623 1.499-1.023 1.535-0.869 0.081-1.529-0.574-2.371-1.126-1.318-0.865-2.063-1.403-3.342-2.246-1.479-0.973-0.52-1.51 0.322-2.384 0.221-0.23 4.052-3.715 4.127-4.031 0.004-0.019 0.006-0.040 0.006-0.062 0-0.078-0.029-0.149-0.076-0.203l0 0c-0.052-0.034-0.117-0.053-0.185-0.053-0.045 0-0.088 0.009-0.128 0.024l0.002-0.001q-0.198 0.045-6.316 4.174c-0.445 0.351-1.007 0.573-1.619 0.599l-0.006 0c-0.867-0.105-1.654-0.298-2.401-0.573l0.074 0.024c-0.938-0.306-1.683-0.467-1.619-0.985q0.051-0.404 1.114-0.827 6.548-2.853 8.733-3.761c1.607-0.853 3.47-1.555 5.429-2.010l0.157-0.031z"></path></svg>
                     </a>
                     <a href="https://vk.com/pandawear22" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-light text-black rounded-xl hover:bg-gray-200 transition-colors" aria-label="VK">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M25.217 22.402h-2.179c-0.825 0-1.080-0.656-2.562-2.158-1.291-1.25-1.862-1.418-2.179-1.418-0.445 0-0.572 0.127-0.572 0.741v1.968c0 0.53-0.169 0.847-1.566 0.847-2.818-0.189-5.24-1.726-6.646-3.966l-0.021-0.035c-1.632-2.027-2.835-4.47-3.43-7.142l-0.022-0.117c0-0.317 0.127-0.614 0.741-0.614h2.179c0.55 0 0.762 0.254 0.975 0.846 1.078 3.112 2.878 5.842 3.619 5.842 0.275 0 0.402-0.127 0.402-0.825v-3.219c-0.085-1.482-0.868-1.608-0.868-2.137 0.009-0.283 0.241-0.509 0.525-0.509 0.009 0 0.017 0 0.026 0.001l-0.001-0h3.429c0.466 0 0.635 0.254 0.635 0.804v4.34c0 0.465 0.212 0.635 0.339 0.635 0.275 0 0.509-0.17 1.016-0.677 1.054-1.287 1.955-2.759 2.642-4.346l0.046-0.12c0.145-0.363 0.493-0.615 0.9-0.615 0.019 0 0.037 0.001 0.056 0.002l-0.003-0h2.179c0.656 0 0.805 0.337 0.656 0.804-0.874 1.925-1.856 3.579-2.994 5.111l0.052-0.074c-0.232 0.381-0.317 0.55 0 0.975 0.232 0.317 0.995 0.973 1.503 1.566 0.735 0.727 1.351 1.573 1.816 2.507l0.025 0.055c0.212 0.612-0.106 0.93-0.72 0.93z"></path></svg>
                     </a>
                   </div>
                 </div>
               </div>
             </ModalBody>
             <ModalFooter>
               <Button color="default" variant="light" onPress={onContactsModalClose} className="rounded-lg">
                 Закрыть
               </Button>
             </ModalFooter>
           </ModalContent>
      </Modal>
    </>
  );
}
