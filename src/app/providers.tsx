'use client';

import React from 'react';
import { HeroUIProvider, ToastProvider } from "@heroui/react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <HeroUIProvider>
      <ToastProvider 
        toastProps={{
          timeout: 2000,
          radius: 'lg',
        }}
        placement="bottom-right"
      />
      {children}
    </HeroUIProvider>
  );
} 