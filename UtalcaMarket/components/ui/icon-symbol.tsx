// Fallback for using MaterialIcons, EvilIcons, and Ionicons on Android and web.

import React, { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { MaterialIcons, EvilIcons, Ionicons, Entypo } from '@expo/vector-icons';

// Define the available icon sets
type IconSet = 'MaterialIcons' | 'EvilIcons' | 'Ionicons' | 'Entypo';

// Define the structure for an icon mapping: [IconSet, IconName]
type IconMapValue = [IconSet, string];

// Define the main mapping type from SF Symbol name to our custom mapping value
type IconMapping = Record<SymbolViewProps['name'], IconMapValue>;

// Define the type for a valid SF Symbol name based on our mapping
type IconSymbolName = keyof typeof MAPPING;

/**
 * Agrega tus mapeos de SF Symbols a los íconos de MaterialIcons, EvilIcons o Ionicons aquí.
 * Para encontrar los nombres de los íconos:
 * - MaterialIcons, EvilIcons, Ionicons: consulta el [Directorio de Íconos de Expo](https://icons.expo.fyi).
 * - SF Symbols: utiliza la aplicación [SF Symbols](https://developer.apple.com/sf-symbols/).
 *
 * El formato es: 'sf-symbol-name': ['IconSet', 'icon-name-in-that-set']
 */
const MAPPING = {
  // --- MaterialIcons ---
  'house.fill': ['MaterialIcons', 'home'],
  'paperplane.fill': ['MaterialIcons', 'send'],
  'chevron.left.forwardslash.chevron.right': ['MaterialIcons', 'code'],
  'chevron.right': ['MaterialIcons', 'chevron-right'],
  'person.fill': ['MaterialIcons', 'person'],
  'trash.fill': ['Ionicons', 'trash-outline'],
  'gearshape.fill': ['Ionicons', 'settings-sharp'],
  'checkmark.circle.fill': ['Ionicons', 'checkmark-circle'],
  'add-circle.fill': ['Ionicons', 'add-circle'],
  'pencil': ['EvilIcons', 'pencil'],
  'magnifyingglass': ['EvilIcons', 'search'],
  'heart': ['EvilIcons', 'heart'],
  'star': ['EvilIcons', 'star'],
  'navicon': ['EvilIcons', 'navicon'],
  'grid': ['Entypo', 'grid'],
  'logout': ['MaterialIcons', 'logout'],

} as const satisfies IconMapping;


/**
 * Un componente de ícono que utiliza SF Symbols nativos en iOS y los íconos
 * de MaterialIcons, EvilIcons o Ionicons en Android y la web.
 * Esto asegura una apariencia consistente entre plataformas y un uso óptimo de recursos.
 * Los nombres (`name`) de los íconos se basan en SF Symbols y requieren un mapeo manual.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight; // 'weight' is kept for API consistency but not used by fallback components
}) {
  const mapping = MAPPING[name];

  // Si no se encuentra un mapeo, no renderizar nada y advertir en la consola.
  if (!mapping) {
    console.warn(`[IconSymbol] No se encontró un mapeo para el SF Symbol: "${name}"`);
    return null;
  }

  const [iconSet, iconName] = mapping;

  // Renderiza el componente de ícono correcto basado en el mapeo
  switch (iconSet) {
    case 'MaterialIcons':
      return <MaterialIcons color={color} size={size} name={iconName as ComponentProps<typeof MaterialIcons>['name']} style={style} />;
    case 'EvilIcons':
      return <EvilIcons color={color} size={size} name={iconName as ComponentProps<typeof EvilIcons>['name']} style={style} />;
    case 'Ionicons':
      return <Ionicons color={color} size={size} name={iconName as ComponentProps<typeof Ionicons>['name']} style={style} />;
    case 'Entypo':
      return <Entypo color={color} size={size} name={iconName as ComponentProps<typeof Entypo>['name']} style={style} />;
    default:
      // En caso de que se agregue un nuevo IconSet sin un case correspondiente.
      return null;
  }
}
