import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// Conditionally import native modules
let ImagePicker = null;
let DocumentPicker = null;
try {
  ImagePicker = require('expo-image-picker');
  DocumentPicker = require('expo-document-picker');
} catch (error) {
  console.warn('Native modules not available:', error.message);
}
import { useTheme } from '../hooks/useTheme';
import { plnService } from '../services/plnService';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { validators, getErrorMessage } from '../utils/validation';
import { useAppContext } from '../context/AppContext';
import { useEffect } from 'react';

export default function PLNApplicationScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState('A');

  // Check authentication on mount
  useEffect(() => {
    if (!user) {
      navigation.replace('Auth', {
        screen: 'Login',
        params: {
          returnScreen: 'PLNApplication',
        },
      });
    }
  }, [user, navigation]);

  // Section A - Owner/Transferor
  const [idType, setIdType] = useState('Namibia ID-doc');
  const [trafficRegisterNumber, setTrafficRegisterNumber] = useState('');
  const [businessRegNumber, setBusinessRegNumber] = useState('');
  const [surname, setSurname] = useState('');
  const [initials, setInitials] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [postalAddress, setPostalAddress] = useState({ line1: '', line2: '', line3: '' });
  const [streetAddress, setStreetAddress] = useState({ line1: '', line2: '', line3: '' });
  const [telephoneHome, setTelephoneHome] = useState({ code: '264', number: '' });
  const [telephoneDay, setTelephoneDay] = useState({ code: '264', number: '' });
  const [cellNumber, setCellNumber] = useState({ code: '264', number: '' });
  const [email, setEmail] = useState('');

  // Section B - Plate
  const [plateFormat, setPlateFormat] = useState('Normal');
  const [quantity, setQuantity] = useState(1);
  const [plateChoices, setPlateChoices] = useState([
    { text: '', meaning: '' },
    { text: '', meaning: '' },
    { text: '', meaning: '' },
  ]);

  // Section C - Representative (optional)
  const [hasRepresentative, setHasRepresentative] = useState(false);
  const [representativeIdType, setRepresentativeIdType] = useState('Namibia ID-doc');
  const [representativeIdNumber, setRepresentativeIdNumber] = useState('');
  const [representativeSurname, setRepresentativeSurname] = useState('');
  const [representativeInitials, setRepresentativeInitials] = useState('');

  // Section D - Vehicle (optional)
  const [hasVehicle, setHasVehicle] = useState(false);
  const [currentLicenceNumber, setCurrentLicenceNumber] = useState('');
  const [vehicleRegisterNumber, setVehicleRegisterNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [seriesName, setSeriesName] = useState('');

  // Section E - Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [declarationPlace, setDeclarationPlace] = useState('');

  // Document
  const [document, setDocument] = useState(null);

  // Validation errors
  const [errors, setErrors] = useState({});

  const styles = getStyles(colors);

  if (!user) {
    return null;
  }

  const updatePlateChoice = (index, field, value) => {
    const updated = [...plateChoices];
    updated[index] = { ...updated[index], [field]: value };
    setPlateChoices(updated);
    if (errors[`plate${index}${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`plate${index}${field}`];
      setErrors(newErrors);
    }
  };

  const pickDocument = async () => {
    try {
      setDocumentLoading(true);
      if (!DocumentPicker && !ImagePicker) {
        Alert.alert(
          'Document Picker Unavailable',
          'Document picker requires a development build.',
          [{ text: 'OK' }]
        );
        setDocumentLoading(false);
        return;
      }

      Alert.alert(
        'Select Document',
        'Choose document type',
        [
          {
            text: 'PDF Document',
            onPress: async () => {
              try {
                if (!DocumentPicker) {
                  Alert.alert('Error', 'Document picker not available');
                  setDocumentLoading(false);
                  return;
                }
                const result = await DocumentPicker.getDocumentAsync({
                  type: 'application/pdf',
                  copyToCacheDirectory: true,
                });
                if (!result.canceled && result.assets[0]) {
                  setDocument(result.assets[0]);
                }
              } catch (error) {
                console.error('Document picker error:', error);
                Alert.alert('Error', 'Failed to pick document.');
              } finally {
                setDocumentLoading(false);
              }
            },
          },
          {
            text: 'Image',
            onPress: async () => {
              try {
                if (!ImagePicker) {
                  Alert.alert('Error', 'Image picker not available');
                  setDocumentLoading(false);
                  return;
                }
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Permission Required', 'Media library permission is required.');
                  setDocumentLoading(false);
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.8,
                });
                if (!result.canceled && result.assets[0]) {
                  setDocument({
                    uri: result.assets[0].uri,
                    name: 'document.jpg',
                    mimeType: 'image/jpeg',
                  });
                }
              } catch (error) {
                console.error('Image picker error:', error);
                Alert.alert('Error', 'Failed to pick image.');
              } finally {
                setDocumentLoading(false);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setDocumentLoading(false),
          },
        ]
      );
    } catch (error) {
      console.error('Pick document error:', error);
      setDocumentLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Section A validation
    if (!idType) {
      newErrors.idType = 'ID type is required';
    }

    if (idType === 'Traffic Register Number' || idType === 'Namibia ID-doc') {
      if (!trafficRegisterNumber || !trafficRegisterNumber.trim()) {
        newErrors.trafficRegisterNumber = 'ID number is required';
      }
    } else if (idType === 'Business Reg. No') {
      if (!businessRegNumber || !businessRegNumber.trim()) {
        newErrors.businessRegNumber = 'Business registration number is required';
      }
      if (!businessName || !businessName.trim()) {
        newErrors.businessName = 'Business name is required';
      }
    }

    if (!surname || !surname.trim()) {
      newErrors.surname = 'Surname is required';
    }

    if (!initials || !initials.trim()) {
      newErrors.initials = 'Initials are required';
    }

    if (!postalAddress.line1 || !postalAddress.line1.trim()) {
      newErrors.postalAddress = 'Postal address line 1 is required';
    }

    if (!streetAddress.line1 || !streetAddress.line1.trim()) {
      newErrors.streetAddress = 'Street address line 1 is required';
    }

    // At least one contact method
    if (
      (!cellNumber.number || !cellNumber.number.trim()) &&
      (!telephoneDay.number || !telephoneDay.number.trim()) &&
      (!telephoneHome.number || !telephoneHome.number.trim()) &&
      (!email || !email.trim() || !validators.email(email))
    ) {
      newErrors.contact = 'At least one contact method (phone or email) is required';
    }

    if (email && email.trim() && !validators.email(email)) {
      newErrors.email = getErrorMessage('Email', 'email');
    }

    // Section B validation
    if (!plateFormat) {
      newErrors.plateFormat = 'Plate format is required';
    }

    if (quantity !== 1 && quantity !== 2) {
      newErrors.quantity = 'Quantity must be 1 or 2';
    }

    plateChoices.forEach((choice, index) => {
      if (!validators.required(choice.text)) {
        newErrors[`plate${index}text`] = `Plate choice ${index + 1} text is required`;
      } else if (!validators.plnPlateText(choice.text)) {
        newErrors[`plate${index}text`] = getErrorMessage('Plate text', 'plnPlateText');
      }
      if (!validators.required(choice.meaning)) {
        newErrors[`plate${index}meaning`] = `Plate choice ${index + 1} meaning is required`;
      }
    });

    // Section C validation (if applicable)
    if (hasRepresentative) {
      if (!representativeIdNumber || !representativeIdNumber.trim()) {
        newErrors.representativeIdNumber = 'Representative ID number is required';
      }
      if (!representativeSurname || !representativeSurname.trim()) {
        newErrors.representativeSurname = 'Representative surname is required';
      }
    }

    // Section E validation
    if (!declarationAccepted) {
      newErrors.declarationAccepted = 'You must accept the declaration';
    }

    if (!declarationPlace || !declarationPlace.trim()) {
      newErrors.declarationPlace = 'Declaration place is required';
    }

    // Document validation
    if (!document) {
      newErrors.document = 'Certified ID document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    try {
      setLoading(true);

      const applicationData = {
        // Section A
        idType,
        trafficRegisterNumber: idType !== 'Business Reg. No' ? trafficRegisterNumber.trim() : undefined,
        businessRegNumber: idType === 'Business Reg. No' ? businessRegNumber.trim() : undefined,
        surname: surname.trim(),
        initials: initials.trim(),
        businessName: idType === 'Business Reg. No' ? businessName.trim() : undefined,
        postalAddress: {
          line1: postalAddress.line1.trim(),
          line2: postalAddress.line2?.trim(),
          line3: postalAddress.line3?.trim(),
        },
        streetAddress: {
          line1: streetAddress.line1.trim(),
          line2: streetAddress.line2?.trim(),
          line3: streetAddress.line3?.trim(),
        },
        telephoneHome: telephoneHome.number.trim() ? telephoneHome : undefined,
        telephoneDay: telephoneDay.number.trim() ? telephoneDay : undefined,
        cellNumber: cellNumber.number.trim() ? cellNumber : undefined,
        email: email.trim() || undefined,
        // Section B
        plateFormat,
        quantity,
        plateChoices: plateChoices.map((choice) => ({
          text: choice.text.trim().toUpperCase(),
          meaning: choice.meaning.trim(),
        })),
        // Section C
        hasRepresentative,
        representativeIdType: hasRepresentative ? representativeIdType : undefined,
        representativeIdNumber: hasRepresentative ? representativeIdNumber.trim() : undefined,
        representativeSurname: hasRepresentative ? representativeSurname.trim() : undefined,
        representativeInitials: hasRepresentative ? representativeInitials.trim() : undefined,
        // Section D
        currentLicenceNumber: hasVehicle ? currentLicenceNumber.trim() : undefined,
        vehicleRegisterNumber: hasVehicle ? vehicleRegisterNumber.trim() : undefined,
        chassisNumber: hasVehicle ? chassisNumber.trim() : undefined,
        vehicleMake: hasVehicle ? vehicleMake.trim() : undefined,
        seriesName: hasVehicle ? seriesName.trim() : undefined,
        // Section E
        declarationAccepted: true,
        declarationPlace: declarationPlace.trim(),
        declarationRole: 'applicant',
      };

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/840482ea-b688-47d0-96ab-c9c7a8f201f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PLNApplicationScreen.js:362',message:'Form prepared applicationData',data:{hasIdType:!!applicationData.idType,hasSurname:!!applicationData.surname,hasPostalAddress:!!applicationData.postalAddress,hasFullName:!!applicationData.fullName,postalAddressLine1:applicationData.postalAddress?.line1},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      const application = await plnService.submitApplication(applicationData, document.uri);

      navigation.replace('PLNConfirmation', {
        referenceId: application.referenceId,
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert(
        'Error Submitting Application',
        error.message || 'Failed to submit application. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
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
            <Text style={styles.headerTitle}>PLN Application</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>Application Progress</Text>
            <View style={styles.progressSteps}>
              {['A', 'B', 'C', 'D', 'E'].map((section, index) => {
                const isActive = currentSection === section;
                const isCompleted = ['A', 'B', 'C', 'D', 'E'].indexOf(currentSection) > index;
                return (
                  <TouchableOpacity
                    key={section}
                    style={styles.progressStep}
                    onPress={() => setCurrentSection(section)}
                  >
                    <View
                      style={[
                        styles.progressStepCircle,
                        isActive && { backgroundColor: colors.primary },
                        isCompleted && { backgroundColor: colors.success },
                      ]}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      ) : (
                        <Text style={[styles.progressStepText, isActive && { color: '#FFFFFF' }]}>
                          {section}
                        </Text>
                      )}
                    </View>
                    {index < 4 && (
                      <View
                        style={[
                          styles.progressStepLine,
                          isCompleted && { backgroundColor: colors.success },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section A: Owner/Transferor */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>A. PARTICULARS OF OWNER/TRANSFEROR</Text>
            
            <Text style={styles.fieldLabel}>Type of identification *</Text>
            <View style={styles.radioGroup}>
              {['Traffic Register Number', 'Namibia ID-doc', 'Business Reg. No'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.radioOption}
                  onPress={() => {
                    setIdType(type);
                    if (errors.idType) {
                      const newErrors = { ...errors };
                      delete newErrors.idType;
                      setErrors(newErrors);
                    }
                  }}
                >
                  <View style={styles.radioCircle}>
                    {idType === type && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.idType && <Text style={styles.errorText}>{errors.idType}</Text>}

            {(idType === 'Traffic Register Number' || idType === 'Namibia ID-doc') && (
              <FormInput
                label={`${idType} Number *`}
                value={trafficRegisterNumber}
                onChangeText={(text) => {
                  setTrafficRegisterNumber(text);
                  if (errors.trafficRegisterNumber) {
                    const newErrors = { ...errors };
                    delete newErrors.trafficRegisterNumber;
                    setErrors(newErrors);
                  }
                }}
                placeholder={`Enter your ${idType.toLowerCase()} number`}
                error={errors.trafficRegisterNumber}
              />
            )}

            {idType === 'Business Reg. No' && (
              <>
                <FormInput
                  label="Business Registration Number *"
                  value={businessRegNumber}
                  onChangeText={(text) => {
                    setBusinessRegNumber(text);
                    if (errors.businessRegNumber) {
                      const newErrors = { ...errors };
                      delete newErrors.businessRegNumber;
                      setErrors(newErrors);
                    }
                  }}
                  placeholder="Enter business registration number"
                  error={errors.businessRegNumber}
                />
                <FormInput
                  label="Business Name *"
                  value={businessName}
                  onChangeText={(text) => {
                    setBusinessName(text);
                    if (errors.businessName) {
                      const newErrors = { ...errors };
                      delete newErrors.businessName;
                      setErrors(newErrors);
                    }
                  }}
                  placeholder="Enter business name"
                  error={errors.businessName}
                />
              </>
            )}

            <FormInput
              label="Surname *"
              value={surname}
              onChangeText={(text) => {
                setSurname(text);
                if (errors.surname) {
                  const newErrors = { ...errors };
                  delete newErrors.surname;
                  setErrors(newErrors);
                }
              }}
              placeholder="Enter your surname"
              error={errors.surname}
            />

            <FormInput
              label="Initials *"
              value={initials}
              onChangeText={(text) => {
                setInitials(text);
                if (errors.initials) {
                  const newErrors = { ...errors };
                  delete newErrors.initials;
                  setErrors(newErrors);
                }
              }}
              placeholder="Enter your initials"
              error={errors.initials}
            />

            <Text style={styles.fieldLabel}>Postal Address *</Text>
            <FormInput
              label="Line 1 *"
              value={postalAddress.line1}
              onChangeText={(text) => {
                setPostalAddress({ ...postalAddress, line1: text });
                if (errors.postalAddress) {
                  const newErrors = { ...errors };
                  delete newErrors.postalAddress;
                  setErrors(newErrors);
                }
              }}
              placeholder="Postal address line 1"
              error={errors.postalAddress}
            />
            <FormInput
              label="Line 2"
              value={postalAddress.line2}
              onChangeText={(text) => setPostalAddress({ ...postalAddress, line2: text })}
              placeholder="Postal address line 2 (optional)"
            />
            <FormInput
              label="Line 3"
              value={postalAddress.line3}
              onChangeText={(text) => setPostalAddress({ ...postalAddress, line3: text })}
              placeholder="Postal address line 3 (optional)"
            />

            <Text style={styles.fieldLabel}>Street Address *</Text>
            <FormInput
              label="Line 1 *"
              value={streetAddress.line1}
              onChangeText={(text) => {
                setStreetAddress({ ...streetAddress, line1: text });
                if (errors.streetAddress) {
                  const newErrors = { ...errors };
                  delete newErrors.streetAddress;
                  setErrors(newErrors);
                }
              }}
              placeholder="Street address line 1"
              error={errors.streetAddress}
            />
            <FormInput
              label="Line 2"
              value={streetAddress.line2}
              onChangeText={(text) => setStreetAddress({ ...streetAddress, line2: text })}
              placeholder="Street address line 2 (optional)"
            />
            <FormInput
              label="Line 3"
              value={streetAddress.line3}
              onChangeText={(text) => setStreetAddress({ ...streetAddress, line3: text })}
              placeholder="Street address line 3 (optional)"
            />

            <Text style={styles.fieldLabel}>Contact Information</Text>
            <View style={styles.phoneRow}>
              <FormInput
                label="Home Phone Code"
                value={telephoneHome.code}
                onChangeText={(text) => setTelephoneHome({ ...telephoneHome, code: text })}
                placeholder="264"
                style={styles.phoneCode}
              />
              <FormInput
                label="Home Phone Number"
                value={telephoneHome.number}
                onChangeText={(text) => setTelephoneHome({ ...telephoneHome, number: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                style={styles.phoneNumber}
              />
            </View>

            <View style={styles.phoneRow}>
              <FormInput
                label="Day Phone Code"
                value={telephoneDay.code}
                onChangeText={(text) => setTelephoneDay({ ...telephoneDay, code: text })}
                placeholder="264"
                style={styles.phoneCode}
              />
              <FormInput
                label="Day Phone Number"
                value={telephoneDay.number}
                onChangeText={(text) => setTelephoneDay({ ...telephoneDay, number: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                style={styles.phoneNumber}
              />
            </View>

            <View style={styles.phoneRow}>
              <FormInput
                label="Cell Code"
                value={cellNumber.code}
                onChangeText={(text) => setCellNumber({ ...cellNumber, code: text })}
                placeholder="264"
                style={styles.phoneCode}
              />
              <FormInput
                label="Cell Number"
                value={cellNumber.number}
                onChangeText={(text) => {
                  setCellNumber({ ...cellNumber, number: text });
                  if (errors.contact) {
                    const newErrors = { ...errors };
                    delete newErrors.contact;
                    setErrors(newErrors);
                  }
                }}
                placeholder="Enter cell number"
                keyboardType="phone-pad"
                style={styles.phoneNumber}
              />
            </View>

            <FormInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email || errors.contact) {
                  const newErrors = { ...errors };
                  delete newErrors.email;
                  delete newErrors.contact;
                  setErrors(newErrors);
                }
              }}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}
          </Card>

          {/* Section B: Plate Format & Choices */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>B. PERSONALISED NUMBER PLATE</Text>
            
            <Text style={styles.fieldLabel}>Number plate format *</Text>
            <View style={styles.radioGroup}>
              {['Long/German', 'Normal', 'American', 'Square', 'Small motorcycle'].map((format) => (
                <TouchableOpacity
                  key={format}
                  style={styles.radioOption}
                  onPress={() => {
                    setPlateFormat(format);
                    if (errors.plateFormat) {
                      const newErrors = { ...errors };
                      delete newErrors.plateFormat;
                      setErrors(newErrors);
                    }
                  }}
                >
                  <View style={styles.radioCircle}>
                    {plateFormat === format && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>{format}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.plateFormat && <Text style={styles.errorText}>{errors.plateFormat}</Text>}

            <Text style={styles.fieldLabel}>Quantity *</Text>
            <View style={styles.radioGroup}>
              {[1, 2].map((qty) => (
                <TouchableOpacity
                  key={qty}
                  style={styles.radioOption}
                  onPress={() => {
                    setQuantity(qty);
                    if (errors.quantity) {
                      const newErrors = { ...errors };
                      delete newErrors.quantity;
                      setErrors(newErrors);
                    }
                  }}
                >
                  <View style={styles.radioCircle}>
                    {quantity === qty && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>{qty}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}

            <Text style={styles.fieldLabel}>Plate Choices (3 choices required) *</Text>
            {plateChoices.map((choice, index) => (
              <View key={index} style={styles.plateChoiceContainer}>
                <Text style={styles.plateChoiceLabel}>Choice {index + 1}</Text>
                <FormInput
                  label="Plate Text (max 7 alphanumeric) *"
                  value={choice.text}
                  onChangeText={(text) => {
                    const upperText = text.toUpperCase().slice(0, 7);
                    updatePlateChoice(index, 'text', upperText);
                  }}
                  placeholder="e.g., ABC123"
                  maxLength={7}
                  error={errors[`plate${index}text`]}
                />
                <FormInput
                  label="Meaning *"
                  value={choice.meaning}
                  onChangeText={(text) => updatePlateChoice(index, 'meaning', text)}
                  placeholder="Explain the meaning of this plate"
                  textArea
                  error={errors[`plate${index}meaning`]}
                />
              </View>
            ))}
          </Card>

          {/* Section C: Representative (Optional) */}
          <Card style={styles.section}>
            <View style={styles.toggleContainer}>
              <Text style={styles.sectionTitle}>C. APPLICANT'S REPRESENTATIVE / PROXY</Text>
              <Switch
                value={hasRepresentative}
                onValueChange={(value) => {
                  setHasRepresentative(value);
                  if (!value) {
                    setRepresentativeIdNumber('');
                    setRepresentativeSurname('');
                    setRepresentativeInitials('');
                  }
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {hasRepresentative && (
              <>
                <Text style={styles.fieldLabel}>Type of identification *</Text>
                <View style={styles.radioGroup}>
                  {['Traffic Register Number', 'Namibia ID-doc'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={styles.radioOption}
                      onPress={() => setRepresentativeIdType(type)}
                    >
                      <View style={styles.radioCircle}>
                        {representativeIdType === type && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.radioLabel}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <FormInput
                  label="Identification Number *"
                  value={representativeIdNumber}
                  onChangeText={(text) => {
                    setRepresentativeIdNumber(text);
                    if (errors.representativeIdNumber) {
                      const newErrors = { ...errors };
                      delete newErrors.representativeIdNumber;
                      setErrors(newErrors);
                    }
                  }}
                  placeholder="Enter identification number"
                  error={errors.representativeIdNumber}
                />

                <FormInput
                  label="Surname *"
                  value={representativeSurname}
                  onChangeText={(text) => {
                    setRepresentativeSurname(text);
                    if (errors.representativeSurname) {
                      const newErrors = { ...errors };
                      delete newErrors.representativeSurname;
                      setErrors(newErrors);
                    }
                  }}
                  placeholder="Enter surname"
                  error={errors.representativeSurname}
                />

                <FormInput
                  label="Initials"
                  value={representativeInitials}
                  onChangeText={(text) => setRepresentativeInitials(text)}
                  placeholder="Enter initials"
                />
              </>
            )}
          </Card>

          {/* Section D: Vehicle (Optional) */}
          <Card style={styles.section}>
            <View style={styles.toggleContainer}>
              <Text style={styles.sectionTitle}>D. PARTICULARS OF VEHICLE</Text>
              <Switch
                value={hasVehicle}
                onValueChange={(value) => {
                  setHasVehicle(value);
                  if (!value) {
                    setCurrentLicenceNumber('');
                    setVehicleRegisterNumber('');
                    setChassisNumber('');
                    setVehicleMake('');
                    setSeriesName('');
                  }
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {hasVehicle && (
              <>
                <FormInput
                  label="Current Licence Number"
                  value={currentLicenceNumber}
                  onChangeText={(text) => setCurrentLicenceNumber(text)}
                  placeholder="Enter current licence number"
                />
                <FormInput
                  label="Vehicle Register Number"
                  value={vehicleRegisterNumber}
                  onChangeText={(text) => setVehicleRegisterNumber(text)}
                  placeholder="Enter vehicle register number"
                />
                <FormInput
                  label="Chassis Number/VIN"
                  value={chassisNumber}
                  onChangeText={(text) => setChassisNumber(text)}
                  placeholder="Enter chassis number"
                />
                <FormInput
                  label="Vehicle Make"
                  value={vehicleMake}
                  onChangeText={(text) => setVehicleMake(text)}
                  placeholder="Enter vehicle make"
                />
                <FormInput
                  label="Series Name"
                  value={seriesName}
                  onChangeText={(text) => setSeriesName(text)}
                  placeholder="Enter series name"
                />
              </>
            )}
          </Card>

          {/* Document Upload */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Upload Documents</Text>
            <Text style={styles.sectionSubtext}>
              Upload your certified ID (PDF or image)
            </Text>
            <TouchableOpacity
              style={[styles.uploadButton, errors.document && styles.uploadButtonError]}
              onPress={pickDocument}
              disabled={documentLoading}
            >
              {documentLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Ionicons
                    name={document ? 'checkmark-circle' : 'cloud-upload-outline'}
                    size={24}
                    color={document ? colors.success : colors.primary}
                  />
                  <Text style={styles.uploadButtonText}>
                    {document ? document.name || 'Document selected' : 'Select Document'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            {errors.document && <Text style={styles.errorText}>{errors.document}</Text>}
          </Card>

          {/* Section E: Declaration */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>E. DECLARATION</Text>
            <Text style={styles.declarationText}>
              I the applicant / holder of a personalised licence number declare that:{'\n\n'}
              (a) I am aware that a personalised licence number or the right to use it may be subject to copyright or other intellectual property rights.{'\n\n'}
              (b) In the event of surrender of a personalised licence number, I declare that the personalised licence plates have been destroyed.{'\n\n'}
              (c) I declare that all the particulars furnished by me are true and correct.{'\n\n'}
              (d) I am aware that a false declaration is punishable by law.
            </Text>

            <FormInput
              label="Place *"
              value={declarationPlace}
              onChangeText={(text) => {
                setDeclarationPlace(text);
                if (errors.declarationPlace) {
                  const newErrors = { ...errors };
                  delete newErrors.declarationPlace;
                  setErrors(newErrors);
                }
              }}
              placeholder="Enter declaration place"
              error={errors.declarationPlace}
            />

            <View style={styles.declarationContainer}>
              <Switch
                value={declarationAccepted}
                onValueChange={(value) => {
                  setDeclarationAccepted(value);
                  if (errors.declarationAccepted) {
                    const newErrors = { ...errors };
                    delete newErrors.declarationAccepted;
                    setErrors(newErrors);
                  }
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
              <Text style={styles.declarationAcceptText}>
                I accept the declaration *
              </Text>
            </View>
            {errors.declarationAccepted && (
              <Text style={styles.errorText}>{errors.declarationAccepted}</Text>
            )}
          </Card>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button
              label={loading ? 'Submitting...' : 'Submit Application'}
              onPress={handleSubmit}
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    keyboardView: {
      flex: 1,
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
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    sectionSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    fieldLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginTop: 12,
      marginBottom: 8,
    },
    radioGroup: {
      marginBottom: 12,
    },
    radioOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    radioCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.primary,
      marginRight: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    radioLabel: {
      fontSize: 14,
      color: colors.text,
    },
    phoneRow: {
      flexDirection: 'row',
      gap: 10,
    },
    phoneCode: {
      flex: 0.3,
    },
    phoneNumber: {
      flex: 0.7,
    },
    plateChoiceContainer: {
      marginBottom: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    plateChoiceLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 8,
      padding: 20,
      gap: 12,
    },
    uploadButtonError: {
      borderColor: colors.error,
    },
    uploadButtonText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '600',
    },
    declarationText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 16,
    },
    declarationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 12,
    },
    declarationAcceptText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
      marginTop: 4,
    },
    buttonContainer: {
      marginTop: 10,
      marginBottom: 20,
    },
    progressContainer: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      marginHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    progressTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    progressSteps: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressStep: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    progressStepCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
    },
    progressStepText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    progressStepLine: {
      flex: 1,
      height: 2,
      backgroundColor: colors.border,
      marginHorizontal: 4,
    },
  });
}
