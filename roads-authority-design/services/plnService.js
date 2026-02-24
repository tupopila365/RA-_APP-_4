import ENV from '../config/env';
import { authService } from './authService';

const API_BASE_URL = ENV.API_BASE_URL;

const ID_TYPE_MAP = {
  idTypeTrafficRegister: 'Traffic Register Number',
  idTypeNamibiaID: 'Namibia ID-doc',
  idTypeBusinessReg: 'Business Reg. No',
};

const PLATE_FORMAT_MAP = {
  plateFormatLongGerman: 'Long/German',
  plateFormatNormal: 'Normal',
  plateFormatAmerican: 'American',
  plateFormatSquare: 'Square',
  plateFormatMotorcycle: 'Small motorcycle',
};

const DECLARATION_ROLE_MAP = {
  declarationRoleApplicant: 'applicant',
  declarationRoleProxy: 'proxy',
  declarationRoleRepresentative: 'representative',
};

/**
 * Map wizard payload (flat) to backend FormData fields.
 * @param {Object} payload - From PLNApplicationWizardScreen buildPayload()
 * @returns {Object} - Application data in backend shape (for FormData)
 */
function mapWizardPayloadToBackend(payload) {
  const idType = ID_TYPE_MAP[payload.idType] || payload.idType;
  const plateFormat = PLATE_FORMAT_MAP[payload.plateFormat] || payload.plateFormat;
  const declarationRole = DECLARATION_ROLE_MAP[payload.declarationRole] || 'applicant';

  const postalAddress = {
    line1: payload.postalAddressLine1 || '',
    line2: payload.postalAddressLine2 || undefined,
    line3: payload.postalAddressLine3 || undefined,
  };
  const streetAddress = {
    line1: payload.streetAddressLine1 || '',
    line2: payload.streetAddressLine2 || undefined,
    line3: payload.streetAddressLine3 || undefined,
  };
  const telephoneHome =
    payload.telephoneHomeCode || payload.telephoneHomeNumber
      ? { code: payload.telephoneHomeCode || '', number: payload.telephoneHomeNumber || '' }
      : undefined;
  const telephoneDay =
    payload.telephoneDayCode || payload.telephoneDayNumber
      ? { code: payload.telephoneDayCode || '', number: payload.telephoneDayNumber || '' }
      : undefined;
  const cellNumber =
    payload.cellNumberCode || payload.cellNumberNumber
      ? { code: payload.cellNumberCode || '', number: payload.cellNumberNumber || '' }
      : undefined;

  const c1 = String(payload.plateChoice1 || '').trim();
  const c2 = String(payload.plateChoice2 || '').trim();
  const c3 = String(payload.plateChoice3 || '').trim();
  const m1 = String(payload.plateChoice1Meaning || '').trim();
  const m2 = String(payload.plateChoice2Meaning || '').trim();
  const m3 = String(payload.plateChoice3Meaning || '').trim();
  const plateChoices = [
    { text: c1 || 'N/A', meaning: m1 },
    { text: c2 || c1 || 'N/A', meaning: m2 || m1 },
    { text: c3 || c2 || c1 || 'N/A', meaning: m3 || m2 || m1 },
  ];

  const quantity = payload.plateQuantity === '2' ? 2 : 1;

  const hasRepresentative =
    !!(payload.representativeIdNumber || payload.representativeSurname || payload.representativeInitials);
  let representativeIdType;
  if (payload.representativeIdTypeTraffic) representativeIdType = 'Traffic Register Number';
  else if (payload.representativeIdTypeIDDoc) representativeIdType = 'Namibia ID-doc';

  const trafficRegisterNumber =
    idType === 'Traffic Register Number' || idType === 'Namibia ID-doc' ? payload.idNumber : undefined;
  const businessRegNumber = idType === 'Business Reg. No' ? payload.idNumber : undefined;

  return {
    idType,
    trafficRegisterNumber,
    businessRegNumber,
    surname: payload.surname || '',
    initials: payload.initials || '',
    businessName: payload.businessName || undefined,
    postalAddress,
    streetAddress,
    telephoneHome,
    telephoneDay,
    cellNumber,
    email: payload.email || undefined,
    plateFormat,
    quantity,
    plateChoices,
    hasRepresentative,
    representativeIdType,
    representativeIdNumber: payload.representativeIdNumber || undefined,
    representativeSurname: payload.representativeSurname || undefined,
    representativeInitials: payload.representativeInitials || undefined,
    currentLicenceNumber: payload.vehicleCurrentLicence || undefined,
    vehicleRegisterNumber: payload.vehicleRegisterNumber || undefined,
    chassisNumber: payload.vehicleChassisNumber || undefined,
    vehicleMake: payload.vehicleMake || undefined,
    seriesName: payload.vehicleSeries || undefined,
    declarationAccepted: true,
    declarationPlace: payload.declarationPlace || '',
    declarationRole,
  };
}

/**
 * Submit PLN application to backend.
 * @param {Object} wizardPayload - From PLNApplicationWizardScreen buildPayload()
 * @param {string} documentUri - Local file URI (image or PDF) for certified ID document
 * @returns {Promise<{ id, referenceId, trackingPin, fullName, status, createdAt }>}
 */
export async function submitApplication(wizardPayload, documentUri) {
  if (!documentUri) {
    throw new Error('Certified ID document is required');
  }
  if (
    !documentUri.startsWith('file://') &&
    !documentUri.startsWith('content://') &&
    !documentUri.startsWith('http')
  ) {
    throw new Error('Invalid document. Please select a photo or PDF of your certified ID.');
  }

  const applicationData = mapWizardPayloadToBackend(wizardPayload);

  const formData = new FormData();
  const isPDF =
    typeof documentUri === 'string' &&
    (documentUri.toLowerCase().endsWith('.pdf') || documentUri.includes('pdf'));
  const documentFile = {
    uri: documentUri,
    type: isPDF ? 'application/pdf' : 'image/jpeg',
    name: isPDF ? 'document.pdf' : 'document.jpg',
  };
  formData.append('document', documentFile);

  formData.append('idType', applicationData.idType);
  if (applicationData.trafficRegisterNumber) {
    formData.append('trafficRegisterNumber', applicationData.trafficRegisterNumber);
  }
  if (applicationData.businessRegNumber) {
    formData.append('businessRegNumber', applicationData.businessRegNumber);
  }
  formData.append('surname', applicationData.surname);
  formData.append('initials', applicationData.initials);
  if (applicationData.businessName) {
    formData.append('businessName', applicationData.businessName);
  }
  formData.append('postalAddress', JSON.stringify(applicationData.postalAddress));
  formData.append('streetAddress', JSON.stringify(applicationData.streetAddress));
  if (applicationData.telephoneHome) {
    formData.append('telephoneHome', JSON.stringify(applicationData.telephoneHome));
  }
  if (applicationData.telephoneDay) {
    formData.append('telephoneDay', JSON.stringify(applicationData.telephoneDay));
  }
  if (applicationData.cellNumber) {
    formData.append('cellNumber', JSON.stringify(applicationData.cellNumber));
  }
  if (applicationData.email) {
    formData.append('email', applicationData.email);
  }
  formData.append('plateFormat', applicationData.plateFormat);
  formData.append('quantity', String(applicationData.quantity));
  formData.append('plateChoices', JSON.stringify(applicationData.plateChoices));

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

  if (applicationData.currentLicenceNumber) {
    formData.append('currentLicenceNumber', applicationData.currentLicenceNumber);
  }
  if (applicationData.vehicleRegisterNumber) {
    formData.append('vehicleRegisterNumber', applicationData.vehicleRegisterNumber);
  }
  if (applicationData.chassisNumber) {
    formData.append('chassisNumber', applicationData.chassisNumber);
  }
  if (applicationData.vehicleMake) {
    formData.append('vehicleMake', applicationData.vehicleMake);
  }
  if (applicationData.seriesName) {
    formData.append('seriesName', applicationData.seriesName);
  }

  formData.append('declarationAccepted', 'true');
  formData.append('declarationPlace', applicationData.declarationPlace);
  formData.append('declarationRole', applicationData.declarationRole);

  const token = await authService.getAccessToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(`${API_BASE_URL}/pln/applications`, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message =
        errData.error?.message || errData.message || `Submission failed (${response.status})`;
      const err = new Error(message);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    return data.data?.application || data.application || data;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error('Request timed out. Please try a smaller document or check your connection.');
    }
    if (e.message?.includes('Network request failed') || e.message?.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Ensure the backend is running.');
    }
    throw e;
  }
}

/**
 * Get the current user's PLN applications. Requires authentication.
 * @returns {Promise<Array>} List of applications from the backend
 */
export async function getMyApplications() {
  const token = await authService.getAccessToken();
  if (!token) {
    throw new Error('Please sign in to view your applications.');
  }
  const response = await fetch(`${API_BASE_URL}/pln/my-applications`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 401) {
    throw new Error('Please sign in to view your applications.');
  }
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || errData.message || 'Failed to load applications');
  }
  const data = await response.json();
  return data.data?.applications ?? data.applications ?? [];
}

/**
 * Confirm that payment has been received for an application (e.g. after online payment).
 * Requires the user to be signed in. Updates the application status to PAID in the database.
 * @param {string} applicationId - PLN application id
 * @param {string} [paymentReference] - Optional payment reference from gateway
 * @returns {Promise<Object>} Updated application data
 */
export async function confirmPayment(applicationId, paymentReference) {
  const token = await authService.getAccessToken();
  if (!token) {
    throw new Error('Please sign in to confirm payment.');
  }
  const response = await fetch(
    `${API_BASE_URL}/pln/applications/${encodeURIComponent(applicationId)}/confirm-payment`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(
        paymentReference ? { paymentReference: String(paymentReference) } : {}
      ),
    }
  );
  if (response.status === 401) {
    throw new Error('Please sign in to confirm payment.');
  }
  if (response.status === 403) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'You can only confirm payment for your own application.');
  }
  if (response.status === 400) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'This application is not awaiting payment.');
  }
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || errData.message || 'Failed to confirm payment');
  }
  const data = await response.json();
  return data.data?.application ?? data.application ?? data;
}
