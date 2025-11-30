import { http, HttpResponse } from 'msw';
import { mockSuperAdmin, mockTokens } from '../test-utils';

const API_BASE_URL = 'http://localhost:5000/api';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    if (body.email === 'superadmin@ra.gov.na' && body.password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockSuperAdmin,
          accessToken: mockTokens.accessToken,
          refreshToken: mockTokens.refreshToken,
        },
      });
    }

    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'AUTH_001',
          message: 'Invalid credentials',
        },
      },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'new-access-token',
      },
    });
  }),

  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      data: null,
    });
  }),

  // News endpoints
  http.get(`${API_BASE_URL}/news`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    return HttpResponse.json({
      success: true,
      data: {
        news: [
          {
            _id: 'news-1',
            title: 'Test News Article',
            content: 'Test content',
            excerpt: 'Test excerpt',
            category: 'announcement',
            author: 'Admin',
            published: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        pagination: {
          page,
          limit,
          total: 1,
          pages: 1,
        },
      },
    });
  }),

  http.post(`${API_BASE_URL}/news`, async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      success: true,
      data: {
        _id: 'new-news-id',
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  http.get(`${API_BASE_URL}/news/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        _id: params.id,
        title: 'Test News Article',
        content: 'Test content',
        excerpt: 'Test excerpt',
        category: 'announcement',
        author: 'Admin',
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  http.put(`${API_BASE_URL}/news/:id`, async ({ params, request }) => {
    const body = await request.json();

    return HttpResponse.json({
      success: true,
      data: {
        _id: params.id,
        ...body,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  http.delete(`${API_BASE_URL}/news/:id`, () => {
    return HttpResponse.json({
      success: true,
      data: null,
    });
  }),

  // Documents endpoints
  http.get(`${API_BASE_URL}/documents`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        documents: [
          {
            _id: 'doc-1',
            title: 'Test Document',
            description: 'Test description',
            fileUrl: 'https://example.com/test.pdf',
            fileType: 'application/pdf',
            fileSize: 1024000,
            category: 'policy',
            indexed: true,
            uploadedBy: 'admin-id',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      },
    });
  }),

  http.post(`${API_BASE_URL}/documents`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        _id: 'new-doc-id',
        title: 'Uploaded Document',
        description: 'Test description',
        fileUrl: 'https://example.com/uploaded.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000,
        category: 'policy',
        indexed: false,
        uploadedBy: 'admin-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // Users endpoints
  http.get(`${API_BASE_URL}/users`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        users: [mockSuperAdmin],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      },
    });
  }),

  http.post(`${API_BASE_URL}/users`, async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      success: true,
      data: {
        _id: 'new-user-id',
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }),
];
