import '@/global.css';

export const Colors = {
  primary: '#ED4087',
  primarySoft: '#FFE8F2',
  text: '#1F1419',
  textSecondary: '#7B7479',
  background: '#FCFAFC',
  backgroundElement: '#FFFFFF',
  backgroundSelected: '#F3EDF1',
  onPrimary: '#ffffff',
  border: '#E9E4E7',
  inactive: '#8E888D',
  success: '#329D6A',
} as const;

export type ThemeColor = keyof typeof Colors;

export const Fonts = {
  regular: 'Inter-Regular',
  bold: 'Inter-Bold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  control: 12,
  card: 16,
} as const;

export const Sizes = {
  text: { title: 24, subtitle: 18, body: 14, small: 12, code: 11, tab: 10 },
  lineHeight: { title: 32, subtitle: 26, body: 22, small: 18, code: 16, tab: 16 },
  controlMinHeight: 48,
  touchMinWidth: 44,
  borderWidth: 1,
  maxContentWidth: 600,
  mediaHero: 180,
  mediaThumbnail: 72,
  mediaCardHeight: 88,
  categoryMinHeight: 88,
  avatar: 56,
  tabBarMinHeight: 64,
} as const;

// Use small icons inline, medium icons in controls, and large icons for emphasis.
// Interactive icons still need the minimum touch area defined in Sizes.
export const IconSizes = {
  small: Spacing.three,
  medium: Spacing.four,
  large: Spacing.five,
} as const;

export const IconColors = {
  default: Colors.text,
  secondary: Colors.textSecondary,
  active: Colors.primary,
  onPrimary: Colors.onPrimary,
} as const;

// Each static font file already contains its weight; avoid synthesizing other weights.
const regularText = { fontFamily: Fonts.regular, fontWeight: 'normal' } as const;
const boldText = { fontFamily: Fonts.bold, fontWeight: 'normal' } as const;

export const Typography = {
  body: { ...regularText, fontSize: Sizes.text.body, lineHeight: Sizes.lineHeight.body },
  title: { ...boldText, fontSize: Sizes.text.title, lineHeight: Sizes.lineHeight.title },
  subtitle: { ...boldText, fontSize: Sizes.text.subtitle, lineHeight: Sizes.lineHeight.subtitle },
  small: { ...regularText, fontSize: Sizes.text.small, lineHeight: Sizes.lineHeight.small },
  smallBold: { ...boldText, fontSize: Sizes.text.small, lineHeight: Sizes.lineHeight.small },
  label: { ...boldText, fontSize: Sizes.text.small, lineHeight: Sizes.lineHeight.small },
  action: { ...boldText, fontSize: Sizes.text.body, lineHeight: Sizes.lineHeight.body },
  auxiliary: { ...regularText, fontSize: Sizes.text.code, lineHeight: Sizes.lineHeight.code },
  tab: { ...boldText, fontSize: Sizes.text.tab, lineHeight: Sizes.lineHeight.tab },
  link: { ...boldText, fontSize: Sizes.text.small, lineHeight: Sizes.lineHeight.body },
  code: { ...regularText, fontSize: Sizes.text.code, lineHeight: Sizes.lineHeight.code },
} as const;

const regularNavigationFont = { fontFamily: Fonts.regular, fontWeight: '400' } as const;
const boldNavigationFont = { fontFamily: Fonts.bold, fontWeight: '400' } as const;

export const NavigationFonts = {
  regular: regularNavigationFont,
  medium: boldNavigationFont,
  bold: boldNavigationFont,
  heavy: boldNavigationFont,
} as const;

export const Surfaces = {
  screen: Colors.background,
  card: Colors.backgroundElement,
  control: Colors.backgroundElement,
} as const;

export const ControlStates = {
  opacity: { default: 1, pressed: 0.8, disabled: 0.5 },
  secondaryPressedBackground: Colors.backgroundSelected,
  focusBorder: Colors.primary,
} as const;
