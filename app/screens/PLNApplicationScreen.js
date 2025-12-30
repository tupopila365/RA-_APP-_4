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

  // Check authentication on mount
  useEffect(() => {
    if (!user) {
      // Redirect to login screen with return navigation
      navigation.replace('Auth', {
        screen: 'Login',
        params: {
          returnScreen: 'PLNApplication',
        },
      });
    }
  }, [user, navigation]);

  // Form state
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [plateChoices, setPlateChoices] = useState([
    { text: '', meaning: '' },
    { text: '', meaning: '' },
    { text: '', meaning: '' },
  ]);
  const [document, setDocument] = useState(null);
  const [declaration, setDeclaration] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  const styles = getStyles(colors);

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const updatePlateChoice = (index, field, value) => {
    const updated = [...plateChoices];
    updated[index] = { ...updated[index], [field]: value };
    setPlateChoices(updated);
    // Clear error for this field
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
          'Document picker requires a development build. Please build the app with: npx expo run:android',
          [{ text: 'OK' }]
        );
        setDocumentLoading(false);
        return;
      }

      // Show action sheet for document selection
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
                Alert.alert('Error', 'Failed to pick document. Please try again.');
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
                Alert.alert('Error', 'Failed to pick image. Please try again.');
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

    // Validate full name
    if (!validators.required(fullName)) {
      newErrors.fullName = getErrorMessage('Full name', 'required');
    }

    // Validate ID number
    if (!validators.required(idNumber)) {
      newErrors.idNumber = getErrorMessage('ID number', 'required');
    }

    // Validate phone number
    if (!validators.required(phoneNumber)) {
      newErrors.phoneNumber = getErrorMessage('Phone number', 'required');
    } else if (!validators.phone(phoneNumber)) {
      newErrors.phoneNumber = getErrorMessage('Phone number', 'phone');
    }

    // Validate plate choices
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

    // Validate document
    if (!document) {
      newErrors.document = 'Certified ID document is required';
    }

    // Validate declaration
    if (!declaration) {
      newErrors.declaration = 'You must accept the declaration';
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
        fullName: fullName.trim(),
        idNumber: idNumber.trim(),
        phoneNumber: phoneNumber.trim(),
        plateChoices: plateChoices.map((choice) => ({
          text: choice.text.trim().toUpperCase(),
          meaning: choice.meaning.trim(),
        })),
      };

      const application = await plnService.submitApplication(applicationData, document.uri);

      // Navigate to confirmation screen
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
          {/* Applicant Details */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Applicant Details</Text>
            <FormInput
              label="Full Name"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) {
                  const newErrors = { ...errors };
                  delete newErrors.fullName;
                  setErrors(newErrors);
                }
              }}
              placeholder="Enter your full name"
              error={errors.fullName}
            />
            <FormInput
              label="ID Number"
              value={idNumber}
              onChangeText={(text) => {
                setIdNumber(text);
                if (errors.idNumber) {
                  const newErrors = { ...errors };
                  delete newErrors.idNumber;
                  setErrors(newErrors);
                }
              }}
              placeholder="Enter your ID number"
              error={errors.idNumber}
            />
            <FormInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (errors.phoneNumber) {
                  const newErrors = { ...errors };
                  delete newErrors.phoneNumber;
                  setErrors(newErrors);
                }
              }}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              error={errors.phoneNumber}
            />
          </Card>

          {/* Plate Choices */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Plate Choices (3 choices required)</Text>
            {plateChoices.map((choice, index) => (
              <View key={index} style={styles.plateChoiceContainer}>
                <Text style={styles.plateChoiceLabel}>Choice {index + 1}</Text>
                <FormInput
                  label="Plate Text (max 7 alphanumeric)"
                  value={choice.text}
                  onChangeText={(text) => {
                    // Convert to uppercase and limit to 7 chars
                    const upperText = text.toUpperCase().slice(0, 7);
                    updatePlateChoice(index, 'text', upperText);
                  }}
                  placeholder="e.g., ABC123"
                  maxLength={7}
                  error={errors[`plate${index}text`]}
                />
                <FormInput
                  label="Meaning"
                  value={choice.meaning}
                  onChangeText={(text) => {
                    updatePlateChoice(index, 'meaning', text);
                  }}
                  placeholder="Explain the meaning of this plate"
                  textArea
                  error={errors[`plate${index}meaning`]}
                />
              </View>
            ))}
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
            {errors.document && (
              <Text style={styles.errorText}>{errors.document}</Text>
            )}
          </Card>

          {/* Declaration */}
          <Card style={styles.section}>
            <View style={styles.declarationContainer}>
              <Switch
                value={declaration}
                onValueChange={(value) => {
                  setDeclaration(value);
                  if (errors.declaration) {
                    const newErrors = { ...errors };
                    delete newErrors.declaration;
                    setErrors(newErrors);
                  }
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
              <Text style={styles.declarationText}>
                I declare that the information provided is correct.
              </Text>
            </View>
            {errors.declaration && (
              <Text style={styles.errorText}>{errors.declaration}</Text>
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
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    sectionSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
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
    declarationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    declarationText: {
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
  });
}

