// filepath: /Users/brayan/Sites/juice-finder/src/app/fonts.ts
/**
 * Configuration des fonts personnalisées avec Next.js
 */

import localFont from 'next/font/local';

export const owners = localFont({
  src: [
    {
      path: '../../public/assets/webfonts/owners-font-family/OwnersTRIAL-Regular-BF64361ef86ac54.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/assets/webfonts/owners-font-family/OwnersTRIAL-Bold-BF64361ef8ad10f.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/assets/webfonts/owners-font-family/OwnersTRIAL-Black-BF64361ef89adb0.otf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-owners',
  display: 'swap',
});

export const ownersWide = localFont({
  src: [
    {
      path: '../../public/assets/webfonts/owners-font-family/OwnersTRIALWide-Bold-BF64361ef5bf162.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/assets/webfonts/owners-font-family/OwnersTRIALWide-Black-BF64361ef56b4a9.otf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-owners-wide',
  display: 'swap',
});

