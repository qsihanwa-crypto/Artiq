import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowUpRight } from 'lucide-react'
import dennisPortrait from '../assets/images/dennis-liew.jpg'
import patriciaAndDennis from '../assets/images/patricia-and-dennis.jpg'
import SectionHeading from '../components/common/SectionHeading'
import AnimatedText from '../components/common/AnimatedText'
import Button from '../components/buttons/Button'
import WavyLine from '../components/common/WavyLine'
import { revealOnScroll } from '../animations/scrollAnimations'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useSettings } from '../context/SettingsContext'
import { site } from '../data/site'

function useAboutContent() {
  const settings = useSettings()
  return { ...site.about_content, ...(settings.about_content || {}) }
}

export default function About() {
  return (
    <div className="pt-32 sm:pt-40">
      <MeetSection />
      <StorySection />
      <PressSection />
      <ClosingStatement />
    </div>
  )
}

function useReveal() {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const ctx = gsap.context(() => revealOnScroll('[data-reveal]', { reduced, stagger: 0.08 }), ref)
    return () => ctx.revert()
  }, [reduced])

  return ref
}

function MeetSection() {
  const content = useAboutContent()
  return (
    <section className="px-6 pb-20 sm:px-10">
      <div className="mx-auto max-w-4xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">About</span>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl md:text-7xl">
          {content.heading}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-600">
          {content.intro}
        </p>
      </div>
      <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-3xl bg-neutral-100">
        <img
          src={dennisPortrait}
          alt="Dennis Liew sitting in front of a wall of his landscape paintings."
          className="aspect-[4/3] w-full object-cover object-center"
        />
      </div>
    </section>
  )
}

function StorySection() {
  const ref = useReveal()
  const content = useAboutContent()

  return (
    <section ref={ref} className="px-6 py-20 sm:px-10">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div data-reveal className="flex flex-col gap-6 text-lg leading-relaxed text-zinc-600">
          <SectionHeading kicker="Story" title={content.storyTitle} />
          {content.storyParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div data-reveal className="overflow-hidden rounded-3xl bg-neutral-100">
          <img
            src={patriciaAndDennis}
            alt="Dennis Liew and his mother, Patricia, standing in front of his paintings at an exhibition."
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}

function PressSection() {
  const ref = useReveal()
  const content = useAboutContent()

  return (
    <section ref={ref} className="px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <SectionHeading align="center" kicker="In the media" title="As featured in" className="mx-auto" />
        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {content.press.map((item) => (
            <li key={item.href} data-reveal>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass group flex h-full items-start justify-between gap-4 rounded-2xl p-6 transition-colors hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    {item.year} · {item.outlet}
                  </span>
                  <span className="mt-2 block font-display text-lg font-medium text-zinc-950">{item.title}</span>
                </span>
                <ArrowUpRight
                  size={20}
                  className="mt-1 shrink-0 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ClosingStatement() {
  const content = useAboutContent()
  return (
    <section className="px-6 py-28 sm:px-10">
      <div className="relative mx-auto max-w-3xl text-center">
        <WavyLine variant="horizontal" className="pointer-events-none absolute -top-10 left-1/2 h-16 w-64 -translate-x-1/2" opacity={0.2} />
        <AnimatedText
          as="p"
          text={content.closing}
          className="font-display text-3xl font-medium leading-snug text-zinc-950 sm:text-4xl"
        />
        <div className="mt-10 flex justify-center">
          <Button to="/catalogue" variant="primary" size="lg" showArrow>
            Explore the artwork
          </Button>
        </div>
      </div>
    </section>
  )
}
