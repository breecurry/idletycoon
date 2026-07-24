import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

type StatRowProps = {
    label: string;
    detail: string;
};

const StatRow = ({ label, detail }: StatRowProps) => {
    return (
        <Text style={styles.text}>
            {label} ({detail})
        </Text>
    );
};
const styles = StyleSheet.create({
    text: {
        fontSize: 18,
        color: COLORS.gray,
    },
});
export default StatRow;