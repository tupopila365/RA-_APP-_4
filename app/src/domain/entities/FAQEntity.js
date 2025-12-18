/**
 * FAQ Entity
 * 
 * Domain model representing a Frequently Asked Question.
 */
export class FAQEntity {
  /**
   * @param {Object} props - FAQ properties
   * @param {string|number} props.id - Unique identifier (MongoDB ObjectId as string)
   * @param {string} props.question - Question text
   * @param {string} props.answer - Answer text
   * @param {string} [props.category] - FAQ category
   * @param {number} [props.order] - Display order
   * @param {Date} [props.createdAt] - Creation date
   * @param {Date} [props.updatedAt] - Last update date
   */
  constructor({
    id,
    question,
    answer,
    category = null,
    order = 0,
    createdAt = null,
    updatedAt = null,
  }) {
    this.id = id;
    this.question = question;
    this.answer = answer;
    this.category = category;
    this.order = order;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Get short preview of answer (first 100 characters)
   * @returns {string}
   */
  getAnswerPreview() {
    if (this.answer.length <= 100) {
      return this.answer;
    }
    return `${this.answer.substring(0, 100)}...`;
  }

  /**
   * Check if FAQ has a category
   * @returns {boolean}
   */
  hasCategory() {
    return this.category !== null && this.category !== '';
  }

  /**
   * Get word count of answer
   * @returns {number}
   */
  getAnswerWordCount() {
    return this.answer.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Estimate reading time in minutes
   * @returns {number}
   */
  getReadingTime() {
    const wordsPerMinute = 200;
    const wordCount = this.getAnswerWordCount();
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Check if question matches search query
   * @param {string} query - Search query
   * @returns {boolean}
   */
  matchesQuery(query) {
    if (!query || query.trim().length === 0) {
      return true;
    }

    const lowerQuery = query.toLowerCase();
    return (
      this.question.toLowerCase().includes(lowerQuery) ||
      this.answer.toLowerCase().includes(lowerQuery) ||
      (this.category && this.category.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Create a copy with updated properties
   * @param {Object} updates - Properties to update
   * @returns {FAQEntity}
   */
  copyWith(updates) {
    return new FAQEntity({
      id: this.id,
      question: this.question,
      answer: this.answer,
      category: this.category,
      order: this.order,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...updates,
    });
  }

  /**
   * Convert to plain object
   * @returns {Object}
   */
  toObject() {
    return {
      id: this.id,
      question: this.question,
      answer: this.answer,
      category: this.category,
      order: this.order,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
