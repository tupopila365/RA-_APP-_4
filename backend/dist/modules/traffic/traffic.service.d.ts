import { CongestionLevel, TrafficStatusRequest, TrafficStatusResponse } from './traffic.types';
export declare const classifyCongestion: (delaySeconds: number, normalDurationSeconds: number) => CongestionLevel;
export declare const buildTrafficMessage: (response: TrafficStatusResponse) => string;
declare class TrafficService {
    private apiKey;
    private cacheTtlSeconds;
    private timeoutMs;
    constructor();
    getTrafficStatus(request: TrafficStatusRequest): Promise<TrafficStatusResponse>;
    private resolveQueryType;
    private ensureApiKey;
    private forwardGeocode;
    private buildProbeRoute;
    private fetchTravelTimes;
}
export declare const trafficService: TrafficService;
export {};
//# sourceMappingURL=traffic.service.d.ts.map