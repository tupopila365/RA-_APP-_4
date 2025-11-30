/**
 * News Entity
 * 
 * Domain model representing a news article.
 * This is the core business object used throughout the application.
 * 
 * @example
 * const news = new NewsEntity({
 *   id: 1,
 *   title: 'Breaking News',
 *   content: 'News content...',
 *   publishedAt: new Date(),
 * });
 */
export class NewsEntity {
  /**
   * @param {Object} props - News properties
   * @param {number} props.id - Unique identifier
   * @param {string} props.title - News title
   * @param {string} props.content - News content/body
   * @param {string} [props.excerpt] - Short excerpt or summary
   * @param {string} [props.imageUrl] - Featured image URL
   * @param {string} [props.category] - News category
   * @param {Date} props.publishedAt - Publication date
   * @param {Date} [props.updatedAt] - Last update date
   * @param {boolean} [props.published=true] - Publication status
   * @param {string} [props.author] - Author name
   * @param {Array<string>} [props.tags=[]] - Article tags
   */
  constructor({
    id,
    title,
    content,
    excerpt = '',
    imageUrl = null,
    category = null,
    publishedAt,
    updatedAt = null,
    published = true,
    author = null,
    tags = [],
  }) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.excerpt = excerpt;
    this.imageUrl = imageUrl;
    this.category = category;
    this.publishedAt = publishedAt;
    this.updatedAt = updatedAt;
    this.published = published;
    this.author = author;
    this.tags = tags;
  }

  /**
   * Get formatted publication date
   * @returns {string} Formatted date string
   */
  getFormattedDate() {
    return this.publishedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Get short excerpt (first 150 characters)
   * @returns {string} Short excerpt
   */
  getShortExcerpt() {
    if (this.excerpt) {
      return this.excerpt.length > 150
        ? `${this.excerpt.substring(0, 150)}...`
        : this.excerpt;
    }
    
    if (this.content) {
      return this.content.length > 150
        ? `${this.content.substring(0, 150)}...`
        : this.content;
    }
    
    return '';
  }

  /**
   * Check if news has an image
   * @returns {boolean} True if has image
   */
  hasImage() {
    return this.imageUrl !== null && this.imageUrl !== '';
  }

  /**
   * Check if news is recent (published within last 7 days)
   * @returns {boolean} True if recent
   */
  isRecent() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return this.publishedAt >= sevenDaysAgo;
  }

  /**
   * Get time ago string (e.g., "2 hours ago")
   * @returns {string} Time ago string
   */
  getTimeAgo() {
    const now = new Date();
    const diffMs = now - this.publishedAt;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return this.getFormattedDate();
    }
  }

  /**
   * Create a copy with updated properties
   * @param {Object} updates - Properties to update
   * @returns {NewsEntity} New instance with updates
   */
  copyWith(updates) {
    return new NewsEntity({
      id: this.id,
      title: this.title,
      content: this.content,
      excerpt: this.excerpt,
      imageUrl: this.imageUrl,
      category: this.category,
      publishedAt: this.publishedAt,
      updatedAt: this.updatedAt,
      published: this.published,
      author: this.author,
      tags: this.tags,
      ...updates,
    });
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      excerpt: this.excerpt,
      imageUrl: this.imageUrl,
      category: this.category,
      publishedAt: this.publishedAt,
      updatedAt: this.updatedAt,
      published: this.published,
      author: this.author,
      tags: this.tags,
    };
  }
}
