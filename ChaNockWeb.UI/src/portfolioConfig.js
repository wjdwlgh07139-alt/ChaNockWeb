// Photographer Portfolio Configuration
// Modify this file to easily update the website content, categories, and media items.

import img1 from './assets/KakaoTalk_20260709_232335850.jpg'
import img2 from './assets/KakaoTalk_20260709_232335850_01.jpg'
import img3 from './assets/KakaoTalk_20260709_232335850_02.jpg'
import img4 from './assets/KakaoTalk_20260709_232335850_03.jpg'
import img5 from './assets/KakaoTalk_20260709_232335850_04.jpg'

export const portfolioConfig = {
  // Website branding and headers
  brandName: "Cha Nok",
  photographerName: "Cha Nok",
  photographerTitle: "photographer based in Korea",
  bio: "Cha Nok (2004) photographer based in Korea.",
  
  // Contact & Social links
  email: "kimchanokphoto@gmail.com",
  instagram: "https://www.instagram.com/kimchanok?igsh=MWNxcXo2OXNnZXhvdw==",
  behance: "https://behance.net",
  github: "https://github.com",
  
  // Available categories (English labels for a premium feel)
  categories: [
    { id: "completed", label: "WORKS #1" },
    { id: "in-progress", label: "WORKS #2" },
    { id: "exhibition", label: "EXHIBITIONS" },
    { id: "about", label: "ABOUT" }
  ],

  // Theme defaults
  defaultTheme: {
    primaryColor: "#000000",
    bgColor: "#FAF6EC",       // Warm cream/ivory tone with a hint of yellow
    textColor: "#222222",
    fontSans: "'Apple SD Gothic Neo', 'AppleSDGothicNeo', 'Malgun Gothic', sans-serif"
  },

  // Media items list (WORKS #2 is empty, WORKS #1 subtitle changed to Taboo / 2026)
  items: [
    {
      id: "work1-01",
      title: "Silent Space I",
      subtitle: "Taboo / 2026",
      category: "completed",
      type: "image",
      src: img1,
      metadata: { camera: "Sony Alpha", location: "Korea", date: "2026" }
    },
    {
      id: "work1-02",
      title: "Silent Space II",
      subtitle: "Taboo / 2026",
      category: "completed",
      type: "image",
      src: img2,
      metadata: { camera: "Sony Alpha", location: "Korea", date: "2026" }
    },
    {
      id: "work1-03",
      title: "Silent Space III",
      subtitle: "Taboo / 2026",
      category: "completed",
      type: "image",
      src: img3,
      metadata: { camera: "Sony Alpha", location: "Korea", date: "2026" }
    },
    {
      id: "work1-04",
      title: "Silent Space IV",
      subtitle: "Taboo / 2026",
      category: "completed",
      type: "image",
      src: img4,
      metadata: { camera: "Sony Alpha", location: "Korea", date: "2026" }
    },
    {
      id: "work1-05",
      title: "Silent Space V",
      subtitle: "Taboo / 2026",
      category: "completed",
      type: "image",
      src: img5,
      metadata: { camera: "Sony Alpha", location: "Korea", date: "2026" }
    }
  ],

  // Exhibition list (Cleared per request)
  exhibitions: []
};
