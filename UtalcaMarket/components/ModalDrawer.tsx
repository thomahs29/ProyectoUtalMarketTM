import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { DrawerContent } from './DrawerContent';

interface ModalDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export const ModalDrawer: React.FC<ModalDrawerProps> = ({ visible, onClose }) => {
  const drawerWidth = Dimensions.get('window').width * 0.75;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay semitransparente */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Drawer content - no cierra al hacer click */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={[styles.drawerContainer, { width: drawerWidth }]}
        >
          <DrawerContent
            navigation={undefined as any}
            onClose={onClose}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  drawerContainer: {
    backgroundColor: '#fff',
    height: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 3, height: 0 },
  },
});
