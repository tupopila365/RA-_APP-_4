import { chatbotService } from '../chatbot.service';

describe('Chatbot incident/roadworks detection and formatting', () => {
  it('detects incident keywords and road numbers', () => {
    expect(chatbotService.isIncidentQuery('Any accidents on the B2?')).toBe(true);
    expect(chatbotService.isIncidentQuery('Is B1 closed?')).toBe(true);
    expect(chatbotService.isIncidentQuery('Hello')).toBe(false);
  });

  it('detects roadwork keywords', () => {
    expect(chatbotService.isRoadworkQuery('Any roadworks in Windhoek?')).toBe(true);
    expect(chatbotService.isRoadworkQuery('Planned maintenance on B1?')).toBe(true);
  });

  it('formats incident answers with required fields', () => {
    const sample = [
      {
        title: 'Accident near Arandis',
        type: 'Accident',
        road: 'B2',
        locationDescription: 'near Arandis turn-off',
        area: 'Arandis',
        status: 'Active',
        reportedAt: new Date('2026-01-04T08:15:00Z'),
        expectedClearance: undefined,
        severity: 'High',
      },
    ];

    const { answer, metadata } = (chatbotService as any).formatIncidentAnswer(sample, 'B2');
    expect(answer).toContain('Incident: Accident');
    expect(answer).toContain('Status: Active');
    expect(metadata.type).toBe('incident');
    expect(metadata.incidents[0].road).toBe('B2');
  });

  it('formats roadwork answers with required fields', () => {
    const sample = [
      {
        title: 'B1 North Maintenance',
        road: 'B1',
        section: 'Brakwater → Okahandja',
        area: 'Okahandja',
        status: 'Planned',
        startDate: new Date('2026-03-10'),
        endDate: new Date('2026-03-25'),
        expectedDelayMinutes: 20,
        trafficControl: 'Stop-and-go',
        expectedCompletion: new Date('2026-03-25'),
      },
    ];

    const { answer, metadata } = (chatbotService as any).formatRoadworkAnswer(sample, 'B1');
    expect(answer).toContain('Roadworks: B1 North Maintenance');
    expect(answer).toContain('Section: Brakwater → Okahandja');
    expect(answer).toContain('Expected delay: 20 minutes');
    expect(metadata.type).toBe('roadwork');
    expect(metadata.roadworks[0].road).toBe('B1');
  });
});











