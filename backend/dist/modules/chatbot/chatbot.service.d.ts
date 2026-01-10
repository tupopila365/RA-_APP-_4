import { CongestionLevel, TrafficResolvedLocation, TrafficStatusResponse } from '../traffic/traffic.types';
export interface ChatbotQueryRequest {
    question: string;
    sessionId?: string;
    userLocation?: {
        latitude: number;
        longitude: number;
    };
}
export interface ChatbotSource {
    documentId: string;
    title: string;
    relevance: number;
}
export interface LocationQueryMetadata {
    type: 'location_query';
    offices: Array<{
        id: string;
        name: string;
        address: string;
        region: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
        distance?: number;
        contactNumber?: string;
        email?: string;
    }>;
}
export interface TrafficQueryMetadata {
    type: 'traffic_status';
    congestionLevel: CongestionLevel;
    estimatedDelayMinutes: number;
    location: TrafficResolvedLocation;
    routeSummary: TrafficStatusResponse['routeSummary'];
}
export interface IncidentQueryMetadata {
    type: 'incident';
    incidents: Array<{
        title: string;
        type: string;
        road: string;
        locationDescription: string;
        area?: string;
        status: string;
        reportedAt?: Date;
        expectedClearance?: Date;
        severity?: string;
    }>;
}
export interface RoadworkQueryMetadata {
    type: 'roadwork';
    roadworks: Array<{
        title: string;
        road: string;
        section: string;
        area?: string;
        status: string;
        startDate?: Date;
        endDate?: Date;
        expectedDelayMinutes?: number;
        trafficControl?: string;
        expectedCompletion?: Date;
    }>;
}
export interface ChatbotResponse {
    answer: string;
    sources: ChatbotSource[];
    timestamp: Date;
    interactionId?: string;
    metadata?: LocationQueryMetadata | TrafficQueryMetadata | IncidentQueryMetadata | RoadworkQueryMetadata;
}
declare class ChatbotService {
    /**
     * Process a user query by forwarding it to the RAG service
     * and formatting the response with source document references
     */
    processQuery(queryRequest: ChatbotQueryRequest): Promise<ChatbotResponse>;
    /**
     * Format source documents from RAG service response
     */
    private formatSources;
    /**
     * Detect if a question is asking about traffic conditions
     */
    isTrafficQuery(question: string): boolean;
    /**
     * Process a traffic query using the traffic status service
     */
    processTrafficQuery(question: string): Promise<ChatbotResponse>;
    /**
     * Detect if a question is asking about incidents (accidents/closures/hazards)
     */
    isIncidentQuery(question: string): boolean;
    /**
     * Detect if a question is asking about roadworks / maintenance
     */
    isRoadworkQuery(question: string): boolean;
    private formatIncidentAnswer;
    private formatRoadworkAnswer;
    processIncidentQuery(question: string): Promise<ChatbotResponse>;
    processRoadworkQuery(question: string): Promise<ChatbotResponse>;
    /**
     * Detect if a question is asking about office locations
     *
     * @param question - User's question text
     * @returns True if question appears to be asking about office locations
     */
    isLocationQuery(question: string): boolean;
    /**
     * Process a location query and return nearby offices
     *
     * @param userLat - User's latitude (optional)
     * @param userLon - User's longitude (optional)
     * @returns ChatbotResponse with formatted office information
     */
    processLocationQuery(userLat?: number, userLon?: number): Promise<ChatbotResponse>;
    /**
     * Health check for chatbot service
     */
    healthCheck(): Promise<{
        status: string;
        ragServiceConnected: boolean;
    }>;
}
export declare const chatbotService: ChatbotService;
export {};
//# sourceMappingURL=chatbot.service.d.ts.map