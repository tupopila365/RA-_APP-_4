import { TrafficStatusResponse } from './traffic.types';
export declare class TrafficCache {
    get(key: string): Promise<TrafficStatusResponse | null>;
    set(key: string, value: TrafficStatusResponse, ttlSeconds: number): Promise<void>;
}
export declare const trafficCache: TrafficCache;
//# sourceMappingURL=traffic.cache.d.ts.map