import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { formatMoney } from '../utils/format';
type HeaderProps = {
  money: number;
  incomePerSecond: number;
};
const Header = ({ money, incomePerSecond }: HeaderProps) => {
  return (
    <View style={styles.header}>
      <Text style={styles.money}>${formatMoney(money)}</Text>
      <Text style={styles.income}>+${formatMoney(incomePerSecond)}/sec</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  header: {
    paddingTop: 70,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  money: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.green,
  },
  income: {
    fontSize: 18,
    color: COLORS.gray,
  },
});
export default Header;