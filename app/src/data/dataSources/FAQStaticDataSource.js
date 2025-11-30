import { Result } from '../../domain/Result';
import { NotFoundError } from '../../domain/errors';

/**
 * FAQ Static Data Source
 * 
 * Provides static FAQ data (no backend API yet).
 * In the future, this can be replaced with FAQApiDataSource.
 */
export class FAQStaticDataSource {
  constructor() {
    this.faqs = [
      {
        id: 1,
        question: 'How do I apply for a driver\'s license?',
        answer: 'You can apply for a driver\'s license through NATIS online or visit any Roads Authority office. You will need to complete the application form, provide required documents, and pass the driving test.',
        category: 'Licensing',
        order: 1,
      },
      {
        id: 2,
        question: 'What documents do I need for vehicle registration?',
        answer: 'For vehicle registration, you need: proof of identity, proof of residence, vehicle import documents (if applicable), and proof of payment for applicable fees.',
        category: 'Registration',
        order: 2,
      },
      {
        id: 3,
        question: 'How can I check my vehicle registration status?',
        answer: 'You can check your vehicle registration status through NATIS online portal or by visiting any Roads Authority office with your vehicle registration number.',
        category: 'Registration',
        order: 3,
      },
      {
        id: 4,
        question: 'What are the operating hours of Roads Authority offices?',
        answer: 'Roads Authority offices are open Monday to Friday from 8:00 AM to 5:00 PM. Some offices may have extended hours. Please check with your local office for specific hours.',
        category: 'General',
        order: 4,
      },
      {
        id: 5,
        question: 'How do I report a road maintenance issue?',
        answer: 'You can report road maintenance issues through our website, mobile app, or by calling our toll-free number. Please provide as much detail as possible including location and nature of the issue.',
        category: 'Maintenance',
        order: 5,
      },
      {
        id: 6,
        question: 'What payment methods are accepted?',
        answer: 'We accept cash, debit cards, credit cards, and bank transfers. Online payments can be made through NATIS online portal using various payment methods.',
        category: 'Payments',
        order: 6,
      },
      {
        id: 7,
        question: 'How long does it take to process a driver\'s license?',
        answer: 'The processing time for a driver\'s license is typically 7-14 working days after successful completion of all requirements including the driving test.',
        category: 'Licensing',
        order: 7,
      },
      {
        id: 8,
        question: 'Can I renew my license online?',
        answer: 'Yes, you can renew your driver\'s license online through the NATIS portal. You will need to log in with your credentials and follow the renewal process.',
        category: 'Licensing',
        order: 8,
      },
    ];
  }

  /**
   * Get all FAQs
   * @param {Object} [params={}] - Query parameters
   * @returns {Promise<Result>}
   */
  async getFAQs(params = {}) {
    try {
      // Simulate async operation
      await this._delay(100);

      let faqs = [...this.faqs];

      // Filter by category if provided
      if (params.category) {
        faqs = faqs.filter(faq => faq.category === params.category);
      }

      return Result.success(faqs);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Get a single FAQ by ID
   * @param {number} id - FAQ ID
   * @returns {Promise<Result>}
   */
  async getFAQById(id) {
    try {
      await this._delay(50);

      const faq = this.faqs.find(f => f.id === id);

      if (!faq) {
        return Result.failure(
          new NotFoundError(`FAQ with ID ${id} not found`, {
            resourceType: 'FAQ',
            resourceId: id,
          })
        );
      }

      return Result.success(faq);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Search FAQs
   * @param {string} query - Search query
   * @param {Object} [params={}] - Additional parameters
   * @returns {Promise<Result>}
   */
  async searchFAQs(query, params = {}) {
    try {
      await this._delay(100);

      const lowerQuery = query.toLowerCase();
      let faqs = this.faqs.filter(faq =>
        faq.question.toLowerCase().includes(lowerQuery) ||
        faq.answer.toLowerCase().includes(lowerQuery) ||
        (faq.category && faq.category.toLowerCase().includes(lowerQuery))
      );

      // Filter by category if provided
      if (params.category) {
        faqs = faqs.filter(faq => faq.category === params.category);
      }

      return Result.success(faqs);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Simulate async delay
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
