import * as Haptics from 'expo-haptics';
import React, { type ComponentProps } from 'react';
import { Pressable } from 'react-native';

export function HapticTab(props: ComponentProps<typeof Pressable>) {
  return (
    <Pressable
      {...props}
      onPress={(e) => {
        // Use the `HapticTab` component from the bottom tab navigator so that the tab press vibration is consistent with the native tab bar behavior. Thanks!
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPress?.(e);
      }}
    />
  );
}
