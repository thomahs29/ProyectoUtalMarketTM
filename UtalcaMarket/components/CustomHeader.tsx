import { IconSymbol } from '@/components/ui/icon-symbol';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DrawerNavigation = DrawerNavigationProp<any>;

interface CustomHeaderProps {
  title?: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ title = "UtalcaMarket" }) => {
  const navigation = useNavigation<DrawerNavigation>();

  const toggleDrawer = () => {
    navigation.toggleDrawer();
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
        <IconSymbol name={"navicon" as any} size={24} color="#1F2937" />
      </TouchableOpacity>
      
      <Text style={styles.title}>{title}</Text>
      
      {/* Espacio vacío para balancear el layout */}
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    height: 60,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  spacer: {
    width: 48, // Mismo ancho que el botón del menú para centrar el título
  },
});

export default CustomHeader;