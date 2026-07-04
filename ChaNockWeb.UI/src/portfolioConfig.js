// Photographer Portfolio Configuration
// Modify this file to easily update the website content, categories, and media items.

import natureImg from './assets/portfolio_nature.png'
import portraitImg from './assets/portfolio_portrait.png'
import architectureImg from './assets/portfolio_architecture.png'

export const portfolioConfig = {
  // Website branding and headers
  brandName: "NOCK STUDIO",
  photographerName: "Cha Nock",
  photographerTitle: "Visual Artist & Photographer",
  bio: "Capturing the interplay of light, geometry, and human emotion. Specialized in fine art landscape, minimalist architecture, and narrative-driven portraits.",
  
  // Contact & Social links
  email: "contact@chanock.com",
  instagram: "https://instagram.com",
  behance: "https://behance.net",
  github: "https://github.com",
  
  // Available media categories
  categories: [
    { id: "all", label: "All Works" },
    { id: "nature", label: "Nature & Landscape" },
    { id: "portrait", label: "Portrait" },
    { id: "architecture", label: "Architecture" },
    { id: "video", label: "Moving Image" }
  ],

  // Theme defaults (can be customized here or live in the UI)
  defaultTheme: {
    primaryColor: "#aa3bff", // Accent color (purple)
    bgColor: "#0a0a0c",       // Dark backdrop
    textColor: "#e2e8f0",    // Soft white
    fontSans: "'Outfit', system-ui, -apple-system, sans-serif"
  },

  // Media items list
  items: [
    {
      id: "nature-01",
      title: "Misty Sunrise Peaks",
      description: "A dramatic sunrise over mountains, capturing the layered mist and first light piercing the valleys.",
      category: "nature",
      type: "image",
      src: natureImg,
      metadata: {
        camera: "Sony Alpha 7R V",
        lens: "FE 24-70mm F2.8 GM II",
        aperture: "f/8.0",
        shutterSpeed: "1/160s",
        iso: "100",
        location: "Seoraksan, South Korea",
        date: "2026-05-12"
      }
    },
    {
      id: "portrait-01",
      title: "The Wisdom of Wrinkles",
      description: "Artistic high-contrast portrait emphasizing natural texture, character, and depth of expressions.",
      category: "portrait",
      type: "image",
      src: portraitImg,
      metadata: {
        camera: "Fujifilm GFX 100S",
        lens: "GF 110mm F2 R LM WR",
        aperture: "f/2.0",
        shutterSpeed: "1/125s",
        iso: "200",
        location: "Seoul Studio, South Korea",
        date: "2026-04-05"
      }
    },
    {
      id: "arch-01",
      title: "Concrete Shadow Geometry",
      description: "Minimalist composition of modern concrete geometry under sharp sunlight, focusing on shadows and negative space.",
      category: "architecture",
      type: "image",
      src: architectureImg,
      metadata: {
        camera: "Leica Q3",
        lens: "Summilux 28mm f/1.7 ASPH",
        aperture: "f/5.6",
        shutterSpeed: "1/500s",
        iso: "100",
        location: "Dongdaemun Design Plaza, Seoul",
        date: "2026-06-20"
      }
    },
    {
      id: "video-01",
      title: "Flowing Water Semiotics",
      description: "A cinemagraph-style loop of forest water rapids, expressing the continuous passage of time.",
      category: "video",
      type: "video",
      // High-quality public stock video URL (scenic nature stream)
      src: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4",
      poster: natureImg,
      metadata: {
        camera: "RED V-Raptor 8K",
        lens: "Zeiss Supreme Prime 50mm",
        aperture: "T/2.0",
        shutterSpeed: "1/100s (180° Shutter)",
        iso: "800",
        location: "Gangwon Valley, South Korea",
        date: "2026-06-01"
      }
    },
    {
      id: "video-02",
      title: "Urban Traffic Trails",
      description: "Time-lapse loop showcasing dynamic city light trails, contrasting motion with static architecture.",
      category: "video",
      type: "video",
      // Another high-quality public stock video
      src: "https://assets.mixkit.co/videos/preview/mixkit-night-time-lapse-of-a-busy-city-intersection-40615-large.mp4",
      poster: architectureImg,
      metadata: {
        camera: "Sony Alpha 7S III",
        lens: "FE 16-35mm F2.8 GM",
        aperture: "f/11",
        shutterSpeed: "2s (Time-lapse)",
        iso: "80",
        location: "Teheran-ro, Seoul",
        date: "2026-06-15"
      }
    }
  ]
};
