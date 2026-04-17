import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  color?: string;
  showText?: boolean;
}

export default function Logo({ 
  size = 32, 
  className = "", 
  color = "var(--brand-500)",
  showText = false
}: LogoProps) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Frame (Hexagon with cuts) */}
        <path 
           d="M50 0 L95 25 L95 40 L85 35 L50 15 L15 35 L5 40 L5 25 L50 0Z"
           fill={color}
        />
        <path 
           d="M50 100 L5 75 L5 60 L15 65 L50 85 L85 65 L95 60 L95 75 L50 100Z"
           fill={color}
        />

        {/* Central diagonal of the Z */}
        <path 
           d="M18 40 L82 40 L82 60 L18 60 Z"
           fill={color}
           transform="rotate(-32 50 50)"
        />

        {/* Technical connection bars to complete the Z shape inside the hexagon */}
        <path d="M15 35 V45 L25 40 V30Z" fill={color} />
        <path d="M85 65 V55 L75 60 V70Z" fill={color} />

        {/* Subtle sharp edges/details */}
        <path d="M50 0 L55 5 L50 10 L45 5 Z" fill={color} opacity="0.3" />
      </svg>
      
      {showText && (
        <span style={{ 
          color: color, 
          fontSize: "clamp(10px, 1.2vw, 14px)", 
          fontWeight: 700, 
          fontFamily: "var(--font-sans)",
          letterSpacing: "0.2em",
          textTransform: "lowercase",
          marginTop: "1px"
        }}>
          zen inventory
        </span>
      )}
    </div>
  );
}
