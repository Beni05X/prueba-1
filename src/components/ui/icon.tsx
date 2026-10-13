import { Image } from 'expo-image';

import { IconSizes } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

// Outline geometry renders the PDF's icons consistently with the installed Expo Image.
const paths = {
  home: '<path d="M3 11 12 3l9 8v10h-6v-7H9v7H3z"/>',
  catalog: '<path d="M4 4v16M8 4v16M12 4v16M16 4v16M20 4v16"/>',
  agenda: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6h5"/>',
  cart: '<path d="M2 3h3l3 13h11l3-9H6M8 19h11"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>',
  profile: '<circle cx="12" cy="12" r="8"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  'chevron-right': '<path d="m9 5 7 7-7 7"/>',
  'chevron-left': '<path d="m15 5-7 7 7 7"/>',
  service: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>',
  course: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h6M9 11h6M9 15h4"/>',
  product: '<path d="m12 2 10 10-10 10L2 12z"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
} as const;

export type IconName = keyof typeof paths;

// Android's Expo Image data-URL loader expects a base64 payload. SVG markup is ASCII.
function encodeSvg(markup: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let encoded = '';
  for (let index = 0; index < markup.length; index += 3) {
    const first = markup.charCodeAt(index);
    const second = markup.charCodeAt(index + 1) || 0;
    const third = markup.charCodeAt(index + 2) || 0;
    encoded += alphabet[first >> 2] + alphabet[((first & 3) << 4) | (second >> 4)]
      + (index + 1 < markup.length ? alphabet[((second & 15) << 2) | (third >> 6)] : '=')
      + (index + 2 < markup.length ? alphabet[third & 63] : '=');
  }
  return encoded;
}

export function Icon({ name, size = IconSizes.medium, color }: { name: IconName; size?: number; color?: string }) {
  const theme = useTheme();
  const iconColor = color ?? theme.text;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
  return <Image source={{ uri: `data:image/svg+xml;base64,${encodeSvg(svg)}` }} style={{ width: size, height: size }} contentFit="contain" accessible={false} />;
}
