"use client";

import React from 'react';
import styled, { keyframes } from 'styled-components';
import Image from 'next/image'; // Используем next/image

// Анимация пульсации
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.98); // Небольшое уменьшение
  }
`;

// Обертка для центрирования
const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh; // Занимает значительную часть экрана для центрирования
  width: 100%;
  padding: 2rem;
`;

// Анимированный логотип
const AnimatedLogo = styled(Image)`
  animation: ${pulse} 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  max-width: 180px; // Максимальная ширина лого
  height: auto; // Сохраняем пропорции
`;

const Loader = () => {
  return (
    <StyledWrapper>
      <AnimatedLogo
        src="/img/logo/logo.svg" // Путь к вашему лого в public
        alt="Загрузка PANDA WEAR..."
        width={180} // Базовая ширина (пропорционально viewBox 1240)
        height={42} // Базовая высота (пропорционально viewBox 288)
        priority // Приоритет загрузки логотипа
      />
    </StyledWrapper>
  );
};

export default Loader;
