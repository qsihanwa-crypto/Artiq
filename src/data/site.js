// Identity, socials, press and page copy for Dennis Liew, taken from
// dennisliew.art. The artist's pronouns aren't stated there, so copy stays in
// the first person ("I", "my") or uses the name — never "he/she".
export const site = {
  artistName: 'Dennis Liew',
  shortName: 'Dennis',
  tagline: 'Sharing my journey as an artist.',
  location: 'Malaysia',
  currency: 'RM',
  // Placeholder number and message used by checkout until set in the CMS Cart & Checkout page.
  whatsapp_number: '',
  checkout_message: {
    greeting: "Hi {artist_name}, I'd like to order the following:",
    signoff: "Sent from {artist_name}'s catalogue",
  },
  social: [
    { label: 'YouTube', href: 'https://www.youtube.com/channel/UCY226m6JyIjBozmKHeYw-dA/featured' },
    { label: 'Facebook', href: 'https://www.facebook.com/groups/2070292319937008' },
  ],

  press: [
    { year: '2017', outlet: 'New Straits Times', title: "Art and Asperger's", href: 'https://www.nst.com.my/lifestyle/sunday-vibes/2017/12/318092/art-and-aspergers' },
    { year: '2018', outlet: 'The Star', title: 'Artist with Asperger syndrome brings beauty to the canvas', href: 'https://www.thestar.com.my/lifestyle/people/2018/02/06/artist-with-asperger-syndrome-brings-beauty-to-the-canvas' },
    { year: '2019', outlet: 'New Straits Times', title: 'A remarkable artist', href: 'https://www.nst.com.my/lifestyle/sunday-vibes/2019/01/455097/remarkable-artist' },
    { year: '2021', outlet: 'New Straits Times', title: "Visual artist with Asperger's dreamy artworks offers hope during difficult times", href: 'https://www.nst.com.my/lifestyle/sunday-vibes/2021/01/656008/visual-artist-aspergers-dreamy-artworks-offers-hope-during' },
  ],

  // Snake-case alias is consumed by useSettings() (src/context/SettingsContext.jsx).
  artist_name: 'Dennis Liew',

  home_content: {
    heroLines: ['LANDSCAPES', 'THAT HOLD', 'HOPE.'],
    heroSubtext: 'Landscapes, gardens and nature, painted by {artist_name}, an artist based in {location}.',
    introHeadline1: 'EVERYONE SEES THE WORLD DIFFERENTLY.',
    introHeadline2: 'THIS IS HOW I SEE MINE.',
    introBody: 'Hi, I am Dennis. I would like to share my journey as an artist with you.',
    artistIntroParagraphs: [
      'I am Dennis Liew, an artist based in Malaysia. I have held various exhibitions in Malaysia, held live-art painting demonstrations, and taught art classes organised by Gamuda Land.',
      'My mother, Patricia, is my pillar of strength and encouragement. It is because of her that I am able to continue my passion in painting.',
    ],
  },

  about_content: {
    heading: 'Meet Dennis',
    intro: 'Hello and welcome to my site! I am Dennis Liew, an artist based in Malaysia.',
    storyTitle: 'My journey',
    storyParagraphs: [
      'I have held various exhibitions in Malaysia and have sold art pieces to many fans and clients. I have also held live-art painting demonstrations and taught art classes organised by Gamuda Land.',
      'My mother, Patricia, is my pillar of strength and encouragement. It is because of her that I am able to continue my passion in painting. She helps with the administrative work that I am unable to do yet due to Asperger syndrome.',
    ],
    closing: 'With the continuous support from you and all the fans of my art, I will learn to overcome the challenges ahead. Thank you from the bottom of my heart.',
    press: [
      { year: '2017', outlet: 'New Straits Times', title: "Art and Asperger's", href: 'https://www.nst.com.my/lifestyle/sunday-vibes/2017/12/318092/art-and-aspergers' },
      { year: '2018', outlet: 'The Star', title: 'Artist with Asperger syndrome brings beauty to the canvas', href: 'https://www.thestar.com.my/lifestyle/people/2018/02/06/artist-with-asperger-syndrome-brings-beauty-to-the-canvas' },
      { year: '2019', outlet: 'New Straits Times', title: 'A remarkable artist', href: 'https://www.nst.com.my/lifestyle/sunday-vibes/2019/01/455097/remarkable-artist' },
      { year: '2021', outlet: 'New Straits Times', title: "Visual artist with Asperger's dreamy artworks offers hope during difficult times", href: 'https://www.nst.com.my/lifestyle/sunday-vibes/2021/01/656008/visual-artist-aspergers-dreamy-artworks-offers-hope-during' },
    ],
  },
}

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Artwork', to: '/catalogue' },
]
