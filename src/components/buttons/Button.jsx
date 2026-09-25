import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-ink text-white border border-ink hover:bg-ink-soft',
  secondary: 'glass text-ink hover:bg-white/85',
  ghost: 'bg-transparent text-ink border border-transparent hover:border-neutral-300',
}

const SIZES = {
  md: 'px-6 py-3.5 text-sm',
  lg: 'px-8 py-4 text-base',
}

/**
 * The single button component for the whole site. `to` renders a router Link,
 * `href` renders an anchor, otherwise a native <button>. Always takes real
 * label text as children — never an icon alone.
 */
const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', showArrow = false, className = '', to, href, ...props },
  ref,
) {
  const classes = `group relative inline-flex items-center justify-center gap-2 rounded-full font-medium
    tracking-tight whitespace-nowrap transition-[transform,background-color,border-color] duration-200
    ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]
    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink
    ${VARIANTS[variant]} ${SIZES[size]} ${className}`

  const content = (
    <>
      <span>{children}</span>
      {showArrow && (
        <ArrowRight
          aria-hidden="true"
          size={18}
          className="transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1"
        />
      )}
    </>
  )

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button ref={ref} type="button" className={classes} {...props}>
      {content}
    </button>
  )
})

export default Button
