import { incidentsService } from '../incidents.service';
import { IncidentModel } from '../incidents.model';

jest.mock('../incidents.model', () => {
  const mockModel = {
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
  };
  return { IncidentModel: mockModel };
});

describe('IncidentsService', () => {
  const mockedModel = IncidentModel as unknown as {
    create: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findByIdAndDelete: jest.Mock;
    findById: jest.Mock;
    find: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets updatedBy when updating an incident', async () => {
    mockedModel.findByIdAndUpdate.mockResolvedValue({
      _id: '1',
      road: 'B1',
      status: 'Cleared',
      updatedBy: 'admin-1',
    });

    const result = await incidentsService.updateIncident('1', { status: 'Cleared' }, 'admin-1');

    expect(mockedModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ status: 'Cleared', updatedBy: 'admin-1' }),
      expect.any(Object)
    );
    expect(result.updatedBy).toBe('admin-1');
  });

  it('filters active incidents for chatbot queries', async () => {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    };
    mockedModel.find.mockReturnValue(chain);

    await incidentsService.findActiveForQuery('B1');

    expect(mockedModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'Active',
      })
    );
    expect(chain.limit).toHaveBeenCalledWith(3);
  });
});


















