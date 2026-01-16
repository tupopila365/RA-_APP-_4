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
  Dimensions,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { plnService } from '../services/plnService';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { validators, getErrorMessage } from '../utils/validation';
import { useAppContext } from '../context/AppContext';

// Import native modules
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');

// Professional color palette
const COLORS = {
  primary: '#2563EB', // Professional blue
  secondary: '#64748B', // Slate gray
  success: '#059669', // Emerald green
  warning: '#D97706', // Amber
  error: '#DC2626', // Red
  background: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
};

export default function PLNApplicationWizard({ navigation }) {
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

  // Professional styles
  const styles = createStyles(insets);

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
      title: 'Personal Information',
      subtitle: 'Tell us about yourself',
      icon: 'person-outline',
      description: 'We need your personal details to process your application. All information is kept secure and confidential.',
      fields: ['idType', 'surname', 'initials', 'businessName', 'trafficRegisterNumber', 'businessRegNumber'],
      helpText: 'Choose your identification type and provide accurate personal information as it appears on your official documents.',
    },
    {
      id: 'contact',
      title: 'Contact & Address',
      subtitle: 'How can we reach you?',
      icon: 'location-outline',
      description: 'Provide your current addresses and contact information for correspondence and delivery.',
      fields: ['postalAddress', 'streetAddress', 'cellNumber', 'email', 'telephoneHome', 'telephoneDay'],
      helpText: 'Ensure your addresses are complete and accurate. We will use these for official correspondence and plate delivery.',
    },
    {
      id: 'plates',
      title: 'Number Plate Details',
      subtitle: 'Design your personalized plates',
      icon: 'car-outline',
      description: 'Choose your preferred plate format and provide your personalized text choices.',
      fields: ['plateFormat', 'quantity', 'plateChoices'],
      helpText: 'Provide 3 choices in order of preference. Each choice must be unique and follow Namibian regulations.',
    },
    {
      id: 'optional',
      title: 'Additional Information',
      subtitle: 'Representative & vehicle details',
      icon: 'people-outline',
      description: 'Optional information about representatives and vehicle details.',
      fields: ['hasRepresentative', 'hasVehicle'],
      helpText: 'This information is optional but can help us process your application more efficiently.',
    },
    {
      id: 'declaration',
      title: 'Declaration & Documents',
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
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.progressTitleContainer}>
          <MaterialIcons name="description" size={24} color={COLORS.primary} />
          <Text style={styles.progressTitle}>PLN Application</Text>
        </View>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => setShowHelp(true)}
        >
          <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
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
                color={index <= currentStep ? '#fff' : COLORS.textMuted}
              />
            </View>
            {index < wizardSteps.length - 1 && (
              <View style={[styles.stepConnector, index < currentStep && styles.completedStepConnector]} />
            )}
          </View>
        ))}
      </View>
      
      <View style={styles.stepInfo}>
        <Text style={styles.stepTitle}>{wizardSteps[currentStep].title}</Text>
        <Text style={styles.stepSubtitle}>{wizardSteps[currentStep].subtitle}</Text>
        <Text style={styles.stepDescription}>{wizardSteps[currentStep].description}</Text>
      </View>
    </View>
  );

  const renderHelpModal = () => (
    <Modal
      visible={showHelp}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowHelp(false)}
    >
      <View style={styles.helpModal}>
        <View style={styles.helpHeader}>
          <Text style={styles.helpTitle}>Step {currentStep + 1} — Help & Guidance</Text>
          <TouchableOpacity onPress={() => setShowHelp(false)}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.helpContent}>
          <Text style={styles.helpSectionTitle}>{wizardSteps[currentStep].title}</Text>
          <Text style={styles.helpText}>{wizardSteps[currentStep].helpText}</Text>
          
          <Text style={styles.helpSectionTitle}>Required Fields</Text>
          {wizardSteps[currentStep].fields.map(field => (
            <Text key={field} style={styles.helpFieldText}>• {field}</Text>
          ))}
          
          <Text style={styles.helpSectionTitle}>Tips</Text>
          <Text style={styles.helpText}>
            • Double-check all information for accuracy{'\n'}
            • Use official document names and numbers{'\n'}
            • Ensure contact information is current{'\n'}
            • Keep your reference ID safe after submission
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
  // Step content renderers
  const renderPersonalInformation = () => (
    <Card style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <Ionicons name="person-outline" size={24} color={COLORS.primary} />
        <Text style={styles.stepCardTitle}>Personal Information</Text>
      </View>
      
      <Text style={styles.fieldLabel}>Transaction Type</Text>
      <View style={styles.readOnlyField}>
        <Text style={styles.readOnlyText}>{transactionType}</Text>
        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
      </View>

      <Text style={styles.fieldLabel}>Type of identification *</Text>
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
            <Text style={styles.radioText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {idType === 'Traffic Register Number' && (
        <FormInput
          label="Traffic Register Number *"
          value={trafficRegisterNumber}
          onChangeText={(value) => {
            setTrafficRegisterNumber(value);
            handleFieldChange('trafficRegisterNumber', value);
          }}
          placeholder="Enter traffic register number"
          error={validationErrors.trafficRegisterNumber}
          maxLength={13}
          keyboardType="numeric"
        />
      )}

      {idType === 'Business Reg. No' && (
        <>
          <FormInput
            label="Business Registration Number *"
            value={businessRegNumber}
            onChangeText={(value) => {
              setBusinessRegNumber(value);
              handleFieldChange('businessRegNumber', value);
            }}
            placeholder="Enter business registration number"
            error={validationErrors.businessRegNumber}
            maxLength={20}
          />
          <FormInput
            label="Business Name *"
            value={businessName}
            onChangeText={(value) => {
              setBusinessName(value);
              handleFieldChange('businessName', value);
            }}
            placeholder="Enter business name"
            error={validationErrors.businessName}
            maxLength={50}
            autoCapitalize="words"
          />
        </>
      )}

      {idType !== 'Business Reg. No' && (
        <>
          <FormInput
            label="Surname *"
            value={surname}
            onChangeText={(value) => {
              setSurname(value);
              handleFieldChange('surname', value);
            }}
            placeholder="Enter surname"
            error={validationErrors.surname}
            maxLength={25}
            autoCapitalize="words"
          />
          <FormInput
            label="Initials *"
            value={initials}
            onChangeText={(value) => {
              setInitials(value);
              handleFieldChange('initials', value);
            }}
            placeholder="Enter initials (e.g., J.D.)"
            error={validationErrors.initials}
            maxLength={10}
            autoCapitalize="characters"
          />
        </>
      )}
    </Card>
  );
  const renderContactAddress = () => (
    <Card style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <Ionicons name="location-outline" size={24} color={COLORS.primary} />
        <Text style={styles.stepCardTitle}>Contact & Address Information</Text>
      </View>

      <Text style={styles.sectionSubtitle}>Postal Address *</Text>
      <FormInput
        label="Address Line 1 *"
        value={postalAddress.line1}
        onChangeText={(text) => {
          setPostalAddress({ ...postalAddress, line1: text });
          handleFieldChange('postalAddressLine1', text);
        }}
        placeholder="P.O. Box or street address"
        error={validationErrors.postalAddressLine1}
        maxLength={40}
        autoCapitalize="words"
      />
      <FormInput
        label="Address Line 2"
        value={postalAddress.line2}
        onChangeText={(text) => setPostalAddress({ ...postalAddress, line2: text })}
        placeholder="City or area"
        maxLength={40}
        autoCapitalize="words"
      />
      <FormInput
        label="Address Line 3"
        value={postalAddress.line3}
        onChangeText={(text) => setPostalAddress({ ...postalAddress, line3: text })}
        placeholder="Region or country"
        maxLength={40}
        autoCapitalize="words"
      />

      <Text style={styles.sectionSubtitle}>Street Address *</Text>
      <FormInput
        label="Address Line 1 *"
        value={streetAddress.line1}
        onChangeText={(text) => {
          setStreetAddress({ ...streetAddress, line1: text });
          handleFieldChange('streetAddressLine1', text);
        }}
        placeholder="Street address"
        error={validationErrors.streetAddressLine1}
        maxLength={40}
        autoCapitalize="words"
      />
      <FormInput
        label="Address Line 2"
        value={streetAddress.line2}
        onChangeText={(text) => setStreetAddress({ ...streetAddress, line2: text })}
        placeholder="Area or suburb"
        maxLength={40}
        autoCapitalize="words"
      />
      <FormInput
        label="Address Line 3"
        value={streetAddress.line3}
        onChangeText={(text) => setStreetAddress({ ...streetAddress, line3: text })}
        placeholder="City"
        maxLength={40}
        autoCapitalize="words"
      />

      <Text style={styles.sectionSubtitle}>Contact Information *</Text>
      <View style={styles.phoneRow}>
        <FormInput
          label="Cell Code *"
          value={cellNumber.code}
          onChangeText={(text) => setCellNumber({ ...cellNumber, code: text })}
          placeholder="264"
          style={styles.phoneCode}
          keyboardType="numeric"
          maxLength={4}
          error={validationErrors.cellNumber}
        />
        <FormInput
          label="Cell Number *"
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
        />
      </View>

      <FormInput
        label="Email Address *"
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
      />

      <Text style={styles.helperText}>Optional phone numbers</Text>
      <View style={styles.phoneRow}>
        <FormInput
          label="Home Phone Code"
          value={telephoneHome.code}
          onChangeText={(text) => setTelephoneHome({ ...telephoneHome, code: text })}
          placeholder="264"
          style={styles.phoneCode}
          keyboardType="numeric"
          maxLength={4}
        />
        <FormInput
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
        <FormInput
          label="Day Phone Code"
          value={telephoneDay.code}
          onChangeText={(text) => setTelephoneDay({ ...telephoneDay, code: text })}
          placeholder="264"
          style={styles.phoneCode}
          keyboardType="numeric"
          maxLength={4}
        />
        <FormInput
          label="Day Phone Number"
          value={telephoneDay.number}
          onChangeText={(text) => setTelephoneDay({ ...telephoneDay, number: text })}
          placeholder="61234567"
          style={styles.phoneNumber}
          keyboardType="numeric"
          maxLength={10}
        />
      </View>
    </Card>
  );
  const renderPlateDetails = () => (
    <Card style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <Ionicons name="car-outline" size={24} color={COLORS.primary} />
        <Text style={styles.stepCardTitle}>Number Plate Details</Text>
      </View>

      <Text style={styles.fieldLabel}>Number plate format *</Text>
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
            <Text style={styles.plateFormatText}>{format.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Quantity *</Text>
      <View style={styles.quantityContainer}>
        {[1, 2].map((num) => (
          <TouchableOpacity
            key={num}
            style={[styles.quantityOption, quantity === num && styles.quantitySelected]}
            onPress={() => setQuantity(num)}
          >
            <Text style={[styles.quantityText, quantity === num && styles.quantityTextSelected]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionSubtitle}>Plate Choices (in order of preference)</Text>
      <Text style={styles.helperText}>
        Enter your preferred personalized number plate text. Maximum 8 characters each. Provide 3 choices in order of preference.
      </Text>

      {plateChoices.map((choice, index) => (
        <View key={index} style={styles.plateChoiceContainer}>
          <Text style={styles.plateChoiceLabel}>
            {index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'} Choice *
          </Text>
          <View style={styles.plateChoiceRow}>
            <FormInput
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
              style={styles.plateMeaningInput}
              maxLength={30}
            />
          </View>
          <View style={styles.platePreview}>
            <Text style={styles.platePreviewText}>
              {choice.text || 'PREVIEW'}
            </Text>
            <Image 
              source={require('../flag/image.png')} 
              style={styles.plateFlag}
              resizeMode="contain"
            />
            <Text style={styles.platePreviewText}>NA</Text>
          </View>
        </View>
      ))}
    </Card>
  );
  const renderOptionalInformation = () => (
    <Card style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <Ionicons name="people-outline" size={24} color={COLORS.primary} />
        <Text style={styles.stepCardTitle}>Additional Information</Text>
      </View>

      <Text style={styles.helperText}>
        This information is optional but can help us process your application more efficiently.
      </Text>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Do you have a representative/proxy?</Text>
        <Switch
          value={hasRepresentative}
          onValueChange={setHasRepresentative}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={hasRepresentative ? '#fff' : '#f4f3f4'}
        />
      </View>

      {hasRepresentative && (
        <>
          <Text style={styles.fieldLabel}>Representative's identification type</Text>
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
                <Text style={styles.radioText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FormInput
            label="Identification Number"
            value={representativeIdNumber}
            onChangeText={setRepresentativeIdNumber}
            placeholder="Enter identification number"
            maxLength={13}
            keyboardType="numeric"
          />

          <FormInput
            label="Surname"
            value={representativeSurname}
            onChangeText={setRepresentativeSurname}
            placeholder="Enter surname"
            maxLength={25}
            autoCapitalize="words"
          />

          <FormInput
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
        <Text style={styles.switchLabel}>Do you want to provide vehicle details?</Text>
        <Switch
          value={hasVehicle}
          onValueChange={setHasVehicle}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
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
  const renderDeclarationDocuments = () => (
    <Card style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
        <Text style={styles.stepCardTitle}>Declaration & Documents</Text>
      </View>

      <Text style={styles.fieldLabel}>I am the *</Text>
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
            <Text style={styles.radioText}>{role.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.declarationContainer}>
        <Text style={styles.declarationTitle}>I declare that:</Text>
        <Text style={styles.declarationPoint}>
          (a) I am aware that a personalised licence number or the right to use it may be subject to copyright or other intellectual property rights.
        </Text>
        <Text style={styles.declarationPoint}>
          (b) In the event of surrender of a personalised licence number, I declare that the personalised licence plates have been destroyed.
        </Text>
        <Text style={styles.declarationPoint}>
          (c) I declare that all the particulars furnished by me are true and correct.
        </Text>
        <Text style={styles.declarationPoint}>
          (d) I am aware that a false declaration is punishable by law.
        </Text>
      </View>

      <FormInput
        label="Place *"
        value={declarationPlace}
        onChangeText={(value) => {
          setDeclarationPlace(value);
          handleFieldChange('declarationPlace', value);
        }}
        placeholder="Windhoek"
        error={validationErrors.declarationPlace}
        maxLength={30}
        autoCapitalize="words"
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
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </View>
          <Text style={styles.checkboxText}>
            I accept the above declaration and confirm that all information provided is true and correct *
          </Text>
        </TouchableOpacity>
        {validationErrors.declarationAccepted && (
          <Text style={styles.errorText}>{validationErrors.declarationAccepted}</Text>
        )}
      </View>

      <Text style={styles.fieldLabel}>Certified copy of identification document *</Text>
      <Text style={styles.helperText}>
        Upload a clear, certified copy of your identification document (PDF or image format, max 10MB).
      </Text>

      <TouchableOpacity
        style={styles.documentUploadButton}
        onPress={handleDocumentPick}
        disabled={documentLoading}
      >
        {documentLoading ? (
          <SkeletonLoader type="circle" width={16} height={16} />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={32} color={COLORS.primary} />
            <Text style={styles.documentUploadText}>
              {document ? 'Change Document' : 'Upload Document'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {document && (
        <View style={styles.documentInfo}>
          <Ionicons name="document" size={24} color={COLORS.success} />
          <View style={styles.documentDetails}>
            <Text style={styles.documentName}>{document.name}</Text>
            <Text style={styles.documentSize}>
              {(document.size / 1024 / 1024).toFixed(2)} MB
            </Text>
          </View>
          <TouchableOpacity onPress={() => setDocument(null)}>
            <Ionicons name="close-circle" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      )}

      {validationErrors.document && (
        <Text style={styles.errorText}>{validationErrors.document}</Text>
      )}
    </Card>
  );
  const renderNavigationButtons = () => (
    <View style={styles.navigationContainer}>
      {currentStep > 0 && (
        <TouchableOpacity style={styles.navButton} onPress={prevStep}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.navButtonSpacer} />
      
      {currentStep < wizardSteps.length - 1 ? (
        <TouchableOpacity style={styles.navButton} onPress={nextStep}>
          <Text style={styles.navButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <SkeletonLoader type="circle" width={16} height={16} />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Application</Text>
            </>
          )}
        </TouchableOpacity>
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
// Professional styling
const createStyles = (insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Math.max(16, insets?.top || 0),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  progressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  helpButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepIndicator: {
    backgroundColor: COLORS.primary,
  },
  completedStepIndicator: {
    backgroundColor: COLORS.success,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  completedStepConnector: {
    backgroundColor: COLORS.success,
  },
  stepInfo: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  stepSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  stepCard: {
    margin: 20,
    padding: 24,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 24,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  helperText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  readOnlyText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioText: {
    fontSize: 14,
    color: COLORS.text,
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
  plateFormatContainer: {
    marginBottom: 16,
  },
  plateFormatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  plateFormatText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  quantityOption: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: COLORS.background,
  },
  quantitySelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  quantityTextSelected: {
    color: '#fff',
  },
  plateChoiceContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  plateChoiceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
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
    borderColor: COLORS.primary,
    alignSelf: 'flex-start',
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  platePreviewText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
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
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    fontWeight: '500',
  },
  declarationContainer: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  declarationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  declarationPoint: {
    fontSize: 14,
    color: COLORS.text,
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
    borderColor: COLORS.primary,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  documentUploadButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  documentUploadText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  documentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  documentSize: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: Math.max(20, insets?.bottom || 0) + 4,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    minWidth: 100,
  },
  navButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  navButtonSpacer: {
    flex: 1,
    minWidth: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 140,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  bottomSpacing: {
    height: 20,
  },
  helpModal: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  helpContent: {
    flex: 1,
    padding: 20,
  },
  helpSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  helpFieldText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
});

// Screen options to hide the default header
PLNApplicationWizard.options = {
  headerShown: false,
};