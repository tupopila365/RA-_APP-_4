import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function PLNConfirmationScreen({ route }) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { referenceId } = route.params || {};
  const styles = getStyles(colors);

  const handleTrackStatus = () => {
    navigation.navigate('PLNTracking');
  };

  const handleDone = () => {
    navigation.navigate('PLNInfo');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4ECDC4" />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Application Submitted Successfully!</Text>
        <Text style={styles.message}>
          Your PLN application has been received and will be reviewed by our team.
        </Text>

        {/* Reference ID */}
        {referenceId && (
          <Card style={styles.referenceContainer}>
            <Text style={styles.referenceLabel}>Reference ID</Text>
            <View style={styles.referenceCodeBox}>
              <Text style={styles.referenceCode}>{referenceId}</Text>
            </View>
            <Text style={styles.referenceNote}>
              Save this reference ID to track your application status
            </Text>
          </Card>
        )}

        {/* Payment Instructions */}
        <Card style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Payment Instructions</Text>
          <Text style={styles.instructionsText}>
            Once your application is approved, you will need to pay N$2,000 at any NaTIS office
            within 21 days. Plates will be manufactured after payment is received.
          </Text>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            label="Track Application Status"
            onPress={handleTrackStatus}
            variant="primary"
            size="large"
            fullWidth
            iconName="search-outline"
          />

          <Button
            label="Done"
            onPress={handleDone}
            variant="outline"
            size="large"
            fullWidth
          />
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
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
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
      marginBottom: 20,
      padding: 20,
    },
    referenceLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      fontWeight: '600',
    },
    referenceCodeBox: {
      backgroundColor: colors.background,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.primary,
      marginBottom: 8,
      width: '100%',
      alignItems: 'center',
    },
    referenceCode: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      letterSpacing: 1,
    },
    referenceNote: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    instructionsContainer: {
      width: '100%',
      marginBottom: 32,
      padding: 20,
    },
    instructionsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    instructionsText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    buttonContainer: {
      width: '100%',
      gap: 12,
    },
  });
}


