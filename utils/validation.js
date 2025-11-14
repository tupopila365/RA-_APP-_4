export const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  phone: (value) => {
    const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
    return phoneRegex.test(value);
  },

  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  minLength: (value, length) => value.length >= length,
  maxLength: (value, length) => value.length <= length,

  required: (value) => {
    if (typeof value === 'string') return value.trim().length > 0;
    return value !== null && value !== undefined;
  },

  password: (value) => {
    return (
      value.length >= 8 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /\d/.test(value)
    );
  },

  alphanumeric: (value) => /^[a-zA-Z0-9]*$/.test(value),
  numeric: (value) => /^\d+$/.test(value),
};

export const validate = (value, rules) => {
  const errors = [];

  if (!rules || typeof rules !== 'object') {
    return errors;
  }

  for (const [rule, params] of Object.entries(rules)) {
    const validator = validators[rule];

    if (!validator) {
      console.warn(`Unknown validator: ${rule}`);
      continue;
    }

    const isValid = Array.isArray(params)
      ? validator(value, ...params)
      : validator(value, params);

    if (!isValid) {
      errors.push(`Validation failed for rule: ${rule}`);
    }
  }

  return errors;
};

export const getErrorMessage = (field, rule) => {
  const messages = {
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    url: 'Please enter a valid URL',
    minLength: `This field is too short`,
    maxLength: `This field is too long`,
    required: `${field} is required`,
    password: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
    alphanumeric: 'Only letters and numbers are allowed',
    numeric: 'Only numbers are allowed',
  };

  return messages[rule] || `Invalid ${field}`;
};
