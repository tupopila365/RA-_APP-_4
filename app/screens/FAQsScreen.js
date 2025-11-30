import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';

export default function FAQsScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I apply for a driver\'s license?',
      answer: 'You can apply for a driver\'s license through NATIS online or visit any Roads Authority office. You will need to complete the application form, provide required documents, and pass the driving test.',
    },
    {
      id: 2,
      question: 'What documents do I need for vehicle registration?',
      answer: 'For vehicle registration, you need: proof of identity, proof of residence, vehicle import documents (if applicable), and proof of payment for applicable fees.',
    },
    {
      id: 3,
      question: 'How can I check my vehicle registration status?',
      answer: 'You can check your vehicle registration status through NATIS online portal or by visiting any Roads Authority office with your vehicle registration number.',
    },
    {
      id: 4,
      question: 'What are the operating hours of Roads Authority offices?',
      answer: 'Roads Authority offices are open Monday to Friday from 8:00 AM to 5:00 PM. Some offices may have extended hours. Please check with your local office for specific hours.',
    },
    {
      id: 5,
      question: 'How do I report a road maintenance issue?',
      answer: 'You can report road maintenance issues through our website, mobile app, or by calling our toll-free number. Please provide as much detail as possible including location and nature of the issue.',
    },
    {
      id: 6,
      question: 'What payment methods are accepted?',
      answer: 'We accept cash, debit cards, credit cards, and bank transfers. Online payments can be made through NATIS online portal using various payment methods.',
    },
    {
      id: 7,
      question: 'How long does it take to process a driver\'s license?',
      answer: 'The processing time for a driver\'s license is typically 7-14 working days after successful completion of all requirements including the driving test.',
    },
    {
      id: 8,
      question: 'Can I renew my license online?',
      answer: 'Yes, you can renew your driver\'s license online through the NATIS portal. You will need to log in with your credentials and follow the renewal process.',
    },
  ];

  const toggleExpanded = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="help-circle" size={48} color={colors.primary} />
          <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
          <Text style={styles.headerSubtitle}>Find answers to common questions</Text>
        </View>

        {faqs.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={[
              styles.faqCard,
              expandedId === faq.id && styles.faqCardExpanded,
            ]}
            onPress={() => toggleExpanded(faq.id)}
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={colors.primary}
              />
            </View>
            {expandedId === faq.id && (
              <View style={styles.faqAnswerContainer}>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
     header: {
      backgroundColor: colors.background,
      paddingTop: 20,
    },
    content: {
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 20,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 5,
    },
    faqCard: {
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: 20,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    faqCardExpanded: {
      borderColor: colors.primary,
    },
    faqHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    faqQuestion: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginRight: 10,
    },
    faqAnswerContainer: {
      marginTop: 15,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    faqAnswer: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });
}

