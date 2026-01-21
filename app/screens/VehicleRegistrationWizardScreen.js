import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { vehicleService } from '../services/vehicleService';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import * as DocumentPicker from 'expo-document-picker';

export default function VehicleRegistrationWizardScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const applicationType = route?.params?.type || 'new';
  const isNewVehicle = applicationType === 'new';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [documentUri, setDocumentUri] = useState(null);
  
  // Step 1: Owner Details
  const [idType, setIdType] = useState('Namibia ID-doc');
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [personType, setPersonType] = useState('male');
  const [surname, setSurname] = useState('');
  const [initials, setInitials] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [postalAddressLine1, setPostalAddressLine1] = useState('');
  const [postalAddressLine2, setPostalAddressLine2] = useState('');
  const [postalAddressLine3, setPostalAddressLine3] = useState('');
  const [streetAddressLine1, setStreetAddressLine1] = useState('');
  const [streetAddressLine2, setStreetAddressLine2] = useState('');
  const [streetAddressLine3, setStreetAddressLine3] = useState('');
  const [phoneCode, setPhoneCode] = useState('264');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Step 2: Proxy (optional)
  const [hasProxy, setHasProxy] = useState(false);
  const [proxyIdType, setProxyIdType] = useState('Namibia ID-doc');
  const [proxyIdNumber, setProxyIdNumber] = useState('');
  const [proxySurname, setProxySurname] = useState('');
  const [proxyInitials, setProxyInitials] = useState('');
  
  // Step 3: Representative (optional)
  const [hasRepresentative, setHasRepresentative] = useState(false);
  const [representativeIdType, setRepresentativeIdType] = useState('Namibia ID-doc');
  const [representativeIdNumber, setRepresentativeIdNumber] = useState('');
  const [representativeSurname, setRepresentativeSurname] = useState('');
  const [representativeInitials, setRepresentativeInitials] = useState('');
  
  // Step 4: Vehicle Details
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [make, setMake] = useState('');
  const [seriesName, setSeriesName] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState('');
  const [drivenType, setDrivenType] = useState('self-propelled');
  const [vehicleDescription, setVehicleDescription] = useState('');
  const [netPower, setNetPower] = useState('');
  const [engineCapacity, setEngineCapacity] = useState('');
  const [fuelType, setFuelType] = useState('petrol');
  const [fuelTypeOther, setFuelTypeOther] = useState('');
  const [totalMass, setTotalMass] = useState('');
  const [grossVehicleMass, setGrossVehicleMass] = useState('');
  const [maxPermissibleVehicleMass, setMaxPermissibleVehicleMass] = useState('');
  const [maxPermissibleDrawingMass, setMaxPermissibleDrawingMass] = useState('');
  const [transmission, setTransmission] = useState('manual');
  const [mainColour, setMainColour] = useState('white');
  const [mainColourOther, setMainColourOther] = useState('');
  const [usedForTransportation, setUsedForTransportation] = useState('');
  const [economicSector, setEconomicSector] = useState('');
  const [odometerReading, setOdometerReading] = useState('no odometer');
  const [odometerReadingKm, setOdometerReadingKm] = useState('');
  const [vehicleStreetAddressLine1, setVehicleStreetAddressLine1] = useState('');
  const [vehicleStreetAddressLine2, setVehicleStreetAddressLine2] = useState('');
  const [vehicleStreetAddressLine3, setVehicleStreetAddressLine3] = useState('');
  const [hasDifferentVehicleAddress, setHasDifferentVehicleAddress] = useState(false);
  const [ownershipType, setOwnershipType] = useState('private');
  const [usedOnPublicRoad, setUsedOnPublicRoad] = useState(true);
  
  // Step 5: Declaration
  const [declarationRole, setDeclarationRole] = useState('owner');
  const [declarationPlace, setDeclarationPlace] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // Payment
  const [paymentAmount] = useState('150');
  const [paymentMethod, setPaymentMethod] = useState('mobile-money');
  const [paymentReference, setPaymentReference] = useState('');

  const styles = createStyles(colors, isDark, insets);

  const stepTitles = {
    1: 'Owner Information',
    2: 'Proxy (Optional)',
    3: 'Representative (Optional)',
    4: 'Vehicle Details',
    5: 'Document & Declaration',
    6: 'Review & Submit',
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocumentUri(result.assets[0].uri);
        Alert.alert('Success', 'Document selected successfully');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const validateStep = (step) => {
    // Step 1: Owner
    if (step === 1) {
      if (!identificationNumber.trim()) {
        Alert.alert('Validation Error', 'Identification number is required');
        return false;
      }
      if (idType === 'Business Reg. No') {
        if (!businessName.trim()) {
          Alert.alert('Validation Error', 'Business name is required');
          return false;
        }
      } else {
        if (!surname.trim()) {
          Alert.alert('Validation Error', 'Surname is required');
          return false;
        }
        if (!initials.trim()) {
          Alert.alert('Validation Error', 'Initials are required');
          return false;
        }
      }
      if (!postalAddressLine1.trim()) {
        Alert.alert('Validation Error', 'Postal address is required');
        return false;
      }
      if (!streetAddressLine1.trim()) {
        Alert.alert('Validation Error', 'Street address is required');
        return false;
      }
      return true;
    }

    // Step 2: Proxy (optional)
    if (step === 2) {
      if (hasProxy) {
        if (!proxyIdNumber.trim()) {
          Alert.alert('Validation Error', 'Proxy identification number is required');
          return false;
        }
        if (!proxySurname.trim()) {
          Alert.alert('Validation Error', 'Proxy surname is required');
          return false;
        }
        if (!proxyInitials.trim()) {
          Alert.alert('Validation Error', 'Proxy initials are required');
          return false;
        }
      }
      return true;
    }

    // Step 3: Representative (optional)
    if (step === 3) {
      if (hasRepresentative) {
        if (!representativeIdNumber.trim()) {
          Alert.alert('Validation Error', 'Representative identification number is required');
          return false;
        }
        if (!representativeSurname.trim()) {
          Alert.alert('Validation Error', 'Representative surname is required');
          return false;
        }
        if (!representativeInitials.trim()) {
          Alert.alert('Validation Error', 'Representative initials are required');
          return false;
        }
      }
      return true;
    }

    // Step 4: Vehicle details
    if (step === 4) {
      if (!make.trim()) {
        Alert.alert('Validation Error', 'Vehicle make is required');
        return false;
      }
      if (!seriesName.trim()) {
        Alert.alert('Validation Error', 'Series name is required');
        return false;
      }
      return true;
    }

    // Step 5: Document & Declaration
    if (step === 5) {
      if (!documentUri) {
        Alert.alert('Validation Error', 'Please upload a certified ID document');
        return false;
      }
      if (Number(paymentAmount) !== 150) {
        Alert.alert('Validation Error', 'Application fee must be NAD 150');
        return false;
      }
      if (!paymentReference.trim()) {
        Alert.alert('Validation Error', 'Payment reference is required');
        return false;
      }
      if (!declarationPlace.trim()) {
        Alert.alert('Validation Error', 'Declaration place is required');
        return false;
      }
      if (!declarationAccepted) {
        Alert.alert('Validation Error', 'You must accept the declaration');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const applicationData = {
        idType,
        identificationNumber,
        personType,
        surname: idType !== 'Business Reg. No' ? surname : undefined,
        initials: idType !== 'Business Reg. No' ? initials : undefined,
        businessName: idType === 'Business Reg. No' ? businessName : undefined,
        postalAddress: {
          line1: postalAddressLine1,
          line2: postalAddressLine2 || undefined,
          line3: postalAddressLine3 || undefined,
        },
        streetAddress: {
          line1: streetAddressLine1,
          line2: streetAddressLine2 || undefined,
          line3: streetAddressLine3 || undefined,
        },
        telephoneDay: phoneNumber ? {
          code: phoneCode,
          number: phoneNumber,
        } : undefined,
        hasProxy,
        proxyIdType: hasProxy ? proxyIdType : undefined,
        proxyIdNumber: hasProxy ? proxyIdNumber : undefined,
        proxySurname: hasProxy ? proxySurname : undefined,
        proxyInitials: hasProxy ? proxyInitials : undefined,
        hasRepresentative,
        representativeIdType: hasRepresentative ? representativeIdType : undefined,
        representativeIdNumber: hasRepresentative ? representativeIdNumber : undefined,
        representativeSurname: hasRepresentative ? representativeSurname : undefined,
        representativeInitials: hasRepresentative ? representativeInitials : undefined,
        registrationNumber: registrationNumber || undefined,
        make,
        seriesName,
        vehicleCategory: vehicleCategory || undefined,
        drivenType,
        vehicleDescription: vehicleDescription || undefined,
        netPower: netPower || undefined,
        engineCapacity: engineCapacity || undefined,
        fuelType,
        fuelTypeOther: fuelType === 'other' ? fuelTypeOther : undefined,
        totalMass: totalMass || undefined,
        grossVehicleMass: grossVehicleMass || undefined,
        maxPermissibleVehicleMass: maxPermissibleVehicleMass || undefined,
        maxPermissibleDrawingMass: maxPermissibleDrawingMass || undefined,
        transmission,
        mainColour,
        mainColourOther: mainColour === 'other' ? mainColourOther : undefined,
        usedForTransportation: usedForTransportation || undefined,
        economicSector: economicSector || undefined,
        odometerReading: odometerReading === 'no odometer' ? 'no odometer' : odometerReading === 'km' && odometerReadingKm ? `${odometerReadingKm} km` : undefined,
        odometerReadingKm: odometerReading === 'km' ? odometerReadingKm : undefined,
        vehicleStreetAddress: hasDifferentVehicleAddress ? {
          line1: vehicleStreetAddressLine1,
          line2: vehicleStreetAddressLine2 || undefined,
          line3: vehicleStreetAddressLine3 || undefined,
        } : undefined,
        ownershipType,
        usedOnPublicRoad,
        paymentAmount: Number(paymentAmount),
        paymentMethod: paymentMethod || undefined,
        paymentReference,
        declarationAccepted: true,
        declarationPlace,
        declarationRole: declarationRole === 'owner' ? 'owner' : declarationRole === 'proxy' ? 'organisation\'s proxy' : 'organisation\'s representative',
      };

      const result = await vehicleService.submitApplication(applicationData, documentUri, applicationType);

      Alert.alert(
        'Application Submitted',
        `Your application has been submitted successfully.\n\nReference ID: ${result.application.referenceId}\nTracking PIN: ${result.application.trackingPin}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Applications'),
          },
        ]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    const steps = [1, 2, 3, 4, 5, 6];
    return (
      <View style={styles.progressContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <View style={styles.stepContainer}>
                <View
                  style={[
                    styles.stepCircle,
                    currentStep > step && styles.stepCircleCompleted,
                    currentStep === step && styles.stepCircleCurrent,
                  ]}
                >
                  {currentStep > step ? (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  ) : (
                    <Text style={[styles.stepNumber, currentStep === step && styles.stepNumberCurrent]}>
                      {step}
                    </Text>
                  )}
                </View>
                <Text style={styles.stepLabel} numberOfLines={2}>
                  {stepTitles[step].split(' ')[0]}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.progressLine,
                    currentStep > step && styles.progressLineCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.sectionTitle}>A. Owner Information</Text>
      
      <Text style={styles.label}>Type of identification (mark with X) *</Text>
      <View style={styles.radioGroup}>
        {['Traffic Register Number', 'Namibia ID-doc', 'Business Reg. No'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.radioOption, idType === type && styles.radioOptionSelected]}
            onPress={() => setIdType(type)}
          >
            <Ionicons
              name={idType === type ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={idType === type ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.radioLabel}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Identification Number *</Text>
      <TextInput
        style={styles.input}
        value={identificationNumber}
        onChangeText={setIdentificationNumber}
        placeholder="Enter identification number"
      />

      <Text style={styles.label}>Nature of person/organisation (mark with X)</Text>
      <View style={styles.radioGroup}>
        {['male', 'female', 'one-man business', 'Private company', 'closed corporation', 'other'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.radioOption, personType === type && styles.radioOptionSelected]}
            onPress={() => setPersonType(type)}
          >
            <Ionicons
              name={personType === type ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={personType === type ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.radioLabel}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {idType === 'Business Reg. No' ? (
        <>
          <Text style={styles.label}>Name of organisation *</Text>
          <TextInput
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Enter business name"
          />
        </>
      ) : (
        <>
          <Text style={styles.label}>Surname/name of organisation *</Text>
          <TextInput
            style={styles.input}
            value={surname}
            onChangeText={setSurname}
            placeholder="Enter surname"
          />
          <Text style={styles.label}>Initials and first names (not more than 3) *</Text>
          <TextInput
            style={styles.input}
            value={initials}
            onChangeText={setInitials}
            placeholder="Enter initials"
            maxLength={10}
          />
        </>
      )}

      <Text style={styles.label}>Postal Address *</Text>
      <TextInput
        style={styles.input}
        value={postalAddressLine1}
        onChangeText={setPostalAddressLine1}
        placeholder="Line 1"
      />
      <TextInput
        style={styles.input}
        value={postalAddressLine2}
        onChangeText={setPostalAddressLine2}
        placeholder="Line 2 (optional)"
      />
      <TextInput
        style={styles.input}
        value={postalAddressLine3}
        onChangeText={setPostalAddressLine3}
        placeholder="Line 3 (optional)"
      />

      <Text style={styles.label}>Street Address *</Text>
      <TextInput
        style={styles.input}
        value={streetAddressLine1}
        onChangeText={setStreetAddressLine1}
        placeholder="Line 1"
      />
      <TextInput
        style={styles.input}
        value={streetAddressLine2}
        onChangeText={setStreetAddressLine2}
        placeholder="Line 2 (optional)"
      />
      <TextInput
        style={styles.input}
        value={streetAddressLine3}
        onChangeText={setStreetAddressLine3}
        placeholder="Line 3 (optional)"
      />

      <Text style={styles.label}>Telephone number during day</Text>
      <View style={styles.phoneInput}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          value={phoneCode}
          onChangeText={setPhoneCode}
          placeholder="Code"
          keyboardType="phone-pad"
        />
        <TextInput
          style={[styles.input, { flex: 2 }]}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Number"
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.sectionTitle}>B. Organisation's Proxy (Optional)</Text>
      
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => setHasProxy(!hasProxy)}
      >
        <Ionicons
          name={hasProxy ? 'checkbox' : 'checkbox-outline'}
          size={24}
          color={hasProxy ? colors.primary : colors.textSecondary}
        />
        <Text style={styles.checkboxLabel}>
          I am applying on behalf of an organisation (enable proxy details)
        </Text>
      </TouchableOpacity>

      {hasProxy && (
        <>
          <Text style={styles.label}>Type of identification (mark with X) *</Text>
          <View style={styles.radioGroup}>
            {['Traffic Register Number', 'Namibia ID-doc'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.radioOption, proxyIdType === type && styles.radioOptionSelected]}
                onPress={() => setProxyIdType(type)}
              >
                <Ionicons
                  name={proxyIdType === type ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={proxyIdType === type ? colors.primary : colors.textSecondary}
                />
                <Text style={styles.radioLabel}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Identification Number *</Text>
          <TextInput
            style={styles.input}
            value={proxyIdNumber}
            onChangeText={setProxyIdNumber}
            placeholder="Enter identification number"
          />

          <Text style={styles.label}>Surname and initials *</Text>
          <TextInput
            style={styles.input}
            value={proxySurname}
            onChangeText={setProxySurname}
            placeholder="Surname"
          />
          <TextInput
            style={styles.input}
            value={proxyInitials}
            onChangeText={setProxyInitials}
            placeholder="Initials"
            maxLength={10}
          />
        </>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.sectionTitle}>C. Organisation's Representative (Optional)</Text>
      
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => setHasRepresentative(!hasRepresentative)}
      >
        <Ionicons
          name={hasRepresentative ? 'checkbox' : 'checkbox-outline'}
          size={24}
          color={hasRepresentative ? colors.primary : colors.textSecondary}
        />
        <Text style={styles.checkboxLabel}>
          Organisation has a representative (enable representative details)
        </Text>
      </TouchableOpacity>

      {hasRepresentative && (
        <>
          <Text style={styles.label}>Type of identification (mark with X) *</Text>
          <View style={styles.radioGroup}>
            {['Traffic Register Number', 'Namibia ID-doc'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.radioOption, representativeIdType === type && styles.radioOptionSelected]}
                onPress={() => setRepresentativeIdType(type)}
              >
                <Ionicons
                  name={representativeIdType === type ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={representativeIdType === type ? colors.primary : colors.textSecondary}
                />
                <Text style={styles.radioLabel}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Identification Number *</Text>
          <TextInput
            style={styles.input}
            value={representativeIdNumber}
            onChangeText={setRepresentativeIdNumber}
            placeholder="Enter identification number"
          />

          <Text style={styles.label}>Surname and initials *</Text>
          <TextInput
            style={styles.input}
            value={representativeSurname}
            onChangeText={setRepresentativeSurname}
            placeholder="Surname"
          />
          <TextInput
            style={styles.input}
            value={representativeInitials}
            onChangeText={setRepresentativeInitials}
            placeholder="Initials"
            maxLength={10}
          />
        </>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.sectionTitle}>E. Vehicle Particulars</Text>

      <Text style={styles.label}>Registration number</Text>
      <View style={styles.registrationInput}>
        <Text style={styles.registrationPrefix}>N</Text>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={registrationNumber}
          onChangeText={setRegistrationNumber}
          placeholder="Enter registration number"
        />
      </View>

      <Text style={styles.label}>Make *</Text>
      <TextInput
        style={styles.input}
        value={make}
        onChangeText={setMake}
        placeholder="e.g., Toyota, Ford"
      />

      <Text style={styles.label}>Series name (describe in full) *</Text>
      <TextInput
        style={styles.input}
        value={seriesName}
        onChangeText={setSeriesName}
        placeholder="e.g., Corolla, Ranger"
        multiline
      />

      <Text style={styles.label}>Vehicle category</Text>
      <TextInput
        style={styles.input}
        value={vehicleCategory}
        onChangeText={setVehicleCategory}
        placeholder="e.g., motorcycle, heavy load vehicle, front passenger vehicle, special vehicle"
      />

      <Text style={styles.label}>Driven (mark with X) *</Text>
      <View style={styles.radioGroup}>
        {['self-propelled', 'trailer', 'semi-trailer', 'trailer drawn by tractor'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.radioOption, drivenType === type && styles.radioOptionSelected]}
            onPress={() => setDrivenType(type)}
          >
            <Ionicons
              name={drivenType === type ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={drivenType === type ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.radioLabel}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Vehicle description</Text>
      <TextInput
        style={styles.input}
        value={vehicleDescription}
        onChangeText={setVehicleDescription}
        placeholder="e.g., station wagon, bus, ambulance"
      />

      <Text style={styles.label}>Net power and engine capacity</Text>
      <View style={styles.dualInput}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          value={netPower}
          onChangeText={setNetPower}
          placeholder="kW"
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={engineCapacity}
          onChangeText={setEngineCapacity}
          placeholder="cm³"
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.label}>Fuel type (mark with X) *</Text>
      <View style={styles.radioGroup}>
        {['petrol', 'diesel', 'other'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.radioOption, fuelType === type && styles.radioOptionSelected]}
            onPress={() => setFuelType(type)}
          >
            <Ionicons
              name={fuelType === type ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={fuelType === type ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.radioLabel}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {fuelType === 'other' && (
        <TextInput
          style={styles.input}
          value={fuelTypeOther}
          onChangeText={setFuelTypeOther}
          placeholder="Specify fuel type"
        />
      )}

      <Text style={styles.label}>Total (T) and gross vehicle mass (V)</Text>
      <View style={styles.dualInput}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          value={totalMass}
          onChangeText={setTotalMass}
          placeholder="T (kg)"
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={grossVehicleMass}
          onChangeText={setGrossVehicleMass}
          placeholder="V (kg)"
          keyboardType="numeric"
        />
      </View>

      {grossVehicleMass && parseFloat(grossVehicleMass) >= 3500 && (
        <>
          <Text style={styles.label}>Maximum permissible vehicle mass (V) (kg)</Text>
          <Text style={styles.labelHint}>Only in respect of vehicles with Gross Vehicle Mass ≥ 3500kg</Text>
          <TextInput
            style={styles.input}
            value={maxPermissibleVehicleMass}
            onChangeText={setMaxPermissibleVehicleMass}
            placeholder="kg"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Maximum permissible drawing mass (D) (kg)</Text>
          <Text style={styles.labelHint}>Only in respect of vehicles with Gross Vehicle Mass ≥ 3500kg</Text>
          <TextInput
            style={styles.input}
            value={maxPermissibleDrawingMass}
            onChangeText={setMaxPermissibleDrawingMass}
            placeholder="kg"
            keyboardType="numeric"
          />
        </>
      )}

      <Text style={styles.label}>Transmission (mark with X) *</Text>
      <View style={styles.radioGroup}>
        {['manual', 'semi-automatic', 'automatic'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.radioOption, transmission === type && styles.radioOptionSelected]}
            onPress={() => setTransmission(type)}
          >
            <Ionicons
              name={transmission === type ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={transmission === type ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.radioLabel}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Main colour (mark with X) *</Text>
      <View style={styles.radioGroup}>
        {['white', 'red', 'blue', 'other'].map((colour) => (
          <TouchableOpacity
            key={colour}
            style={[styles.radioOption, mainColour === colour && styles.radioOptionSelected]}
            onPress={() => setMainColour(colour)}
          >
            <Ionicons
              name={mainColour === colour ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={mainColour === colour ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.radioLabel}>{colour}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {mainColour === 'other' && (
        <TextInput
          style={styles.input}
          value={mainColourOther}
          onChangeText={setMainColourOther}
          placeholder="Specify colour"
        />
      )}

      <Text style={styles.label}>Used for transportation of</Text>
      <TextInput
        style={styles.input}
        value={usedForTransportation}
        onChangeText={setUsedForTransportation}
        placeholder="e.g., Passengers, livestock, building and construction materials"
        multiline
      />

      <Text style={styles.label}>Economic sector in which used</Text>
      <TextInput
        style={styles.input}
        value={economicSector}
        onChangeText={setEconomicSector}
        placeholder="e.g., private, agriculture, service"
      />

      <Text style={styles.label}>Odometer reading (if available)</Text>
      <View style={styles.radioGroup}>
        {['no odometer', 'km'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.radioOption, odometerReading === option && styles.radioOptionSelected]}
            onPress={() => setOdometerReading(option)}
          >
            <Ionicons
              name={odometerReading === option ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={odometerReading === option ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.radioLabel}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {odometerReading === 'km' && (
        <TextInput
          style={styles.input}
          value={odometerReadingKm}
          onChangeText={setOdometerReadingKm}
          placeholder="Enter odometer reading in km"
          keyboardType="numeric"
        />
      )}

      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => setHasDifferentVehicleAddress(!hasDifferentVehicleAddress)}
      >
        <Ionicons
          name={hasDifferentVehicleAddress ? 'checkbox' : 'checkbox-outline'}
          size={24}
          color={hasDifferentVehicleAddress ? colors.primary : colors.textSecondary}
        />
        <Text style={styles.checkboxLabel}>
          Street address where vehicle is kept (if different from owner's address)
        </Text>
      </TouchableOpacity>

      {hasDifferentVehicleAddress && (
        <>
          <Text style={styles.label}>Vehicle Street Address</Text>
          <TextInput
            style={styles.input}
            value={vehicleStreetAddressLine1}
            onChangeText={setVehicleStreetAddressLine1}
            placeholder="Line 1"
          />
          <TextInput
            style={styles.input}
            value={vehicleStreetAddressLine2}
            onChangeText={setVehicleStreetAddressLine2}
            placeholder="Line 2 (optional)"
          />
          <TextInput
            style={styles.input}
            value={vehicleStreetAddressLine3}
            onChangeText={setVehicleStreetAddressLine3}
            placeholder="Line 3 (optional)"
          />
        </>
      )}

      <Text style={styles.label}>Nature of ownership (mark with X) *</Text>
      <View style={styles.radioGroup}>
        {['private', 'business', 'motor dealer'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.radioOption, ownershipType === type && styles.radioOptionSelected]}
            onPress={() => setOwnershipType(type)}
          >
            <Ionicons
              name={ownershipType === type ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={ownershipType === type ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.radioLabel}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Is vehicle used on public road? (mark with X) *</Text>
      <View style={styles.radioGroup}>
        {['yes', 'no'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.radioOption, (usedOnPublicRoad ? 'yes' : 'no') === option && styles.radioOptionSelected]}
            onPress={() => setUsedOnPublicRoad(option === 'yes')}
          >
            <Ionicons
              name={(usedOnPublicRoad ? 'yes' : 'no') === option ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={(usedOnPublicRoad ? 'yes' : 'no') === option ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.radioLabel}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View>
      <Text style={styles.sectionTitle}>D. Declaration</Text>

      <Text style={styles.label}>I the (mark with X) *</Text>
      <View style={styles.radioGroup}>
        {['owner', 'proxy', 'representative'].map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.radioOption, declarationRole === role && styles.radioOptionSelected]}
            onPress={() => setDeclarationRole(role)}
          >
            <Ionicons
              name={declarationRole === role ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={declarationRole === role ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.radioLabel}>
              {role === 'owner' ? 'owner' : role === 'proxy' ? "organisation's proxy" : "organisation's representative"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Certified ID Document *</Text>
      <TouchableOpacity style={styles.documentButton} onPress={handlePickDocument}>
        <Ionicons name="document-attach-outline" size={24} color={colors.primary} />
        <Text style={styles.documentButtonText}>
          {documentUri ? 'Document Selected' : 'Select Document (PDF or Image)'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Application Fee (NAD)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.textSecondary }]}
        value={paymentAmount}
        editable={false}
      />

      <Text style={styles.label}>Payment Reference *</Text>
      <TextInput
        style={styles.input}
        value={paymentReference}
        onChangeText={setPaymentReference}
        placeholder="e.g., MTC-TRANS-12345"
      />

      <Text style={styles.label}>Payment Method (optional)</Text>
      <TextInput
        style={styles.input}
        value={paymentMethod}
        onChangeText={setPaymentMethod}
        placeholder="e.g., card, eft, mobile-money"
      />

      <Text style={styles.label}>Place *</Text>
      <TextInput
        style={styles.input}
        value={declarationPlace}
        onChangeText={setDeclarationPlace}
        placeholder="e.g., Windhoek"
      />

      <View style={styles.declarationBox}>
        <Text style={styles.declarationText}>
          (a) declare that all the particulars furnished by me in this form are true and correct; and
        </Text>
        <Text style={styles.declarationText}>
          (b) realise that a false declaration is punishable in accordance with current criminal legislation.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => setDeclarationAccepted(!declarationAccepted)}
      >
        <Ionicons
          name={declarationAccepted ? 'checkbox' : 'checkbox-outline'}
          size={24}
          color={declarationAccepted ? colors.primary : colors.textSecondary}
        />
        <Text style={styles.checkboxLabel}>
          I accept the above declaration
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep6 = () => (
    <View>
      <Text style={styles.sectionTitle}>Review & Submit</Text>
      <Card>
        <Text style={styles.reviewTitle}>A. Owner Information</Text>
        <Text style={styles.reviewText}>ID Type: {idType}</Text>
        <Text style={styles.reviewText}>ID Number: {identificationNumber}</Text>
        <Text style={styles.reviewText}>Person Type: {personType}</Text>
        {idType === 'Business Reg. No' ? (
          <Text style={styles.reviewText}>Business: {businessName}</Text>
        ) : (
          <>
            <Text style={styles.reviewText}>Surname: {surname}</Text>
            <Text style={styles.reviewText}>Initials: {initials}</Text>
          </>
        )}
        
        {hasProxy && (
          <>
            <Text style={styles.reviewTitle}>B. Proxy</Text>
            <Text style={styles.reviewText}>ID Type: {proxyIdType}</Text>
            <Text style={styles.reviewText}>ID Number: {proxyIdNumber}</Text>
            <Text style={styles.reviewText}>Name: {proxySurname} {proxyInitials}</Text>
          </>
        )}

        {hasRepresentative && (
          <>
            <Text style={styles.reviewTitle}>C. Representative</Text>
            <Text style={styles.reviewText}>ID Type: {representativeIdType}</Text>
            <Text style={styles.reviewText}>ID Number: {representativeIdNumber}</Text>
            <Text style={styles.reviewText}>Name: {representativeSurname} {representativeInitials}</Text>
          </>
        )}
        
        <Text style={styles.reviewTitle}>E. Vehicle Details</Text>
        {registrationNumber && <Text style={styles.reviewText}>Registration: N{registrationNumber}</Text>}
        <Text style={styles.reviewText}>Make: {make}</Text>
        <Text style={styles.reviewText}>Series: {seriesName}</Text>
        {vehicleCategory && <Text style={styles.reviewText}>Category: {vehicleCategory}</Text>}
        <Text style={styles.reviewText}>Driven Type: {drivenType}</Text>
        {vehicleDescription && <Text style={styles.reviewText}>Description: {vehicleDescription}</Text>}
        {(netPower || engineCapacity) && (
          <Text style={styles.reviewText}>
            Power/Capacity: {netPower}kW / {engineCapacity}cm³
          </Text>
        )}
        <Text style={styles.reviewText}>Fuel: {fuelType}{fuelTypeOther ? ` (${fuelTypeOther})` : ''}</Text>
        {(totalMass || grossVehicleMass) && (
          <Text style={styles.reviewText}>
            Mass: T={totalMass}kg, V={grossVehicleMass}kg
          </Text>
        )}
        <Text style={styles.reviewText}>Transmission: {transmission}</Text>
        <Text style={styles.reviewText}>Colour: {mainColour}{mainColourOther ? ` (${mainColourOther})` : ''}</Text>
        {usedForTransportation && <Text style={styles.reviewText}>Used for: {usedForTransportation}</Text>}
        {economicSector && <Text style={styles.reviewText}>Sector: {economicSector}</Text>}
        <Text style={styles.reviewText}>Ownership: {ownershipType}</Text>
        <Text style={styles.reviewText}>Used on public road: {usedOnPublicRoad ? 'Yes' : 'No'}</Text>
      </Card>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stepTitles[currentStep]}</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderProgressBar()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 160 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <Button
          title={currentStep > 1 ? 'Back' : 'Cancel'}
          onPress={handleBack}
          variant="outline"
          style={styles.footerButton}
        />
        <Button
          title={currentStep === 6 ? (loading ? 'Submitting...' : 'Submit') : 'Next'}
          onPress={handleNext}
          disabled={loading}
          style={styles.footerButton}
        />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function createStyles(colors, isDark, insets) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: insets.top + 8,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    progressContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.surface,
    },
    stepContainer: {
      alignItems: 'center',
      minWidth: 70,
    },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepCircleCompleted: {
      backgroundColor: colors.success,
    },
    stepCircleCurrent: {
      backgroundColor: colors.primary,
    },
    stepNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    stepNumberCurrent: {
      color: '#fff',
    },
    stepLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    progressLine: {
      flex: 1,
      height: 2,
      backgroundColor: colors.border,
      marginHorizontal: 8,
    },
    progressLineCompleted: {
      backgroundColor: colors.success,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginTop: 12,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    phoneInput: {
      flexDirection: 'row',
    },
    registrationInput: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    registrationPrefix: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginRight: 8,
      padding: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
    },
    dualInput: {
      flexDirection: 'row',
    },
    labelHint: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: -4,
      marginBottom: 8,
    },
    declarationBox: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    declarationText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 8,
    },
    radioGroup: {
      marginVertical: 8,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    radioOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      minWidth: '48%',
      marginRight: 12,
      marginBottom: 6,
    },
    radioOptionSelected: {
      // Additional styling if needed
    },
    radioLabel: {
      marginLeft: 8,
      fontSize: 16,
      color: colors.text,
    },
    documentButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: 'dashed',
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
    },
    documentButtonText: {
      marginLeft: 8,
      fontSize: 16,
      color: colors.primary,
    },
    checkbox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 16,
    },
    checkboxLabel: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    reviewTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    reviewText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    footer: {
      flexDirection: 'row',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
    footerButton: {
      flex: 1,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
