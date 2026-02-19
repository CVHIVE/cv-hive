export default function Logo({ className = '', size = 'default' }: { className?: string; size?: 'sm' | 'default' | 'lg' }) {
  const sizes = {
    sm: { svg: 'w-7 h-7', text: 'text-lg' },
    default: { svg: 'w-9 h-9', text: 'text-xl' },
    lg: { svg: 'w-12 h-12', text: 'text-2xl' },
  };
  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg className={s.svg} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hexagonal hive shape */}
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F52BA" />
            <stop offset="100%" stopColor="#0D47A1" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="16" y1="16" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00C853" />
            <stop offset="100%" stopColor="#00A651" />
          </linearGradient>
        </defs>
        {/* Outer hexagon */}
        <path
          d="M24 2L43.5 13.25V35.75L24 47L4.5 35.75V13.25L24 2Z"
          fill="url(#logoGrad)"
          rx="2"
        />
        {/* Inner document/CV icon */}
        <rect x="16" y="12" width="16" height="20" rx="2" fill="white" opacity="0.95" />
        {/* Document lines */}
        <rect x="19" y="16" width="10" height="1.5" rx="0.75" fill="url(#accentGrad)" />
        <rect x="19" y="20" width="8" height="1.5" rx="0.75" fill="#0F52BA" opacity="0.3" />
        <rect x="19" y="24" width="10" height="1.5" rx="0.75" fill="#0F52BA" opacity="0.3" />
        <rect x="19" y="28" width="6" height="1.5" rx="0.75" fill="#0F52BA" opacity="0.3" />
        {/* Small accent checkmark */}
        <circle cx="34" cy="30" r="5" fill="url(#accentGrad)" />
        <path d="M31.5 30L33 31.5L36.5 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className={`${s.text} font-extrabold tracking-tight text-primary`}>
          CV <span className="text-accent">Hive</span>
        </span>
      </div>
    </div>
  );
}
