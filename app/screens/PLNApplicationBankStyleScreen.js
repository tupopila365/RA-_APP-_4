import React, { useState, useEffect } from 'react';
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
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { plnService } from '../services/plnService';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { validators, getErrorMessage } from '../utils/validation';
import { useAppContext } from '../context/AppContext';

// Conditionally import native modules
let ImagePicker = null;
let DocumentPicker = null;
try {
  ImagePicker = require('expo-image-picker');
  DocumentPicker = require('expo-document-picker');
} catch (error) {
  console.warn('Native modules not available:', error.message);
}

const { width } = Dimensions.get('window');

export default function PLNApplicationBankStyleScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { user } = useAppContext();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [formProgress, setFormProgress] = useState(0);

  // Dynamic styles based on theme
  const dynamicStyles = createDynamicStyles(colors, isDark, insets);

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

  // Form sections matching exact PDF structure
  const sections = [
    { id: 'A', title: 'Particulars of Owner/Transferor', icon: 'person' },
    { id: 'B', title: 'Personalised Number Plate', icon: 'car' },
    { id: 'C', title: 'Representative/Proxy', icon: 'people' },
    { id: 'D', title: 'Vehicle Particulars', icon: 'directions-car' },
    { id: 'E', title: 'Declaration', icon: 'assignment' },
    { id: 'F', title: 'Document Upload', icon: 'attach-file' },
  ];

  // Section A - Owner/Transferor (matching PDF exactly)
  const [transactionType] = useState('New Personalised Licence Number');
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

  // Section B - Personalised Number Plate (matching PDF exactly)
  const [plateFormat, setPlateFormat] = useState('Normal');
  const [quantity, setQuantity] = useState(1);
  const [plateChoices, setPlateChoices] = useState([
    { text: '', meaning: '' },
    { text: '', meaning: '' },
    { text: '', meaning: '' },
  ]);

  // Section C - Representative/Proxy (optional, matching PDF)
  const [hasRepresentative, setHasRepresentative] = useState(false);
  const [representativeIdType, setRepresentativeIdType] = useState('Traffic Register Number');
  const [representativeIdNumber, setRepresentativeIdNumber] = useState('');
  const [representativeSurname, setRepresentativeSurname] = useState('');
  const [representativeInitials, setRepresentativeInitials] = useState('');

  // Section D - Vehicle Particulars (optional, matching PDF)
  const [hasVehicle, setHasVehicle] = useState(false);
  const [currentLicenceNumber, setCurrentLicenceNumber] = useState('');
  const [vehicleRegisterNumber, setVehicleRegisterNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [seriesName, setSeriesName] = useState('');

  // Section E - Declaration (matching PDF exactly)
  const [declarationRole, setDeclarationRole] = useState('applicant');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [declarationPlace, setDeclarationPlace] = useState('');

  // Document
  const [document, setDocument] = useState(null);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Calculate form progress
  useEffect(() => {
    const totalFields = 15; // Approximate required fields
    let filledFields = 0;
    
    if (surname) filledFields++;
    if (initials) filledFields++;
    if (idType && (trafficRegisterNumber || businessRegNumber)) filledFields++;
    if (postalAddress.line1) filledFields++;
    if (streetAddress.line1) filledFields++;
    if (cellNumber.number) filledFields++;
    if (email) filledFields++;
    if (plateFormat) filledFields++;
    if (quantity) filledFields++;
    if (plateChoices[0].text) filledFields++;
    if (plateChoices[1].text) filledFields++;
    if (plateChoices[2].text) filledFields++;
    if (declarationPlace) filledFields++;
    if (declarationAccepted) filledFields++;
    if (document) filledFields++;
    
    setFormProgress((filledFields / totalFields) * 100);
  }, [surname, initials, trafficRegisterNumber, businessRegNumber, postalAddress, streetAddress, 
      cellNumber, email, plateFormat, quantity, plateChoices, declarationPlace, declarationAccepted, document]);

  const handleDocumentPick = async () => {
    if (!DocumentPicker) {
      Alert.alert('Error', 'Document picker not available');
      return;
    }

    try {
      setDocumentLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setDocument({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType,
          size: asset.size,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    } finally {
      setDocumentLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!surname.trim()) newErrors.surname = 'Surname is required';
    if (!initials.trim()) newErrors.initials = 'Initials are required';
    
    if (idType === 'Traffic Register Number' && !trafficRegisterNumber.trim()) {
      newErrors.trafficRegisterNumber = 'Traffic Register Number is required';
    }
    if (idType === 'Business Reg. No' && !businessRegNumber.trim()) {
      newErrors.businessRegNumber = 'Business Registration Number is required';
    }
    if (idType === 'Business Reg. No' && !businessName.trim()) {
      newErrors.businessName = 'Business Name is required';
    }

    if (!postalAddress.line1.trim()) newErrors.postalAddressLine1 = 'Postal address is required';
    if (!streetAddress.line1.trim()) newErrors.streetAddressLine1 = 'Street address is required';
    if (!cellNumber.number.trim()) newErrors.cellNumber = 'Cell number is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (email && !validators.email(email)) newErrors.email = 'Invalid email format';

    if (!plateChoices[0].text.trim()) newErrors.plateChoice1 = '1st plate choice is required';
    if (!plateChoices[1].text.trim()) newErrors.plateChoice2 = '2nd plate choice is required';
    if (!plateChoices[2].text.trim()) newErrors.plateChoice3 = '3rd plate choice is required';

    if (!declarationPlace.trim()) newErrors.declarationPlace = 'Declaration place is required';
    if (!declarationAccepted) newErrors.declarationAccepted = 'You must accept the declaration';
    if (!document) newErrors.document = 'ID document is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const applicationData = {
        transactionType,
        // Section A
        idType,
        trafficRegisterNumber: idType === 'Traffic Register Number' ? trafficRegisterNumber : undefined,
        businessRegNumber: idType === 'Business Reg. No' ? businessRegNumber : undefined,
        surname: idType !== 'Business Reg. No' ? surname : undefined,
        initials: idType !== 'Business Reg. No' ? initials : undefined,
        businessName: idType === 'Business Reg. No' ? businessName : undefined,
        postalAddress,
        streetAddress,
        telephoneHome: telephoneHome.number ? telephoneHome : undefined,
        telephoneDay: telephoneDay.number ? telephoneDay : undefined,
        cellNumber,
        email,
        
        // Section B
        plateFormat,
        quantity,
        plateChoices,
        
        // Section C
        hasRepresentative,
        representativeIdType: hasRepresentative ? representativeIdType : undefined,
        representativeIdNumber: hasRepresentative ? representativeIdNumber : undefined,
        representativeSurname: hasRepresentative ? representativeSurname : undefined,
        representativeInitials: hasRepresentative ? representativeInitials : undefined,
        
        // Section D
        currentLicenceNumber: hasVehicle ? currentLicenceNumber : undefined,
        vehicleRegisterNumber: hasVehicle ? vehicleRegisterNumber : undefined,
        chassisNumber: hasVehicle ? chassisNumber : undefined,
        vehicleMake: hasVehicle ? vehicleMake : undefined,
        seriesName: hasVehicle ? seriesName : undefined,
        
        // Section E
        declarationRole,
        declarationAccepted,
        declarationDate: new Date().toISOString(),
        declarationPlace,
      };

      const response = await plnService.submitApplication(applicationData, document.uri);
      
      Alert.alert(
        'Success',
        `Application submitted successfully!\nReference ID: ${response.referenceId}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('PLNTracking', { referenceId: response.referenceId }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const renderProgressBar = () => (
    <View style={[dynamicStyles.progressContainer]}>
      <View style={dynamicStyles.progressHeader}>
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={dynamicStyles.progressTitleContainer}>
          <MaterialIcons name="account-balance" size={24} color={colors.primary} />
          <Text style={[dynamicStyles.progressTitle]}>PLN Application</Text>
        </View>
        <Text style={[dynamicStyles.progressPercentage]}>{Math.round(formProgress)}%</Text>
      </View>
      <View style={[dynamicStyles.progressBarContainer]}>
        <View style={[dynamicStyles.progressBar, { width: `${formProgress}%` }]} />
      </View>
      <View style={dynamicStyles.sectionIndicators}>
        {sections.map((section, index) => (
          <TouchableOpacity
            key={section.id}
            style={[
              dynamicStyles.sectionIndicator,
              index === currentSection && dynamicStyles.activeSectionIndicator,
              index < currentSection && dynamicStyles.completedSectionIndicator,
            ]}
            onPress={() => setCurrentSection(index)}
          >
            <MaterialIcons
              name={section.icon}
              size={16}
              color={index <= currentSection ? '#fff' : (isDark ? '#666' : '#999')}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={dynamicStyles.currentSectionTitle}>
        {sections[currentSection].title}
      </Text>
    </View>
  );

  const renderSectionA = () => (
    <Card style={dynamicStyles.sectionCard}>
      <View style={dynamicStyles.sectionHeader}>
        <MaterialIcons name="person" size={24} color={colors.primary} />
        <Text style={dynamicStyles.sectionTitle}>A. PARTICULARS OF OWNER/TRANSFEROR</Text>
      </View>
      
      <Text style={dynamicStyles.fieldLabel}>Transaction Type</Text>
      <View style={dynamicStyles.readOnlyField}>
        <Text style={dynamicStyles.readOnlyText}>{transactionType}</Text>
        <MaterialIcons name="check-circle" size={20} color={colors.success} />
      </View>

      <Text style={dynamicStyles.fieldLabel}>Type of identification (select one) *</Text>
      <View style={dynamicStyles.radioGroup}>
        {['Traffic Register Number', 'Namibia ID-doc', 'Business Reg. No'].map((type) => (
          <TouchableOpacity
            key={type}
            style={dynamicStyles.radioOption}
            onPress={() => setIdType(type)}
          >
            <View style={[dynamicStyles.radioCircle, idType === type && dynamicStyles.radioSelected]}>
              {idType === type && <View style={dynamicStyles.radioInner} />}
            </View>
            <Text style={dynamicStyles.radioText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {idType === 'Traffic Register Number' && (
        <FormInput
          label="Traffic Register Number *"
          value={trafficRegisterNumber}
          onChangeText={setTrafficRegisterNumber}
          placeholder="Enter traffic register number"
          error={errors.trafficRegisterNumber}
          maxLength={13}
          keyboardType="numeric"
        />
      )}

      {idType === 'Business Reg. No' && (
        <>
          <FormInput
            label="Business Registration Number *"
            value={businessRegNumber}
            onChangeText={setBusinessRegNumber}
            placeholder="Enter business registration number"
            error={errors.businessRegNumber}
            maxLength={20}
          />
          <FormInput
            label="Business Name *"
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Enter business name"
            error={errors.businessName}
            maxLength={50}
          />
        </>
      )}

      {idType !== 'Business Reg. No' && (
        <>
          <FormInput
            label="Surname *"
            value={surname}
            onChangeText={setSurname}
            placeholder="Enter surname"
            error={errors.surname}
            maxLength={25}
            autoCapitalize="words"
          />
          <FormInput
            label="Initials *"
            value={initials}
            onChangeText={setInitials}
            placeholder="Enter initials (e.g., J.D.)"
            error={errors.initials}
            maxLength={10}
            autoCapitalize="characters"
          />
        </>
      )}

      <Text style={dynamicStyles.sectionSubtitle}>Postal Address *</Text>
      <FormInput
        label="Address Line 1 *"
        value={postalAddress.line1}
        onChangeText={(text) => setPostalAddress({ ...postalAddress, line1: text })}
        placeholder="P.O. Box or street address"
        error={errors.postalAddressLine1}
        maxLength={40}
      />
      <FormInput
        label="Address Line 2"
        value={postalAddress.line2}
        onChangeText={(text) => setPostalAddress({ ...postalAddress, line2: text })}
        placeholder="City or area"
        maxLength={40}
      />
      <FormInput
        label="Address Line 3"
        value={postalAddress.line3}
        onChangeText={(text) => setPostalAddress({ ...postalAddress, line3: text })}
        placeholder="Region or country"
        maxLength={40}
      />

      <Text style={dynamicStyles.sectionSubtitle}>Street Address *</Text>
      <FormInput
        label="Address Line 1 *"
        value={streetAddress.line1}
        onChangeText={(text) => setStreetAddress({ ...streetAddress, line1: text })}
        placeholder="Street address"
        error={errors.streetAddressLine1}
        maxLength={40}
      />
      <FormInput
        label="Address Line 2"
        value={streetAddress.line2}
        onChangeText={(text) => setStreetAddress({ ...streetAddress, line2: text })}
        placeholder="Area or suburb"
        maxLength={40}
      />
      <FormInput
        label="Address Line 3"
        value={streetAddress.line3}
        onChangeText={(text) => setStreetAddress({ ...streetAddress, line3: text })}
        placeholder="City"
        maxLength={40}
      />

      <Text style={dynamicStyles.sectionSubtitle}>Contact Information</Text>
      <View style={dynamicStyles.phoneRow}>
        <FormInput
          label="Home Phone Code"
          value={telephoneHome.code}
          onChangeText={(text) => setTelephoneHome({ ...telephoneHome, code: text })}
          placeholder="264"
          style={[dynamicStyles.phoneCode, dynamicStyles.phoneCodeInput]}
          keyboardType="numeric"
          maxLength={4}
        />
        <FormInput
          label="Home Phone Number"
          value={telephoneHome.number}
          onChangeText={(text) => setTelephoneHome({ ...telephoneHome, number: text })}
          placeholder="61234567"
          style={dynamicStyles.phoneNumber}
          keyboardType="numeric"
          maxLength={10}
        />
      </View>

      <View style={dynamicStyles.phoneRow}>
        <FormInput
          label="Day Phone Code"
          value={telephoneDay.code}
          onChangeText={(text) => setTelephoneDay({ ...telephoneDay, code: text })}
          placeholder="264"
          style={[dynamicStyles.phoneCode, dynamicStyles.phoneCodeInput]}
          keyboardType="numeric"
          maxLength={4}
        />
        <FormInput
          label="Day Phone Number"
          value={telephoneDay.number}
          onChangeText={(text) => setTelephoneDay({ ...telephoneDay, number: text })}
          placeholder="61234567"
          style={dynamicStyles.phoneNumber}
          keyboardType="numeric"
          maxLength={10}
        />
      </View>

      <View style={dynamicStyles.phoneRow}>
        <FormInput
          label="Cell Code *"
          value={cellNumber.code}
          onChangeText={(text) => setCellNumber({ ...cellNumber, code: text })}
          placeholder="264"
          style={[dynamicStyles.phoneCode, dynamicStyles.phoneCodeInput]}
          keyboardType="numeric"
          maxLength={4}
          error={errors.cellNumber}
        />
        <FormInput
          label="Cell Number *"
          value={cellNumber.number}
          onChangeText={(text) => setCellNumber({ ...cellNumber, number: text })}
          placeholder="81234567"
          style={dynamicStyles.phoneNumber}
          keyboardType="numeric"
          maxLength={10}
          error={errors.cellNumber}
        />
      </View>

      <FormInput
        label="E-mail *"
        value={email}
        onChangeText={setEmail}
        placeholder="your.email@example.com"
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        maxLength={50}
      />
    </Card>
  );

  const renderSectionB = () => (
    <Card style={dynamicStyles.sectionCard}>
      <View style={dynamicStyles.sectionHeader}>
        <MaterialIcons name="directions-car" size={24} color={colors.primary} />
        <Text style={dynamicStyles.sectionTitle}>B. PERSONALISED NUMBER PLATE</Text>
      </View>

      <Text style={dynamicStyles.fieldLabel}>Number plate format *</Text>
      <View style={dynamicStyles.plateFormatContainer}>
        {[
          { key: 'Long/German', label: 'Long/German format (520 mm x 110mm)' },
          { key: 'Normal', label: 'Normal format (440 mm x 120mm)' },
          { key: 'American', label: 'American format (305 mm x 165mm)' },
          { key: 'Square', label: 'Square format (250 mm x 205mm)' },
          { key: 'Small motorcycle', label: 'Small motorcycle format (250 mm x 165mm)' },
        ].map((format) => (
          <TouchableOpacity
            key={format.key}
            style={dynamicStyles.plateFormatOption}
            onPress={() => setPlateFormat(format.key)}
          >
            <View style={[dynamicStyles.radioCircle, plateFormat === format.key && dynamicStyles.radioSelected]}>
              {plateFormat === format.key && <View style={dynamicStyles.radioInner} />}
            </View>
            <Text style={dynamicStyles.plateFormatText}>{format.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={dynamicStyles.fieldLabel}>Quantity (1 or 2) *</Text>
      <View style={dynamicStyles.quantityContainer}>
        {[1, 2].map((num) => (
          <TouchableOpacity
            key={num}
            style={[dynamicStyles.quantityOption, quantity === num && dynamicStyles.quantitySelected]}
            onPress={() => setQuantity(num)}
          >
            <Text style={[dynamicStyles.quantityText, quantity === num && dynamicStyles.quantityTextSelected]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={dynamicStyles.sectionSubtitle}>Plate Choices (in order of preference)</Text>
      <Text style={dynamicStyles.helperText}>
        Enter your preferred personalised number plate text. Maximum 8 characters each.
      </Text>

      {plateChoices.map((choice, index) => (
        <View key={index} style={dynamicStyles.plateChoiceContainer}>
          <Text style={dynamicStyles.plateChoiceLabel}>
            {index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'} Choice *
          </Text>
          <View style={dynamicStyles.plateChoiceRow}>
            <FormInput
              label="Plate Text"
              value={choice.text}
              onChangeText={(text) => {
                const newChoices = [...plateChoices];
                newChoices[index].text = text.toUpperCase();
                setPlateChoices(newChoices);
              }}
              placeholder="SMITH1"
              style={dynamicStyles.plateTextInput}
              maxLength={8}
              autoCapitalize="characters"
              error={errors[`plateChoice${index + 1}`]}
            />
            <FormInput
              label="Meaning"
              value={choice.meaning}
              onChangeText={(text) => {
                const newChoices = [...plateChoices];
                newChoices[index].meaning = text;
                setPlateChoices(newChoices);
              }}
              placeholder="Family name"
              style={dynamicStyles.plateMeaningInput}
              maxLength={30}
            />
          </View>
          <View style={dynamicStyles.platePreview}>
            <Text style={dynamicStyles.platePreviewText}>
              {choice.text || 'PREVIEW'}
            </Text>
            <Image 
              source={require('../flag/image.png')} 
              style={dynamicStyles.plateFlag}
              resizeMode="contain"
            />
            <Text style={dynamicStyles.platePreviewText}>NA</Text>
          </View>
        </View>
      ))}
    </Card>
  );

  const renderSectionC = () => (
    <Card style={dynamicStyles.sectionCard}>
      <View style={dynamicStyles.sectionHeader}>
        <MaterialIcons name="people" size={24} color={colors.primary} />
        <Text style={dynamicStyles.sectionTitle}>C. APPLICANT'S REPRESENTATIVE / PROXY</Text>
        <Text style={dynamicStyles.optionalText}>(If applicable)</Text>
      </View>

      <View style={dynamicStyles.switchContainer}>
        <Text style={dynamicStyles.switchLabel}>Do you have a representative/proxy?</Text>
        <Switch
          value={hasRepresentative}
          onValueChange={setHasRepresentative}
          trackColor={{ false: isDark ? '#444' : '#E0E0E0', true: colors.primary }}
          thumbColor={hasRepresentative ? '#fff' : '#f4f3f4'}
        />
      </View>

      {hasRepresentative && (
        <>
          <Text style={dynamicStyles.fieldLabel}>Type of identification *</Text>
          <View style={dynamicStyles.radioGroup}>
            {['Traffic Register Number', 'Namibia ID-doc'].map((type) => (
              <TouchableOpacity
                key={type}
                style={dynamicStyles.radioOption}
                onPress={() => setRepresentativeIdType(type)}
              >
                <View style={[dynamicStyles.radioCircle, representativeIdType === type && dynamicStyles.radioSelected]}>
                  {representativeIdType === type && <View style={dynamicStyles.radioInner} />}
                </View>
                <Text style={dynamicStyles.radioText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FormInput
            label="Identification Number *"
            value={representativeIdNumber}
            onChangeText={setRepresentativeIdNumber}
            placeholder="Enter identification number"
            maxLength={13}
            keyboardType="numeric"
          />

          <FormInput
            label="Surname *"
            value={representativeSurname}
            onChangeText={setRepresentativeSurname}
            placeholder="Enter surname"
            maxLength={25}
            autoCapitalize="words"
          />

          <FormInput
            label="Initials *"
            value={representativeInitials}
            onChangeText={setRepresentativeInitials}
            placeholder="Enter initials (e.g., J.D.)"
            maxLength={10}
            autoCapitalize="characters"
          />
        </>
      )}
    </Card>
  );

  const renderSectionD = () => (
    <Card style={dynamicStyles.sectionCard}>
      <View style={dynamicStyles.sectionHeader}>
        <MaterialIcons name="directions-car" size={24} color={colors.primary} />
        <Text style={dynamicStyles.sectionTitle}>D. PARTICULARS OF VEHICLE</Text>
        <Text style={dynamicStyles.optionalText}>(If available)</Text>
      </View>

      <View style={dynamicStyles.switchContainer}>
        <Text style={dynamicStyles.switchLabel}>Do you want to provide vehicle details?</Text>
        <Switch
          value={hasVehicle}
          onValueChange={setHasVehicle}
          trackColor={{ false: isDark ? '#444' : '#E0E0E0', true: colors.primary }}
          thumbColor={hasVehicle ? '#fff' : '#f4f3f4'}
        />
      </View>

      {hasVehicle && (
        <>
          <FormInput
            label="Current licence number"
            value={currentLicenceNumber}
            onChangeText={setCurrentLicenceNumber}
            placeholder="N12345W"
            maxLength={10}
            autoCapitalize="characters"
          />

          <FormInput
            label="Vehicle register number"
            value={vehicleRegisterNumber}
            onChangeText={setVehicleRegisterNumber}
            placeholder="VR123456"
            maxLength={15}
            autoCapitalize="characters"
          />

          <FormInput
            label="Chassis number/VIN"
            value={chassisNumber}
            onChangeText={setChassisNumber}
            placeholder="ABC123DEF456789"
            maxLength={20}
            autoCapitalize="characters"
          />

          <FormInput
            label="Vehicle make"
            value={vehicleMake}
            onChangeText={setVehicleMake}
            placeholder="Toyota"
            maxLength={20}
            autoCapitalize="words"
          />

          <FormInput
            label="Series name"
            value={seriesName}
            onChangeText={setSeriesName}
            placeholder="Corolla"
            maxLength={20}
            autoCapitalize="words"
          />
        </>
      )}
    </Card>
  );

  const renderSectionE = () => (
    <Card style={dynamicStyles.sectionCard}>
      <View style={dynamicStyles.sectionHeader}>
        <MaterialIcons name="assignment" size={24} color={colors.primary} />
        <Text style={dynamicStyles.sectionTitle}>E. DECLARATION</Text>
      </View>

      <Text style={dynamicStyles.fieldLabel}>I am the *</Text>
      <View style={dynamicStyles.radioGroup}>
        {[
          { key: 'applicant', label: 'applicant / holder of a personalised licence number' },
          { key: 'proxy', label: "applicant / holder's proxy" },
          { key: 'representative', label: "applicant / holder's representative" },
        ].map((role) => (
          <TouchableOpacity
            key={role.key}
            style={dynamicStyles.radioOption}
            onPress={() => setDeclarationRole(role.key)}
          >
            <View style={[dynamicStyles.radioCircle, declarationRole === role.key && dynamicStyles.radioSelected]}>
              {declarationRole === role.key && <View style={dynamicStyles.radioInner} />}
            </View>
            <Text style={dynamicStyles.radioText}>{role.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={dynamicStyles.declarationContainer}>
        <Text style={dynamicStyles.declarationTitle}>I declare that:</Text>
        <Text style={dynamicStyles.declarationPoint}>
          (a) I am aware that a personalised licence number or the right to use it may be subject to copyright or other intellectual property rights.
        </Text>
        <Text style={dynamicStyles.declarationPoint}>
          (b) In the event of surrender of a personalised licence number, I declare that the personalised licence plates have been destroyed.
        </Text>
        <Text style={dynamicStyles.declarationPoint}>
          (c) I declare that all the particulars furnished by me are true and correct.
        </Text>
        <Text style={dynamicStyles.declarationPoint}>
          (d) I am aware that a false declaration is punishable by law.
        </Text>
      </View>

      <FormInput
        label="Place *"
        value={declarationPlace}
        onChangeText={setDeclarationPlace}
        placeholder="Windhoek"
        error={errors.declarationPlace}
        maxLength={30}
        autoCapitalize="words"
      />

      <View style={dynamicStyles.checkboxContainer}>
        <TouchableOpacity
          style={dynamicStyles.checkbox}
          onPress={() => setDeclarationAccepted(!declarationAccepted)}
        >
          <View style={[dynamicStyles.checkboxBox, declarationAccepted && dynamicStyles.checkboxChecked]}>
            {declarationAccepted && (
              <MaterialIcons name="check" size={16} color="#fff" />
            )}
          </View>
          <Text style={dynamicStyles.checkboxText}>
            I accept the above declaration and confirm that all information provided is true and correct *
          </Text>
        </TouchableOpacity>
        {errors.declarationAccepted && (
          <Text style={dynamicStyles.errorText}>{errors.declarationAccepted}</Text>
        )}
      </View>
    </Card>
  );

  const renderSectionF = () => (
    <Card style={dynamicStyles.sectionCard}>
      <View style={dynamicStyles.sectionHeader}>
        <MaterialIcons name="attach-file" size={24} color={colors.primary} />
        <Text style={dynamicStyles.sectionTitle}>F. DOCUMENT UPLOAD</Text>
      </View>

      <Text style={dynamicStyles.fieldLabel}>Certified copy of identification document *</Text>
      <Text style={dynamicStyles.helperText}>
        Upload a clear, certified copy of your identification document (PDF or image format).
      </Text>

      <TouchableOpacity
        style={dynamicStyles.documentUploadButton}
        onPress={handleDocumentPick}
        disabled={documentLoading}
      >
        {documentLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            <MaterialIcons name="cloud-upload" size={32} color={colors.primary} />
            <Text style={dynamicStyles.documentUploadText}>
              {document ? 'Change Document' : 'Upload Document'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {document && (
        <View style={dynamicStyles.documentInfo}>
          <MaterialIcons name="description" size={24} color={colors.success} />
          <View style={dynamicStyles.documentDetails}>
            <Text style={dynamicStyles.documentName}>{document.name}</Text>
            <Text style={dynamicStyles.documentSize}>
              {(document.size / 1024 / 1024).toFixed(2)} MB
            </Text>
          </View>
          <TouchableOpacity onPress={() => setDocument(null)}>
            <MaterialIcons name="close" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}

      {errors.document && (
        <Text style={dynamicStyles.errorText}>{errors.document}</Text>
      )}
    </Card>
  );

  const renderNavigationButtons = () => (
    <View style={dynamicStyles.navigationContainer}>
      {currentSection > 0 && (
        <TouchableOpacity style={dynamicStyles.navButton} onPress={prevSection}>
          <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
          <Text style={dynamicStyles.navButtonText}>Previous</Text>
        </TouchableOpacity>
      )}
      
      <View style={dynamicStyles.navButtonSpacer} />
      
      {currentSection < sections.length - 1 ? (
        <TouchableOpacity style={dynamicStyles.navButton} onPress={nextSection}>
          <Text style={dynamicStyles.navButtonText}>Next</Text>
          <MaterialIcons name="arrow-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[dynamicStyles.submitButton, loading && dynamicStyles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="send" size={20} color="#fff" />
              <Text style={dynamicStyles.submitButtonText}>Submit Application</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0: return renderSectionA();
      case 1: return renderSectionB();
      case 2: return renderSectionC();
      case 3: return renderSectionD();
      case 4: return renderSectionE();
      case 5: return renderSectionF();
      default: return renderSectionA();
    }
  };

  return (
    <View style={[dynamicStyles.container]}>
      {renderProgressBar()}

      <KeyboardAvoidingView
        style={dynamicStyles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={dynamicStyles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderCurrentSection()}
          <View style={dynamicStyles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {renderNavigationButtons()}
    </View>
  );
}

// Dynamic styles function for dark mode support
const createDynamicStyles = (colors, isDark, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'ios' ? 44 : 24, // Status bar height
  },
  progressContainer: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.22,
    shadowRadius: 2.22,
    borderBottomWidth: isDark ? 1 : 0,
    borderBottomColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  progressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: isDark ? '#333' : '#E0E0E0',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  sectionIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? '#333' : '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSectionIndicator: {
    backgroundColor: colors.primary,
  },
  completedSectionIndicator: {
    backgroundColor: colors.success,
  },
  currentSectionTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  sectionCard: {
    margin: 16,
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    elevation: isDark ? 0 : 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.25,
    shadowRadius: 3.84,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  optionalText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 20,
    marginBottom: 12,
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  readOnlyText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  phoneCode: {
    flex: 0.25,
    marginRight: 12,
  },
  phoneNumber: {
    flex: 0.75,
  },
  phoneCodeInput: {
    paddingHorizontal: 8,
  },
  plateFormatContainer: {
    marginBottom: 16,
  },
  plateFormatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  plateFormatText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  quantityOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: isDark ? '#444' : '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: colors.card,
  },
  quantitySelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  quantityTextSelected: {
    color: '#fff',
  },
  plateChoiceContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: isDark ? '#2A2A2A' : '#F8F9FA',
    borderRadius: 8,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  plateChoiceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  plateChoiceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  plateTextInput: {
    flex: 0.4,
    marginRight: 12,
  },
  plateMeaningInput: {
    flex: 0.6,
  },
  platePreview: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignSelf: 'flex-start',
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  platePreviewText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  plateFlag: {
    width: 24,
    height: 16,
    marginLeft: 8,
    borderRadius: 2,
    overflow: 'hidden',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 16,
    backgroundColor: isDark ? '#2A2A2A' : '#F8F9FA',
    borderRadius: 8,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  declarationContainer: {
    backgroundColor: isDark ? '#2A2A2A' : '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  declarationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  declarationPoint: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  checkboxContainer: {
    marginTop: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  documentUploadButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: isDark ? '#1A1A1A' : colors.card,
  },
  documentUploadText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: isDark ? '#1B4332' : '#E8F5E8',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.success,
  },
  documentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  documentSize: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: Math.max(16, (insets?.bottom || 0)),
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  navButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  navButtonSpacer: {
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: isDark ? '#444' : '#BDBDBD',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 2,
  },
  headerLogo: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  sectionCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  optionalText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginTop: 20,
    marginBottom: 12,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  readOnlyText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1976D2',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#1976D2',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1976D2',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  phoneCode: {
    flex: 0.25,
    marginRight: 12,
  },
  phoneNumber: {
    flex: 0.75,
  },
  phoneCodeInput: {
    paddingHorizontal: 8,
  },
  plateFormatContainer: {
    marginBottom: 16,
  },
  plateFormatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  plateFormatText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  quantityOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quantitySelected: {
    borderColor: '#1976D2',
    backgroundColor: '#1976D2',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  quantityTextSelected: {
    color: '#fff',
  },
  plateChoiceContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  plateChoiceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 12,
  },
  plateChoiceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  plateTextInput: {
    flex: 0.4,
    marginRight: 12,
  },
  plateMeaningInput: {
    flex: 0.6,
  },
  platePreview: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#00B4E6',
    alignSelf: 'flex-start',
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  platePreviewText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B4E6',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  plateFlag: {
    width: 24,
    height: 16,
    marginLeft: 8,
    borderRadius: 2,
    overflow: 'hidden',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  declarationContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  declarationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  declarationPoint: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  checkboxContainer: {
    marginTop: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#1976D2',
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1976D2',
  },
  checkboxText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  documentUploadButton: {
    borderWidth: 2,
    borderColor: '#1976D2',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  documentUploadText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
    marginTop: 8,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    marginBottom: 16,
  },
  documentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  documentSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1976D2',
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  navButtonSpacer: {
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});

// Screen options to hide the default header
PLNApplicationBankStyleScreen.options = {
  headerShown: false,
};