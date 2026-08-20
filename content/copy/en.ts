import type { Copy } from "@/types/content";

export const en: Copy = {
  meta: {
    title: "Fraise Studio — Food & Beverage Production, Amman",
    description:
      "A food and beverage production studio in Amman, Jordan. TVC, recipes, reels, stills and menu plate design.",
  },
  eyebrow: "Step 02 — Two languages",
  title: "Fraise Studio design system",
  intro:
    "Black Room, Warm Plate. The interface is achromatic — every pixel of colour on a real page comes from the food. This page exists to make the tokens visible before we build on them.",
  sections: {
    colour: "Colour",
    typography: "Typography",
    arabic: "Arabic is not a fallback",
    ratio: "Aspect ratio is the taxonomy",
    state: "Interactive state",
  },
  paletteNote: {
    ink: "ground",
    "ink-raised": "raised surface",
    bone: "primary type",
    "bone-dim": "secondary type",
    "bone-faint": "tertiary",
    fraise: "state only",
  },
  displaySample: "Display",
  bodySample:
    "Body copy sits at a comfortable measure and never exceeds roughly 68 characters. The scale is deliberately gapped — a large jump from body to display with nothing in between, because mid-sizes are what make a page feel like a template.",
  arabicNote:
    "The Arabic block uses IBM Plex Sans Arabic with more leading, and the eyebrow above it is neither uppercased nor letter-spaced — Arabic has no letter case, and tracking would break the joins. That rule is enforced in CSS, not by remembering to do it.",
  ratioNote:
    "Each pillar has a native shape, so the grid becomes asymmetric for a reason rather than for decoration. Declaring the ratio up front is also the entire CLS strategy — nothing reflows when media loads.",
  hoverNote:
    "Rest the cursor on any frame. The still is what loads; the loop is attached only after 120ms of held intent, and at most two videos hold a decoder at once.",
  stateNote: {
    before: "Press",
    key: "Tab",
    after: "to see the only place the accent is allowed to appear.",
  },
  focusLabel: "Focus me",

  home: {
    nav: {
      work: "Work",
      services: "Services",
      studio: "Studio",
      contact: "Contact",
      about: "About Us",
      awards: "Awards",
      menu: "Menu",
      close: "Close",
    },
    aboutMenu: {
      team: "The Crew",
      backstage: "Behind The Scenes",
      story: "The Fraise Studio Story",
    },
    tagline: "Food & beverage production studio — Amman, Jordan",
    positioning: "We make the image that makes the product seen and remembered.",
    sections: {
      work: "Selected Work",
      capabilities: "Capabilities",
      clients: "Clients",
      studio: "The Studio",
      awards: "Recognition",
    },
    seeWork: "See the work",
    playFilm: "PLAY FILM",
    viewAll: "View all work",
    moreStudio: "Read the studio story",
    awardsNote: "Awarded for food and beverage craft, not for reach.",
    pillar: {
      tvc: "TVC & Cinematography",
      recipes: "Recipe Films",
      reels: "Reels",
      stills: "Stills",
      menu: "Menu Plate Design",
    },
    capabilitiesNote:
      "Each format has a native shape. The frame tells you which one you are looking at before the label does.",
    clientsNote: "Selected clients, 2019 — 2024.",
    studioBody:
      "A crew, not a camera. Pre-production, food styling, direction of photography, edit and grade run in-house — which is why a shoot day produces a campaign rather than a folder of clips.",
    ctaLine: "Have a product that deserves to be seen properly?",
    ctaAction: "Start a project",
    rights: "All rights reserved.",
    skip: "Skip to content",
    heroControls: { pause: "Pause", play: "Play", sound: "Sound", mute: "Mute" },
    clientsLabel: "Selected clients",
  },

  contact: {
    title: "Contact",
    line: "Tell us what you are making. We will tell you how we would shoot it.",
    body: "A brief, a deadline and a product is enough to start. If there is no brief yet, that is what the first call is for.",
    emailLabel: "Email",
    phoneLabel: "Phone",
    whatsappLabel: "WhatsApp",
    addressLabel: "Studio",
    city: "Amman, Jordan",
    directions: "Open in Maps",
    social: "Instagram",
  },

  work: {
    title: "Work",
    description:
      "Selected food and beverage work from Fraise Studio — TV commercials, recipe films, reels, stills and menu plate design, shot in Amman for brands across the Arab world.",
    intro:
      "Every piece is slated with its client, format and year. Filter by what you need made.",
    all: "All",
    count: "shown",
    clientLabel: "Client",
    serviceLabel: "Service",
    yearLabel: "Year",
    watchFilm: "Watch the film on Vimeo",
    filmSoon: "The full film is not published online yet.",
    moreIn: "More in this format",
    backToWork: "All work",
    loadMore: "Load more",
    empty: "Nothing in this format yet.",
  },
};
