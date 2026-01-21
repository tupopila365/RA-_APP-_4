import { ApiClient } from './api';
import { authService } from './authService';
import ENV from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;

class VehicleService {
  /**
   * Submit a new vehicle registration application
   */
  async submitApplication(applicationData, documentUri, applicationType = 'new') {
    try {
      const url = `${API_BASE_URL}/vehicle-reg/applications`;
      console.log('Submitting vehicle registration application:', {
        url,
        applicationType,
        hasDocument: !!documentUri,
      });

      if (!documentUri) {
        throw new Error('Certified ID document is required');
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();

      // Determine file type and name
      const isPDF = documentUri.toLowerCase().endsWith('.pdf') || documentUri.includes('pdf');
      const documentFile = {
        uri: documentUri,
        type: isPDF ? 'application/pdf' : 'image/jpeg',
        name: isPDF ? 'document.pdf' : 'document.jpg',
      };
      formData.append('document', documentFile);

      // Section A - Owner
      if (applicationData.idType) {
        formData.append('idType', applicationData.idType);
      }
      if (applicationData.identificationNumber) {
        formData.append('identificationNumber', applicationData.identificationNumber);
      }
      if (applicationData.personType) {
        formData.append('personType', applicationData.personType);
      }
      if (applicationData.surname) {
        formData.append('surname', applicationData.surname);
      }
      if (applicationData.initials) {
        formData.append('initials', applicationData.initials);
      }
      if (applicationData.businessName) {
        formData.append('businessName', applicationData.businessName);
      }
      if (applicationData.postalAddress) {
        formData.append('postalAddress', JSON.stringify(applicationData.postalAddress));
      }
      if (applicationData.streetAddress) {
        formData.append('streetAddress', JSON.stringify(applicationData.streetAddress));
      }
      if (applicationData.telephoneDay) {
        formData.append('telephoneDay', JSON.stringify(applicationData.telephoneDay));
      }

      // Section B - Proxy
      if (applicationData.hasProxy) {
        formData.append('hasProxy', 'true');
        if (applicationData.proxyIdType) {
          formData.append('proxyIdType', applicationData.proxyIdType);
        }
        if (applicationData.proxyIdNumber) {
          formData.append('proxyIdNumber', applicationData.proxyIdNumber);
        }
        if (applicationData.proxySurname) {
          formData.append('proxySurname', applicationData.proxySurname);
        }
        if (applicationData.proxyInitials) {
          formData.append('proxyInitials', applicationData.proxyInitials);
        }
      }

      // Section C - Representative
      if (applicationData.hasRepresentative) {
        formData.append('hasRepresentative', 'true');
        if (applicationData.representativeIdType) {
          formData.append('representativeIdType', applicationData.representativeIdType);
        }
        if (applicationData.representativeIdNumber) {
          formData.append('representativeIdNumber', applicationData.representativeIdNumber);
        }
        if (applicationData.representativeSurname) {
          formData.append('representativeSurname', applicationData.representativeSurname);
        }
        if (applicationData.representativeInitials) {
          formData.append('representativeInitials', applicationData.representativeInitials);
        }
      }

      // Section D - Declaration
      if (applicationData.declarationAccepted) {
        formData.append('declarationAccepted', 'true');
      }
      if (applicationData.declarationPlace) {
        formData.append('declarationPlace', applicationData.declarationPlace);
      }
      if (applicationData.declarationRole) {
        formData.append('declarationRole', applicationData.declarationRole);
      }

      // Section E - Vehicle
      formData.append('applicationType', applicationType);
      if (applicationData.registrationNumber) {
        formData.append('registrationNumber', applicationData.registrationNumber);
      }
      if (applicationData.make) {
        formData.append('make', applicationData.make);
      }
      if (applicationData.seriesName) {
        formData.append('seriesName', applicationData.seriesName);
      }
      if (applicationData.vehicleCategory) {
        formData.append('vehicleCategory', applicationData.vehicleCategory);
      }
      if (applicationData.drivenType) {
        formData.append('drivenType', applicationData.drivenType);
      }
      if (applicationData.vehicleDescription) {
        formData.append('vehicleDescription', applicationData.vehicleDescription);
      }
      if (applicationData.netPower) {
        formData.append('netPower', applicationData.netPower);
      }
      if (applicationData.engineCapacity) {
        formData.append('engineCapacity', applicationData.engineCapacity);
      }
      if (applicationData.fuelType) {
        formData.append('fuelType', applicationData.fuelType);
      }
      if (applicationData.fuelTypeOther) {
        formData.append('fuelTypeOther', applicationData.fuelTypeOther);
      }
      if (applicationData.totalMass) {
        formData.append('totalMass', applicationData.totalMass);
      }
      if (applicationData.grossVehicleMass) {
        formData.append('grossVehicleMass', applicationData.grossVehicleMass);
      }
      if (applicationData.maxPermissibleVehicleMass) {
        formData.append('maxPermissibleVehicleMass', applicationData.maxPermissibleVehicleMass);
      }
      if (applicationData.maxPermissibleDrawingMass) {
        formData.append('maxPermissibleDrawingMass', applicationData.maxPermissibleDrawingMass);
      }
      if (applicationData.transmission) {
        formData.append('transmission', applicationData.transmission);
      }
      if (applicationData.mainColour) {
        formData.append('mainColour', applicationData.mainColour);
      }
      if (applicationData.mainColourOther) {
        formData.append('mainColourOther', applicationData.mainColourOther);
      }
      if (applicationData.usedForTransportation) {
        formData.append('usedForTransportation', applicationData.usedForTransportation);
      }
      if (applicationData.economicSector) {
        formData.append('economicSector', applicationData.economicSector);
      }
      if (applicationData.odometerReading) {
        formData.append('odometerReading', applicationData.odometerReading);
      }
      if (applicationData.odometerReadingKm) {
        formData.append('odometerReadingKm', applicationData.odometerReadingKm);
      }
      if (applicationData.vehicleStreetAddress) {
        formData.append('vehicleStreetAddress', JSON.stringify(applicationData.vehicleStreetAddress));
      }
      if (applicationData.ownershipType) {
        formData.append('ownershipType', applicationData.ownershipType);
      }
      if (applicationData.usedOnPublicRoad !== undefined) {
        formData.append('usedOnPublicRoad', applicationData.usedOnPublicRoad ? 'true' : 'false');
      }

      // Get auth token if available
      const token = await authService.getToken();
      const headers = {
        'Content-Type': 'multipart/form-data',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await ApiClient.post(url, formData, { headers });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error?.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Submit vehicle registration application error:', error);
      throw error;
    }
  }

  /**
   * Track application by reference ID and PIN
   */
  async trackApplication(referenceId, pin) {
    try {
      const url = `${API_BASE_URL}/vehicle-reg/track/${referenceId}/${pin}`;
      const response = await ApiClient.get(url);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error?.message || 'Failed to track application');
      }
    } catch (error) {
      console.error('Track vehicle registration application error:', error);
      throw error;
    }
  }

  /**
   * Get user's applications
   */
  async getMyApplications() {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const url = `${API_BASE_URL}/vehicle-reg/my-applications`;
      const response = await ApiClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error?.message || 'Failed to get applications');
      }
    } catch (error) {
      console.error('Get my vehicle registration applications error:', error);
      throw error;
    }
  }

  /**
   * Download blank form
   */
  async downloadBlankForm() {
    try {
      const url = `${API_BASE_URL}/vehicle-reg/form`;
      const response = await ApiClient.get(url, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Download vehicle registration form error:', error);
      throw error;
    }
  }
}

export const vehicleService = new VehicleService();
