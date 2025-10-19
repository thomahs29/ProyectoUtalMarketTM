import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';

type Props = TextProps & { type?: 'title' | 'subtitle' | 'defaultSemiBold' };

export const ThemedText: React.FC<Props> = ({ children, style, type, ...rest }) => {
  const composed: (TextStyle | undefined)[] = [styles.default];
  if (type === 'title') composed.push(styles.title);
  if (type === 'subtitle') composed.push(styles.subtitle);
  if (type === 'defaultSemiBold') composed.push(styles.semiBold);

  return (
    <Text style={[...composed, style as TextStyle]} {...rest}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  default: { color: '#111' } as TextStyle,
  title: { fontSize: 20, fontWeight: '600' } as TextStyle,
  subtitle: { fontSize: 16, fontWeight: '500' } as TextStyle,
  semiBold: { fontWeight: '600' } as TextStyle,
});

export default ThemedText;
