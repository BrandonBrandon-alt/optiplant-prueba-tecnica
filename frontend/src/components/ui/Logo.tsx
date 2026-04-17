import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  color?: string;
  accentColor?: string;
}

export default function Logo({ 
  size = 32, 
  className = "", 
  color = "currentColor", 
  accentColor = "var(--brand-500)" 
}: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 115" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: "drop-shadow(0 0 8px rgba(217, 99, 79, 0.15))" }}
    >
      {/* Hexagon Outer Frame stylized */}
      <path 
        d="M50 0L95 25V90L50 115L5 90V25L50 0Z" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      
      {/* Central "Z" geometric structure inspired by the modern reference */}
      <path 
        d="M25 35H75L30 85H80" 
        stroke={color} 
        strokeWidth="14" 
        strokeLinecap="square" 
        strokeLinejoin="miter"
      />
      
      {/* Modern Accent - Dots or small marks following the image style */}
      <rect x="70" y="20" width="10" height="10" fill={accentColor} />
      <rect x="20" y="85" width="10" height="10" fill={accentColor} />
      
      {/* Sharp cut details */}
      <path d="M5 40L15 45V70L5 75V40Z" fill={color} opacity="0.5" />
      <path d="M95 40L85 45V70L95 75V40Z" fill={color} opacity="0.5" />
    </svg>
  );
}
