import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function PLNInfoScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleApply = () => {
    navigation.navigate('PLNApplication');
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
            <Text style={styles.headerTitle}>Personalized Number Plates</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* What is PLN Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>What is a PLN?</Text>
          <Text style={styles.sectionText}>
            A Personalized Number Plate (PLN) is a licence number of your choice for your vehicle.
            You can select a custom combination of letters and numbers to personalize your vehicle's
            registration plate.
          </Text>
        </Card>

        {/* Rules Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Rules</Text>
          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.ruleText}>Maximum 7 alphanumeric characters</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.ruleText}>Followed by Namibian flag + NA</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.ruleText}>
                Must not be obscene, indecent, or offensive
              </Text>
            </View>
          </View>
        </Card>

        {/* Application Overview Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Application Overview</Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Complete the application form</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Provide 3 plate choices and meanings</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Submit at NaTIS / Registering Authority office</Text>
            </View>
          </View>
        </Card>

        {/* Fees & Deadlines Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Fees & Deadlines</Text>
          <View style={styles.feesList}>
            <View style={styles.feeItem}>
              <Ionicons name="cash-outline" size={24} color={colors.primary} />
              <View style={styles.feeContent}>
                <Text style={styles.feeLabel}>Application Fee</Text>
                <Text style={styles.feeAmount}>N$2,000</Text>
                <Text style={styles.feeNote}>Pay offline at NaTIS</Text>
              </View>
            </View>
            <View style={styles.feeItem}>
              <Ionicons name="time-outline" size={24} color={colors.primary} />
              <View style={styles.feeContent}>
                <Text style={styles.feeLabel}>Payment Deadline</Text>
                <Text style={styles.feeAmount}>21 days after approval</Text>
              </View>
            </View>
            <View style={styles.feeItem}>
              <Ionicons name="construct-outline" size={24} color={colors.primary} />
              <View style={styles.feeContent}>
                <Text style={styles.feeLabel}>Plate Manufacturing</Text>
                <Text style={styles.feeAmount}>Max 5 working days</Text>
              </View>
            </View>
            <View style={styles.feeItem}>
              <Ionicons name="refresh-outline" size={24} color={colors.primary} />
              <View style={styles.feeContent}>
                <Text style={styles.feeLabel}>Renewal Fee</Text>
                <Text style={styles.feeAmount}>N$280 annually</Text>
              </View>
            </View>
            <View style={styles.feeItem}>
              <Ionicons name="copy-outline" size={24} color={colors.primary} />
              <View style={styles.feeContent}>
                <Text style={styles.feeLabel}>Duplicate Plate Fee</Text>
                <Text style={styles.feeAmount}>N$240</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Apply Button */}
        <View style={styles.buttonContainer}>
          <Button
            label="Apply for PLN"
            onPress={handleApply}
            variant="primary"
            size="large"
            fullWidth
            iconName="document-text-outline"
          />
        </View>
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
      marginBottom: 12,
    },
    sectionText: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    rulesList: {
      gap: 12,
    },
    ruleItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    ruleText: {
      flex: 1,
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    stepsList: {
      gap: 16,
    },
    stepItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    stepNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepNumberText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    stepText: {
      flex: 1,
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    feesList: {
      gap: 16,
    },
    feeItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    feeContent: {
      flex: 1,
    },
    feeLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    feeAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 2,
    },
    feeNote: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    buttonContainer: {
      marginTop: 10,
      marginBottom: 20,
    },
  });
}


