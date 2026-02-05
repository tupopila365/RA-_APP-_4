import { Banner } from './banners.entity';
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
    createBanner(dto: CreateBannerDTO): Promise<Banner>;
    listBanners(query?: ListBannersQuery): Promise<Banner[]>;
    getBannerById(bannerId: string): Promise<Banner>;
    updateBanner(bannerId: string, dto: UpdateBannerDTO): Promise<Banner>;
    deleteBanner(bannerId: string): Promise<void>;
}
export declare const bannersService: BannersService;
export {};
//# sourceMappingURL=banners.service.d.ts.map