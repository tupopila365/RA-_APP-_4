import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { plnService } from '../services/plnService';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatusStepper } from '../components/StatusStepper';

export default function PLNTrackingScreen({ navigation }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);

  const styles = getStyles(colors);

  const handleCheckStatus = async () => {
    if (!referenceId.trim() || !idNumber.trim()) {
      Alert.alert('Error', 'Please enter both Reference ID and ID Number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await plnService.trackApplication(referenceId.trim(), idNumber.trim());
      setApplication(result);
    } catch (error) {
      console.error('Error tracking application:', error);
      setError(error.message || 'Failed to track application. Please check your details.');
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Track Application</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Search Form */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Application Details</Text>
          <FormInput
            label="Reference ID"
            value={referenceId}
            onChangeText={setReferenceId}
            placeholder="Enter your reference ID"
            autoCapitalize="characters"
          />
          <FormInput
            label="ID Number"
            value={idNumber}
            onChangeText={setIdNumber}
            placeholder="Enter your ID number"
          />
          <Button
            label={loading ? 'Checking...' : 'Check Status'}
            onPress={handleCheckStatus}
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
            disabled={loading}
            style={styles.checkButton}
          />
        </Card>

        {/* Error Message */}
        {error && (
          <Card style={styles.errorCard}>
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </Card>
        )}

        {/* Application Details */}
        {application && (
          <>
            {/* Status Stepper */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Application Status</Text>
              <StatusStepper
                currentStatus={application.status}
                statusHistory={application.statusHistory || []}
              />
            </Card>

            {/* Application Information */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Application Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Reference ID:</Text>
                <Text style={styles.infoValue}>{application.referenceId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Applicant Name:</Text>
                <Text style={styles.infoValue}>{application.fullName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Submission Date:</Text>
                <Text style={styles.infoValue}>{formatDate(application.createdAt)}</Text>
              </View>
              {application.paymentDeadline && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment Deadline:</Text>
                  <Text style={[styles.infoValue, styles.deadlineText]}>
                    {formatDate(application.paymentDeadline)}
                  </Text>
                </View>
              )}
              {application.paymentReceivedAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment Received:</Text>
                  <Text style={styles.infoValue}>{formatDate(application.paymentReceivedAt)}</Text>
                </View>
              )}
            </Card>

            {/* Plate Choices */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Plate Choices</Text>
              {application.plateChoices?.map((choice, index) => (
                <View key={index} style={styles.plateChoiceItem}>
                  <Text style={styles.plateChoiceNumber}>Choice {index + 1}</Text>
                  <Text style={styles.plateChoiceText}>{choice.text}</Text>
                  <Text style={styles.plateChoiceMeaning}>{choice.meaning}</Text>
                </View>
              ))}
            </Card>

            {/* Admin Comments */}
            {application.adminComments && (
              <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Admin Comments</Text>
                <Text style={styles.commentsText}>{application.adminComments}</Text>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 20,
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    checkButton: {
      marginTop: 12,
    },
    errorCard: {
      backgroundColor: colors.error + '10',
      borderColor: colors.error,
      borderWidth: 1,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    errorText: {
      flex: 1,
      fontSize: 14,
      color: colors.error,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    infoValue: {
      fontSize: 16,
      color: colors.textSecondary,
      flex: 1,
      textAlign: 'right',
    },
    deadlineText: {
      color: colors.error,
      fontWeight: '600',
    },
    plateChoiceItem: {
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    plateChoiceNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    plateChoiceText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 4,
      letterSpacing: 2,
    },
    plateChoiceMeaning: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    commentsText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
    },
  });
}


