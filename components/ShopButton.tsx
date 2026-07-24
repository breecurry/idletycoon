import { Pressable, StyleSheet, Text } from 'react-native';


type ShopButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

const ShopButton = ({ label, onPress, disabled }: ShopButtonProps) => {
  return (
    <Pressable
    style={[styles.button, disabled && styles.buttonDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{label}</Text>
  </Pressable>
);
};

const styles = StyleSheet.create({
button: {
  backgroundColor: '#4ade80',
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 12,
},
buttonText: {
  color: '#1a1a2e',
  fontSize: 18,
  fontWeight: 'bold',
},
buttonDisabled: {
  backgroundColor: '#555566',
},
});

export default ShopButton;