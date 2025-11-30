"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsService = void 0;
const news_model_1 = require("./news.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class NewsService {
    /**
     * Create a new news article
     */
    async createNews(dto) {
        try {
            logger_1.logger.info('Creating news article:', { title: dto.title });
            const news = await news_model_1.NewsModel.create({
                title: dto.title,
                content: dto.content,
                excerpt: dto.excerpt,
                category: dto.category,
                author: dto.author,
                imageUrl: dto.imageUrl,
                published: dto.published || false,
            });
            logger_1.logger.info(`News article created with ID: ${news._id}`);
            return news;
        }
        catch (error) {
            logger_1.logger.error('Create news error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create news article',
                details: error.message,
            };
        }
    }
    /**
     * List news articles with pagination, filtering, and search
     */
    async listNews(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            // Build filter
            const filter = {};
            if (query.category) {
                filter.category = query.category;
            }
            if (query.published !== undefined) {
                filter.published = query.published;
            }
            if (query.search) {
                filter.$text = { $search: query.search };
            }
            // Execute query with pagination
            const [news, total] = await Promise.all([
                news_model_1.NewsModel.find(filter)
                    .sort({ publishedAt: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                news_model_1.NewsModel.countDocuments(filter),
            ]);
            return {
                news: news,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger_1.logger.error('List news error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve news articles',
                details: error.message,
            };
        }
    }
    /**
     * Get a single news article by ID
     */
    async getNewsById(newsId) {
        try {
            const news = await news_model_1.NewsModel.findById(newsId).lean();
            if (!news) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'News article not found',
                };
            }
            return news;
        }
        catch (error) {
            logger_1.logger.error('Get news error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve news article',
                details: error.message,
            };
        }
    }
    /**
     * Update a news article
     */
    async updateNews(newsId, dto) {
        try {
            logger_1.logger.info(`Updating news article: ${newsId}`);
            const updateData = { ...dto };
            // If publishing for the first time, set publishedAt
            if (dto.published === true) {
                const existingNews = await news_model_1.NewsModel.findById(newsId);
                if (existingNews && !existingNews.published && !existingNews.publishedAt) {
                    updateData.publishedAt = new Date();
                }
            }
            const news = await news_model_1.NewsModel.findByIdAndUpdate(newsId, updateData, { new: true, runValidators: true }).lean();
            if (!news) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'News article not found',
                };
            }
            logger_1.logger.info(`News article ${newsId} updated successfully`);
            return news;
        }
        catch (error) {
            logger_1.logger.error('Update news error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update news article',
                details: error.message,
            };
        }
    }
    /**
     * Delete a news article
     */
    async deleteNews(newsId) {
        try {
            logger_1.logger.info(`Deleting news article: ${newsId}`);
            const news = await news_model_1.NewsModel.findByIdAndDelete(newsId);
            if (!news) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'News article not found',
                };
            }
            logger_1.logger.info(`News article ${newsId} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete news error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete news article',
                details: error.message,
            };
        }
    }
}
exports.newsService = new NewsService();
//# sourceMappingURL=news.service.js.map