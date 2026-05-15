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

describe('View Events (Admin) - /admin/events', () => {
  beforeEach(() => resetPrismaMock());

  const baseEvents = [
    {
      id: 1,
      name: 'Event Old',
      about: 'older',
      date: new Date('2024-01-10T10:00:00Z'),
      venue: 'Hall A',
      event_type: 'Technical',
      event_category: 'Team',
      min_no_member: 1,
      max_no_member: 4,
    },
    {
      id: 2,
      name: 'Event New',
      about: 'newer',
      date: new Date('2024-02-10T10:00:00Z'),
      venue: 'Hall B',
      event_type: 'Workshop',
      event_category: 'Solo',
      min_no_member: 1,
      max_no_member: 2,
    },
  ];

  // TC32: past events (sorted desc by date per current implementation)
  it('TC32: returns past events (200) with descending date order', async () => {
    const app = makeApp(1);

    prismaMock.events.findFirst.mockReset(); // not used here
    prismaMock.events.findMany?.mockResolvedValueOnce(baseEvents as any);

    const res = await request(app).get('/admin/events').query({ type: 'past' });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    const names = res.body.data.map((e: any) => e.name);
    // past -> sorted descending
    expect(names).toEqual(['Event New', 'Event Old']);
    expect(String(res.body.message || '')).toMatch(/past events fetched successfully/i);
  });

  // TC33: ongoing events (sorted asc by date per current implementation)
  it('TC33: returns ongoing events (200) with ascending date order', async () => {
    const app = makeApp(1);

    prismaMock.events.findMany?.mockResolvedValueOnce(baseEvents as any);

    const res = await request(app).get('/admin/events').query({ type: 'ongoing' });

    expect(res.status).toBe(200);
    const names = res.body.data.map((e: any) => e.name);
    // ongoing -> sorted ascending
    expect(names).toEqual(['Event Old', 'Event New']);
    expect(String(res.body.message || '')).toMatch(/ongoing events fetched successfully/i);
  });

  // TC34: upcoming events (sorted asc by date per current implementation)
  it('TC34: returns upcoming events (200) with ascending date order', async () => {
    const app = makeApp(1);

    prismaMock.events.findMany?.mockResolvedValueOnce(baseEvents as any);

    const res = await request(app).get('/admin/events').query({ type: 'upcoming' });

    expect(res.status).toBe(200);
    const names = res.body.data.map((e: any) => e.name);
    // upcoming -> sorted ascending
    expect(names).toEqual(['Event Old', 'Event New']);
    expect(String(res.body.message || '')).toMatch(/upcoming events fetched successfully/i);
  });

  // TC35: invalid type -> 400
  it('TC35: fails with invalid type parameter (400)', async () => {
    const app = makeApp(1);

    const res = await request(app).get('/admin/events').query({ type: 'invalid' });

    expect(res.status).toBe(400);
    expect(String(res.body.message || '')).toMatch(/invalid event type|invalid type/i);
  });
});