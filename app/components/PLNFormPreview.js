import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

export const PLNFormPreview = ({ applicationData }) => {
  const { colors, isDark } = useTheme();

  // Dynamic styles based on theme
  const dynamicStyles = createDynamicStyles(colors, isDark);
  const renderFormHeader = () => (
    <View style={dynamicStyles.formHeader}>
      <Text style={dynamicStyles.formNumber}>PLN2-NA(2)(2007/05)</Text>
      <Text style={dynamicStyles.formCode}>PLN2</Text>
      
      <Text style={dynamicStyles.republicTitle}>REPUBLIC OF NAMIBIA</Text>
      <Text style={dynamicStyles.ministryTitle}>MINISTRY OF WORKS AND TRANSPORT</Text>
      <Text style={dynamicStyles.departmentTitle}>DEPARTMENT OF TRANSPORT</Text>
      <Text style={dynamicStyles.actTitle}>(Road Traffic and Transport Act, 1999)</Text>
      
      <Text style={dynamicStyles.applicationTitle}>
        APPLICATION FOR PERSONALISED LICENCE NUMBER AND ORDERING OF PLATES
      </Text>
      
      <Text style={dynamicStyles.identificationNote}>
        Acceptable identification is essential (including that of the proxy and/or representative).
      </Text>
    </View>
  );

  const renderTransactionTypes = () => (
    <View style={dynamicStyles.transactionSection}>
      <Text style={dynamicStyles.sectionTitle}>LIST OF POSSIBLE TRANSACTIONS:</Text>
      
      <View style={dynamicStyles.transactionList}>
        <View style={dynamicStyles.transactionItem}>
          <MaterialIcons name="check-box" size={16} color={colors.success} />
          <Text style={dynamicStyles.transactionText}>New Personalised Licence Number</Text>
          <Text style={dynamicStyles.transactionParts}>A, B, C, E</Text>
        </View>
        
        <View style={dynamicStyles.transactionItem}>
          <MaterialIcons name="check-box-outline-blank" size={16} color={colors.textSecondary} />
          <Text style={dynamicStyles.transactionText}>Allocate a personalised licence number to another vehicle</Text>
          <Text style={dynamicStyles.transactionParts}>A, B, C, D, E</Text>
        </View>
        
        <View style={dynamicStyles.transactionItem}>
          <MaterialIcons name="check-box-outline-blank" size={16} color={colors.textSecondary} />
          <Text style={dynamicStyles.transactionText}>Order alternative personalised number plate format(s)</Text>
          <Text style={dynamicStyles.transactionParts}>A, B, C, E</Text>
        </View>
        
        <View style={dynamicStyles.transactionItem}>
          <MaterialIcons name="check-box-outline-blank" size={16} color={colors.textSecondary} />
          <Text style={dynamicStyles.transactionText}>Replacement of lost or stolen personalised number plate</Text>
          <Text style={dynamicStyles.transactionParts}>A, B, C, E</Text>
        </View>
        
        <View style={dynamicStyles.transactionItem}>
          <MaterialIcons name="check-box-outline-blank" size={16} color={colors.textSecondary} />
          <Text style={dynamicStyles.transactionText}>Duplicate certificate of entitlement</Text>
          <Text style={dynamicStyles.transactionParts}>A, B, C, E</Text>
        </View>
      </View>
    </View>
  );

  const renderSectionA = () => (
    <View style={dynamicStyles.formSection}>
      <Text style={dynamicStyles.sectionHeader}>A. PARTICULARS OF OWNER/TRANSFEROR:</Text>
      
      <Text style={dynamicStyles.fieldLabel}>Type of identification (mark with X):</Text>
      <View style={dynamicStyles.checkboxRow}>
        <View style={dynamicStyles.checkboxItem}>
          <MaterialIcons 
            name={applicationData?.idType === 'Traffic Register Number' ? 'check-box' : 'check-box-outline-blank'} 
            size={16} 
            color={applicationData?.idType === 'Traffic Register Number' ? colors.success : colors.textSecondary} 
          />
          <Text style={dynamicStyles.checkboxText}>Traffic Register Number</Text>
        </View>
        <View style={dynamicStyles.checkboxItem}>
          <MaterialIcons 
            name={applicationData?.idType === 'Namibia ID-doc' ? 'check-box' : 'check-box-outline-blank'} 
            size={16} 
            color={applicationData?.idType === 'Namibia ID-doc' ? colors.success : colors.textSecondary} 
          />
          <Text style={dynamicStyles.checkboxText}>Namibia ID-doc</Text>
        </View>
        <View style={dynamicStyles.checkboxItem}>
          <MaterialIcons 
            name={applicationData?.idType === 'Business Reg. No' ? 'check-box' : 'check-box-outline-blank'} 
            size={16} 
            color={applicationData?.idType === 'Business Reg. No' ? colors.success : colors.textSecondary} 
          />
          <Text style={dynamicStyles.checkboxText}>Business Reg. No</Text>
        </View>
      </View>

      <Text style={dynamicStyles.fieldLabel}>Identification number/Business Reg. Number:</Text>
      <View style={dynamicStyles.gridBoxContainer}>
        {renderGridBoxes(applicationData?.trafficRegisterNumber || applicationData?.businessRegNumber || '', 20)}
      </View>

      <Text style={dynamicStyles.fieldLabel}>Surname and initials/Business Name:</Text>
      {applicationData?.idType === 'Business Reg. No' ? (
        <View style={dynamicStyles.gridBoxContainer}>
          {renderGridBoxes(applicationData?.businessName || '', 30)}
        </View>
      ) : (
        <View style={dynamicStyles.nameRow}>
          <View style={dynamicStyles.gridBoxContainer}>
            {renderGridBoxes(applicationData?.surname || '', 25)}
          </View>
          <Text style={dynamicStyles.andText}>and</Text>
          <View style={dynamicStyles.gridBoxContainer}>
            {renderGridBoxes(applicationData?.initials || '', 5)}
          </View>
        </View>
      )}

      <Text style={dynamicStyles.fieldLabel}>Postal address:</Text>
      <View style={dynamicStyles.addressContainer}>
        <View style={dynamicStyles.gridBoxContainer}>
          {renderGridBoxes(applicationData?.postalAddress?.line1 || '', 40)}
        </View>
        <View style={dynamicStyles.gridBoxContainer}>
          {renderGridBoxes(applicationData?.postalAddress?.line2 || '', 40)}
        </View>
        <View style={dynamicStyles.gridBoxContainer}>
          {renderGridBoxes(applicationData?.postalAddress?.line3 || '', 40)}
        </View>
      </View>

      <Text style={dynamicStyles.fieldLabel}>Street address:</Text>
      <View style={dynamicStyles.addressContainer}>
        <View style={dynamicStyles.gridBoxContainer}>
          {renderGridBoxes(applicationData?.streetAddress?.line1 || '', 40)}
        </View>
        <View style={dynamicStyles.gridBoxContainer}>
          {renderGridBoxes(applicationData?.streetAddress?.line2 || '', 40)}
        </View>
        <View style={dynamicStyles.gridBoxContainer}>
          {renderGridBoxes(applicationData?.streetAddress?.line3 || '', 40)}
        </View>
      </View>

      <View style={dynamicStyles.contactInfo}>
        <View style={dynamicStyles.contactRow}>
          <Text style={dynamicStyles.contactLabel}>Telephone number at home:</Text>
          <Text style={dynamicStyles.contactValue}>
            (code) {applicationData?.telephoneHome?.code || ''} (number) {applicationData?.telephoneHome?.number || ''}
          </Text>
        </View>
        <View style={dynamicStyles.contactRow}>
          <Text style={dynamicStyles.contactLabel}>Telephone number during day:</Text>
          <Text style={dynamicStyles.contactValue}>
            (code) {applicationData?.telephoneDay?.code || ''} (number) {applicationData?.telephoneDay?.number || ''}
          </Text>
        </View>
        <View style={dynamicStyles.contactRow}>
          <Text style={dynamicStyles.contactLabel}>Cell number:</Text>
          <Text style={dynamicStyles.contactValue}>
            (code) {applicationData?.cellNumber?.code || ''} (number) {applicationData?.cellNumber?.number || ''}
          </Text>
        </View>
        <View style={dynamicStyles.contactRow}>
          <Text style={dynamicStyles.contactLabel}>E-mail:</Text>
          <Text style={dynamicStyles.contactValue}>{applicationData?.email || ''}</Text>
        </View>
      </View>
    </View>
  );

  const renderSectionB = () => (
    <View style={dynamicStyles.formSection}>
      <Text style={dynamicStyles.sectionHeader}>B. PERSONALISED NUMBER PLATE:</Text>
      
      <View style={dynamicStyles.plateTable}>
        <View style={dynamicStyles.plateTableHeader}>
          <Text style={dynamicStyles.plateTableHeaderText}>Number plate format</Text>
          <Text style={dynamicStyles.plateTableHeaderText}>Quantity (1 or 2)</Text>
          <Text style={dynamicStyles.plateTableHeaderText}>1st Number Choice</Text>
          <Text style={dynamicStyles.plateTableHeaderText}>2nd Alternative</Text>
          <Text style={dynamicStyles.plateTableHeaderText}>3rd Alternative</Text>
        </View>
        
        {[
          'Long/German format (520 mm x 110mm)',
          'Normal format (440 mm x 120mm)',
          'American format (305 mm x 165mm)',
          'Square format (250 mm x 205mm)',
          'Small motorcycle format (250 mm x 165mm)',
        ].map((format, index) => (
          <View key={index} style={dynamicStyles.plateTableRow}>
            <View style={dynamicStyles.plateFormatCell}>
              <MaterialIcons 
                name={format.includes(applicationData?.plateFormat) ? 'check-box' : 'check-box-outline-blank'} 
                size={16} 
                color={format.includes(applicationData?.plateFormat) ? colors.success : colors.textSecondary} 
              />
              <Text style={dynamicStyles.plateFormatText}>{format}</Text>
            </View>
            <View style={dynamicStyles.plateQuantityCell}>
              {format.includes(applicationData?.plateFormat) && (
                <Text style={dynamicStyles.plateQuantityText}>{applicationData?.quantity || ''}</Text>
              )}
            </View>
          </View>
        ))}
        
        <View style={dynamicStyles.plateChoicesRow}>
          {applicationData?.plateChoices?.map((choice, index) => (
            <View key={index} style={dynamicStyles.plateChoiceCell}>
              <Text style={dynamicStyles.plateChoiceLabel}>
                {index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'} Choice:
              </Text>
              <View style={dynamicStyles.platePreview}>
                <Text style={dynamicStyles.platePreviewText}>
                  {choice.text || 'CHOICE'}
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
        </View>
      </View>
    </View>
  );

  const renderSectionC = () => {
    if (!applicationData?.hasRepresentative) return null;
    
    return (
      <View style={dynamicStyles.formSection}>
        <Text style={dynamicStyles.sectionHeader}>C. APPLICANT'S REPRESENTATIVE / PROXY (If applicable):</Text>
        
        <Text style={dynamicStyles.fieldLabel}>Type of identification (mark with X):</Text>
        <View style={dynamicStyles.checkboxRow}>
          <View style={dynamicStyles.checkboxItem}>
            <MaterialIcons 
              name={applicationData?.representativeIdType === 'Traffic Register Number' ? 'check-box' : 'check-box-outline-blank'} 
              size={16} 
              color={applicationData?.representativeIdType === 'Traffic Register Number' ? colors.success : colors.textSecondary} 
            />
            <Text style={dynamicStyles.checkboxText}>Traffic Register Number</Text>
          </View>
          <View style={dynamicStyles.checkboxItem}>
            <MaterialIcons 
              name={applicationData?.representativeIdType === 'Namibia ID-doc' ? 'check-box' : 'check-box-outline-blank'} 
              size={16} 
              color={applicationData?.representativeIdType === 'Namibia ID-doc' ? colors.success : colors.textSecondary} 
            />
            <Text style={dynamicStyles.checkboxText}>Namibia ID-doc</Text>
          </View>
        </View>

        <Text style={dynamicStyles.fieldLabel}>Identification number:</Text>
        <View style={dynamicStyles.gridBoxContainer}>
          {renderGridBoxes(applicationData?.representativeIdNumber || '', 13)}
        </View>

        <Text style={dynamicStyles.fieldLabel}>Surname and initials:</Text>
        <View style={dynamicStyles.nameRow}>
          <View style={dynamicStyles.gridBoxContainer}>
            {renderGridBoxes(applicationData?.representativeSurname || '', 13)}
          </View>
          <Text style={dynamicStyles.andText}>and</Text>
          <View style={dynamicStyles.gridBoxContainer}>
            {renderGridBoxes(applicationData?.representativeInitials || '', 3)}
          </View>
        </View>
      </View>
    );
  };

  const renderSectionD = () => {
    if (!applicationData?.hasVehicle) return null;
    
    return (
      <View style={dynamicStyles.formSection}>
        <Text style={dynamicStyles.sectionHeader}>D. PARTICULARS OF VEHICLE (If available):</Text>
        
        <View style={dynamicStyles.vehicleInfo}>
          <View style={dynamicStyles.vehicleRow}>
            <Text style={dynamicStyles.vehicleLabel}>Current licence number:</Text>
            <View style={dynamicStyles.gridBoxContainer}>
              {renderGridBoxes(applicationData?.currentLicenceNumber || '', 7)}
            </View>
          </View>
          
          <View style={dynamicStyles.vehicleRow}>
            <Text style={dynamicStyles.vehicleLabel}>Vehicle register number:</Text>
            <View style={dynamicStyles.gridBoxContainer}>
              {renderGridBoxes(applicationData?.vehicleRegisterNumber || '', 10)}
            </View>
          </View>
          
          <View style={dynamicStyles.vehicleRow}>
            <Text style={dynamicStyles.vehicleLabel}>Chassis number/VIN:</Text>
            <View style={dynamicStyles.gridBoxContainer}>
              {renderGridBoxes(applicationData?.chassisNumber || '', 17)}
            </View>
          </View>
          
          <View style={dynamicStyles.vehicleRow}>
            <Text style={dynamicStyles.vehicleLabel}>Vehicle make:</Text>
            <View style={dynamicStyles.textBox}>
              <Text style={dynamicStyles.textBoxContent}>{applicationData?.vehicleMake || ''}</Text>
            </View>
          </View>
          
          <View style={dynamicStyles.vehicleRow}>
            <Text style={dynamicStyles.vehicleLabel}>Series name:</Text>
            <View style={dynamicStyles.textBox}>
              <Text style={dynamicStyles.textBoxContent}>{applicationData?.seriesName || ''}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSectionE = () => (
    <View style={dynamicStyles.formSection}>
      <Text style={dynamicStyles.sectionHeader}>E. DECLARATION</Text>
      
      <View style={dynamicStyles.declarationRow}>
        <Text style={dynamicStyles.declarationText}>I the</Text>
        <View style={dynamicStyles.declarationRoles}>
          {[
            { key: 'applicant', label: 'applicant / holder of a personalised licence number' },
            { key: 'proxy', label: "applicant / holder's proxy" },
            { key: 'representative', label: "applicant / holder's representative" },
          ].map((role) => (
            <View key={role.key} style={dynamicStyles.declarationRole}>
              <MaterialIcons 
                name={applicationData?.declarationRole === role.key ? 'check-box' : 'check-box-outline-blank'} 
                size={16} 
                color={applicationData?.declarationRole === role.key ? colors.success : colors.textSecondary} 
              />
              <Text style={dynamicStyles.declarationRoleText}>{role.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={dynamicStyles.declarationPoints}>
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

      <View style={dynamicStyles.signatureSection}>
        <View style={dynamicStyles.signatureRow}>
          <Text style={dynamicStyles.signatureLabel}>Signature:</Text>
          <View style={dynamicStyles.signatureLine} />
        </View>
        
        <View style={dynamicStyles.signatureRow}>
          <Text style={dynamicStyles.signatureLabel}>Place:</Text>
          <View style={dynamicStyles.textBox}>
            <Text style={dynamicStyles.textBoxContent}>{applicationData?.declarationPlace || ''}</Text>
          </View>
        </View>
        
        <View style={dynamicStyles.signatureRow}>
          <Text style={dynamicStyles.signatureLabel}>Date: 20</Text>
          <View style={dynamicStyles.dateBoxes}>
            {renderGridBoxes(new Date().getFullYear().toString().slice(2), 2)}
            <Text style={dynamicStyles.dateSeparator}>:</Text>
            {renderGridBoxes((new Date().getMonth() + 1).toString().padStart(2, '0'), 2)}
            <Text style={dynamicStyles.dateSeparator}>:</Text>
            {renderGridBoxes(new Date().getDate().toString().padStart(2, '0'), 2)}
          </View>
        </View>
      </View>
    </View>
  );

  const renderGridBoxes = (text, count) => {
    const chars = (text || '').toUpperCase().split('');
    const boxes = [];
    
    for (let i = 0; i < count; i++) {
      boxes.push(
        <View key={i} style={dynamicStyles.gridBox}>
          <Text style={dynamicStyles.gridBoxText}>{chars[i] || ''}</Text>
        </View>
      );
    }
    
    return boxes;
  };

  return (
    <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
      <View style={dynamicStyles.formContainer}>
        {renderFormHeader()}
        {renderTransactionTypes()}
        {renderSectionA()}
        {renderSectionB()}
        {renderSectionC()}
        {renderSectionD()}
        {renderSectionE()}
        
        <View style={dynamicStyles.officeUseSection}>
          <Text style={dynamicStyles.sectionHeader}>F. FOR OFFICE USE</Text>
          <Text style={dynamicStyles.officeUseText}>This section will be completed by the licensing office.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Dynamic styles function for dark mode support
const createDynamicStyles = (colors, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formContainer: {
    padding: 16,
    backgroundColor: colors.background,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  formNumber: {
    fontSize: 10,
    color: colors.textSecondary,
    alignSelf: 'flex-start',
  },
  formCode: {
    fontSize: 10,
    color: colors.textSecondary,
    alignSelf: 'flex-end',
    marginTop: -12,
  },
  republicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  ministryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  departmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  actTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginTop: 12,
  },
  identificationNote: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  transactionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  transactionList: {
    marginLeft: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionText: {
    fontSize: 10,
    color: colors.text,
    flex: 1,
    marginLeft: 8,
  },
  transactionParts: {
    fontSize: 10,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  formSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    color: colors.text,
    marginBottom: 6,
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  checkboxText: {
    fontSize: 10,
    color: colors.text,
    marginLeft: 4,
  },
  gridBoxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  gridBox: {
    width: 16,
    height: 20,
    borderWidth: 1,
    borderColor: colors.text,
    marginRight: 2,
    marginBottom: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  gridBoxText: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  andText: {
    fontSize: 10,
    color: colors.text,
    marginHorizontal: 8,
  },
  addressContainer: {
    marginBottom: 8,
  },
  contactInfo: {
    marginTop: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactLabel: {
    fontSize: 10,
    color: colors.text,
    width: 140,
  },
  contactValue: {
    fontSize: 10,
    color: colors.text,
    flex: 1,
  },
  plateTable: {
    marginTop: 8,
  },
  plateTableHeader: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
    padding: 8,
    borderWidth: 1,
    borderColor: colors.text,
  },
  plateTableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  plateTableRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.text,
    borderTopWidth: 0,
    minHeight: 24,
    backgroundColor: colors.card,
  },
  plateFormatCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  plateFormatText: {
    fontSize: 9,
    color: colors.text,
    marginLeft: 4,
  },
  plateQuantityCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  plateQuantityText: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '500',
  },
  plateChoicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  plateChoiceCell: {
    alignItems: 'center',
  },
  plateChoiceLabel: {
    fontSize: 9,
    color: colors.text,
    marginBottom: 4,
  },
  platePreview: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 120,
  },
  platePreviewText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  plateFlag: {
    width: 12,
    height: 8,
    marginHorizontal: 4,
    borderRadius: 1,
    overflow: 'hidden',
  },
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
  },
  vehicleInfo: {
    marginTop: 8,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleLabel: {
    fontSize: 10,
    color: colors.text,
    width: 140,
  },
  textBox: {
    borderWidth: 1,
    borderColor: colors.text,
    padding: 4,
    minWidth: 120,
    minHeight: 20,
    backgroundColor: colors.card,
  },
  textBoxContent: {
    fontSize: 10,
    color: colors.text,
  },
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  declarationText: {
    fontSize: 10,
    color: colors.text,
    marginRight: 8,
  },
  declarationRoles: {
    flex: 1,
  },
  declarationRole: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.text,
    backgroundColor: colors.card,
  },
  declarationRoleText: {
    fontSize: 9,
    color: colors.text,
    marginLeft: 4,
    flex: 1,
  },
  declarationPoints: {
    marginBottom: 16,
  },
  declarationPoint: {
    fontSize: 10,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 14,
  },
  signatureSection: {
    marginTop: 16,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  signatureLabel: {
    fontSize: 10,
    color: colors.text,
    marginRight: 8,
  },
  signatureLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.text,
    marginHorizontal: 8,
  },
  dateBoxes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateSeparator: {
    fontSize: 10,
    color: colors.text,
    marginHorizontal: 4,
  },
  officeUseSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
    borderRadius: 8,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  officeUseText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  formNumber: {
    fontSize: 10,
    color: '#666',
    alignSelf: 'flex-start',
  },
  formCode: {
    fontSize: 10,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: -12,
  },
  republicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  ministryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  departmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  actTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 12,
  },
  identificationNote: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  transactionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  transactionList: {
    marginLeft: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionText: {
    fontSize: 10,
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  transactionParts: {
    fontSize: 10,
    color: '#666',
    marginLeft: 8,
  },
  formSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    color: '#333',
    marginBottom: 6,
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  checkboxText: {
    fontSize: 10,
    color: '#333',
    marginLeft: 4,
  },
  gridBoxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  gridBox: {
    width: 16,
    height: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 2,
    marginBottom: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBoxText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  andText: {
    fontSize: 10,
    color: '#333',
    marginHorizontal: 8,
  },
  addressContainer: {
    marginBottom: 8,
  },
  contactInfo: {
    marginTop: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactLabel: {
    fontSize: 10,
    color: '#333',
    width: 140,
  },
  contactValue: {
    fontSize: 10,
    color: '#333',
    flex: 1,
  },
  plateTable: {
    marginTop: 8,
  },
  plateTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  plateTableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  plateTableRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#333',
    borderTopWidth: 0,
    minHeight: 24,
  },
  plateFormatCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  plateFormatText: {
    fontSize: 9,
    color: '#333',
    marginLeft: 4,
  },
  plateQuantityCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  plateQuantityText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
  },
  plateChoicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  plateChoiceCell: {
    alignItems: 'center',
  },
  plateChoiceLabel: {
    fontSize: 9,
    color: '#333',
    marginBottom: 4,
  },
  platePreview: {
    backgroundColor: '#00B4E6',
    borderWidth: 2,
    borderColor: '#00B4E6',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  platePreviewText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00B4E6',
    letterSpacing: 1,
  },
  vehicleInfo: {
    marginTop: 8,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleLabel: {
    fontSize: 10,
    color: '#333',
    width: 140,
  },
  textBox: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 4,
    minWidth: 120,
    minHeight: 20,
  },
  textBoxContent: {
    fontSize: 10,
    color: '#333',
  },
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  declarationText: {
    fontSize: 10,
    color: '#333',
    marginRight: 8,
  },
  declarationRoles: {
    flex: 1,
  },
  declarationRole: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  declarationRoleText: {
    fontSize: 9,
    color: '#333',
    marginLeft: 4,
    flex: 1,
  },
  declarationPoints: {
    marginBottom: 16,
  },
  declarationPoint: {
    fontSize: 10,
    color: '#333',
    marginBottom: 6,
    lineHeight: 14,
  },
  signatureSection: {
    marginTop: 16,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#333',
    marginRight: 8,
  },
  signatureLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  dateBoxes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateSeparator: {
    fontSize: 10,
    color: '#333',
    marginHorizontal: 4,
  },
  officeUseSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  officeUseText: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default PLNFormPreview;