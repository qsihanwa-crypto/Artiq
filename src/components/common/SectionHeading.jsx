import AnimatedText from './AnimatedText'

/**
 * Consistent section header: small kicker label, large display title, optional
 * supporting copy. `title` accepts a string or an array of lines.
 */
export default function SectionHeading({ kicker, title, subtitle, align = 'left', className = '' }) {
  const lines = Array.isArray(title) ? title : [title]
  const alignClass = align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left'

  return (
    <div className={`flex flex-col gap-5 ${alignClass} ${className}`}>
      {kicker && (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{kicker}</span>
      )}
      <h2 className="font-display text-4xl font-semibold leading-[1.05] text-zinc-950 sm:text-5xl md:text-6xl">
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </h2>
      {subtitle && <p className="max-w-xl text-lg leading-relaxed text-zinc-600">{subtitle}</p>}
    </div>
  )
}
