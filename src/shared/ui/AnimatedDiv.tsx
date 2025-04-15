"use client";

import React from 'react';
import { motion, type Transition } from 'framer-motion';

// Используем any для initial и animate из-за сложностей с типами framer-motion
interface AnimatedDivProps {
  children: React.ReactNode;
  initial?: any; 
  animate?: any; 
  transition?: Transition;
  className?: string;
}

const AnimatedDiv: React.FC<AnimatedDivProps> = ({ 
  children, 
  initial, 
  animate, 
  transition, 
  className 
}) => {
    return (
        <motion.div
            initial={initial}
            animate={animate}
            transition={transition}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedDiv; 