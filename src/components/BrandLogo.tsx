import React from 'react'

interface BrandLogoProps {
  className?: string
  size?: number
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-7 w-7', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Document card container with rounded corners */}
      <rect
        x="2.5"
        y="2.5"
        width="27"
        height="27"
        rx="6.5"
        className="fill-[var(--accent-soft)] stroke-[var(--accent)]"
        strokeWidth="1.75"
      />

      {/* Stylized 'K' lettermark */}
      <path
        d="M7.5 9V23"
        className="stroke-[var(--accent)]"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M14 9L7.5 16L14.5 23"
        className="stroke-[var(--accent)]"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Stylized 'M' (Markdown) lettermark */}
      <path
        d="M17.5 23V9L21.5 15L25.5 9V23"
        className="stroke-[var(--accent)]"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
