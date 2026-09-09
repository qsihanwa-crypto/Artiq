import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { site } from '../data/site'
import kirtanrawPortrait from '../assets/images/kirtanraw-portrait.jpg'
import { processSteps, steadyItems } from '../data/about'
import SectionHeading from '../components/common/SectionHeading'
import AnimatedText from '../components/common/AnimatedText'
import Button from '../components/buttons/Button'
import WavyLine from '../components/common/WavyLine'
import ProcessThread from '../components/about/ProcessThread'
import SteadyCard from '../components/about/SteadyCard'
import { revealOnScroll } from '../animations/scrollAnimations'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function About() {
  return (
    <div className="pt-32 sm:pt-40">
      <MeetSection />
      <StorySection />
      <LifeAndArt />
      <ProcessSection />
      <ClosingStatement />
    </div>
  )
}

function MeetSection() {
  return (
    <section className="px-6 pb-20 sm:px-10">
      <div className="mx-auto max-w-4xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">About</span>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl md:text-7xl">
          Meet {site.artistName}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-600">
          Twenty years of acrylic and oil paint, wood-burning and carving — working on my own, in {site.location}.
        </p>
      </div>
      <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-3xl bg-neutral-100">
        <img
          src={kirtanrawPortrait}
          alt="Kirtanraw Subramanian outside the Kirtanraw Art Gallery, beside a hand-painted welcome sign."
          className="aspect-[7/3] w-full object-cover object-center"
        />
      </div>
    </section>
  )
}

function StorySection() {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const ctx = gsap.context(() => revealOnScroll('[data-reveal]', { reduced }), ref)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={ref} className="px-6 py-20 sm:px-10">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-[1fr_1.3fr]">
        <div data-reveal>
          <SectionHeading kicker="Story" title="Twenty years by hand" />
        </div>
        <div data-reveal className="flex flex-col gap-6 text-lg leading-relaxed text-neutral-600">
          <p>
            I&rsquo;m Kirtanraw. I&rsquo;m 32, and I&rsquo;ve been painting for about twenty of those
            years. Somewhere along the way the wood took over as much as the canvas &mdash; pyrography,
            relief carving, hand-lettered boards &mdash; so now I move between all of it, whatever the
            piece needs.
          </p>
          <p>
            I was diagnosed with Asperger&rsquo;s syndrome. The short version: I notice small things,
            I repeat them until they&rsquo;re right, and I can lose a whole day to one corner of a
            painting without minding. In the studio that isn&rsquo;t a struggle &mdash; it&rsquo;s the
            part that works.
          </p>
          <p>
            The subjects run from Hanuman, Ganesha and Krishna to tigers, owls, old cars and the odd
            &ldquo;keep going&rdquo; sign. What doesn&rsquo;t change is the standard: every customer
            gets the best piece I can make, finished properly, no shortcuts.
          </p>
        </div>
      </div>
    </section>
  )
}

function LifeAndArt() {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const ctx = gsap.context(() => revealOnScroll('[data-reveal]', { reduced, stagger: 0.08 }), ref)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={ref} className="px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <SectionHeading align="center" kicker="Life & Art" title="What steadies the work" className="mx-auto" />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {steadyItems.map((item) => (
            <div key={item.title} data-reveal>
              <SteadyCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  return (
    <section className="relative px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <SectionHeading align="center" kicker="Creative Process" title="From idea to finished work" className="mx-auto" />
        <ProcessThread steps={processSteps} />
      </div>
    </section>
  )
}

function ClosingStatement() {
  return (
    <section className="px-6 py-28 sm:px-10">
      <div className="relative mx-auto max-w-3xl text-center">
        <WavyLine variant="horizontal" className="pointer-events-none absolute -top-10 left-1/2 h-16 w-64 -translate-x-1/2" opacity={0.2} />
        <AnimatedText
          as="p"
          text="I make things because it is how I pay attention. Twenty years in, that hasn't worn off — and I would love for you to see where it has got to."
          className="font-display text-3xl font-medium leading-snug text-ink sm:text-4xl"
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
