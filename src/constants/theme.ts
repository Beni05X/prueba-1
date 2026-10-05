import '@/global.css';

export const Colors = {
  primary: '#ED4087',
  text: '#000000',
  textSecondary: '#60646C',
  background: '#ffffff',
  backgroundElement: '#F0F0F3',
  backgroundSelected: '#E0E1E6',
  onPrimary: '#ffffff',
  border: '#E0E1E6',
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
  text: { title: 28, subtitle: 20, body: 16, small: 14, code: 12 },
  lineHeight: { title: 36, subtitle: 28, body: 24, small: 20, code: 18 },
  controlMinHeight: 48,
  touchMinWidth: 44,
  borderWidth: 1,
  maxContentWidth: 800,
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
  control: Colors.background,
} as const;

export const ControlStates = {
  opacity: { default: 1, pressed: 0.8, disabled: 0.5 },
  secondaryPressedBackground: Colors.backgroundSelected,
  focusBorder: Colors.primary,
} as const;
