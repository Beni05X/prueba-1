import { StyleSheet } from 'react-native';

import { Colors, Radius, Sizes, Spacing } from '@/theme';

export const accountSectionStyles = StyleSheet.create({
  section: { gap: Spacing.two },
  form: { gap: Spacing.three },
  legalCopy: { gap: Spacing.five },
  confirmation: { marginTop: Spacing.four, gap: Spacing.three },
  centeredLink: { minHeight: Sizes.controlMinHeight, alignItems: 'center', justifyContent: 'center' },
  warning: { textAlign: 'center' },
  appearanceOption: { minHeight: Sizes.controlMinHeight, borderRadius: Radius.card, padding: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  optionCopy: { flex: 1, gap: Spacing.one },
  radio: { width: Spacing.three, height: Spacing.three, borderRadius: Spacing.two, borderWidth: Sizes.borderWidth },
  termsRow: { minHeight: Sizes.controlMinHeight, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  checkbox: { width: Spacing.three, height: Spacing.three, borderWidth: Sizes.borderWidth, borderColor: Colors.textSecondary },
});
