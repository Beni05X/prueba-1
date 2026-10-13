import { StyleSheet, Text, type TextProps } from 'react-native';

import { Typography, type ThemeColor } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code' | 'label' | 'action' | 'auxiliary';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        {
          color: theme[themeColor ?? (type === 'link' || type === 'linkPrimary' ? 'primary' : 'text')],
        },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        type === 'label' && styles.label,
        type === 'action' && styles.action,
        type === 'auxiliary' && styles.auxiliary,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: Typography.small,
  smallBold: Typography.smallBold,
  label: Typography.label,
  action: Typography.action,
  auxiliary: Typography.auxiliary,
  default: Typography.body,
  title: Typography.title,
  subtitle: Typography.subtitle,
  link: {
    ...Typography.link,
    textDecorationLine: 'underline',
  },
  linkPrimary: {
    ...Typography.link,
    textDecorationLine: 'underline',
  },
  code: {
    ...Typography.code,
  },
});
