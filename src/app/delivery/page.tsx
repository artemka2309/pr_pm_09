import React from 'react';
import type { Metadata } from 'next';
import { Truck, Clock, CreditCard, Info, MapPin, PackageCheck, PackageOpen } from 'lucide-react';

export const metadata: Metadata = {
    title: 'доставка и оплата',
    description: 'узнайте условия доставки и оплаты заказов в интернет-магазине PANDA WEAR. Доставляем по всей России. Самовывоз в Барнауле.',
    openGraph: {
        title: 'доставка и оплата - PANDA WEAR',
        description: 'условия доставки (Почта России, СДЭК, самовывоз) и оплаты в PANDA WEAR.',
    }
};

export default function DeliveryPage() {
    return (
        <main className="flex flex-col min-h-screen max-w-screen-xl mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col mb-8">
                <span className="text-xs font-medium tracking-widest uppercase text-dark mb-3">
                    информация
                </span>
                <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
                    доставка и оплата
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-light rounded-2xl p-6 md:p-8">
                    <div className="flex items-center mb-5">
                        <div className="w-12 h-12 flex items-center justify-center bg-black rounded-xl mr-4">
                            <Truck size={24} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-normal tracking-tight">Способы доставки</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Мы доставляем заказы по всей России. Выберите удобный для вас способ доставки.
                    </p>
                </div>
                
                <div className="bg-light rounded-2xl p-6 md:p-8">
                    <div className="flex items-center mb-5">
                        <div className="w-12 h-12 flex items-center justify-center bg-black rounded-xl mr-4">
                            <CreditCard size={24} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-normal tracking-tight">Способы оплаты</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Для вашего удобства мы предлагаем разные способы оплаты заказа.
                    </p>
                </div>
            </div>

            <div className="space-y-12 text-base leading-relaxed">
                <section>
                    <div className="flex items-center mb-6">
                        <Truck size={20} className="text-black mr-3" />
                        <h2 className="text-2xl font-normal tracking-tight">Способы доставки</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-light rounded-2xl p-6">
                            <div className="flex items-center mb-4">
                                <PackageOpen size={20} className="text-black mr-3" />
                                <h3 className="text-lg font-medium">Почта России</h3>
                            </div>
                            <p className="text-gray-700">
                                Доставка осуществляется по всей территории РФ. Сроки и стоимость рассчитываются автоматически при оформлении заказа в зависимости от вашего региона и веса посылки. После отправки мы предоставим вам трек-номер для отслеживания.
                            </p>
                        </div>
                        
                        <div className="bg-light rounded-2xl p-6">
                            <div className="flex items-center mb-4">
                                <PackageCheck size={20} className="text-black mr-3" />
                                <h3 className="text-lg font-medium">СДЭК до пункта выдачи</h3>
                            </div>
                            <p className="text-gray-700">
                                Вы можете выбрать удобный для вас пункт выдачи СДЭК в вашем городе. Сроки и стоимость также рассчитываются при оформлении.
                            </p>
                        </div>
                        
                        <div className="bg-light rounded-2xl p-6">
                            <div className="flex items-center mb-4">
                                <Truck size={20} className="text-black mr-3" />
                                <h3 className="text-lg font-medium">СДЭК курьером до двери</h3>
                            </div>
                            <p className="text-gray-700">
                                Курьер СДЭК доставит заказ непосредственно по указанному вами адресу.
                            </p>
                        </div>
                        
                        <div className="bg-light rounded-2xl p-6">
                            <div className="flex items-center mb-4">
                                <MapPin size={20} className="text-black mr-3" />
                                <h3 className="text-lg font-medium">Самовывоз (г. Барнаул)</h3>
                            </div>
                            <p className="text-gray-700">
                                Вы можете забрать свой заказ самостоятельно из нашего магазина по адресу: г. Барнаул, ул. Попова, 82 (ТЦ «Малина», 1 этаж) в рабочее время (11:00-19:00). Пожалуйста, дождитесь подтверждения готовности заказа к выдаче.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center mb-6">
                        <Clock size={20} className="text-black mr-3" />
                        <h2 className="text-2xl font-normal tracking-tight">Сроки доставки</h2>
                    </div>
                    
                    <div className="bg-light rounded-2xl p-6">
                        <p className="text-gray-700">
                            Сборка и отправка заказа занимает обычно 1-3 рабочих дня после подтверждения оплаты. Сроки доставки зависят от выбранного способа и региона. Ориентировочные сроки будут показаны при оформлении заказа.
                        </p>
                    </div>
                </section>

                <section>
                    <div className="flex items-center mb-6">
                        <CreditCard size={20} className="text-black mr-3" />
                        <h2 className="text-2xl font-normal tracking-tight">Способы оплаты</h2>
                    </div>
                    
                    <div className="bg-light rounded-2xl p-6">
                        <p className="text-gray-700">
                            На данный момент мы работаем по 100% предоплате. Оплата заказа производится онлайн через безопасный платежный шлюз. Мы принимаем к оплате банковские карты Visa, MasterCard, Мир.
                        </p>
                    </div>
                </section>

                <section>
                    <div className="flex items-center mb-6">
                        <Info size={20} className="text-black mr-3" />
                        <h2 className="text-2xl font-normal tracking-tight">Важная информация</h2>
                    </div>
                    
                    <div className="bg-light rounded-2xl p-6">
                        <ul className="list-disc list-outside pl-5 space-y-3">
                            <li>Пожалуйста, внимательно проверяйте введенные данные при оформлении заказа (адрес, ФИО, номер телефона).</li>
                            <li>После оформления заказа наш менеджер может связаться с вами для уточнения деталей.</li>
                            <li>В случае возникновения вопросов по доставке или оплате, пожалуйста, свяжитесь с нами по телефону <a href="tel:+79628191796" className="text-black hover:underline font-medium">+7 (962) 819-17-96</a> или через социальные сети.</li>
                        </ul>
                    </div>
                </section>
            </div>
        </main>
    );
}
