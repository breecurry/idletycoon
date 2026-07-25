import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/colors';

type ShopButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  hint?: string;
};

const ShopButton = ({ label, onPress, disabled, hint }: ShopButtonProps) => {
  return (
    <Pressable
    style={({ pressed }) => [
      styles.button,
      disabled && styles.buttonDisabled,
      pressed && styles.buttonPressed,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{label}</Text>
    {disabled && hint && <Text style={styles.hint}>{hint}</Text>}
  </Pressable>
);
};

const styles = StyleSheet.create({
button: {
  backgroundColor: COLORS.green,
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 12,
  alignItems: 'center',
},
buttonText: {
  color: COLORS.background,
  fontSize: 18,
  fontWeight: 'bold',
},
buttonDisabled: {
  backgroundColor: COLORS.disabled,
},
buttonPressed: {
  transform: [{ scale: 0.96 }],
  opacity: 0.85,
},
hint: {
  color: COLORS.background,
  fontSize: 13,
  opacity: 0.7,
  marginTop: 2,
}
});

export default ShopButton;