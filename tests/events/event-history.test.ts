import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Mock prisma before importing the router
jest.mock('../../src/prisma.ts', () => {
  const { prismaMock } = require('../mocks/prismaMock');
  return { __esModule: true, default: prismaMock };
});

// Import router after mocks
import adminRouter from '../../src/api/admin/admin.js';
import { prismaMock, resetPrismaMock } from '../mocks/prismaMock';

const makeApp = (club_id = 1) => {
  const app = express();
  // simulate admin auth middleware
  app.use((req, _res, next) => {
    (req as any).admin_club_id = club_id;
    (req as any).admin_user_id = 10;
    next();
  });
  app.use(express.json());
  app.use(cookieParser());
  app.use('/admin', adminRouter);
  return app;
};

describe('Event History (Admin) - /admin/events-history', () => {
  beforeEach(() => resetPrismaMock());

  // TC36: history with analytics
  it('TC36: returns past events with analytics (200)', async () => {
    const app = makeApp(1);

    // Build two past events with convenors, winners, feedback, registrations, and attendance
    prismaMock.events.findMany.mockResolvedValueOnce([
      {
        id: 1,
        name: 'Code Carnival',
        about: 'coding',
        date: new Date('2024-01-10T10:00:00Z'),
        venue: 'Hall A',
        event_type: 'Competition',
        event_category: 'Technical',
        eventconvenors: [
          {
            id: 11,
            club_id: 1,
            user_id: 101,
            event_id: 1,
            users: { name: 'Alice', department: 'CSE', yearofstudy: 2 },
          },
        ],
        eventwinners: [
          { id: 21, team_id: 2, event_id: 1, position: 1, teams: { name: 'Winners' } },
        ],
        feedback: [{ rating: 5 }, { rating: 3 }],
        eventregistration: [{}, {}, {}], // 3 teams registered
        teammembers: [{ is_present: true }, { is_present: false }, { is_present: true }],
      },
      {
        id: 2,
        name: 'Bug Bash',
        about: 'debugging',
        date: new Date('2024-02-10T10:00:00Z'),
        venue: 'Hall B',
        event_type: 'Workshop',
        event_category: 'Technical',
        eventconvenors: [],
        eventwinners: [],
        feedback: [{ rating: 4 }],
        eventregistration: [{}], // 1 team registered
        teammembers: [{ is_present: false }],
      },
    ] as any);

    const res = await request(app).get('/admin/events-history');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);

    // Validate computed analytics for first event
    const first = res.body.data[0];
    expect(first.average_rating).toBeCloseTo(4.0, 1); // (5+3)/2
    expect(first.total_registered_teams).toBe(3);
    expect(first.total_attendance).toBe(2);
    expect(first.eventConvenors.length).toBe(1);
    expect(first.eventWinners.length).toBe(1);
    expect(String(res.body.message || '')).toMatch(/retrieved successfully/i);
  });

  // TC37: no past events
  it('TC37: returns empty data when there are no past events (200)', async () => {
    const app = makeApp(1);

    prismaMock.events.findMany.mockResolvedValueOnce([]);

    const res = await request(app).get('/admin/events-history');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });
});