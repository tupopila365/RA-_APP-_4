import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer, FormInput, DropdownSelector } from '../components';
import { useKeyboardScroll } from '../hooks/useKeyboardScroll';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY, RA_YELLOW } from '../theme/colors';
import { submitApplication } from '../services/plnService';

/** Green for PLN Next / Submit buttons (matches Start application button) */
const PLN_BUTTON_GREEN = '#3CB371';

const TOTAL_STEPS = 6;
const STEP_IDENTITY = 1;
const STEP_ADDRESS = 2;
const STEP_CONTACT = 3;
const STEP_PLATE = 4;
const STEP_VEHICLE = 5;
const STEP_DECLARATION = 6;

const ID_TYPE_OPTIONS = [
  { value: 'idTypeTrafficRegister', label: 'Traffic Register Number' },
  { value: 'idTypeNamibiaID', label: 'Namibia ID document' },
  { value: 'idTypeBusinessReg', label: 'Business Registration No.' },
];

const PLATE_FORMAT_OPTIONS = [
  { value: 'plateFormatLongGerman', label: 'Long / German' },
  { value: 'plateFormatNormal', label: 'Normal' },
  { value: 'plateFormatAmerican', label: 'American' },
  { value: 'plateFormatSquare', label: 'Square' },
  { value: 'plateFormatMotorcycle', label: 'Small motorcycle' },
];

const PLATE_QUANTITY_OPTIONS = [
  { value: '1', label: '1 plate' },
  { value: '2', label: '2 plates' },
];

const DECLARATION_ROLE_OPTIONS = [
  { value: 'declarationRoleApplicant', label: 'Applicant' },
  { value: 'declarationRoleProxy', label: 'Proxy' },
  { value: 'declarationRoleRepresentative', label: 'Representative' },
];

/** Cities and towns in Namibia for place of declaration */
const DECLARATION_PLACE_OPTIONS = [
  { value: 'Arandis', label: 'Arandis' },
  { value: 'Bethanie', label: 'Bethanie' },
  { value: 'Eenhana', label: 'Eenhana' },
  { value: 'Gobabis', label: 'Gobabis' },
  { value: 'Grünau', label: 'Grünau' },
  { value: 'Grootfontein', label: 'Grootfontein' },
  { value: 'Henties Bay', label: 'Henties Bay' },
  { value: 'Kamanjab', label: 'Kamanjab' },
  { value: 'Karasburg', label: 'Karasburg' },
  { value: 'Karibib', label: 'Karibib' },
  { value: 'Katima Mulilo', label: 'Katima Mulilo' },
  { value: 'Keetmanshoop', label: 'Keetmanshoop' },
  { value: 'Khorixas', label: 'Khorixas' },
  { value: 'Lüderitz', label: 'Lüderitz' },
  { value: 'Maltahöhe', label: 'Maltahöhe' },
  { value: 'Mariental', label: 'Mariental' },
  { value: 'Nkurenkuru', label: 'Nkurenkuru' },
  { value: 'Noordoewer', label: 'Noordoewer' },
  { value: 'Okahandja', label: 'Okahandja' },
  { value: 'Omaruru', label: 'Omaruru' },
  { value: 'Ondangwa', label: 'Ondangwa' },
  { value: 'Ongwediva', label: 'Ongwediva' },
  { value: 'Opuwo', label: 'Opuwo' },
  { value: 'Oranjemund', label: 'Oranjemund' },
  { value: 'Oshakati', label: 'Oshakati' },
  { value: 'Oshikango', label: 'Oshikango' },
  { value: 'Otavi', label: 'Otavi' },
  { value: 'Otjiwarongo', label: 'Otjiwarongo' },
  { value: 'Outjo', label: 'Outjo' },
  { value: 'Outapi', label: 'Outapi' },
  { value: 'Rehoboth', label: 'Rehoboth' },
  { value: 'Rosh Pinah', label: 'Rosh Pinah' },
  { value: 'Ruacana', label: 'Ruacana' },
  { value: 'Rundu', label: 'Rundu' },
  { value: 'Swakopmund', label: 'Swakopmund' },
  { value: 'Tsumeb', label: 'Tsumeb' },
  { value: 'Usakos', label: 'Usakos' },
  { value: 'Warmbad', label: 'Warmbad' },
  { value: 'Walvis Bay', label: 'Walvis Bay' },
  { value: 'Windhoek', label: 'Windhoek' },
];

function RadioGroup({ label, options, value, onSelect, error }) {
  return (
    <View style={radioStyles.wrap}>
      <Text style={radioStyles.label}>{label}</Text>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          style={[radioStyles.option, value === opt.value && radioStyles.optionSelected]}
          onPress={() => onSelect(opt.value)}
        >
          <View style={[radioStyles.dot, value === opt.value && radioStyles.dotSelected]} />
          <Text style={radioStyles.optionText}>{opt.label}</Text>
        </Pressable>
      ))}
      {error ? <Text style={radioStyles.error}>{error}</Text> : null}
    </View>
  );
}

const radioStyles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { ...typography.label, color: NEUTRAL_COLORS.gray700, marginBottom: spacing.sm },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  optionSelected: {},
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: NEUTRAL_COLORS.gray400, marginRight: spacing.sm },
  dotSelected: { borderColor: PRIMARY, backgroundColor: PRIMARY },
  optionText: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray900 },
  error: { ...typography.caption, color: '#DC2626', marginTop: spacing.xs },
});

const PLATE_FORMAT_SIZES = {
  plateFormatLongGerman: { width: 200, height: 44 },
  plateFormatNormal: { width: 140, height: 52 },
  plateFormatAmerican: { width: 160, height: 48 },
  plateFormatSquare: { width: 72, height: 72 },
  plateFormatMotorcycle: { width: 100, height: 36 },
};

const PLATE_CHOICE_MAX_LENGTH = 7;

function SinglePlatePreview({ format, text, label }) {
  const size = PLATE_FORMAT_SIZES[format] || PLATE_FORMAT_SIZES.plateFormatNormal;
  const isSquare = format === 'plateFormatSquare';
  const isSmall = format === 'plateFormatMotorcycle';
  const displayText = (text || '').trim() || 'ABC 123';

  return (
    <View style={previewStyles.singleWrap}>
      {label ? <Text style={previewStyles.singleLabel}>{label}</Text> : null}
      <View
        style={[
          previewStyles.plate,
          {
            width: size.width,
            height: size.height,
            borderRadius: isSquare ? 4 : 6,
          },
        ]}
      >
        <Text
          style={[
            previewStyles.plateText,
            isSmall && previewStyles.plateTextSmall,
            isSquare && previewStyles.plateTextSquare,
          ]}
          numberOfLines={1}
        >
          {displayText.toUpperCase()}
        </Text>
        <Image
          source={require('../assets/flag.png')}
          style={previewStyles.flag}
          resizeMode="contain"
          accessibilityLabel="Namibia flag"
        />
        <Text style={previewStyles.plateNa}>NA</Text>
      </View>
    </View>
  );
}

const previewStyles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { ...typography.label, color: NEUTRAL_COLORS.gray600, marginBottom: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'center' },
  singleWrap: { marginBottom: spacing.lg },
  singleLabel: { ...typography.caption, color: NEUTRAL_COLORS.gray600, marginBottom: spacing.xs },
  plate: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  flag: {
    width: 28,
    height: 20,
  },
  plateNa: {
    fontSize: 14,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: 1,
  },
  plateText: { fontSize: 18, fontWeight: '800', color: PRIMARY, letterSpacing: 2, flex: 1 },
  plateTextSmall: { fontSize: 12, letterSpacing: 1 },
  plateTextSquare: { fontSize: 10, letterSpacing: 0 },
});

export function PLNApplicationWizardScreen({ onBack, onSubmit }) {
  const [step, setStep] = useState(STEP_IDENTITY);
  const [errors, setErrors] = useState({});
  const clearError = (field) => setErrors((e) => ({ ...e, [field]: undefined }));
  const { scrollViewRef, contentRef, onFocusWithRef } = useKeyboardScroll();

  // Step 1 – Identity (matches PDF)
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [surname, setSurname] = useState('');
  const [initials, setInitials] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Step 2 – Address
  const [postalAddressLine1, setPostalAddressLine1] = useState('');
  const [postalAddressLine2, setPostalAddressLine2] = useState('');
  const [postalAddressLine3, setPostalAddressLine3] = useState('');
  const [streetAddressLine1, setStreetAddressLine1] = useState('');
  const [streetAddressLine2, setStreetAddressLine2] = useState('');
  const [streetAddressLine3, setStreetAddressLine3] = useState('');

  // Step 3 – Contact
  const [telephoneHomeCode, setTelephoneHomeCode] = useState('');
  const [telephoneHomeNumber, setTelephoneHomeNumber] = useState('');
  const [telephoneDayCode, setTelephoneDayCode] = useState('');
  const [telephoneDayNumber, setTelephoneDayNumber] = useState('');
  const [cellNumberCode, setCellNumberCode] = useState('264');
  const [cellNumberNumber, setCellNumberNumber] = useState('');
  const [email, setEmail] = useState('');

  // Step 4 – Plate
  const [plateFormat, setPlateFormat] = useState('');
  const [plateQuantity, setPlateQuantity] = useState('');
  const [plateChoice1, setPlateChoice1] = useState('');
  const [plateChoice2, setPlateChoice2] = useState('');
  const [plateChoice3, setPlateChoice3] = useState('');
  const [plateChoice1Meaning, setPlateChoice1Meaning] = useState('');
  const [plateChoice2Meaning, setPlateChoice2Meaning] = useState('');
  const [plateChoice3Meaning, setPlateChoice3Meaning] = useState('');

  // Step 5 – Vehicle & Representative
  const [vehicleCurrentLicence, setVehicleCurrentLicence] = useState('');
  const [vehicleRegisterNumber, setVehicleRegisterNumber] = useState('');
  const [vehicleChassisNumber, setVehicleChassisNumber] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleSeries, setVehicleSeries] = useState('');
  const [representativeIdTypeTraffic, setRepresentativeIdTypeTraffic] = useState(false);
  const [representativeIdTypeIDDoc, setRepresentativeIdTypeIDDoc] = useState(false);
  const [representativeIdNumber, setRepresentativeIdNumber] = useState('');
  const [representativeSurname, setRepresentativeSurname] = useState('');
  const [representativeInitials, setRepresentativeInitials] = useState('');

  // Step 6 – Declaration & document
  const [declarationRole, setDeclarationRole] = useState('');
  const [declarationPlace, setDeclarationPlace] = useState('');
  const [declarationDate, setDeclarationDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [documentUri, setDocumentUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validateStep1 = () => {
    const next = {};
    if (!idType) next.idType = 'Select ID type';
    if (!idNumber.trim()) next.idNumber = 'Required';
    if (idType === 'idTypeBusinessReg') { if (!businessName.trim()) next.businessName = 'Required'; }
    else { if (!surname.trim()) next.surname = 'Required'; if (!initials.trim()) next.initials = 'Required'; }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next = {};
    if (!postalAddressLine1.trim()) next.postalAddressLine1 = 'Required';
    if (!streetAddressLine1.trim()) next.streetAddressLine1 = 'Required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep3 = () => {
    const next = {};
    if (!email.trim()) next.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Invalid email';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep4 = () => {
    const next = {};
    if (!plateFormat) next.plateFormat = 'Select plate format';
    if (!plateQuantity.trim() || (plateQuantity !== '1' && plateQuantity !== '2')) next.plateQuantity = 'Enter 1 or 2';
    if (!plateChoice1.trim()) next.plateChoice1 = 'At least 1st choice required';
    else if (plateChoice1.length > PLATE_CHOICE_MAX_LENGTH) next.plateChoice1 = `Max ${PLATE_CHOICE_MAX_LENGTH} characters (space counts)`;
    if (plateChoice2.trim() && plateChoice2.length > PLATE_CHOICE_MAX_LENGTH) next.plateChoice2 = `Max ${PLATE_CHOICE_MAX_LENGTH} characters`;
    if (plateChoice3.trim() && plateChoice3.length > PLATE_CHOICE_MAX_LENGTH) next.plateChoice3 = `Max ${PLATE_CHOICE_MAX_LENGTH} characters`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep5 = () => {
    const next = {};
    if (!vehicleChassisNumber.trim()) next.vehicleChassisNumber = 'Required';
    if (!vehicleMake.trim()) next.vehicleMake = 'Required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep6 = () => {
    const next = {};
    if (!declarationRole) next.declarationRole = 'Select declaration role';
    if (!declarationPlace.trim()) next.declarationPlace = 'Required';
    if (!declarationDate) next.declarationDate = 'Select date of declaration';
    if (!documentUri) next.document = 'Certified ID document is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const pickDocument = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Photo library access is required to attach your certified ID.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.9,
      });
      if (!result.canceled) {
        setDocumentUri(result.assets[0].uri);
        clearError('document');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open photo library.');
    }
  };

  const takeDocumentPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera access is required to photograph your ID.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.9,
      });
      if (!result.canceled) {
        setDocumentUri(result.assets[0].uri);
        clearError('document');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const handleNext = () => {
    if (step === STEP_IDENTITY && validateStep1()) setStep(STEP_ADDRESS);
    else if (step === STEP_ADDRESS && validateStep2()) setStep(STEP_CONTACT);
    else if (step === STEP_CONTACT && validateStep3()) setStep(STEP_PLATE);
    else if (step === STEP_PLATE && validateStep4()) setStep(STEP_VEHICLE);
    else if (step === STEP_VEHICLE && validateStep5()) setStep(STEP_DECLARATION);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBack?.();
  };

  const buildPayload = () => ({
    transactionNewPLN: true,
    idTypeTrafficRegister: idType === 'idTypeTrafficRegister',
    idTypeNamibiaID: idType === 'idTypeNamibiaID',
    idTypeBusinessReg: idType === 'idTypeBusinessReg',
    idNumber: idNumber.trim(),
    surname: surname.trim(),
    initials: initials.trim(),
    businessName: businessName.trim(),
    postalAddressLine1: postalAddressLine1.trim(),
    postalAddressLine2: postalAddressLine2.trim(),
    postalAddressLine3: postalAddressLine3.trim(),
    streetAddressLine1: streetAddressLine1.trim(),
    streetAddressLine2: streetAddressLine2.trim(),
    streetAddressLine3: streetAddressLine3.trim(),
    telephoneHomeCode: telephoneHomeCode.trim(),
    telephoneHomeNumber: telephoneHomeNumber.trim(),
    telephoneDayCode: telephoneDayCode.trim(),
    telephoneDayNumber: telephoneDayNumber.trim(),
    cellNumberCode: cellNumberCode.trim(),
    cellNumberNumber: cellNumberNumber.trim(),
    email: email.trim(),
    plateFormatLongGerman: plateFormat === 'plateFormatLongGerman',
    plateFormatNormal: plateFormat === 'plateFormatNormal',
    plateFormatAmerican: plateFormat === 'plateFormatAmerican',
    plateFormatSquare: plateFormat === 'plateFormatSquare',
    plateFormatMotorcycle: plateFormat === 'plateFormatMotorcycle',
    plateQuantity: plateQuantity.trim(),
    plateChoice1: plateChoice1.trim(),
    plateChoice2: plateChoice2.trim(),
    plateChoice3: plateChoice3.trim(),
    plateChoice1Meaning: plateChoice1Meaning.trim(),
    plateChoice2Meaning: plateChoice2Meaning.trim(),
    plateChoice3Meaning: plateChoice3Meaning.trim(),
    vehicleCurrentLicence: vehicleCurrentLicence.trim(),
    vehicleRegisterNumber: vehicleRegisterNumber.trim(),
    vehicleChassisNumber: vehicleChassisNumber.trim(),
    vehicleMake: vehicleMake.trim(),
    vehicleSeries: vehicleSeries.trim(),
    representativeIdTypeTraffic: representativeIdTypeTraffic,
    representativeIdTypeIDDoc: representativeIdTypeIDDoc,
    representativeIdNumber: representativeIdNumber.trim(),
    representativeSurname: representativeSurname.trim(),
    representativeInitials: representativeInitials.trim(),
    declarationRoleApplicant: declarationRole === 'declarationRoleApplicant',
    declarationRoleProxy: declarationRole === 'declarationRoleProxy',
    declarationRoleRepresentative: declarationRole === 'declarationRoleRepresentative',
    declarationPlace: declarationPlace.trim(),
    declarationDay: declarationDate ? String(declarationDate.getDate()).padStart(2, '0') : '',
    declarationMonth: declarationDate ? String(declarationDate.getMonth() + 1).padStart(2, '0') : '',
    declarationYear: declarationDate ? String(declarationDate.getFullYear()).slice(-2) : '',
  });

  const handleSubmit = async () => {
    if (!validateStep6()) return;
    setSubmitting(true);
    try {
      const payload = buildPayload();
      await submitApplication(payload, documentUri);
      onSubmit?.();
    } catch (err) {
      Alert.alert('Submission failed', err.message || 'Could not submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content} scrollable={false}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <React.Fragment key={s}>
              <View style={[styles.stepDot, step >= s && styles.stepDotActive]} />
              {s < 6 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
            </React.Fragment>
          ))}
        </View>
        <Text style={styles.stepLabel}>Step {step} of {TOTAL_STEPS}</Text>

        <ScrollView ref={scrollViewRef} style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View ref={contentRef} collapsable={false}>
          {step === STEP_IDENTITY && (
            <>
              <Text style={styles.title}>Applicant identity</Text>
              <Text style={styles.hint}>Matches the official PLN application form.</Text>
              <RadioGroup label="ID type" required options={ID_TYPE_OPTIONS} value={idType} onSelect={(v) => { setIdType(v); clearError('idType'); }} error={errors.idType} />
              <FormInput label="ID / Business registration number" required value={idNumber} onChangeText={(v) => { setIdNumber(v); clearError('idNumber'); }} placeholder="Identification or business reg. no." error={errors.idNumber} onFocusWithRef={onFocusWithRef} />
              {idType === 'idTypeBusinessReg' ? (
                <FormInput label="Business name" required value={businessName} onChangeText={(v) => { setBusinessName(v); clearError('businessName'); }} placeholder="Registered business name" error={errors.businessName} onFocusWithRef={onFocusWithRef} />
              ) : (
                <>
                  <FormInput label="Surname" required value={surname} onChangeText={(v) => { setSurname(v); clearError('surname'); }} placeholder="Surname" error={errors.surname} onFocusWithRef={onFocusWithRef} />
                  <FormInput label="Initials" required value={initials} onChangeText={(v) => { setInitials(v); clearError('initials'); }} placeholder="e.g. J.K." error={errors.initials} onFocusWithRef={onFocusWithRef} />
                </>
              )}
            </>
          )}

          {step === STEP_ADDRESS && (
            <>
              <Text style={styles.title}>Address</Text>
              <Text style={styles.hint}>Postal and street address.</Text>
              <FormInput label="Postal address line 1" required value={postalAddressLine1} onChangeText={(v) => { setPostalAddressLine1(v); clearError('postalAddressLine1'); }} placeholder="P.O. Box or street" error={errors.postalAddressLine1} onFocusWithRef={onFocusWithRef} />
              <FormInput label="Postal address line 2" value={postalAddressLine2} onChangeText={setPostalAddressLine2} placeholder="Optional" onFocusWithRef={onFocusWithRef} />
              <FormInput label="Postal address line 3" value={postalAddressLine3} onChangeText={setPostalAddressLine3} placeholder="Optional" onFocusWithRef={onFocusWithRef} />
              <FormInput label="Street address line 1" required value={streetAddressLine1} onChangeText={(v) => { setStreetAddressLine1(v); clearError('streetAddressLine1'); }} placeholder="Street and number" error={errors.streetAddressLine1} onFocusWithRef={onFocusWithRef} />
              <FormInput label="Street address line 2" value={streetAddressLine2} onChangeText={setStreetAddressLine2} placeholder="Optional" onFocusWithRef={onFocusWithRef} />
              <FormInput label="Street address line 3" value={streetAddressLine3} onChangeText={setStreetAddressLine3} placeholder="Optional" onFocusWithRef={onFocusWithRef} />
            </>
          )}

          {step === STEP_CONTACT && (
            <>
              <Text style={styles.title}>Contact details</Text>
              <Text style={styles.hint}>Telephone and email.</Text>
              <View style={styles.row}>
                <View style={styles.half}><FormInput label="Home tel. code" value={telephoneHomeCode} onChangeText={setTelephoneHomeCode} placeholder="061" onFocusWithRef={onFocusWithRef} /></View>
                <View style={styles.half}><FormInput label="Home tel. number" value={telephoneHomeNumber} onChangeText={setTelephoneHomeNumber} placeholder="1234567" onFocusWithRef={onFocusWithRef} /></View>
              </View>
              <View style={styles.row}>
                <View style={styles.half}><FormInput label="Day tel. code" value={telephoneDayCode} onChangeText={setTelephoneDayCode} placeholder="061" onFocusWithRef={onFocusWithRef} /></View>
                <View style={styles.half}><FormInput label="Day tel. number" value={telephoneDayNumber} onChangeText={setTelephoneDayNumber} placeholder="1234567" onFocusWithRef={onFocusWithRef} /></View>
              </View>
              <View style={styles.row}>
                <View style={styles.half}><FormInput label="Cell code" value={cellNumberCode} onChangeText={setCellNumberCode} placeholder="264" onFocusWithRef={onFocusWithRef} /></View>
                <View style={styles.half}><FormInput label="Cell number" value={cellNumberNumber} onChangeText={setCellNumberNumber} placeholder="811234567" keyboardType="phone-pad" onFocusWithRef={onFocusWithRef} /></View>
              </View>
              <FormInput label="Email" required value={email} onChangeText={(v) => { setEmail(v); clearError('email'); }} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} onFocusWithRef={onFocusWithRef} />
            </>
          )}

          {step === STEP_PLATE && (
            <>
              <Text style={styles.title}>Number plate</Text>
              <Text style={styles.hint}>Plate format and preferred choices. Add meaning for each choice if desired.</Text>
              <RadioGroup label="Plate format" required options={PLATE_FORMAT_OPTIONS} value={plateFormat} onSelect={(v) => { setPlateFormat(v); clearError('plateFormat'); }} error={errors.plateFormat} />
              <RadioGroup label="Plate quantity" required options={PLATE_QUANTITY_OPTIONS} value={plateQuantity} onSelect={(v) => { setPlateQuantity(v); clearError('plateQuantity'); }} error={errors.plateQuantity} />

              <Text style={styles.sectionLabel}>Choice 1</Text>
              <FormInput label="1st plate choice" required value={plateChoice1} onChangeText={(v) => { setPlateChoice1(v); clearError('plateChoice1'); }} placeholder="e.g. ABC 123 (max 7)" maxLength={PLATE_CHOICE_MAX_LENGTH} error={errors.plateChoice1} onFocusWithRef={onFocusWithRef} />
              {(plateFormat || plateChoice1) ? (
                <SinglePlatePreview format={plateFormat || 'plateFormatNormal'} text={plateChoice1} label="Preview" />
              ) : null}
              <FormInput label="Meaning" value={plateChoice1Meaning} onChangeText={setPlateChoice1Meaning} placeholder="e.g. initials or nickname" onFocusWithRef={onFocusWithRef} />

              <Text style={styles.sectionLabel}>Choice 2</Text>
              <FormInput label="2nd plate choice" value={plateChoice2} onChangeText={(v) => { setPlateChoice2(v); clearError('plateChoice2'); }} placeholder="Optional (max 7)" maxLength={PLATE_CHOICE_MAX_LENGTH} error={errors.plateChoice2} onFocusWithRef={onFocusWithRef} />
              {(plateFormat || plateChoice2) ? (
                <SinglePlatePreview format={plateFormat || 'plateFormatNormal'} text={plateChoice2} label="Preview" />
              ) : null}
              <FormInput label="Meaning" value={plateChoice2Meaning} onChangeText={setPlateChoice2Meaning} placeholder="e.g. initials or nickname" onFocusWithRef={onFocusWithRef} />

              <Text style={styles.sectionLabel}>Choice 3</Text>
              <FormInput label="3rd plate choice" value={plateChoice3} onChangeText={(v) => { setPlateChoice3(v); clearError('plateChoice3'); }} placeholder="Optional (max 7)" maxLength={PLATE_CHOICE_MAX_LENGTH} error={errors.plateChoice3} onFocusWithRef={onFocusWithRef} />
              {(plateFormat || plateChoice3) ? (
                <SinglePlatePreview format={plateFormat || 'plateFormatNormal'} text={plateChoice3} label="Preview" />
              ) : null}
              <FormInput label="Meaning" value={plateChoice3Meaning} onChangeText={setPlateChoice3Meaning} placeholder="e.g. initials or nickname" onFocusWithRef={onFocusWithRef} />
            </>
          )}

          {step === STEP_VEHICLE && (
            <>
              <Text style={styles.title}>Vehicle & representative</Text>
              <Text style={styles.hint}>Vehicle details. Representative only if applicable.</Text>
              <FormInput label="Current licence number" value={vehicleCurrentLicence} onChangeText={setVehicleCurrentLicence} placeholder="If applicable" onFocusWithRef={onFocusWithRef} />
              <FormInput label="Vehicle register number" value={vehicleRegisterNumber} onChangeText={setVehicleRegisterNumber} placeholder="If applicable" onFocusWithRef={onFocusWithRef} />
              <FormInput label="Chassis number / VIN" required value={vehicleChassisNumber} onChangeText={(v) => { setVehicleChassisNumber(v); clearError('vehicleChassisNumber'); }} placeholder="Chassis or VIN" error={errors.vehicleChassisNumber} onFocusWithRef={onFocusWithRef} />
              <FormInput label="Vehicle make" required value={vehicleMake} onChangeText={(v) => { setVehicleMake(v); clearError('vehicleMake'); }} placeholder="e.g. Toyota" error={errors.vehicleMake} onFocusWithRef={onFocusWithRef} />
              <FormInput label="Series name" value={vehicleSeries} onChangeText={setVehicleSeries} placeholder="e.g. Hiace" onFocusWithRef={onFocusWithRef} />
              <Text style={styles.sectionLabel}>Representative (optional)</Text>
              <Pressable style={styles.checkRow} onPress={() => setRepresentativeIdTypeTraffic((x) => !x)}>
                <Ionicons name={representativeIdTypeTraffic ? 'checkbox' : 'square-outline'} size={22} color={PRIMARY} />
                <Text style={styles.checkLabel}>Traffic Register</Text>
              </Pressable>
              <Pressable style={styles.checkRow} onPress={() => setRepresentativeIdTypeIDDoc((x) => !x)}>
                <Ionicons name={representativeIdTypeIDDoc ? 'checkbox' : 'square-outline'} size={22} color={PRIMARY} />
                <Text style={styles.checkLabel}>Namibia ID document</Text>
              </Pressable>
              <FormInput label="Representative ID number" value={representativeIdNumber} onChangeText={setRepresentativeIdNumber} placeholder="If applicable" onFocusWithRef={onFocusWithRef} />
              <FormInput label="Representative surname" value={representativeSurname} onChangeText={setRepresentativeSurname} placeholder="If applicable" onFocusWithRef={onFocusWithRef} />
              <FormInput label="Representative initials" value={representativeInitials} onChangeText={setRepresentativeInitials} placeholder="e.g. J.K." onFocusWithRef={onFocusWithRef} />
            </>
          )}

          {step === STEP_DECLARATION && (
            <>
              <Text style={styles.title}>Declaration</Text>
              <Text style={styles.hint}>Confirm your role and place/date of declaration.</Text>
              <RadioGroup label="I am signing as" required options={DECLARATION_ROLE_OPTIONS} value={declarationRole} onSelect={(v) => { setDeclarationRole(v); clearError('declarationRole'); }} error={errors.declarationRole} />
              <DropdownSelector label="Place of declaration" required placeholder="Select city or town" options={DECLARATION_PLACE_OPTIONS} value={declarationPlace} onSelect={(v) => { setDeclarationPlace(v); clearError('declarationPlace'); }} />
              <View style={styles.dateWrap}>
                <Text style={styles.dateLabel}>Date of declaration *</Text>
                <Pressable
                  style={styles.dateTrigger}
                  onPress={() => setShowDatePicker(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`Date of declaration: ${declarationDate ? declarationDate.toLocaleDateString() : 'Not selected'}`}
                >
                  <Text style={[styles.dateTriggerText, !declarationDate && styles.datePlaceholder]}>
                    {declarationDate ? declarationDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={22} color={NEUTRAL_COLORS.gray500} />
                </Pressable>
              </View>
              {showDatePicker && (
                <DateTimePicker
                  value={declarationDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    if (Platform.OS === 'android') setShowDatePicker(false);
                    if (date) {
                      setDeclarationDate(date);
                      clearError('declarationDate');
                    }
                  }}
                  onTouchCancel={() => Platform.OS === 'ios' && setShowDatePicker(false)}
                />
              )}
              {Platform.OS === 'ios' && showDatePicker && (
                <Pressable style={styles.datePickerDone} onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerDoneText}>Done</Text>
                </Pressable>
              )}
              {errors.declarationDate ? <Text style={styles.errorText}>{errors.declarationDate}</Text> : null}
              <Text style={styles.sectionLabel}>Certified ID document</Text>
              <Text style={styles.hint}>Attach a photo of your certified ID (required for submission).</Text>
              {documentUri ? (
                <View style={styles.documentAttached}>
                  <Ionicons name="document-attach" size={24} color={PRIMARY} />
                  <Text style={styles.documentAttachedText} numberOfLines={1}>Document attached</Text>
                  <Pressable onPress={() => setDocumentUri(null)} style={styles.removeDoc}>
                    <Text style={styles.removeDocText}>Remove</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.documentButtons}>
                  <Pressable style={styles.documentButton} onPress={takeDocumentPhoto}>
                    <Ionicons name="camera-outline" size={22} color={PRIMARY} />
                    <Text style={styles.documentButtonText}>Take photo</Text>
                  </Pressable>
                  <Pressable style={styles.documentButton} onPress={pickDocument}>
                    <Ionicons name="images-outline" size={22} color={PRIMARY} />
                    <Text style={styles.documentButtonText}>Choose photo</Text>
                  </Pressable>
                </View>
              )}
              {errors.document ? <Text style={styles.errorText}>{errors.document}</Text> : null}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Summary</Text>
                <SummaryRow label="ID type" value={idType === 'idTypeBusinessReg' ? 'Business registration' : idType === 'idTypeID' ? 'ID document' : idType === 'idTypePassport' ? 'Passport' : idType} />
                <SummaryRow label="Applicant" value={idType === 'idTypeBusinessReg' ? businessName : `${surname} ${initials}`.trim()} />
                <SummaryRow label="ID number" value={idNumber} />
                <SummaryRow label="Postal address" value={[postalAddressLine1, postalAddressLine2, postalAddressLine3].filter(Boolean).join(', ')} />
                <SummaryRow label="Street address" value={[streetAddressLine1, streetAddressLine2, streetAddressLine3].filter(Boolean).join(', ')} />
                <SummaryRow label="Telephone (home)" value={[telephoneHomeCode, telephoneHomeNumber].filter(Boolean).join(' ')} />
                <SummaryRow label="Telephone (day)" value={[telephoneDayCode, telephoneDayNumber].filter(Boolean).join(' ')} />
                <SummaryRow label="Cell" value={[cellNumberCode, cellNumberNumber].filter(Boolean).join(' ')} />
                <SummaryRow label="Email" value={email} />
                <SummaryRow label="Plate format" value={PLATE_FORMAT_OPTIONS.find((o) => o.value === plateFormat)?.label || plateFormat} />
                <SummaryRow label="Plate quantity" value={plateQuantity ? `${plateQuantity} plate(s)` : ''} />
                <SummaryRow label="Plate choice 1" value={plateChoice1} />
                {plateChoice1Meaning ? <SummaryRow label="Choice 1 meaning" value={plateChoice1Meaning} /> : null}
                <SummaryRow label="Plate choice 2" value={plateChoice2} />
                {plateChoice2Meaning ? <SummaryRow label="Choice 2 meaning" value={plateChoice2Meaning} /> : null}
                <SummaryRow label="Plate choice 3" value={plateChoice3} />
                {plateChoice3Meaning ? <SummaryRow label="Choice 3 meaning" value={plateChoice3Meaning} /> : null}
                <SummaryRow label="Vehicle make" value={vehicleMake} />
                <SummaryRow label="Vehicle series" value={vehicleSeries} />
                <SummaryRow label="Chassis number" value={vehicleChassisNumber} />
                <SummaryRow label="Current licence" value={vehicleCurrentLicence} />
                <SummaryRow label="Register number" value={vehicleRegisterNumber} />
                <SummaryRow label="Declaration role" value={DECLARATION_ROLE_OPTIONS.find((o) => o.value === declarationRole)?.label || declarationRole} />
                <SummaryRow label="Place of declaration" value={declarationPlace} />
                <SummaryRow label="Date of declaration" value={declarationDate ? declarationDate.toLocaleDateString('en-GB') : ''} />
              </View>
            </>
          )}
          </View>
        </ScrollView>

        <View style={styles.buttons}>
          <Pressable style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.secondaryButtonText}>{step === 1 ? 'Cancel' : 'Back'}</Text>
          </Pressable>
          {step < TOTAL_STEPS ? (
            <Pressable style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.primaryButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color={NEUTRAL_COLORS.white} />
            </Pressable>
          ) : (
            <Pressable
              style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Submit application</Text>
              )}
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function SummaryRow({ label, value }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.lg, flex: 1 },
  keyboard: { flex: 1 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: NEUTRAL_COLORS.gray300 },
  stepDotActive: { backgroundColor: RA_YELLOW },
  stepLine: { width: 16, height: 2, backgroundColor: NEUTRAL_COLORS.gray300, marginHorizontal: 2 },
  stepLineActive: { backgroundColor: RA_YELLOW },
  stepLabel: { ...typography.caption, color: NEUTRAL_COLORS.gray600, marginBottom: spacing.lg },
  scroll: { flex: 1, marginBottom: spacing.lg },
  title: { ...typography.h5, color: NEUTRAL_COLORS.gray900, marginBottom: spacing.sm },
  hint: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray600, marginBottom: spacing.lg },
  errorText: { ...typography.caption, color: '#DC2626', marginTop: -spacing.sm, marginBottom: spacing.sm },
  dateWrap: { marginBottom: spacing.lg },
  dateLabel: { ...typography.label, color: NEUTRAL_COLORS.gray700, marginBottom: spacing.xs },
  dateTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: NEUTRAL_COLORS.gray300, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 44 },
  dateTriggerText: { ...typography.body, color: NEUTRAL_COLORS.gray900 },
  datePlaceholder: { color: NEUTRAL_COLORS.gray400 },
  datePickerDone: { marginTop: spacing.sm, alignItems: 'flex-end' },
  datePickerDoneText: { ...typography.body, color: PRIMARY, fontWeight: '600' },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  third: { flex: 1 },
  sectionLabel: { ...typography.label, color: NEUTRAL_COLORS.gray700, marginTop: spacing.lg, marginBottom: spacing.sm },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  checkLabel: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray900, marginLeft: spacing.sm },
  summaryCard: { backgroundColor: NEUTRAL_COLORS.white, borderRadius: 0, borderWidth: 1, borderColor: NEUTRAL_COLORS.gray200, padding: spacing.lg, marginTop: spacing.lg },
  summaryTitle: { ...typography.body, fontWeight: '700', color: NEUTRAL_COLORS.gray900, marginBottom: spacing.md },
  summaryRow: { marginBottom: spacing.sm },
  summaryLabel: { ...typography.caption, color: NEUTRAL_COLORS.gray500, marginBottom: 2 },
  summaryValue: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray900 },
  documentAttached: { flexDirection: 'row', alignItems: 'center', backgroundColor: NEUTRAL_COLORS.gray100, padding: spacing.md, borderRadius: 0, marginBottom: spacing.sm, gap: spacing.sm },
  documentAttachedText: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray800, flex: 1 },
  removeDoc: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  removeDocText: { ...typography.bodySmall, color: PRIMARY, fontWeight: '600' },
  documentButtons: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  documentButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderRadius: 0, borderWidth: 1, borderColor: NEUTRAL_COLORS.gray300 },
  documentButtonText: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray800 },
  primaryButtonDisabled: { opacity: 0.7 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: PLN_BUTTON_GREEN, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, borderRadius: 8, gap: spacing.sm, flex: 1 },
  primaryButtonText: { ...typography.button, color: NEUTRAL_COLORS.white },
  secondaryButton: { justifyContent: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  secondaryButtonText: { ...typography.button, color: PRIMARY },
});
