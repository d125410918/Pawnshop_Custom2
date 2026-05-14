type GoldNumberBadgeProps = {
  value: string;
};

export default function GoldNumberBadge({ value }: GoldNumberBadgeProps) {
  const gradientId = `goldBadgeGradient-${value}`;
  const shineId = `goldBadgeShine-${value}`;
  const shadowId = `goldBadgeShadow-${value}`;

  return (
    <span className="inline-flex shrink-0" aria-label={`第 ${value} 區`}>
      <svg
        width="58"
        height="48"
        viewBox="0 0 116 96"
        role="img"
        aria-hidden="true"
        className="drop-shadow-[0_0_14px_rgba(245,212,122,0.34)]"
      >
        <defs>
          <linearGradient id={gradientId} x1="12" y1="8" x2="104" y2="88" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff8c9" />
            <stop offset="0.22" stopColor="#f9d978" />
            <stop offset="0.48" stopColor="#c88a28" />
            <stop offset="0.72" stopColor="#8d5310" />
            <stop offset="1" stopColor="#ffe89a" />
          </linearGradient>

          <radialGradient id={shineId} cx="34" cy="20" r="70" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.78" />
            <stop offset="0.24" stopColor="#fff3b0" stopOpacity="0.35" />
            <stop offset="0.52" stopColor="#f5d47a" stopOpacity="0.08" />
            <stop offset="1" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.45" />
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f5d47a" floodOpacity="0.42" />
          </filter>
        </defs>

        <g filter={`url(#${shadowId})`}>
          <path
            d="M18 8 H98 L108 18 V78 L98 88 H18 L8 78 V18 Z"
            fill={`url(#${gradientId})`}
            stroke="#fff0a8"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M23 14 H93 L102 23 V73 L93 82 H23 L14 73 V23 Z"
            fill="none"
            stroke="#3a2608"
            strokeWidth="2.2"
            strokeLinejoin="round"
            opacity="0.72"
          />
          <path
            d="M28 19 H88 L97 28 V68 L88 77 H28 L19 68 V28 Z"
            fill="none"
            stroke="#fff4b7"
            strokeWidth="1.5"
            strokeLinejoin="round"
            opacity="0.58"
          />
          <path
            d="M18 8 H98 L108 18 V78 L98 88 H18 L8 78 V18 Z"
            fill={`url(#${shineId})`}
            opacity="0.9"
          />
          <path
            d="M18 8 H98 L108 18 V78 L98 88 H18 L8 78 V18 Z"
            fill="none"
            stroke="#6d420c"
            strokeWidth="1"
            strokeLinejoin="round"
            opacity="0.62"
          />
        </g>

        <text
          x="58"
          y="61"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="45"
          fontWeight="700"
          letterSpacing="-2"
          fill="#171006"
          stroke="#f8df8e"
          strokeWidth="0.8"
          paintOrder="stroke fill"
        >
          {value}
        </text>
        <text
          x="58"
          y="61"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="45"
          fontWeight="700"
          letterSpacing="-2"
          fill="none"
          stroke="#000000"
          strokeWidth="1.4"
          opacity="0.24"
          transform="translate(2 2)"
        >
          {value}
        </text>
      </svg>
    </span>
  );
}
