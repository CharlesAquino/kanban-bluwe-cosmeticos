/**
 * Animações Avançadas para Quarentena
 * Componentes com transições suaves e micro-interações
 */

import React, { useState, useEffect } from 'react'

// ============================================
// ANIMAÇÃO: CARD ENTRADA
// ============================================

export const CardEntrance: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transition-all duration-500 ease-out transform ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95'
      }`}
    >
      {children}
    </div>
  )
}

// ============================================
// ANIMAÇÃO: CONTADOR
// ============================================

interface CounterProps {
  from: number
  to: number
  duration?: number
  suffix?: string
}

export const AnimatedCounter: React.FC<CounterProps> = ({
  from,
  to,
  duration = 1000,
  suffix = '',
}) => {
  const [count, setCount] = useState(from)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      setCount(Math.floor(from + (to - from) * progress))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [from, to, duration])

  return <span>{count}{suffix}</span>
}

// ============================================
// ANIMAÇÃO: PROGRESSO
// ============================================

interface ProgressBarProps {
  value: number
  max?: number
  animated?: boolean
  color?: string
}

export const AnimatedProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  animated = true,
  color = 'from-blue-500 to-indigo-600',
}) => {
  const percentage = (value / max) * 100

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${color} transition-all ${
          animated ? 'duration-500 ease-out' : ''
        }`}
        style={{ width: `${percentage}%` }}
      >
        <div className="h-full bg-white/20 animate-pulse"></div>
      </div>
    </div>
  )
}

// ============================================
// ANIMAÇÃO: PULSE COM ESCALA
// ============================================

interface PulseScaleProps {
  children: React.ReactNode
  intensity?: 'low' | 'medium' | 'high'
}

export const PulseScale: React.FC<PulseScaleProps> = ({ children, intensity = 'medium' }) => {
  const intensityMap = {
    low: 'scale-105',
    medium: 'scale-110',
    high: 'scale-125',
  }

  return (
    <div className={`animate-pulse ${intensityMap[intensity]} transition-transform`}>
      {children}
    </div>
  )
}

// ============================================
// ANIMAÇÃO: FADE IN OUT
// ============================================

interface FadeInOutProps {
  children: React.ReactNode
  isVisible: boolean
  duration?: number
}

export const FadeInOut: React.FC<FadeInOutProps> = ({
  children,
  isVisible,
  duration = 300,
}) => {
  return (
    <div
      className={`transition-opacity ${duration === 300 ? 'duration-300' : `duration-${duration}`} ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {children}
    </div>
  )
}

// ============================================
// ANIMAÇÃO: SLIDE IN
// ============================================

interface SlideInProps {
  children: React.ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  isVisible: boolean
  duration?: number
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'left',
  isVisible,
  duration = 300,
}) => {
  const directionMap = {
    left: 'translate-x-0 from-left',
    right: '-translate-x-0 from-right',
    up: 'translate-y-0 from-top',
    down: '-translate-y-0 from-bottom',
  }

  const initialMap = {
    left: '-translate-x-full',
    right: 'translate-x-full',
    up: 'translate-y-full',
    down: '-translate-y-full',
  }

  return (
    <div
      className={`transition-all ${duration === 300 ? 'duration-300' : `duration-${duration}`} ${
        isVisible ? directionMap[direction] : initialMap[direction]
      }`}
    >
      {children}
    </div>
  )
}

// ============================================
// ANIMAÇÃO: BOUNCE
// ============================================

interface BounceProps {
  children: React.ReactNode
  intensity?: 'low' | 'medium' | 'high'
}

export const Bounce: React.FC<BounceProps> = ({ children, intensity = 'medium' }) => {
  const intensityMap = {
    low: 'animate-bounce',
    medium: 'animate-bounce',
    high: 'animate-bounce',
  }

  return <div className={intensityMap[intensity]}>{children}</div>
}

// ============================================
// ANIMAÇÃO: SHIMMER (Skeleton Loading)
// ============================================

export const Shimmer: React.FC<{ className?: string }> = ({ className = 'h-12 w-full' }) => {
  return (
    <div
      className={`${className} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse`}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
      }}
    />
  )
}

// ============================================
// ANIMAÇÃO: ROTATE
// ============================================

interface RotateProps {
  children: React.ReactNode
  speed?: 'slow' | 'normal' | 'fast'
}

export const Rotate: React.FC<RotateProps> = ({ children, speed = 'normal' }) => {
  const speedMap = {
    slow: 'animate-spin-slow',
    normal: 'animate-spin',
    fast: 'animate-spin-fast',
  }

  return <div className={speedMap[speed]}>{children}</div>
}

// ============================================
// ANIMAÇÃO: FLIP
// ============================================

interface FlipProps {
  children: React.ReactNode
  isFlipped: boolean
  duration?: number
}

export const Flip: React.FC<FlipProps> = ({ children, isFlipped, duration = 600 }) => {
  return (
    <div
      className={`transition-transform ${duration === 600 ? 'duration-600' : `duration-${duration}`}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}
    >
      {children}
    </div>
  )
}

// ============================================
// ANIMAÇÃO: GLOW
// ============================================

interface GlowProps {
  children: React.ReactNode
  color?: string
  intensity?: 'low' | 'medium' | 'high'
}

export const Glow: React.FC<GlowProps> = ({
  children,
  color = 'blue',
  intensity = 'medium',
}) => {
  const intensityMap = {
    low: 'shadow-lg',
    medium: 'shadow-2xl',
    high: 'shadow-2xl',
  }

  const colorMap = {
    blue: 'shadow-blue-500/50',
    pink: 'shadow-pink-500/50',
    purple: 'shadow-purple-500/50',
    green: 'shadow-green-500/50',
  }

  return (
    <div className={`${intensityMap[intensity]} ${colorMap[color as keyof typeof colorMap]} animate-pulse`}>
      {children}
    </div>
  )
}

// ============================================
// ANIMAÇÃO: TYPEWRITER
// ============================================

interface TypewriterProps {
  text: string
  speed?: number
}

export const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1))
        index++
      } else {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return <span>{displayedText}</span>
}

// ============================================
// ANIMAÇÃO: HOVER SCALE
// ============================================

interface HoverScaleProps {
  children: React.ReactNode
  scale?: number
}

export const HoverScale: React.FC<HoverScaleProps> = ({ children, scale = 1.05 }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="transition-transform duration-300 ease-out"
      style={{
        transform: isHovered ? `scale(${scale})` : 'scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  )
}

// ============================================
// ANIMAÇÃO: STAGGER
// ============================================

interface StaggerProps {
  children: React.ReactNode[]
  delay?: number
}

export const Stagger: React.FC<StaggerProps> = ({ children, delay = 100 }) => {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <CardEntrance key={index} delay={index * delay}>
          {child}
        </CardEntrance>
      ))}
    </>
  )
}

// ============================================
// CSS KEYFRAMES CUSTOMIZADAS
// ============================================

export const animationStyles = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-fast {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }

  .animate-spin-fast {
    animation: spin-fast 0.5s linear infinite;
  }
`

export default {
  CardEntrance,
  AnimatedCounter,
  AnimatedProgressBar,
  PulseScale,
  FadeInOut,
  SlideIn,
  Bounce,
  Shimmer,
  Rotate,
  Flip,
  Glow,
  Typewriter,
  HoverScale,
  Stagger,
  animationStyles,
}
