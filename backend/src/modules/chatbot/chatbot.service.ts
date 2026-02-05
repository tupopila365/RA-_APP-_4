import { ragService } from '../../utils/httpClient';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { locationsService } from '../locations/locations.service';
import { trafficService, buildTrafficMessage } from '../traffic/traffic.service';
import {
  CongestionLevel,
  TrafficResolvedLocation,
  TrafficStatusResponse,
} from '../traffic/traffic.types';
import { incidentsService } from '../incidents/incidents.service';
import { roadworksService } from '../roadworks/roadworks.service';
import { cacheService } from '../../utils/cache';

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

class ChatbotService {
  /**
   * Process a user query by forwarding it to the RAG service
   * and formatting the response with source document references
   */
  async processQuery(queryRequest: ChatbotQueryRequest): Promise<ChatbotResponse> {
    const { question, sessionId } = queryRequest;

    logger.info('Processing chatbot query', { question, sessionId });

    // Check cache first for general queries (not location/traffic specific)
    const cacheKey = `query:${question}`;
    const cachedResponse = await cacheService.get<ChatbotResponse>('chatbot', cacheKey);
    
    if (cachedResponse) {
      logger.info('Returning cached chatbot response', { question: question.substring(0, 50) });
      return {
        ...cachedResponse,
        timestamp: new Date(), // Update timestamp but keep cached content
      };
    }

    try {
      // Forward query to RAG service
      const ragResponse = await ragService.queryDocuments(question);

      // Debug logging to trace source formatting
      logger.debug('RAG service response:', {
        hasAnswer: !!ragResponse.answer,
        rawSources: ragResponse.sources,
        sourcesType: Array.isArray(ragResponse.sources) ? 'array' : typeof ragResponse.sources,
        sourcesLength: Array.isArray(ragResponse.sources) ? ragResponse.sources.length : 0,
      });

      // Format response with source document references
      const formattedSources = this.formatSources(ragResponse.sources || []);
      
      logger.debug('Formatted sources:', {
        formattedSources,
        formattedCount: formattedSources.length,
      });

      const formattedResponse: ChatbotResponse = {
        answer: ragResponse.answer || 'I apologize, but I could not find relevant information to answer your question.',
        sources: formattedSources,
        timestamp: new Date(),
      };

      // Cache the response for 1 hour (3600 seconds)
      await cacheService.set('chatbot', cacheKey, formattedResponse, 3600);

      logger.info('Chatbot query processed successfully', {
        question,
        sourcesCount: formattedResponse.sources.length,
        rawSourcesCount: Array.isArray(ragResponse.sources) ? ragResponse.sources.length : 0,
      });

      return formattedResponse;
    } catch (error: any) {
      logger.error('Error processing chatbot query:', error);

      // If RAG service is unavailable, provide a helpful error message
      if (error.code === ERROR_CODES.RAG_SERVICE_UNAVAILABLE || error.code === ERROR_CODES.RAG_QUERY_FAILED) {
        throw {
          statusCode: 503,
          code: error.code,
          message: 'The chatbot service is temporarily unavailable. Please try again later.',
          details: error.details,
        };
      }

      // For other errors, throw a generic error
      throw {
        statusCode: 500,
        code: ERROR_CODES.SERVER_ERROR,
        message: 'An error occurred while processing your question',
        details: error.message,
      };
    }
  }

  /**
   * Format source documents from RAG service response
   */
  private formatSources(sources: any[]): ChatbotSource[] {
    if (!sources || !Array.isArray(sources)) {
      logger.warn('formatSources received invalid input:', { sources, type: typeof sources });
      return [];
    }
    
    const formatted = sources.map((source) => {
      const formattedSource = {
        documentId: source.document_id || source.documentId || '',
        title: source.document_title || source.title || 'Unknown Document',
        relevance: source.relevance || source.score || 0,
      };
      
      logger.debug('Formatting source:', { original: source, formatted: formattedSource });
      return formattedSource;
    });
    
    logger.debug('Formatted sources result:', { count: formatted.length, sources: formatted });
    return formatted;
  }

  /**
   * Detect if a question is asking about traffic conditions
   */
  isTrafficQuery(question: string): boolean {
    if (!question || typeof question !== 'string') {
      return false;
    }

    const normalized = question.toLowerCase();
    const roadPattern = /\b(b|a|c)\s*[-]?\s*\d{1,3}\b/i;
    const trafficKeywords = [
      /\btraffic\b/i,
      /\bcongestion\b/i,
      /\bdelays?\b/i,
      /\bjam(s)?\b/i,
      /\bbacked\s*up\b/i,
    ];

    return trafficKeywords.some((pattern) => pattern.test(normalized)) || roadPattern.test(normalized);
  }

  /**
   * Process a traffic query using the traffic status service
   */
  async processTrafficQuery(question: string): Promise<ChatbotResponse> {
    const trafficStatus = await trafficService.getTrafficStatus({ query: question });
    const answer = buildTrafficMessage(trafficStatus);

    const trafficMetadata: TrafficQueryMetadata = {
      type: 'traffic_status',
      congestionLevel: trafficStatus.congestionLevel,
      estimatedDelayMinutes: trafficStatus.estimatedDelayMinutes,
      location: trafficStatus.location,
      routeSummary: trafficStatus.routeSummary,
    };

    return {
      answer,
      sources: [],
      timestamp: new Date(),
      metadata: trafficMetadata,
    };
  }

  /**
   * Detect if a question is asking about incidents (accidents/closures/hazards)
   */
  isIncidentQuery(question: string): boolean {
    if (!question || typeof question !== 'string') return false;
    const normalized = question.toLowerCase();
    const keywords = [
      /\baccident(s)?\b/i,
      /\bclosure(s)?\b/i,
      /\bclosed\b/i,
      /\bhazard(s)?\b/i,
      /\bdebris\b/i,
      /\bflood(ing)?\b/i,
      /\bincident(s)?\b/i,
    ];
    const roadPattern = /\b(b|a|c)\s*[-]?\s*\d{1,3}\b/i;
    return keywords.some((k) => k.test(normalized)) || roadPattern.test(normalized);
  }

  /**
   * Detect if a question is asking about roadworks / maintenance
   */
  isRoadworkQuery(question: string): boolean {
    if (!question || typeof question !== 'string') return false;
    const normalized = question.toLowerCase();
    const keywords = [
      /\broadwork(s)?\b/i,
      /\bmaintenance\b/i,
      /\brepair(s)?\b/i,
      /\bconstruction\b/i,
      /\bresurfacing\b/i,
      /\bstop[- ]and[- ]go\b/i,
    ];
    const roadPattern = /\b(b|a|c)\s*[-]?\s*\d{1,3}\b/i;
    return keywords.some((k) => k.test(normalized)) || roadPattern.test(normalized);
  }

  private formatIncidentAnswer(incidents: any[], query: string): { answer: string; metadata: IncidentQueryMetadata } {
    if (!incidents || incidents.length === 0) {
      return {
        answer: `Roads Authority Namibia Advisory: No active verified incidents are currently recorded for ${query}.`,
        metadata: {
          type: 'incident',
          incidents: [],
        },
      };
    }

    const lines = incidents.map((incident) => {
      const reported = incident.reportedAt ? new Date(incident.reportedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
      const clearance = incident.expectedClearance
        ? new Date(incident.expectedClearance).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : 'Under assessment';

      return [
        `Incident: ${incident.type}`,
        `Location: ${incident.road}${incident.area ? ' ' + incident.area : ''} ${incident.locationDescription ? incident.locationDescription : ''}`.trim(),
        `Status: ${incident.status}`,
        `Reported: ${reported}`,
        `Expected clearance: ${clearance}`,
        incident.severity ? `Severity: ${incident.severity}` : null,
      ]
        .filter(Boolean)
        .join('\n');
    });

    const metadata: IncidentQueryMetadata = {
      type: 'incident',
      incidents: incidents.map((i) => ({
        title: i.title,
        type: i.type,
        road: i.road,
        locationDescription: i.locationDescription,
        area: i.area,
        status: i.status,
        reportedAt: i.reportedAt,
        expectedClearance: i.expectedClearance,
        severity: i.severity,
      })),
    };

    return {
      answer: lines.join('\n\n'),
      metadata,
    };
  }

  private formatRoadworkAnswer(roadworks: any[], query: string): { answer: string; metadata: RoadworkQueryMetadata } {
    if (!roadworks || roadworks.length === 0) {
      return {
        answer: `Roads Authority Namibia Advisory: No planned or ongoing roadworks are currently recorded for ${query}.`,
        metadata: {
          type: 'roadwork',
          roadworks: [],
        },
      };
    }

    const lines = roadworks.map((rw) => {
      const dates =
        rw.startDate && rw.endDate
          ? `Dates: ${new Date(rw.startDate).toLocaleDateString()} – ${new Date(rw.endDate).toLocaleDateString()}`
          : rw.startDate
          ? `Start date: ${new Date(rw.startDate).toLocaleDateString()}`
          : 'Dates: Not specified';

      const completion = rw.expectedCompletion
        ? `Expected completion: ${new Date(rw.expectedCompletion).toLocaleDateString()}`
        : undefined;

      const delay =
        rw.expectedDelayMinutes !== undefined && rw.expectedDelayMinutes !== null
          ? `Expected delay: ${rw.expectedDelayMinutes} minutes`
          : undefined;

      return [
        `Roadworks: ${rw.title}`,
        `Section: ${rw.section}`,
        `Road: ${rw.road}${rw.area ? ' (' + rw.area + ')' : ''}`,
        `Status: ${rw.status}`,
        dates,
        completion,
        delay,
        rw.trafficControl ? `Traffic control: ${rw.trafficControl}` : undefined,
      ]
        .filter(Boolean)
        .join('\n');
    });

    const metadata: RoadworkQueryMetadata = {
      type: 'roadwork',
      roadworks: roadworks.map((rw) => ({
        title: rw.title,
        road: rw.road,
        section: rw.section,
        area: rw.area,
        status: rw.status,
        startDate: rw.startDate,
        endDate: rw.endDate,
        expectedDelayMinutes: rw.expectedDelayMinutes,
        trafficControl: rw.trafficControl,
        expectedCompletion: rw.expectedCompletion,
      })),
    };

    return {
      answer: lines.join('\n\n'),
      metadata,
    };
  }

  async processIncidentQuery(question: string): Promise<ChatbotResponse> {
    const normalized = question.trim().toLowerCase();
    const cacheKey = normalized;
    const cached = await cacheService.get<ChatbotResponse>('chatbot-incidents', cacheKey);
    if (cached) return cached;

    const incidents = await incidentsService.findActiveForQuery(question, 3);
    const { answer, metadata } = this.formatIncidentAnswer(incidents, question);

    const response: ChatbotResponse = {
      answer,
      sources: [],
      timestamp: new Date(),
      metadata,
    };

    await cacheService.set('chatbot-incidents', cacheKey, response, 180);
    return response;
  }

  async processRoadworkQuery(question: string): Promise<ChatbotResponse> {
    const normalized = question.trim().toLowerCase();
    const cacheKey = normalized;
    const cached = await cacheService.get<ChatbotResponse>('chatbot-roadworks', cacheKey);
    if (cached) return cached;

    const roadworks = await roadworksService.findPublicForQuery(question, 3);
    const { answer, metadata } = this.formatRoadworkAnswer(roadworks, question);

    const response: ChatbotResponse = {
      answer,
      sources: [],
      timestamp: new Date(),
      metadata,
    };

    await cacheService.set('chatbot-roadworks', cacheKey, response, 180);
    return response;
  }

  /**
   * Detect if a question is asking about office locations
   * 
   * @param question - User's question text
   * @returns True if question appears to be asking about office locations
   */
  isLocationQuery(question: string): boolean {
    if (!question || typeof question !== 'string') {
      return false;
    }

    const normalized = question.toLowerCase().trim();

    // Location query patterns
    const locationPatterns = [
      // "where is the nearest [RA|NATIS|office]"
      /\bwhere\s+(is|are)\s+(the\s+)?(nearest|closest|nearby)\s+(ra|natis|office|offices|location|locations|branch|branches)\b/i,
      
      // "find [RA|NATIS] offices near me"
      /\bfind\s+(ra|natis|office|offices|location|locations|branch|branches)\s+(near|around|close\s+to)\s+(me|my\s+location)\b/i,
      
      // "nearest [RA|NATIS] office"
      /\b(nearest|closest|nearby)\s+(ra|natis|office|offices|location|locations|branch|branches)\b/i,
      
      // "where can I find [RA|NATIS]"
      /\bwhere\s+(can\s+I\s+)?find\s+(ra|natis|office|offices|location|locations|branch|branches)\b/i,
      
      // "show me [RA|NATIS] offices"
      /\bshow\s+me\s+(ra|natis|office|offices|location|locations|branch|branches)\b/i,
      
      // "list [RA|NATIS] offices"
      /\blist\s+(ra|natis|office|offices|location|locations|branch|branches)\b/i,
      
      // "ra office near me" or "natis near me"
      /\b(ra|natis)\s+(office|offices|location|locations|branch|branches)?\s+(near|around|close\s+to)\s+me\b/i,
    ];

    return locationPatterns.some(pattern => pattern.test(normalized));
  }

  /**
   * Process a location query and return nearby offices
   * 
   * @param userLat - User's latitude (optional)
   * @param userLon - User's longitude (optional)
   * @returns ChatbotResponse with formatted office information
   */
  async processLocationQuery(
    userLat?: number,
    userLon?: number
  ): Promise<ChatbotResponse> {
    try {
      logger.info('Processing location query', { userLat, userLon });

      let offices: Array<any & { distance?: number }> = [];
      let hasLocation = false;

      // If coordinates provided, find nearest offices
      if (typeof userLat === 'number' && typeof userLon === 'number' && !isNaN(userLat) && !isNaN(userLon)) {
        try {
          offices = await locationsService.findNearestOffices(userLat, userLon, 5);
          hasLocation = true;
        } catch (error: any) {
          logger.warn('Failed to find nearest offices, falling back to list all', error);
          // Fall through to list all offices
        }
      }

      // If no location or nearest search failed, get all offices
      if (offices.length === 0) {
        offices = await locationsService.listLocations();
      }

      // Format response with enhanced formatting
      let answer: string;
      let metadata: LocationQueryMetadata | undefined;
      
      if (offices.length === 0) {
        answer = "I couldn't find any RA or NATIS offices in the database. Please contact the Roads Authority directly for office locations.";
      } else {
        // Create structured metadata for frontend
        metadata = {
          type: 'location_query',
          offices: offices.map((office) => ({
            id: office.id?.toString() || '',
            name: office.name,
            address: office.address,
            region: office.region,
            coordinates: office.coordinates,
            distance: office.distance,
            contactNumber: office.contactNumber || undefined,
            email: office.email || undefined,
          })),
        };

        // Format text response with emoji markers for better readability
        const officeText = offices
          .map((office, index) => {
            const officeInfo = [];
            officeInfo.push(`📍 **${office.name}**`);
            officeInfo.push(`${office.address}, ${office.region}`);
            
            if (office.distance !== undefined) {
              officeInfo.push(`📏 ${office.distance.toFixed(1)} km away`);
            }
            
            if (office.contactNumber) {
              officeInfo.push(`📞 ${office.contactNumber}`);
            }
            
            if (office.email) {
              officeInfo.push(`✉️ ${office.email}`);
            }

            return officeInfo.join('\n');
          })
          .join('\n\n');

        if (hasLocation && offices.length === 1) {
          answer = `The nearest RA office to your location is:\n\n${officeText}`;
        } else if (hasLocation && offices.length > 1) {
          answer = `The nearest RA offices to your location are:\n\n${officeText}`;
        } else {
          answer = `Here are the RA and NATIS offices:\n\n${officeText}`;
        }
      }

      return {
        answer,
        sources: [],
        timestamp: new Date(),
        metadata,
      };
    } catch (error: any) {
      logger.error('Error processing location query:', error);
      return {
        answer: "I'm having trouble retrieving office locations at the moment. Please try again later or contact the Roads Authority directly.",
        sources: [],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Health check for chatbot service
   */
  async healthCheck(): Promise<{ status: string; ragServiceConnected: boolean }> {
    try {
      const ragHealth = await ragService.healthCheck();
      return {
        status: 'healthy',
        ragServiceConnected: ragHealth.status === 'healthy',
      };
    } catch (error) {
      logger.error('Chatbot health check failed:', error);
      return {
        status: 'unhealthy',
        ragServiceConnected: false,
      };
    }
  }
}

export const chatbotService = new ChatbotService();
