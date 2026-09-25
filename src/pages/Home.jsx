import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import Button from '../components/buttons/Button'
import SectionHeading from '../components/common/SectionHeading'
import AnimatedText from '../components/common/AnimatedText'
import ArtworkCard from '../components/artwork/ArtworkCard'
import InfiniteSpiral from '../components/gallery/InfiniteSpiral'
import SignatureThread from '../components/common/SignatureThread'
import LottieAnimation from '../components/lottie/LottieAnimation'
import brushLoader from '../assets/lottie/brush-loader.json'
import { playHeroEntrance, startHeroAmbient } from '../animations/heroAnimations'
import { revealOnScroll, parallaxOnScroll } from '../animations/scrollAnimations'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsTouchDevice } from '../hooks/useIsTouchDevice'
import { useSettings } from '../context/SettingsContext'
import { useArtworks } from '../hooks/useArtwork'
import { artworks } from '../data/artworks'
import artistPortrait from '../assets/images/dennis-liew.jpg'

// Decorative artwork cluster behind the hero headline — the page's thesis is
// "art is the only colour", so the hero leads with several fragments rather
// than one. `depth` scales the pointer/scroll parallax; `mobile` fragments
// stay visible below `sm`, the rest are `sm:`-only. All aria-hidden.
const ASPECT_CLASS = { portrait: 'aspect-[4/5]', landscape: 'aspect-[5/4]', square: 'aspect-square' }
const HERO_FRAGMENT_CONFIG = [
  {
    artId: '8',
    depth: 1,
    className:
      'w-[36vw] right-[-10%] top-[-1%] -rotate-6 ' +
      'sm:w-[24vw] sm:max-w-[300px] sm:right-[3%] sm:top-[15%] sm:-rotate-3',
  },
  {
    artId: '4',
    depth: 0.45,
    className: 'hidden sm:block sm:w-[12vw] sm:max-w-[132px] sm:right-[27%] sm:top-[7%] sm:rotate-6',
  },
  {
    artId: '7',
    depth: 0.7,
    className:
      'w-[30vw] left-[-9%] bottom-[-4%] rotate-3 ' +
      'sm:w-[16vw] sm:max-w-[196px] sm:left-auto sm:right-[9%] sm:bottom-[6%] sm:rotate-2',
  },
  {
    artId: '1',
    depth: 0.35,
    className: 'hidden sm:block sm:w-[11vw] sm:max-w-[124px] sm:left-[-3%] sm:bottom-[3%] sm:-rotate-6',
  },
]

export default function Home() {
  const settings = useSettings()
  const { artworks: featuredArtworks } = useArtworks({ featured: true })

  const pick = (id) => artworks.find((artwork) => artwork.id === id)
  const spiralItems = artworks.map((art) => ({
    id: art.id,
    src: art.image,
    alt: art.alt,
    to: `/artwork/${art.id}`,
    label: `View "${art.title}," ${art.medium}`,
  }))
  const heroFragments = HERO_FRAGMENT_CONFIG.map((fragment) => ({ ...fragment, art: pick(fragment.artId) })).filter((fragment) => fragment.art)
  const homeContent = settings.home_content || {}
  const heroLines = homeContent.heroLines || ['EVERY PIECE', 'MADE', 'BY HAND.']
  const fill = (text = '') => text.replace('{artist_name}', settings.artist_name || '').replace('{location}', settings.location || '')

  return (
    <>
      <SignatureThread />
      <Hero fragments={heroFragments} settings={settings} content={homeContent} fill={fill} heroLines={heroLines} />
      <IntroStatement content={homeContent} />
      <ExploreSpiral items={spiralItems} />
      <ArtistIntro portrait={artistPortrait} settings={settings} content={homeContent} />
      <FeaturedArtwork artworks={featuredArtworks} />
    </>
  )
}

function Hero({ fragments, settings, content, fill, heroLines }) {
  const reduced = useReducedMotion()
  const isTouch = useIsTouchDevice()
  const kickerRef = useRef(null)
  const line1Ref = useRef(null)
  const line2Ref = useRef(null)
  const line3Ref = useRef(null)
  const subtextRef = useRef(null)
  const ctasRef = useRef(null)
  const blobRef = useRef(null)
  const fragmentOuterRefs = useRef([])
  const fragmentInnerRefs = useRef([])
  const sectionRef = useRef(null)

  // Entrance timeline + always-on ambient drift, together in one context so
  // ctx.revert() stops the infinite tweens on unmount.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      playHeroEntrance(
        {
          kicker: kickerRef.current,
          lines: [line1Ref.current, line2Ref.current, line3Ref.current],
          subtext: subtextRef.current,
          ctas: ctasRef.current?.children,
          blob: blobRef.current,
          fragments: fragmentInnerRefs.current,
        },
        reduced,
      )
      startHeroAmbient({ blob: blobRef.current, fragments: fragmentInnerRefs.current }, reduced)
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced])

  // Pointer parallax — each fragment (and the blob, gently opposed) tracks the
  // cursor by a different amount for depth. Desktop only.
  useLayoutEffect(() => {
    if (reduced || isTouch) return
    const el = sectionRef.current
    if (!el) return
    const movers = fragmentOuterRefs.current.filter(Boolean).map((node, i) => ({
      x: gsap.quickTo(node, 'x', { duration: 0.9, ease: 'power3.out' }),
      y: gsap.quickTo(node, 'y', { duration: 0.9, ease: 'power3.out' }),
      depth: fragments[i]?.depth ?? 0.5,
    }))
    const blobX = blobRef.current && gsap.quickTo(blobRef.current, 'x', { duration: 1.2, ease: 'power3.out' })
    const blobY = blobRef.current && gsap.quickTo(blobRef.current, 'y', { duration: 1.2, ease: 'power3.out' })

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      movers.forEach((m) => {
        m.x(px * 44 * m.depth)
        m.y(py * 34 * m.depth)
      })
      if (blobX) {
        blobX(px * -14)
        blobY(py * -12)
      }
    }
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [reduced, isTouch])

  // Scroll parallax — fragments drift up as the hero leaves the viewport.
  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const layers = fragmentOuterRefs.current
        .filter(Boolean)
        .map((el, i) => ({ el, amount: -(6 + (fragments[i]?.depth ?? 0.5) * 12) }))
      parallaxOnScroll(layers, { reduced, trigger: sectionRef.current })
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={sectionRef} className="relative overflow-hidden px-6 pb-20 pt-40 sm:px-10 sm:pt-48 lg:pt-56">
      <div
        ref={blobRef}
        aria-hidden="true"
        className="pointer-events-none absolute right-[-12%] top-[2%] z-0 h-[64vw] w-[64vw] max-h-[720px] max-w-[720px] rounded-full bg-neutral-200/60 blur-[80px] sm:right-[3%]"
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]">
        {fragments.map((f, i) => (
          <div
            key={f.art.id}
            ref={(el) => (fragmentOuterRefs.current[i] = el)}
            className={`absolute ${f.className}`}
          >
            <div
              ref={(el) => (fragmentInnerRefs.current[i] = el)}
              className={`w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-[0_30px_80px_rgba(10,10,10,0.14)] ${ASPECT_CLASS[f.art.aspect] || ASPECT_CLASS.portrait}`}
            >
              <img src={f.art.image} alt="" loading="eager" className="h-full w-full object-cover" />
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8">
        <div ref={kickerRef} className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          <LottieAnimation animationData={brushLoader} className="h-5 w-5" />
          {settings.artist_name} — {settings.location}
        </div>

        <h1 className="font-display text-[15vw] font-semibold leading-[0.95] tracking-tight text-zinc-950 sm:text-[9vw] lg:text-[7.5rem]">
          <span className="block overflow-hidden"><span ref={line1Ref} className="inline-block">{heroLines[0]}</span></span>
          <span className="block overflow-hidden"><span ref={line2Ref} className="inline-block">{heroLines[1]}</span></span>
          <span className="block overflow-hidden"><span ref={line3Ref} className="inline-block">{heroLines[2]}</span></span>
        </h1>

        <p ref={subtextRef} className="max-w-lg text-lg text-zinc-600 sm:text-xl">
          {fill(content.heroSubtext)}
        </p>

        <div ref={ctasRef} className="flex flex-wrap gap-4 pt-2">
          <span className="inline-block">
            <Button to="/catalogue" variant="primary" size="lg" showArrow>
              Explore artwork
            </Button>
          </span>
          <span className="inline-block">
            <Button to="/about" variant="secondary" size="lg" showArrow>
              Meet the artist
            </Button>
          </span>
        </div>
      </div>
    </section>
  )
}

function IntroStatement({ content }) {
  return (
    <section className="px-6 py-28 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-4xl">
        <AnimatedText
          as="h2"
          text={content.introHeadline1}
          className="font-display text-4xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-5xl md:text-6xl"
        />
        <AnimatedText
          as="h2"
          text={content.introHeadline2}
          className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-zinc-400 sm:text-5xl md:text-6xl"
        />
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-600">
          {content.introBody}
        </p>
      </div>
    </section>
  )
}

function ExploreSpiral({ items }) {
  const reduced = useReducedMotion()

  return (
    <section className="px-6 py-16 sm:px-10">
      <div className="glass-strong mx-auto max-w-6xl rounded-[2.5rem] px-6 py-16 sm:px-12 sm:py-20">
        <SectionHeading
          align="center"
          kicker="Discover"
          title={['EXPLORE', 'THE WORK']}
          subtitle="Gardens in bloom, quiet lakes and hills, and a corner of old Penang."
          className="mx-auto"
        />
        <div className="relative mt-16 h-[400px] overflow-hidden sm:h-[520px] lg:h-[600px]">
          <InfiniteSpiral
            items={items}
            linkComponent={Link}
            animationMode={reduced ? 'drag' : 'all'}
            speed={0.55}
            radius={170}
            cardWidth={100}
            cardHeight={100}
            verticalSpacing={60}
            perspective={1000}
            cardRadius={10}
            centerScale={1.2}
            edgeBlur={6}
            cardsPerTurn={7}
            pauseOnHover
          />
        </div>
        <p className="mt-10 text-center text-sm text-zinc-500">
          Drag the spiral to look around, or open the full catalogue below.
        </p>
        <div className="mt-6 flex justify-center">
          <Button to="/catalogue" variant="primary" size="lg" showArrow>
            View full catalogue
          </Button>
        </div>
      </div>
    </section>
  )
}

function ArtistIntro({ portrait, settings, content }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      revealOnScroll('[data-reveal]', { reduced, stagger: 0.1 })
    }, ref)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={ref} className="relative px-6 py-28 sm:px-10 sm:py-36">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div data-reveal className="relative">
          <div className="overflow-hidden rounded-3xl bg-neutral-100">
            <img src={portrait} alt="Dennis Liew sitting in front of a wall of his landscape paintings." className="aspect-[4/5] w-full object-cover" />
          </div>
          <div className="glass absolute -bottom-6 -right-6 hidden rounded-2xl px-5 py-4 sm:block">
            <p className="text-sm font-medium text-zinc-950">{settings.location}</p>
          </div>
        </div>
        <div data-reveal className="flex flex-col gap-6">
          <SectionHeading kicker="The Artist" title="Meet Dennis" />
          <p className="text-lg leading-relaxed text-zinc-600">
            {content.artistIntroParagraphs?.[0]}
          </p>
          <p className="text-lg leading-relaxed text-zinc-600">
            {content.artistIntroParagraphs?.[1]}
          </p>
          <Button to="/about" variant="secondary" size="md" showArrow className="w-fit">
            Read more
          </Button>
        </div>
      </div>
    </section>
  )
}

function FeaturedArtwork({ artworks }) {
  return (
    <section className="px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading kicker="Selected Work" title="FEATURED ARTWORK" />
          <Button to="/catalogue" variant="secondary" size="md" showArrow className="shrink-0">
            View all artwork
          </Button>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {artworks.map((art, i) => (
            <ArtworkCard key={art.id} artwork={art} priority={i < 3} />
          ))}
        </div>
      </div>
    </section>
  )
}

