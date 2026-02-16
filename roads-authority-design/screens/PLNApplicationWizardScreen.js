import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, FormInput } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

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

const DECLARATION_ROLE_OPTIONS = [
  { value: 'declarationRoleApplicant', label: 'Applicant' },
  { value: 'declarationRoleProxy', label: 'Proxy' },
  { value: 'declarationRoleRepresentative', label: 'Representative' },
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

function PlatePreview({ format, choices, quantity = 1 }) {
  const size = PLATE_FORMAT_SIZES[format] || PLATE_FORMAT_SIZES.plateFormatNormal;
  const displayChoices = [choices[0] || 'ABC 123', choices[1] || '', choices[2] || ''].filter(Boolean);
  const isSquare = format === 'plateFormatSquare';
  const isSmall = format === 'plateFormatMotorcycle';

  return (
    <View style={previewStyles.wrap}>
      <Text style={previewStyles.label}>Preview</Text>
      <View style={previewStyles.row}>
        {displayChoices.slice(0, quantity || 1).map((text, i) => (
          <View
            key={i}
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
              {text.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const previewStyles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { ...typography.label, color: NEUTRAL_COLORS.gray600, marginBottom: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'center' },
  plate: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: NEUTRAL_COLORS.gray800,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  plateText: { fontSize: 18, fontWeight: '800', color: NEUTRAL_COLORS.gray900, letterSpacing: 2 },
  plateTextSmall: { fontSize: 12, letterSpacing: 1 },
  plateTextSquare: { fontSize: 10, letterSpacing: 0 },
});

export function PLNApplicationWizardScreen({ onBack, onSubmit }) {
  const [step, setStep] = useState(STEP_IDENTITY);
  const [errors, setErrors] = useState({});
  const clearError = (field) => setErrors((e) => ({ ...e, [field]: undefined }));

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

  // Step 6 – Declaration
  const [declarationRole, setDeclarationRole] = useState('');
  const [declarationPlace, setDeclarationPlace] = useState('');
  const [declarationDay, setDeclarationDay] = useState('');
  const [declarationMonth, setDeclarationMonth] = useState('');
  const [declarationYear, setDeclarationYear] = useState('');

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
    if (!declarationDay.trim() || !declarationMonth.trim() || !declarationYear.trim()) next.declarationDate = 'Day, month and year required';
    setErrors(next);
    return Object.keys(next).length === 0;
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
    declarationDay: declarationDay.trim(),
    declarationMonth: declarationMonth.trim(),
    declarationYear: declarationYear.trim(),
  });

  const handleSubmit = () => {
    if (!validateStep6()) return;
    onSubmit?.(buildPayload());
    onBack?.();
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

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {step === STEP_IDENTITY && (
            <>
              <Text style={styles.title}>Applicant identity</Text>
              <Text style={styles.hint}>Matches the official PLN application form.</Text>
              <RadioGroup label="ID type" required options={ID_TYPE_OPTIONS} value={idType} onSelect={(v) => { setIdType(v); clearError('idType'); }} error={errors.idType} />
              <FormInput label="ID / Business registration number" required value={idNumber} onChangeText={(v) => { setIdNumber(v); clearError('idNumber'); }} placeholder="Identification or business reg. no." error={errors.idNumber} />
              {idType === 'idTypeBusinessReg' ? (
                <FormInput label="Business name" required value={businessName} onChangeText={(v) => { setBusinessName(v); clearError('businessName'); }} placeholder="Registered business name" error={errors.businessName} />
              ) : (
                <>
                  <FormInput label="Surname" required value={surname} onChangeText={(v) => { setSurname(v); clearError('surname'); }} placeholder="Surname" error={errors.surname} />
                  <FormInput label="Initials" required value={initials} onChangeText={(v) => { setInitials(v); clearError('initials'); }} placeholder="e.g. J.K." error={errors.initials} />
                </>
              )}
            </>
          )}

          {step === STEP_ADDRESS && (
            <>
              <Text style={styles.title}>Address</Text>
              <Text style={styles.hint}>Postal and street address.</Text>
              <FormInput label="Postal address line 1" required value={postalAddressLine1} onChangeText={(v) => { setPostalAddressLine1(v); clearError('postalAddressLine1'); }} placeholder="P.O. Box or street" error={errors.postalAddressLine1} />
              <FormInput label="Postal address line 2" value={postalAddressLine2} onChangeText={setPostalAddressLine2} placeholder="Optional" />
              <FormInput label="Postal address line 3" value={postalAddressLine3} onChangeText={setPostalAddressLine3} placeholder="Optional" />
              <FormInput label="Street address line 1" required value={streetAddressLine1} onChangeText={(v) => { setStreetAddressLine1(v); clearError('streetAddressLine1'); }} placeholder="Street and number" error={errors.streetAddressLine1} />
              <FormInput label="Street address line 2" value={streetAddressLine2} onChangeText={setStreetAddressLine2} placeholder="Optional" />
              <FormInput label="Street address line 3" value={streetAddressLine3} onChangeText={setStreetAddressLine3} placeholder="Optional" />
            </>
          )}

          {step === STEP_CONTACT && (
            <>
              <Text style={styles.title}>Contact details</Text>
              <Text style={styles.hint}>Telephone and email.</Text>
              <View style={styles.row}>
                <View style={styles.half}><FormInput label="Home tel. code" value={telephoneHomeCode} onChangeText={setTelephoneHomeCode} placeholder="061" /></View>
                <View style={styles.half}><FormInput label="Home tel. number" value={telephoneHomeNumber} onChangeText={setTelephoneHomeNumber} placeholder="1234567" /></View>
              </View>
              <View style={styles.row}>
                <View style={styles.half}><FormInput label="Day tel. code" value={telephoneDayCode} onChangeText={setTelephoneDayCode} placeholder="061" /></View>
                <View style={styles.half}><FormInput label="Day tel. number" value={telephoneDayNumber} onChangeText={setTelephoneDayNumber} placeholder="1234567" /></View>
              </View>
              <View style={styles.row}>
                <View style={styles.half}><FormInput label="Cell code" value={cellNumberCode} onChangeText={setCellNumberCode} placeholder="264" /></View>
                <View style={styles.half}><FormInput label="Cell number" value={cellNumberNumber} onChangeText={setCellNumberNumber} placeholder="811234567" keyboardType="phone-pad" /></View>
              </View>
              <FormInput label="Email" required value={email} onChangeText={(v) => { setEmail(v); clearError('email'); }} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
            </>
          )}

          {step === STEP_PLATE && (
            <>
              <Text style={styles.title}>Number plate</Text>
              <Text style={styles.hint}>Plate format and preferred choices.</Text>
              <RadioGroup label="Plate format" required options={PLATE_FORMAT_OPTIONS} value={plateFormat} onSelect={(v) => { setPlateFormat(v); clearError('plateFormat'); }} error={errors.plateFormat} />
              {(plateFormat || plateChoice1 || plateChoice2 || plateChoice3) ? (
                <PlatePreview
                  format={plateFormat || 'plateFormatNormal'}
                  choices={[plateChoice1, plateChoice2, plateChoice3]}
                  quantity={plateQuantity === '2' ? 2 : 1}
                />
              ) : null}
              <FormInput label="Plate quantity (1 or 2)" required value={plateQuantity} onChangeText={(v) => { setPlateQuantity(v); clearError('plateQuantity'); }} placeholder="1 or 2" keyboardType="number-pad" maxLength={1} error={errors.plateQuantity} />
              <FormInput label="1st plate choice" required value={plateChoice1} onChangeText={(v) => { setPlateChoice1(v); clearError('plateChoice1'); }} placeholder="e.g. ABC 123" error={errors.plateChoice1} />
              <FormInput label="2nd plate choice" value={plateChoice2} onChangeText={setPlateChoice2} placeholder="Optional" />
              <FormInput label="3rd plate choice" value={plateChoice3} onChangeText={setPlateChoice3} placeholder="Optional" />
            </>
          )}

          {step === STEP_VEHICLE && (
            <>
              <Text style={styles.title}>Vehicle & representative</Text>
              <Text style={styles.hint}>Vehicle details. Representative only if applicable.</Text>
              <FormInput label="Current licence number" value={vehicleCurrentLicence} onChangeText={setVehicleCurrentLicence} placeholder="If applicable" />
              <FormInput label="Vehicle register number" value={vehicleRegisterNumber} onChangeText={setVehicleRegisterNumber} placeholder="If applicable" />
              <FormInput label="Chassis number / VIN" required value={vehicleChassisNumber} onChangeText={(v) => { setVehicleChassisNumber(v); clearError('vehicleChassisNumber'); }} placeholder="Chassis or VIN" error={errors.vehicleChassisNumber} />
              <FormInput label="Vehicle make" required value={vehicleMake} onChangeText={(v) => { setVehicleMake(v); clearError('vehicleMake'); }} placeholder="e.g. Toyota" error={errors.vehicleMake} />
              <FormInput label="Series name" value={vehicleSeries} onChangeText={setVehicleSeries} placeholder="e.g. Hiace" />
              <Text style={styles.sectionLabel}>Representative (optional)</Text>
              <Pressable style={styles.checkRow} onPress={() => setRepresentativeIdTypeTraffic((x) => !x)}>
                <Ionicons name={representativeIdTypeTraffic ? 'checkbox' : 'square-outline'} size={22} color={PRIMARY} />
                <Text style={styles.checkLabel}>Traffic Register</Text>
              </Pressable>
              <Pressable style={styles.checkRow} onPress={() => setRepresentativeIdTypeIDDoc((x) => !x)}>
                <Ionicons name={representativeIdTypeIDDoc ? 'checkbox' : 'square-outline'} size={22} color={PRIMARY} />
                <Text style={styles.checkLabel}>Namibia ID document</Text>
              </Pressable>
              <FormInput label="Representative ID number" value={representativeIdNumber} onChangeText={setRepresentativeIdNumber} placeholder="If applicable" />
              <FormInput label="Representative surname" value={representativeSurname} onChangeText={setRepresentativeSurname} placeholder="If applicable" />
              <FormInput label="Representative initials" value={representativeInitials} onChangeText={setRepresentativeInitials} placeholder="e.g. J.K." />
            </>
          )}

          {step === STEP_DECLARATION && (
            <>
              <Text style={styles.title}>Declaration</Text>
              <Text style={styles.hint}>Confirm your role and place/date of declaration.</Text>
              <RadioGroup label="I am signing as" required options={DECLARATION_ROLE_OPTIONS} value={declarationRole} onSelect={(v) => { setDeclarationRole(v); clearError('declarationRole'); }} error={errors.declarationRole} />
              <FormInput label="Place of declaration" required value={declarationPlace} onChangeText={(v) => { setDeclarationPlace(v); clearError('declarationPlace'); }} placeholder="e.g. Windhoek" error={errors.declarationPlace} />
              <View style={styles.row}>
                <View style={styles.third}><FormInput label="Day (DD)" required value={declarationDay} onChangeText={(v) => { setDeclarationDay(v); clearError('declarationDate'); }} placeholder="01" keyboardType="number-pad" maxLength={2} /></View>
                <View style={styles.third}><FormInput label="Month (MM)" required value={declarationMonth} onChangeText={(v) => { setDeclarationMonth(v); clearError('declarationDate'); }} placeholder="01" keyboardType="number-pad" maxLength={2} /></View>
                <View style={styles.third}><FormInput label="Year (YY)" required value={declarationYear} onChangeText={(v) => { setDeclarationYear(v); clearError('declarationDate'); }} placeholder="25" keyboardType="number-pad" maxLength={2} /></View>
              </View>
              {errors.declarationDate ? <Text style={styles.errorText}>{errors.declarationDate}</Text> : null}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Summary</Text>
                <SummaryRow label="Applicant" value={idType === 'idTypeBusinessReg' ? businessName : `${surname} ${initials}`} />
                <SummaryRow label="ID number" value={idNumber} />
                <SummaryRow label="Email" value={email} />
                <SummaryRow label="Vehicle" value={`${vehicleMake} ${vehicleSeries}`.trim()} />
                <SummaryRow label="Chassis" value={vehicleChassisNumber} />
                <SummaryRow label="Plate choices" value={[plateChoice1, plateChoice2, plateChoice3].filter(Boolean).join(', ')} />
              </View>
            </>
          )}
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
            <Pressable style={styles.primaryButton} onPress={handleSubmit}>
              <Text style={styles.primaryButtonText}>Submit application</Text>
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
      <Text style={styles.summaryValue} numberOfLines={2}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.lg, flex: 1 },
  keyboard: { flex: 1 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: NEUTRAL_COLORS.gray300 },
  stepDotActive: { backgroundColor: PRIMARY },
  stepLine: { width: 16, height: 2, backgroundColor: NEUTRAL_COLORS.gray300, marginHorizontal: 2 },
  stepLineActive: { backgroundColor: PRIMARY },
  stepLabel: { ...typography.caption, color: NEUTRAL_COLORS.gray600, marginBottom: spacing.lg },
  scroll: { flex: 1, marginBottom: spacing.lg },
  title: { ...typography.h5, color: NEUTRAL_COLORS.gray900, marginBottom: spacing.sm },
  hint: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray600, marginBottom: spacing.lg },
  errorText: { ...typography.caption, color: '#DC2626', marginTop: -spacing.sm, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  third: { flex: 1 },
  sectionLabel: { ...typography.label, color: NEUTRAL_COLORS.gray700, marginTop: spacing.lg, marginBottom: spacing.sm },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  checkLabel: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray900, marginLeft: spacing.sm },
  summaryCard: { backgroundColor: NEUTRAL_COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: NEUTRAL_COLORS.gray200, padding: spacing.lg, marginTop: spacing.lg },
  summaryTitle: { ...typography.body, fontWeight: '700', color: NEUTRAL_COLORS.gray900, marginBottom: spacing.md },
  summaryRow: { marginBottom: spacing.sm },
  summaryLabel: { ...typography.caption, color: NEUTRAL_COLORS.gray500, marginBottom: 2 },
  summaryValue: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray900 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: PRIMARY, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, borderRadius: 8, gap: spacing.sm, flex: 1 },
  primaryButtonText: { ...typography.button, color: NEUTRAL_COLORS.white },
  secondaryButton: { justifyContent: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  secondaryButtonText: { ...typography.button, color: PRIMARY },
});
