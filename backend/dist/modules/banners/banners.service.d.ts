import { IBanner } from './banners.model';
export interface CreateBannerDTO {
    title: string;
    description?: string;
    imageUrl: string;
    linkUrl?: string;
    order?: number;
    active?: boolean;
}
export interface UpdateBannerDTO {
    title?: string;
    description?: string;
    imageUrl?: string;
    linkUrl?: string;
    order?: number;
    active?: boolean;
}
export interface ListBannersQuery {
    activeOnly?: boolean;
}
declare class BannersService {
    /**
     * Create a new banner
     */
    createBanner(dto: CreateBannerDTO): Promise<IBanner>;
    /**
     * List banners with optional filtering for active banners only
     * Returns banners ordered by order field
     */
    listBanners(query?: ListBannersQuery): Promise<IBanner[]>;
    /**
     * Get a single banner by ID
     */
    getBannerById(bannerId: string): Promise<IBanner>;
    /**
     * Update a banner
     */
    updateBanner(bannerId: string, dto: UpdateBannerDTO): Promise<IBanner>;
    /**
     * Delete a banner
     */
    deleteBanner(bannerId: string): Promise<void>;
}
export declare const bannersService: BannersService;
export {};
//# sourceMappingURL=banners.service.d.ts.map