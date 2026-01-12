import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

export default function ReportConfirmationScreen({ route }) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { referenceCode } = route.params || {};

  const styles = getStyles(colors);

  const handleViewReports = () => {
    navigation.navigate('MyReports');
  };

  const handleDone = () => {
    // Navigate to Home tab through MainTabs navigator
    navigation.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: {
          screen: 'Home',
        },
      })
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.success }]}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </View>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Report Submitted Successfully!</Text>
        <Text style={styles.message}>
          Thank you for helping improve road safety. Your report has been received and will be reviewed by our team.
        </Text>

        {/* Reference Code */}
        {referenceCode && (
          <View style={styles.referenceContainer}>
            <Text style={styles.referenceLabel}>Reference Code</Text>
            <View style={styles.referenceCodeBox}>
              <Text style={styles.referenceCode}>{referenceCode}</Text>
            </View>
            <Text style={styles.referenceNote}>
              Save this code to track your report status
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleViewReports}
          >
            <Ionicons name="list-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>View My Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleDone}
          >
            <Text style={styles.secondaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    iconContainer: {
      marginBottom: 32,
    },
    iconCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    message: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
    },
    referenceContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 32,
    },
    referenceLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    referenceCodeBox: {
      backgroundColor: colors.primary,
      paddingVertical: 18,
      paddingHorizontal: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.primary,
      marginBottom: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    referenceCode: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 2,
      fontFamily: 'monospace',
    },
    referenceNote: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    buttonContainer: {
      width: '100%',
      gap: 12,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 8,
      gap: 8,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border || '#E0E0E0',
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });
}

