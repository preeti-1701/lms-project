export default function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-16 h-16 text-2xl',
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizes[size]} bg-primary text-white rounded-xl flex items-center justify-center font-bold shadow-sm`}>
        L
      </div>
      <span className={`font-bold tracking-tight text-text ${size === 'lg' || size === 'xl' ? 'text-2xl' : 'text-xl'}`}>
        Learn<span className="text-primary">Hub</span>
      </span>
    </div>
  )
}

