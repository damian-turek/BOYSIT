import type { StaticImageData } from 'next/image'

import Allegro from '@/assets/company-logos/allegro.svg'
import Booking from '@/assets/company-logos/bookingdotcom.svg'
import CdProjekt from '@/assets/company-logos/cdprojekt.svg'
import Klarna from '@/assets/company-logos/klarna.svg'
import Revolut from '@/assets/company-logos/revolut.svg'
import Sap from '@/assets/company-logos/sap.svg'
import Spotify from '@/assets/company-logos/spotify.svg'
import Zabka from '@/assets/company-logos/zabka.svg'
import Zalando from '@/assets/company-logos/zalando.svg'

export type CompanyLogo = {
  name: string
  logo: StaticImageData
  wordmark?: boolean
}

export const COMPANY_LOGOS = [
  { name: 'Allegro', logo: Allegro, wordmark: true },
  { name: 'Spotify', logo: Spotify },
  { name: 'Żabka', logo: Zabka, wordmark: true },
  { name: 'Revolut', logo: Revolut },
  { name: 'CD Projekt', logo: CdProjekt },
  { name: 'Klarna', logo: Klarna },
  { name: 'Zalando', logo: Zalando },
  { name: 'Booking.com', logo: Booking },
  { name: 'SAP', logo: Sap },
] satisfies CompanyLogo[]
