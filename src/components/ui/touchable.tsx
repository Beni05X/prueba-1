import { forwardRef } from 'react';
import { Pressable, type PressableProps, type View } from 'react-native';

import { ControlStates, Sizes } from '@/theme';

// Link's asChild slot merges static styles. Keep the pressed callback inside
// this component so Expo Router cannot flatten it into an empty style object.
type TouchableProps = PressableProps & { selected?: boolean };

export const Touchable = forwardRef<View, TouchableProps>(function Touchable(
  { style, disabled, selected, ...props },
  ref,
) {
  return (
    <Pressable
      ref={ref}
      {...props}
      disabled={disabled}
      accessibilityRole={selected === undefined ? props.accessibilityRole : 'tab'}
      accessibilityState={selected === undefined ? props.accessibilityState : { ...props.accessibilityState, selected }}
      style={(state) => [
        {
          minWidth: Sizes.touchMinWidth,
          minHeight: Sizes.controlMinHeight,
          opacity: disabled ? ControlStates.opacity.disabled : state.pressed ? ControlStates.opacity.pressed : ControlStates.opacity.default,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
    />
  );
});
