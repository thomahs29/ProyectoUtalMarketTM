import React from 'react';
import {
    Dimensions,
    GestureResponderEvent,
    Modal,
    StyleSheet,
    View
} from 'react-native';
import { DrawerContent } from './DrawerContent';

interface ModalDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export const ModalDrawer: React.FC<ModalDrawerProps> = ({ visible, onClose }) => {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.drawerContainer}>
          <DrawerContent
            navigation={undefined as any}
            onClose={onClose}
          />
        </View>
        <View style={styles.spacer} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row' as any,
  },
  drawerContainer: {
    backgroundColor: '#fff',
    width: '75%',
    height: '100%',
  },
  spacer: {
    flex: 1,
  },
});
