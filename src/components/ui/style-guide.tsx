import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useMediaViewModel } from '@/shared/viewmodels/use-media-view-model';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Touchable } from '@/components/ui/touchable';
import { Colors, ControlStates, IconSizes, Radius, Sizes, Spacing, Typography } from '@/theme';
import { useTheme } from '@/hooks/use-theme';
import type { JsonValue } from '@/shared/models/json-value';
import { imageUri } from '@/shared/viewmodels/media-state';

export { imageUri } from '@/shared/viewmodels/media-state';

export { Icon } from '@/components/ui/icon';

export function SearchField({ placeholder = 'Buscar...', value, onChangeText, onSubmitEditing }: { placeholder?: string; value?: string; onChangeText?: (value: string) => void; onSubmitEditing?: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.search, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Icon name="search" color={theme.textSecondary} size={IconSizes.small} />
      <TextInput
        accessibilityLabel={placeholder}
        accessibilityHint="Escribe un término para filtrar los resultados"
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.primary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing ? () => onSubmitEditing() : undefined}
        returnKeyType={onSubmitEditing ? 'search' : 'done'}
        style={[styles.searchInput, { color: theme.text }]}
      />
    </View>
  );
}

export function SegmentedControl({ options, selected, onSelect }: { options: readonly string[]; selected: string; onSelect: (value: string) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {options.map((option) => (
        <Pressable
          key={option}
          accessibilityRole="tab"
          accessibilityState={{ selected: selected === option }}
          onPress={() => onSelect(option)}
          style={({ pressed }) => [styles.segment, { backgroundColor: selected === option ? theme.primary : theme.backgroundElement }, pressed && styles.pressed]}>
          <ThemedText type="label" themeColor={selected === option ? 'onPrimary' : 'textSecondary'} style={styles.center}>{option}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

export function ChoiceChips({ options, selected, onSelect, disabled = false }: { options: readonly { value: string; label: string }[]; selected: string | null; onSelect: (value: string) => void; disabled?: boolean }) {
  const theme = useTheme();
  return <View style={styles.chips} accessibilityRole="radiogroup">{options.map((option) => <Pressable key={option.value} disabled={disabled} accessibilityRole="radio" accessibilityState={{ selected: option.value === selected, disabled }} onPress={() => onSelect(option.value)} style={({ pressed }) => [styles.chip, { backgroundColor: option.value === selected ? theme.primary : theme.backgroundElement, borderColor: option.value === selected ? theme.primary : theme.border }, pressed && styles.pressed]}><ThemedText type="label" themeColor={option.value === selected ? 'onPrimary' : 'text'}>{option.label}</ThemedText></Pressable>)}</View>;
}

export function MediaPlaceholder({ label, compact = false, source, fillWidth = false }: { label?: string; compact?: boolean; source?: JsonValue; fillWidth?: boolean }) {
  return <MediaContent key={imageUri(source) ?? 'missing'} label={label} compact={compact} source={source} fillWidth={fillWidth} />;
}
function MediaContent({ label, compact, source, fillWidth }: { label?: string; compact: boolean; source?: JsonValue; fillWidth: boolean }) {
  const theme = useTheme();
  const { uri, showImage, onError } = useMediaViewModel(source);
  return (
    <View style={[styles.media, { backgroundColor: showImage ? theme.primarySoft : theme.backgroundElement }, fillWidth ? styles.cardMedia : compact ? styles.thumbnail : styles.hero]} accessible accessibilityLabel={showImage ? label ?? 'Imagen' : 'Imagen'}>
      {showImage ? <Image source={{ uri }} contentFit="cover" accessibilityLabel={label} onError={onError} style={styles.image} /> : <ThemedText type="label" themeColor="textSecondary">Imagen</ThemedText>}
    </View>
  );
}

type CatalogCardProps = {
  title: string;
  description?: string;
  price: string;
  kind: 'service' | 'course' | 'product';
  href?: Href;
  compact?: boolean;
  image?: JsonValue;
};

export function CatalogCard({ title, description, price, kind, href, compact = false, image }: CatalogCardProps) {
  const theme = useTheme();
  const content = (
    <>
      <MediaPlaceholder label={title} compact source={image} fillWidth={compact} />
      <View style={styles.cardCopy}>
        <ThemedText type="action">{title}</ThemedText>
        {!compact && description ? <ThemedText type="small" themeColor="textSecondary">{description}</ThemedText> : null}
        <View style={styles.row}>
          <ThemedText type="label" themeColor="primary" style={styles.grow}>{price}</ThemedText>
          {!compact && href ? <ThemedText type="label" themeColor="primary">Ver</ThemedText> : null}
        </View>
      </View>
    </>
  );
  const cardStyle = [styles.catalogCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }, compact ? styles.stackedCard : styles.row];
  if (href) {
    return <Link href={href} asChild><Touchable accessibilityRole="button" accessibilityLabel={`Ver ${title}`} style={StyleSheet.flatten(cardStyle)}>{content}</Touchable></Link>;
  }
  return <View style={cardStyle} accessibilityLabel={`${kind === 'service' ? 'Servicio' : kind === 'course' ? 'Curso' : 'Producto'}: ${title}`}>{content}</View>;
}

export function SectionHeading({ title, href, action = 'Ver todos' }: { title: string; href?: Href; action?: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="subtitle" accessibilityRole="header" style={styles.grow}>{title}</ThemedText>
      {href ? <Link href={href} asChild><Pressable accessibilityRole="link" accessibilityLabel={`${action}: ${title}`} style={styles.textAction}><ThemedText type="label" themeColor="primary">{action}</ThemedText></Pressable></Link> : null}
    </View>
  );
}

export function MenuRow({ label, description, href, emphasized = false, destructive = false }: { label: string; description?: string; href?: Href; emphasized?: boolean; destructive?: boolean }) {
  const theme = useTheme();
  const content = (
    <>
      <View style={styles.grow}>
        <ThemedText type={description || emphasized ? 'action' : 'label'} themeColor={destructive ? 'primary' : 'text'}>{label}</ThemedText>
        {description ? <ThemedText type="small" themeColor="textSecondary">{description}</ThemedText> : null}
      </View>
      <Icon name="chevron-right" size={IconSizes.small} color={theme.inactive} />
    </>
  );
  if (href) {
    return <Link href={href} asChild><Touchable accessibilityRole="button" accessibilityLabel={label} style={StyleSheet.flatten([styles.menuRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }])}>{content}</Touchable></Link>;
  }
  return <View style={[styles.menuRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>{content}</View>;
}

export function InfoRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.row}>
      <ThemedText type="label" themeColor="textSecondary" style={styles.grow}>{label}</ThemedText>
      <ThemedText type={accent ? 'subtitle' : 'default'} themeColor={accent ? 'primary' : 'text'} style={styles.infoValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  grow: { flex: 1 },
  center: { textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pressed: { opacity: ControlStates.opacity.pressed },
  search: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, backgroundColor: Colors.backgroundElement, borderWidth: Sizes.borderWidth, borderColor: Colors.border, borderRadius: Radius.control, paddingHorizontal: Spacing.three, minHeight: Sizes.controlMinHeight },
  searchInput: { ...Typography.body, color: Colors.text, flex: 1, minHeight: Sizes.controlMinHeight, paddingVertical: Spacing.two },
  tabs: { flexDirection: 'row', gap: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { backgroundColor: Colors.backgroundElement, borderColor: Colors.border, borderWidth: Sizes.borderWidth, borderRadius: Radius.control * 2, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, minHeight: Sizes.controlMinHeight, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  segment: { flex: 1, minHeight: Sizes.controlMinHeight, minWidth: Sizes.touchMinWidth, borderRadius: Radius.control * 2, backgroundColor: Colors.backgroundElement, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.two, paddingVertical: Spacing.two },
  segmentActive: { backgroundColor: Colors.primary },
  media: { backgroundColor: Colors.primarySoft, borderRadius: Radius.card, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%', borderRadius: Radius.card },
  thumbnail: { width: Sizes.mediaThumbnail, height: Sizes.mediaThumbnail },
  hero: { width: '100%', height: Sizes.mediaHero },
  cardMedia: { width: '100%', height: Sizes.mediaCardHeight },
  catalogCard: { backgroundColor: Colors.backgroundElement, borderWidth: Sizes.borderWidth, borderColor: Colors.border, borderRadius: Radius.card, padding: Spacing.two, gap: Spacing.three },
  stackedCard: { flexDirection: 'column', flex: 1, gap: Spacing.two },
  cardCopy: { flex: 1, gap: Spacing.one },
  textAction: { minHeight: Sizes.controlMinHeight, minWidth: Sizes.touchMinWidth, alignItems: 'center', justifyContent: 'center' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, backgroundColor: Colors.backgroundElement, borderRadius: Radius.control, borderWidth: Sizes.borderWidth, borderColor: Colors.border, minHeight: Sizes.controlMinHeight, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  infoValue: { flexShrink: 1, textAlign: 'right', maxWidth: '65%' },
});
