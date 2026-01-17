import axios from 'axios';
import { trafficCache } from '../traffic.cache';
import { buildTrafficMessage, classifyCongestion, trafficService } from '../traffic.service';
import { TrafficStatusResponse } from '../traffic.types';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('trafficService', () => {
  beforeEach(() => {
    (trafficService as any).apiKey = 'test-key';
    jest.spyOn(trafficCache, 'set').mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockedAxios.get.mockReset();
  });

  it('classifies congestion levels deterministically', () => {
    expect(classifyCongestion(0, 600)).toBe('Clear');
    expect(classifyCongestion(120, 600)).toBe('Moderate');
    expect(classifyCongestion(900, 600)).toBe('Heavy');
    expect(classifyCongestion(60, 0)).toBe('Moderate');
  });

  it('builds an official-tone traffic advisory', () => {
    const response: TrafficStatusResponse = {
      query: { raw: 'B1', normalized: 'b1', type: 'road' },
      location: { description: 'B1, Windhoek', latitude: -22.57, longitude: 17.08 },
      congestionLevel: 'Moderate',
      estimatedDelayMinutes: 7,
      normalTravelMinutes: 10,
      trafficTravelMinutes: 17,
      routeSummary: {
        distanceKm: 5,
        durationMinutes: 10,
        durationInTrafficMinutes: 17,
        polyline: 'encoded',
      },
      source: 'google_maps',
      updatedAt: new Date().toISOString(),
    };

    const message = buildTrafficMessage(response);
    expect(message).toContain('Roads Authority Namibia Advisory');
    expect(message.toLowerCase()).toContain('moderate');
    expect(message).toContain('delay');
  });

  it('returns cached traffic status when available', async () => {
    const cached: TrafficStatusResponse = {
      query: { raw: 'Windhoek', normalized: 'windhoek', type: 'area' },
      location: { description: 'Windhoek', latitude: -22.57, longitude: 17.08 },
      congestionLevel: 'Clear',
      estimatedDelayMinutes: 0,
      normalTravelMinutes: 8,
      trafficTravelMinutes: 8,
      routeSummary: {
        distanceKm: 4,
        durationMinutes: 8,
        durationInTrafficMinutes: 8,
      },
      source: 'google_maps',
      updatedAt: new Date().toISOString(),
    };

    jest.spyOn(trafficCache, 'get').mockResolvedValueOnce(cached);
    const setSpy = jest.spyOn(trafficCache, 'set');

    const result = await trafficService.getTrafficStatus({ query: 'Windhoek' });
    expect(result).toBe(cached);
    expect(setSpy).not.toHaveBeenCalled();
  });

  it('fetches from Google APIs when cache is empty', async () => {
    jest.spyOn(trafficCache, 'get').mockResolvedValueOnce(null);
    const setSpy = jest.spyOn(trafficCache, 'set').mockResolvedValue();

    mockedAxios.get
      // Geocoding
      .mockResolvedValueOnce({
        data: {
          status: 'OK',
          results: [
            {
              formatted_address: 'Windhoek, Namibia',
              geometry: { location: { lat: -22.57, lng: 17.08 } },
              place_id: 'place-1',
            },
          ],
        },
      } as any)
      // Directions
      .mockResolvedValueOnce({
        data: {
          routes: [
            {
              legs: [
                {
                  duration: { value: 600 },
                  duration_in_traffic: { value: 900 },
                  distance: { value: 4000 },
                },
              ],
              overview_polyline: { points: 'encoded_polyline' },
            },
          ],
        },
      } as any);

    const result = await trafficService.getTrafficStatus({ query: 'Windhoek' });

    expect(result.congestionLevel).toBe('Heavy');
    expect(result.estimatedDelayMinutes).toBe(5);
    expect(setSpy).toHaveBeenCalled();
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });
});















