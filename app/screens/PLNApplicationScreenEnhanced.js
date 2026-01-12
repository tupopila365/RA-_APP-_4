import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Image,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { plnService } from '../services/plnService';
import { validators } from '../utils/validation';
import { useAppContext } from '../context/AppContext';

// Import Unified Design System Components
import {
  GlobalHeader,
  UnifiedFormInput,
  UnifiedCard,
  UnifiedButton,
  UnifiedSkeletonLoader,
  RATheme,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';

// Conditionally import native modules
let ImagePicker = null;
let DocumentPicker = null;
try {
  ImagePicker = require('expo-image-picker');
  DocumentPicker = require('expo-document-picker');
} catch (error) {
  console.warn('Native modules not available:', error.message);
}

export default function PLNApplicationScreenEnhanced({ navigation }) {
  const { colors, isDark } = useTheme();
  const { user } = useAppContext();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});

  // Use government-standard styles with proper design system
  const styles = createStyles(colors, isDark, insets);

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
  // Wizard steps with guidance
  const wizardSteps = [
    {
      id: 'personal',
      title: 'Step 1 — Personal Information',
      subtitle: 'Tell us about yourself',
      icon: 'person-outline',
      description: 'We need your personal details to process your application. All information is kept secure and confidential.',
      fields: ['idType', 'surname', 'initials', 'businessName', 'trafficRegisterNumber', 'businessRegNumber'],
      helpText: 'Choose your identification type and provide accurate personal information as it appears on your official documents.',
    },
    {
      id: 'contact',
      title: 'Step 2 — Contact & Address',
      subtitle: 'How can we reach you?',
      icon: 'location-outline',
      description: 'Provide your current addresses and contact information for correspondence and delivery.',
      fields: ['postalAddress', 'streetAddress', 'cellNumber', 'email', 'telephoneHome', 'telephoneDay'],
      helpText: 'Ensure your addresses are complete and accurate. We will use these for official correspondence and plate delivery.',
    },
    {
      id: 'plates',
      title: 'Step 3 — Number Plate Details',
      subtitle: 'Design your personalized plates',
      icon: 'car-outline',
      description: 'Choose your preferred plate format and provide your personalized text choices.',
      fields: ['plateFormat', 'quantity', 'plateChoices'],
      helpText: 'Provide 3 choices in order of preference. Each choice must be unique and follow Namibian regulations.',
    },
    {
      id: 'optional',
      title: 'Step 4 — Additional Information',
      subtitle: 'Representative & vehicle details',
      icon: 'people-outline',
      description: 'Optional information about representatives and vehicle details.',
      fields: ['hasRepresentative', 'hasVehicle'],
      helpText: 'This information is optional but can help us process your application more efficiently.',
    },
    {
      id: 'declaration',
      title: 'Step 5 — Declaration & Documents',
      subtitle: 'Final step',
      icon: 'document-text-outline',
      description: 'Review and accept the declaration, then upload your identification document.',
      fields: ['declarationAccepted', 'declarationPlace', 'document'],
      helpText: 'Carefully read the declaration and upload a clear, certified copy of your ID document.',
    },
  ];

  // Form state - Section A (Personal Information)
  const [transactionType] = useState('New Personalised Licence Number');
  const [idType, setIdType] = useState('Namibia ID-doc');
  const [trafficRegisterNumber, setTrafficRegisterNumber] = useState('');
  const [businessRegNumber, setBusinessRegNumber] = useState('');
  const [surname, setSurname] = useState('');
  const [initials, setInitials] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Contact & Address
  const [postalAddress, setPostalAddress] = useState({ line1: '', line2: '', line3: '' });
  const [streetAddress, setStreetAddress] = useState({ line1: '', line2: '', line3: '' });
  const [telephoneHome, setTelephoneHome] = useState({ code: '264', number: '' });
  const [telephoneDay, setTelephoneDay] = useState({ code: '264', number: '' });
  const [cellNumber, setCellNumber] = useState({ code: '264', number: '' });
  const [email, setEmail] = useState('');

  // Plate Details
  const [plateFormat, setPlateFormat] = useState('Normal');
  const [quantity, setQuantity] = useState(1);
  const [plateChoices, setPlateChoices] = useState([
    { text: '', meaning: '' },
    { text: '', meaning: '' },
    { text: '', meaning: '' },
  ]);

  // Optional Information
  const [hasRepresentative, setHasRepresentative] = useState(false);
  const [representativeIdType, setRepresentativeIdType] = useState('Traffic Register Number');
  const [representativeIdNumber, setRepresentativeIdNumber] = useState('');
  const [representativeSurname, setRepresentativeSurname] = useState('');
  const [representativeInitials, setRepresentativeInitials] = useState('');

  const [hasVehicle, setHasVehicle] = useState(false);
  const [currentLicenceNumber, setCurrentLicenceNumber] = useState('');
  const [vehicleRegisterNumber, setVehicleRegisterNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [seriesName, setSeriesName] = useState('');

  // Declaration & Documents
  const [declarationRole, setDeclarationRole] = useState('applicant');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [declarationPlace, setDeclarationPlace] = useState('');
  const [document, setDocument] = useState(null);
  // Calculate accurate form progress
  useEffect(() => {
    const calculateProgress = () => {
      let totalFields = 0;
      let filledFields = 0;

      // Step 1: Personal Information (required fields only)
      totalFields += 3; // idType, surname, initials
      if (idType) filledFields++;
      if (surname.trim()) filledFields++;
      if (initials.trim()) filledFields++;

      if (idType === 'Traffic Register Number' || idType === 'Namibia ID-doc') {
        totalFields += 1;
        if (trafficRegisterNumber.trim()) filledFields++;
      } else if (idType === 'Business Reg. No') {
        totalFields += 2;
        if (businessRegNumber.trim()) filledFields++;
        if (businessName.trim()) filledFields++;
      }

      // Step 2: Contact & Address (required fields)
      totalFields += 4; // postal line1, street line1, cell number, email
      if (postalAddress.line1.trim()) filledFields++;
      if (streetAddress.line1.trim()) filledFields++;
      if (cellNumber.number.trim()) filledFields++;
      if (email.trim() && validators.email(email)) filledFields++;

      // Step 3: Plate Details (required fields)
      totalFields += 5; // format, quantity, 3 plate choices
      if (plateFormat) filledFields++;
      if (quantity) filledFields++;
      plateChoices.forEach(choice => {
        if (choice.text.trim()) filledFields++;
      });

      // Step 5: Declaration & Documents (required fields)
      totalFields += 3; // declaration accepted, place, document
      if (declarationAccepted) filledFields++;
      if (declarationPlace.trim()) filledFields++;
      if (document) filledFields++;

      return Math.round((filledFields / totalFields) * 100);
    };

    setFormProgress(calculateProgress());
  }, [
    idType, surname, initials, trafficRegisterNumber, businessRegNumber, businessName,
    postalAddress, streetAddress, cellNumber, email, plateFormat, quantity, plateChoices,
    declarationAccepted, declarationPlace, document
  ]);

  // Real-time validation
  const validateField = (fieldName, value) => {
    const errors = { ...validationErrors };
    
    switch (fieldName) {
      case 'surname':
        if (!value.trim()) {
          errors.surname = 'Surname is required';
        } else {
          delete errors.surname;
        }
        break;
      case 'initials':
        if (!value.trim()) {
          errors.initials = 'Initials are required';
        } else {
          delete errors.initials;
        }
        break;
      case 'email':
        if (value.trim() && !validators.email(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'cellNumber':
        if (!value.trim()) {
          errors.cellNumber = 'Cell number is required';
        } else {
          delete errors.cellNumber;
        }
        break;
      // Add more field validations as needed
    }

    setValidationErrors(errors);
  };

  const handleFieldChange = (fieldName, value) => {
    // Update field touched state
    setFieldTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate field if it's been touched
    if (fieldTouched[fieldName]) {
      validateField(fieldName, value);
    }
  };
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

  const validateCurrentStep = () => {
    const currentStepData = wizardSteps[currentStep];
    const errors = {};

    switch (currentStepData.id) {
      case 'personal':
        if (!surname.trim()) errors.surname = 'Surname is required';
        if (!initials.trim()) errors.initials = 'Initials are required';
        if (idType === 'Traffic Register Number' && !trafficRegisterNumber.trim()) {
          errors.trafficRegisterNumber = 'Traffic Register Number is required';
        }
        if (idType === 'Business Reg. No') {
          if (!businessRegNumber.trim()) errors.businessRegNumber = 'Business Registration Number is required';
          if (!businessName.trim()) errors.businessName = 'Business Name is required';
        }
        break;
      case 'contact':
        if (!postalAddress.line1.trim()) errors.postalAddressLine1 = 'Postal address is required';
        if (!streetAddress.line1.trim()) errors.streetAddressLine1 = 'Street address is required';
        if (!cellNumber.number.trim()) errors.cellNumber = 'Cell number is required';
        if (!email.trim()) errors.email = 'Email is required';
        if (email && !validators.email(email)) errors.email = 'Invalid email format';
        break;
      case 'plates':
        if (!plateChoices[0].text.trim()) errors.plateChoice1 = '1st plate choice is required';
        if (!plateChoices[1].text.trim()) errors.plateChoice2 = '2nd plate choice is required';
        if (!plateChoices[2].text.trim()) errors.plateChoice3 = '3rd plate choice is required';
        break;
      case 'declaration':
        if (!declarationPlace.trim()) errors.declarationPlace = 'Declaration place is required';
        if (!declarationAccepted) errors.declarationAccepted = 'You must accept the declaration';
        if (!document) errors.document = 'ID document is required';
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < wizardSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      Alert.alert('Incomplete Information', 'Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
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
        'Application Submitted Successfully',
        `Your PLN application has been submitted.\n\nReference ID: ${response.referenceId}\n\nPlease save this reference number for tracking your application.`,
        [
          {
            text: 'Track Application',
            onPress: () => navigation.navigate('PLNTracking', { referenceId: response.referenceId }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Submission Error', error.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const renderProgressHeader = () => (
    <GlobalHeader
      title="PLN Application"
      subtitle={`Step ${currentStep + 1} of ${wizardSteps.length}`}
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
      rightActions={[
        {
          icon: 'help-circle-outline',
          onPress: () => setShowHelp(true),
          accessibilityLabel: 'Get help',
        },
      ]}
    />
  );

  const renderHelpModal = () => (
    <Modal
      visible={showHelp}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowHelp(false)}
    >
      <View style={styles.helpModal}>
        <GlobalHeader
          title="Help & Guidance"
          subtitle={`Step ${currentStep + 1} Help`}
          rightActions={[
            {
              icon: 'close',
              onPress: () => setShowHelp(false),
              accessibilityLabel: 'Close help',
            },
          ]}
        />
        <ScrollView style={styles.helpContent}>
          <UnifiedCard variant="outlined" padding="large">
            <Text style={[typography.h4, { color: colors.text, marginBottom: spacing.md }]}>
              {wizardSteps[currentStep].title}
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
              {wizardSteps[currentStep].helpText}
            </Text>
            
            <Text style={[typography.h5, { color: colors.text, marginBottom: spacing.sm }]}>
              Required Fields
            </Text>
            {wizardSteps[currentStep].fields.map(field => (
              <Text key={field} style={[typography.bodySmall, { color: colors.text, marginBottom: spacing.xs }]}>
                • {field}
              </Text>
            ))}
            
            <Text style={[typography.h5, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
              Tips
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, lineHeight: 20 }]}>
              • Double-check all information for accuracy{'\n'}
              • Use official document names and numbers{'\n'}
              • Ensure contact information is current{'\n'}
              • Keep your reference ID safe after submission
            </Text>
          </UnifiedCard>
        </ScrollView>
      </View>
    </Modal>
  );
  // Step content renderers
  const renderPersonalInformation = () => (
    <UnifiedCard variant="default" padding="large">
      <View style={styles.stepHeader}>
        <Ionicons name="person-outline" size={20} color={colors.primary} />
        <Text style={[typography.h4, { color: colors.text, marginLeft: spacing.sm }]}>
          Step 1 — Personal Information
        </Text>
      </View>
      
      <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
        Transaction Type
      </Text>
      <View style={styles.readOnlyField}>
        <Text style={[typography.body, { color: colors.text }]}>{transactionType}</Text>
        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
      </View>

      <Text style={[typography.h5, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md }]}>
        Type of identification *
      </Text>
      <View style={styles.radioGroup}>
        {['Traffic Register Number', 'Namibia ID-doc', 'Business Reg. No'].map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.radioOption}
            onPress={() => setIdType(type)}
          >
            <View style={[styles.radioCircle, idType === type && styles.radioSelected]}>
              {idType === type && <View style={styles.radioInner} />}
            </View>
            <Text style={[typography.body, { color: colors.text }]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {idType === 'Traffic Register Number' && (
        <UnifiedFormInput
          label="Traffic Register Number"
          value={trafficRegisterNumber}
          onChangeText={(value) => {
            setTrafficRegisterNumber(value);
            handleFieldChange('trafficRegisterNumber', value);
          }}
          placeholder="Enter traffic register number"
          error={validationErrors.trafficRegisterNumber}
          maxLength={13}
          keyboardType="numeric"
          required
        />
      )}

      {idType === 'Business Reg. No' && (
        <>
          <UnifiedFormInput
            label="Business Registration Number"
            value={businessRegNumber}
            onChangeText={(value) => {
              setBusinessRegNumber(value);
              handleFieldChange('businessRegNumber', value);
            }}
            placeholder="Enter business registration number"
            error={validationErrors.businessRegNumber}
            maxLength={20}
            required
          />
          <UnifiedFormInput
            label="Business Name"
            value={businessName}
            onChangeText={(value) => {
              setBusinessName(value);
              handleFieldChange('businessName', value);
            }}
            placeholder="Enter business name"
            error={validationErrors.businessName}
            maxLength={50}
            required
          />
        </>
      )}

      {idType !== 'Business Reg. No' && (
        <>
          <UnifiedFormInput
            label="Surname"
            value={surname}
            onChangeText={(value) => {
              setSurname(value);
              handleFieldChange('surname', value);
            }}
            placeholder="Enter surname"
            error={validationErrors.surname}
            maxLength={25}
            autoCapitalize="words"
            required
          />
          <UnifiedFormInput
            label="Initials"
            value={initials}
            onChangeText={(value) => {
              setInitials(value);
              handleFieldChange('initials', value);
            }}
            placeholder="Enter initials (e.g., J.D.)"
            error={validationErrors.initials}
            maxLength={10}
            autoCapitalize="characters"
            required
          />
        </>
      )}
    </UnifiedCard>
  );
  const renderContactAddress = () => (
    <UnifiedCard variant="default" padding="large">
      <View style={styles.stepHeader}>
        <Ionicons name="location-outline" size={20} color={colors.primary} />
        <Text style={[typography.h4, { color: colors.text, marginLeft: spacing.sm }]}>
          Step 2 — Contact & Address Information
        </Text>
      </View>

      <Text style={[typography.h5, { color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.md }]}>
        Postal Address *
      </Text>
      <UnifiedFormInput
        label="Address Line 1"
        value={postalAddress.line1}
        onChangeText={(text) => {
          setPostalAddress({ ...postalAddress, line1: text });
          handleFieldChange('postalAddressLine1', text);
        }}
        placeholder="P.O. Box or street address"
        error={validationErrors.postalAddressLine1}
        maxLength={40}
        required
      />
      <UnifiedFormInput
        label="Address Line 2"
        value={postalAddress.line2}
        onChangeText={(text) => setPostalAddress({ ...postalAddress, line2: text })}
        placeholder="City or area"
        maxLength={40}
      />
      <UnifiedFormInput
        label="Address Line 3"
        value={postalAddress.line3}
        onChangeText={(text) => setPostalAddress({ ...postalAddress, line3: text })}
        placeholder="Region or country"
        maxLength={40}
      />

      <Text style={[typography.h5, { color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.md }]}>
        Street Address *
      </Text>
      <UnifiedFormInput
        label="Address Line 1"
        value={streetAddress.line1}
        onChangeText={(text) => {
          setStreetAddress({ ...streetAddress, line1: text });
          handleFieldChange('streetAddressLine1', text);
        }}
        placeholder="Street address"
        error={validationErrors.streetAddressLine1}
        maxLength={40}
        required
      />
      <UnifiedFormInput
        label="Address Line 2"
        value={streetAddress.line2}
        onChangeText={(text) => setStreetAddress({ ...streetAddress, line2: text })}
        placeholder="Area or suburb"
        maxLength={40}
      />
      <UnifiedFormInput
        label="Address Line 3"
        value={streetAddress.line3}
        onChangeText={(text) => setStreetAddress({ ...streetAddress, line3: text })}
        placeholder="City"
        maxLength={40}
      />

      <Text style={[typography.h5, { color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.md }]}>
        Contact Information *
      </Text>
      <View style={styles.phoneRow}>
        <UnifiedFormInput
          label="Cell Code"
          value={cellNumber.code}
          onChangeText={(text) => setCellNumber({ ...cellNumber, code: text })}
          placeholder="264"
          style={styles.phoneCode}
          keyboardType="numeric"
          maxLength={4}
          error={validationErrors.cellNumber}
          required
        />
        <UnifiedFormInput
          label="Cell Number"
          value={cellNumber.number}
          onChangeText={(text) => {
            setCellNumber({ ...cellNumber, number: text });
            handleFieldChange('cellNumber', text);
          }}
          placeholder="81234567"
          style={styles.phoneNumber}
          keyboardType="numeric"
          maxLength={10}
          error={validationErrors.cellNumber}
          required
        />
      </View>

      <UnifiedFormInput
        label="Email Address"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          handleFieldChange('email', value);
        }}
        placeholder="your.email@example.com"
        error={validationErrors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        maxLength={50}
        required
      />

      <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.md }]}>
        Optional phone numbers
      </Text>
      <View style={styles.phoneRow}>
        <UnifiedFormInput
          label="Home Phone Code"
          value={telephoneHome.code}
          onChangeText={(text) => setTelephoneHome({ ...telephoneHome, code: text })}
          placeholder="264"
          style={styles.phoneCode}
          keyboardType="numeric"
          maxLength={4}
        />
        <UnifiedFormInput
          label="Home Phone Number"
          value={telephoneHome.number}
          onChangeText={(text) => setTelephoneHome({ ...telephoneHome, number: text })}
          placeholder="61234567"
          style={styles.phoneNumber}
          keyboardType="numeric"
          maxLength={10}
        />
      </View>

      <View style={styles.phoneRow}>
        <UnifiedFormInput
          label="Day Phone Code"
          value={telephoneDay.code}
          onChangeText={(text) => setTelephoneDay({ ...telephoneDay, code: text })}
          placeholder="264"
          style={styles.phoneCode}
          keyboardType="numeric"
          maxLength={4}
        />
        <UnifiedFormInput
          label="Day Phone Number"
          value={telephoneDay.number}
          onChangeText={(text) => setTelephoneDay({ ...telephoneDay, number: text })}
          placeholder="61234567"
          style={styles.phoneNumber}
          keyboardType="numeric"
          maxLength={10}
        />
      </View>
    </UnifiedCard>
  );
  const renderPlateDetails = () => (
    <UnifiedCard variant="default" padding="large">
      <View style={styles.stepHeader}>
        <Ionicons name="car-outline" size={20} color={colors.primary} />
        <Text style={[typography.h4, { color: colors.text, marginLeft: spacing.sm }]}>
          Step 3 — Number Plate Details
        </Text>
      </View>

      <Text style={[typography.h5, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md }]}>
        Number plate format *
      </Text>
      <View style={styles.plateFormatContainer}>
        {[
          { key: 'Long/German', label: 'Long/German format (520 mm × 110mm)' },
          { key: 'Normal', label: 'Normal format (440 mm × 120mm)' },
          { key: 'American', label: 'American format (305 mm × 165mm)' },
          { key: 'Square', label: 'Square format (250 mm × 205mm)' },
          { key: 'Small motorcycle', label: 'Small motorcycle format (250 mm × 165mm)' },
        ].map((format) => (
          <TouchableOpacity
            key={format.key}
            style={styles.plateFormatOption}
            onPress={() => setPlateFormat(format.key)}
          >
            <View style={[styles.radioCircle, plateFormat === format.key && styles.radioSelected]}>
              {plateFormat === format.key && <View style={styles.radioInner} />}
            </View>
            <Text style={[typography.body, { color: colors.text }]}>{format.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[typography.h5, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md }]}>
        Quantity *
      </Text>
      <View style={styles.quantityContainer}>
        {[1, 2].map((num) => (
          <TouchableOpacity
            key={num}
            style={[styles.quantityOption, quantity === num && styles.quantitySelected]}
            onPress={() => setQuantity(num)}
          >
            <Text style={[
              typography.h4, 
              { 
                color: quantity === num ? '#FFFFFF' : colors.textSecondary,
                fontWeight: '600'
              }
            ]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[typography.h5, { color: colors.primary, marginTop: spacing.xl, marginBottom: spacing.md }]}>
        Plate Choices (in order of preference)
      </Text>
      <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20 }]}>
        Enter your preferred personalized number plate text. Maximum 8 characters each. Provide 3 choices in order of preference.
      </Text>

      {plateChoices.map((choice, index) => (
        <View key={index} style={styles.plateChoiceContainer}>
          <Text style={[typography.body, { color: colors.primary, fontWeight: '600', marginBottom: spacing.md }]}>
            {index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'} Choice *
          </Text>
          <View style={styles.plateChoiceRow}>
            <UnifiedFormInput
              label="Plate Text"
              value={choice.text}
              onChangeText={(text) => {
                const newChoices = [...plateChoices];
                newChoices[index].text = text.toUpperCase();
                setPlateChoices(newChoices);
                handleFieldChange(`plateChoice${index + 1}`, text);
              }}
              placeholder="SMITH1"
              style={styles.plateTextInput}
              maxLength={8}
              autoCapitalize="characters"
              error={validationErrors[`plateChoice${index + 1}`]}
              required
            />
            <UnifiedFormInput
              label="Meaning"
              value={choice.meaning}
              onChangeText={(text) => {
                const newChoices = [...plateChoices];
                newChoices[index].meaning = text;
                setPlateChoices(newChoices);
              }}
              placeholder="Family name"
              style={styles.plateMeaningInput}
              maxLength={30}
            />
          </View>
          <View style={styles.platePreview}>
            <View style={styles.platePreviewContainer}>
              <Text style={styles.platePreviewText}>
                {choice.text || 'PREVIEW'}
              </Text>
              <View style={styles.platePreviewRight}>
                <Image 
                  source={require('../flag/image.png')} 
                  style={styles.plateFlag}
                  resizeMode="contain"
                />
                <Text style={styles.plateCountryCode}>NA</Text>
              </View>
            </View>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm, fontWeight: '500' }]}>
              Preview
            </Text>
          </View>
        </View>
      ))}
    </UnifiedCard>
  );
  const renderOptionalInformation = () => (
    <UnifiedCard variant="default" padding="large">
      <View style={styles.stepHeader}>
        <Ionicons name="people-outline" size={20} color={colors.primary} />
        <Text style={[typography.h4, { color: colors.text, marginLeft: spacing.sm }]}>
          Step 4 — Additional Information
        </Text>
      </View>

      <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20 }]}>
        This information is optional but can help us process your application more efficiently.
      </Text>

      <View style={styles.switchContainer}>
        <Text style={[typography.body, { color: colors.text, fontWeight: '500', flex: 1 }]}>
          Do you have a representative/proxy?
        </Text>
        <Switch
          value={hasRepresentative}
          onValueChange={setHasRepresentative}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={hasRepresentative ? '#FFFFFF' : colors.surface}
        />
      </View>

      {hasRepresentative && (
        <>
          <Text style={[typography.h5, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md }]}>
            Representative's identification type
          </Text>
          <View style={styles.radioGroup}>
            {['Traffic Register Number', 'Namibia ID-doc'].map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.radioOption}
                onPress={() => setRepresentativeIdType(type)}
              >
                <View style={[styles.radioCircle, representativeIdType === type && styles.radioSelected]}>
                  {representativeIdType === type && <View style={styles.radioInner} />}
                </View>
                <Text style={[typography.body, { color: colors.text }]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <UnifiedFormInput
            label="Identification Number"
            value={representativeIdNumber}
            onChangeText={setRepresentativeIdNumber}
            placeholder="Enter identification number"
            maxLength={13}
            keyboardType="numeric"
          />

          <UnifiedFormInput
            label="Surname"
            value={representativeSurname}
            onChangeText={setRepresentativeSurname}
            placeholder="Enter surname"
            maxLength={25}
            autoCapitalize="words"
          />

          <UnifiedFormInput
            label="Initials"
            value={representativeInitials}
            onChangeText={setRepresentativeInitials}
            placeholder="Enter initials (e.g., J.D.)"
            maxLength={10}
            autoCapitalize="characters"
          />
        </>
      )}

      <View style={styles.switchContainer}>
        <Text style={[typography.body, { color: colors.text, fontWeight: '500', flex: 1 }]}>
          Do you want to provide vehicle details?
        </Text>
        <Switch
          value={hasVehicle}
          onValueChange={setHasVehicle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={hasVehicle ? '#FFFFFF' : colors.surface}
        />
      </View>

      {hasVehicle && (
        <>
          <UnifiedFormInput
            label="Current licence number"
            value={currentLicenceNumber}
            onChangeText={setCurrentLicenceNumber}
            placeholder="N12345W"
            maxLength={10}
            autoCapitalize="characters"
          />

          <UnifiedFormInput
            label="Vehicle register number"
            value={vehicleRegisterNumber}
            onChangeText={setVehicleRegisterNumber}
            placeholder="VR123456"
            maxLength={15}
            autoCapitalize="characters"
          />

          <UnifiedFormInput
            label="Chassis number/VIN"
            value={chassisNumber}
            onChangeText={setChassisNumber}
            placeholder="ABC123DEF456789"
            maxLength={20}
            autoCapitalize="characters"
          />

          <UnifiedFormInput
            label="Vehicle make"
            value={vehicleMake}
            onChangeText={setVehicleMake}
            placeholder="Toyota"
            maxLength={20}
            autoCapitalize="words"
          />

          <UnifiedFormInput
            label="Series name"
            value={seriesName}
            onChangeText={setSeriesName}
            placeholder="Corolla"
            maxLength={20}
            autoCapitalize="words"
          />
        </>
      )}
    </UnifiedCard>
  );
  const renderDeclarationDocuments = () => (
    <UnifiedCard variant="default" padding="large">
      <View style={styles.stepHeader}>
        <Ionicons name="document-text-outline" size={20} color={colors.primary} />
        <Text style={[typography.h4, { color: colors.text, marginLeft: spacing.sm }]}>
          Step 5 — Declaration & Documents
        </Text>
      </View>

      <Text style={[typography.h5, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md }]}>
        I am the *
      </Text>
      <View style={styles.radioGroup}>
        {[
          { key: 'applicant', label: 'applicant / holder of a personalised licence number' },
          { key: 'proxy', label: "applicant / holder's representative" },
        ].map((role) => (
          <TouchableOpacity
            key={role.key}
            style={styles.radioOption}
            onPress={() => setDeclarationRole(role.key)}
          >
            <View style={[styles.radioCircle, declarationRole === role.key && styles.radioSelected]}>
              {declarationRole === role.key && <View style={styles.radioInner} />}
            </View>
            <Text style={[typography.body, { color: colors.text }]}>{role.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.declarationContainer}>
        <Text style={[typography.h5, { color: colors.text, marginBottom: spacing.md }]}>
          I declare that:
        </Text>
        <Text style={[typography.bodySmall, { color: colors.text, marginBottom: spacing.sm, lineHeight: 20 }]}>
          (a) I am aware that a personalised licence number or the right to use it may be subject to copyright or other intellectual property rights.
        </Text>
        <Text style={[typography.bodySmall, { color: colors.text, marginBottom: spacing.sm, lineHeight: 20 }]}>
          (b) In the event of surrender of a personalised licence number, I declare that the personalised licence plates have been destroyed.
        </Text>
        <Text style={[typography.bodySmall, { color: colors.text, marginBottom: spacing.sm, lineHeight: 20 }]}>
          (c) I declare that all the particulars furnished by me are true and correct.
        </Text>
        <Text style={[typography.bodySmall, { color: colors.text, lineHeight: 20 }]}>
          (d) I am aware that a false declaration is punishable by law.
        </Text>
      </View>

      <UnifiedFormInput
        label="Place"
        value={declarationPlace}
        onChangeText={(value) => {
          setDeclarationPlace(value);
          handleFieldChange('declarationPlace', value);
        }}
        placeholder="Windhoek"
        error={validationErrors.declarationPlace}
        maxLength={30}
        autoCapitalize="words"
        required
      />

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => {
            setDeclarationAccepted(!declarationAccepted);
            handleFieldChange('declarationAccepted', !declarationAccepted);
          }}
        >
          <View style={[styles.checkboxBox, declarationAccepted && styles.checkboxChecked]}>
            {declarationAccepted && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
          </View>
          <Text style={[typography.bodySmall, { color: colors.text, flex: 1, lineHeight: 20 }]}>
            I accept the above declaration and confirm that all information provided is true and correct *
          </Text>
        </TouchableOpacity>
        {validationErrors.declarationAccepted && (
          <Text style={[typography.caption, { color: colors.error, marginTop: spacing.xs }]}>
            {validationErrors.declarationAccepted}
          </Text>
        )}
      </View>

      <Text style={[typography.h5, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
        Certified copy of identification document *
      </Text>

        <UnifiedFormInput
          label="Document Upload"
          value={document ? document.name : ''}
          placeholder="Upload certified ID document"
          error={validationErrors.document}
          editable={false}
          rightIcon="cloud-upload-outline"
          onRightIconPress={handleDocumentPick}
          helperText="Upload a clear, certified copy of your identification document (PDF or image format, max 10MB)"
        />

        <TouchableOpacity
          style={styles.documentUploadButton}
          onPress={handleDocumentPick}
          disabled={documentLoading}
        >
          {documentLoading ? (
            <UnifiedSkeletonLoader type="button" animated={true} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
              <Text style={[typography.body, { color: colors.primary, fontWeight: '600', marginTop: spacing.sm }]}>
                {document ? 'Change Document' : 'Upload Document'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {document && (
          <View style={styles.documentInfo}>
            <Ionicons name="document" size={24} color={colors.success} />
            <View style={styles.documentDetails}>
              <Text style={[typography.bodySmall, { color: colors.text, fontWeight: '600' }]}>
                {document.name}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {(document.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>
            <TouchableOpacity onPress={() => setDocument(null)}>
              <Ionicons name="close-circle" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
    </UnifiedCard>
  );
  const renderNavigationButtons = () => (
    <View style={styles.navigationContainer}>
      {currentStep > 0 && (
        <UnifiedButton
          label="Previous"
          variant="outline"
          size="medium"
          iconName="arrow-back"
          iconPosition="left"
          onPress={prevStep}
        />
      )}
      
      <View style={styles.navButtonSpacer} />
      
      {currentStep < wizardSteps.length - 1 ? (
        <UnifiedButton
          label="Next"
          variant="primary"
          size="medium"
          iconName="arrow-forward"
          iconPosition="right"
          onPress={nextStep}
        />
      ) : (
        <UnifiedButton
          label="Submit Application"
          variant="primary"
          size="medium"
          iconName="send"
          iconPosition="left"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        />
      )}
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderPersonalInformation();
      case 1: return renderContactAddress();
      case 2: return renderPlateDetails();
      case 3: return renderOptionalInformation();
      case 4: return renderDeclarationDocuments();
      default: return renderPersonalInformation();
    }
  };

  return (
    <View style={styles.container}>
      {renderProgressHeader()}
      {renderHelpModal()}

      {/* Progress Indicator */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${formProgress}%` }]} />
        </View>
        
        <View style={styles.stepIndicators}>
          {wizardSteps.map((step, index) => (
            <View key={step.id} style={styles.stepIndicatorContainer}>
              <View
                style={[
                  styles.stepIndicator,
                  index === currentStep && styles.activeStepIndicator,
                  index < currentStep && styles.completedStepIndicator,
                ]}
              >
                <Ionicons
                  name={index < currentStep ? 'checkmark' : step.icon}
                  size={16}
                  color={index <= currentStep ? '#FFFFFF' : colors.textSecondary}
                />
              </View>
              {index < wizardSteps.length - 1 && (
                <View style={[styles.stepConnector, index < currentStep && styles.completedStepConnector]} />
              )}
            </View>
          ))}
        </View>
        
        <View style={styles.stepInfo}>
          <Text style={[typography.h4, { color: colors.text, textAlign: 'center' }]}>
            {wizardSteps[currentStep].title}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
            {wizardSteps[currentStep].subtitle}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, lineHeight: 20 }]}>
            {wizardSteps[currentStep].description}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderCurrentStep()}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {renderNavigationButtons()}
    </View>
  );
}
// Government-standard styling using official design system
const createStyles = (colors, isDark, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressSection: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepIndicator: {
    backgroundColor: colors.primary,
  },
  completedStepIndicator: {
    backgroundColor: colors.success,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  completedStepConnector: {
    backgroundColor: colors.success,
  },
  stepInfo: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radioGroup: {
    marginBottom: spacing.lg,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  phoneCode: {
    flex: 0.25,
    marginRight: spacing.md,
  },
  phoneNumber: {
    flex: 0.75,
  },
  plateFormatContainer: {
    marginBottom: spacing.lg,
  },
  plateFormatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  quantityContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  quantityOption: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
    backgroundColor: colors.background,
  },
  quantitySelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  plateChoiceContainer: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  plateChoiceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  plateTextInput: {
    flex: 0.4,
    marginRight: spacing.md,
  },
  plateMeaningInput: {
    flex: 0.6,
  },
  platePreview: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  platePreviewContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    minWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.1,
    shadowRadius: 4,
    elevation: isDark ? 0 : 3,
  },
  platePreviewText: {
    ...typography.h4,
    color: '#000000',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  platePreviewRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  plateFlag: {
    width: 28,
    height: 18,
    borderRadius: 2,
    overflow: 'hidden',
  },
  plateCountryCode: {
    ...typography.body,
    fontWeight: '700',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  declarationContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkboxContainer: {
    marginTop: spacing.lg,
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
    marginRight: spacing.md,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  documentUploadButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.success + '20', // 20% opacity
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.success,
  },
  documentDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: Math.max(spacing.xl, insets?.bottom || 0) + 4,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButtonSpacer: {
    flex: 1,
    minWidth: spacing.xl,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  helpModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  helpContent: {
    flex: 1,
    padding: spacing.xl,
  },
});

// Screen options to hide the default header
PLNApplicationScreenEnhanced.options = {
  headerShown: false,
};