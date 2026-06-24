import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, FormDropdown, FormCancelButton, FormNextButton } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

const TEST_TYPE_OPTIONS = [
  { label: 'Single test', value: 'single-test' },
  { label: 'Supplementary test', value: 'supplementary-test' },
];

const GENERAL_CATEGORY_OPTIONS = [
  { label: "Written learner's licence", value: 'written-learners' },
  { label: "Oral learner's licence", value: 'oral-learners' },
];

const FIRST_TEST_DESCRIPTION_OPTIONS = [
  { label: 'Code 2 learner’s licence', value: 'code-2' },
  { label: 'Code 3 learner’s licence', value: 'code-3' },
];

const SECOND_TEST_DESCRIPTION_OPTIONS = [
  { label: 'Not applicable', value: 'none' },
  { label: 'Code C1 extension', value: 'c1-extension' },
];

const PROVINCE_OPTIONS = [
  { label: 'Namibia', value: 'namibia' },
];

const TEST_CENTRE_OPTIONS = [
  { label: 'Windhoek NaTIS Centre', value: 'windhoek-natis' },
  { label: 'Swakopmund NaTIS Centre', value: 'swakopmund-natis' },
  { label: 'Walvis Bay NaTIS Centre', value: 'walvisbay-natis' },
];

const LICENCE_CATEGORIES = [
  { key: 'code-a1', code: 'A1', label: 'Learners licence for motorcycle', icon: 'bicycle-outline' },
  { key: 'code-a', code: 'A', label: 'Learners licence for light motor vehicle', icon: 'car-sport-outline' },
  { key: 'code-c1', code: 'C1', label: 'Learners licence for heavy motor vehicle', icon: 'bus-outline' },
  { key: 'code-ec1', code: 'EC1', label: 'Learners licence for articulated vehicle', icon: 'trail-sign-outline' },
];

const CODE_NOTES = [
  "A code 2 Learner's Licence can only be used to learn to drive a light motor vehicle and apply for a code EB or B driving licence only.",
  "A code 3 Learner's Licence can be used to learn to drive any (light or heavy) motor vehicle.",
];

const AGE_RESTRICTIONS = [
  'Code 1 (codes A and A1): 16 years and above',
  'Code 2 (codes B and BE): 17 years and above',
  'Code 3 (codes C1, C, CE1 and CE): 18 years and above',
];

export function LearnersLicenceTestScreen({ onCancel }) {
  const { width } = useWindowDimensions();
  const isCompact = width < 860;
  const isPhone = width < 480;
  const [testType, setTestType] = useState('single-test');
  const [generalCategory, setGeneralCategory] = useState('written-learners');
  const [firstDescription, setFirstDescription] = useState('');
  const [secondDescription, setSecondDescription] = useState('');
  const [province, setProvince] = useState('namibia');
  const [testCentre, setTestCentre] = useState('');

  const canContinue = useMemo(
    () => !!testType && !!generalCategory && !!firstDescription && !!secondDescription && !!province && !!testCentre,
    [testType, generalCategory, firstDescription, secondDescription, province, testCentre]
  );

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.headerWrap}>
        <Text style={styles.pageTitle}>Learner&apos;s Licence Test</Text>
        <View style={styles.titleUnderline} />
      </View>

      <View style={[styles.card, isPhone && styles.cardCompact]}>
        <View style={styles.noticeBox}>
          <Text style={styles.noticeHeading}>Learner&apos;s Licence Codes:</Text>
          {CODE_NOTES.map((line) => (
            <View key={line} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}

          <Text style={styles.noticeHeading}>Age restrictions:</Text>
          {AGE_RESTRICTIONS.map((line) => (
            <View key={line} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, isPhone && styles.sectionTitleCompact]}>
          Please select licence type and category
        </Text>

        <View style={[styles.formAndCategoryRow, isCompact && styles.formAndCategoryRowStacked]}>
          <View style={[styles.formColumn, isCompact && styles.formColumnCompact]}>
            <View style={[styles.dropdownRow, isCompact && styles.dropdownRowStacked]}>
              <View style={[styles.dropdownCell, isCompact && styles.dropdownCellStacked]}>
                <FormDropdown
                  label="Type of booking"
                  required
                  options={TEST_TYPE_OPTIONS}
                  value={testType}
                  onSelect={setTestType}
                />
              </View>
              <View style={[styles.dropdownCell, isCompact && styles.dropdownCellStacked]}>
                <FormDropdown
                  label="General default test category"
                  required
                  options={GENERAL_CATEGORY_OPTIONS}
                  value={generalCategory}
                  onSelect={setGeneralCategory}
                />
              </View>
            </View>

            <View style={[styles.dropdownRow, isCompact && styles.dropdownRowStacked]}>
              <View style={[styles.dropdownCell, isCompact && styles.dropdownCellStacked]}>
                <FormDropdown
                  label="First licence test type description"
                  required
                  options={FIRST_TEST_DESCRIPTION_OPTIONS}
                  value={firstDescription}
                  onSelect={setFirstDescription}
                />
              </View>
              <View style={[styles.dropdownCell, isCompact && styles.dropdownCellStacked]}>
                <FormDropdown
                  label="Second licence test type description"
                  required
                  options={SECOND_TEST_DESCRIPTION_OPTIONS}
                  value={secondDescription}
                  onSelect={setSecondDescription}
                />
              </View>
            </View>
          </View>

          <View style={[styles.categoryColumn, isCompact && styles.categoryColumnStacked]}>
            <Text style={styles.categoryTitle}>Learners licence categories</Text>
            {LICENCE_CATEGORIES.map((item) => (
              <View key={item.key} style={styles.categoryRow}>
                <View style={styles.categoryIconWrap}>
                  <Ionicons name={item.icon} size={18} color={NEUTRAL_COLORS.gray700} />
                </View>
                <View style={styles.categoryCopy}>
                  <Text style={styles.categoryCode}>{item.code}</Text>
                  <Text style={styles.categoryLabel}>{item.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionTitle, isPhone && styles.sectionTitleCompact]}>
          Please select the preferred learners licence testing centre
        </Text>

        <View style={[styles.dropdownRow, isCompact && styles.dropdownRowStacked]}>
          <View style={[styles.dropdownCell, isCompact && styles.dropdownCellStacked]}>
            <FormDropdown
              label="Province"
              required
              options={PROVINCE_OPTIONS}
              value={province}
              onSelect={setProvince}
            />
          </View>
          <View style={[styles.dropdownCell, isCompact && styles.dropdownCellStacked]}>
            <FormDropdown
              label="Testing centre"
              required
              options={TEST_CENTRE_OPTIONS}
              value={testCentre}
              onSelect={setTestCentre}
            />
          </View>
        </View>

        <View style={[styles.footerActions, isPhone && styles.footerActionsStacked]}>
          <FormCancelButton label="Cancel" onPress={onCancel} />
          <FormNextButton label="Next" enabled={canContinue} onPress={() => {}} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pageTitle: {
    ...typography.h3,
    color: NEUTRAL_COLORS.gray800,
  },
  titleUnderline: {
    width: 54,
    height: 3,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  pageSubtitle: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray600,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 10,
    padding: spacing.lg,
  },
  cardCompact: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  noticeBox: {
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: '#FAFBFD',
  },
  noticeHeading: {
    ...typography.bodySmall,
    color: '#E11D48',
    fontFamily: 'Poppins_600SemiBold',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  bullet: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray700,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  bulletText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray700,
    flex: 1,
  },
  sectionTitle: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray700,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  sectionTitleCompact: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 22,
  },
  formAndCategoryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  formAndCategoryRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  formColumn: {
    flex: 1,
  },
  formColumnCompact: {
    width: '100%',
  },
  categoryColumn: {
    width: 210,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 8,
    padding: spacing.sm,
    backgroundColor: NEUTRAL_COLORS.gray50,
  },
  categoryColumnStacked: {
    width: '100%',
  },
  categoryTitle: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    fontFamily: 'Poppins_600SemiBold',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryIconWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  categoryCopy: {
    flex: 1,
  },
  categoryCode: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray700,
    fontFamily: 'Poppins_600SemiBold',
  },
  categoryLabel: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
    lineHeight: 16,
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dropdownRowStacked: {
    flexDirection: 'column',
    gap: 0,
  },
  dropdownCell: {
    flex: 1,
  },
  dropdownCellStacked: {
    width: '100%',
  },
  footerActions: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerActionsStacked: {
    justifyContent: 'flex-start',
  },
});
