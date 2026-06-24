import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

const LOCAL_FORMS = [
  {
    id: 'driving-licence-form',
    category: 'NaTIS Form',
    title: 'Driving Licence Form',
    description: 'Official driving licence form in PDF format.',
    moduleRef: require('../assets/Form/Driving_Licence_Form.pdf'),
  },
  {
    id: 'learners-licence-form',
    category: 'NaTIS Form',
    title: "Learners' Licence Form",
    description: "Official learners' licence form in PDF format.",
    moduleRef: require('../assets/Form/Learners_Licence_Form.pdf'),
  },
];

export function FormsScreen({ onBack }) {
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadPdf = async (form) => {
    try {
      setDownloadingId(form.id);
      const asset = Asset.fromModule(form.moduleRef);
      await asset.downloadAsync();
      if (asset.localUri || asset.uri) {
        await Linking.openURL(asset.localUri || asset.uri);
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.list}>
        {LOCAL_FORMS.map((form) => (
          <View key={form.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconWrap}>
                <Ionicons name="document-outline" size={24} color={PRIMARY} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.category}>{form.category}</Text>
                <Text style={styles.formTitle}>{form.title}</Text>
                <View style={styles.cardUnderline} />
                <Text style={styles.description}>{form.description}</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.downloadButton, pressed && styles.downloadButtonPressed]}
              onPress={() => handleDownloadPdf(form)}
            >
              <Ionicons name="download-outline" size={20} color={NEUTRAL_COLORS.white} style={styles.downloadIcon} />
              <Text style={styles.downloadButtonText}>
                {downloadingId === form.id ? 'Opening PDF...' : 'Download PDF'}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  list: {
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: NEUTRAL_COLORS.gray800,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardTop: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: PRIMARY + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  cardBody: {
    alignItems: 'center',
    width: '100%',
  },
  category: {
    ...typography.caption,
    color: PRIMARY,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  formTitle: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray900,
    textAlign: 'center',
  },
  cardUnderline: {
    width: 44,
    height: 3,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    lineHeight: 20,
    textAlign: 'center',
  },
  downloadButton: {
    alignSelf: 'center',
    minWidth: 190,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
  },
  downloadButtonPressed: {
    opacity: 0.9,
  },
  downloadIcon: {
    marginRight: spacing.sm,
  },
  downloadButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
  },
});
