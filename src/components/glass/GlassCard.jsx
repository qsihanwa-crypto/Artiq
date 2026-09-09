const VARIANTS = {
  light: 'glass',
  strong: 'glass-strong',
  dark: 'glass-dark text-white',
}

export default function GlassCard({ as: Tag = 'div', variant = 'light', rounded = 'rounded-3xl', className = '', children, ...props }) {
  return (
    <Tag className={`${VARIANTS[variant]} ${rounded} ${className}`} {...props}>
      {children}
    </Tag>
  )
}
