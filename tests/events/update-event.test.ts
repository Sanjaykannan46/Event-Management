import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Mock prisma before importing the router
jest.mock('../../src/prisma.ts', () => {
  const { prismaMock } = require('../mocks/prismaMock');
  return { __esModule: true, default: prismaMock };
});

// Mock fs-extra default import used by the controller
jest.mock('fs-extra', () => ({
  __esModule: true,
  default: {
    ensureDir: jest.fn(async () => {}),
    writeFile: jest.fn(async () => {}),
    pathExists: jest.fn(async () => true),
    remove: jest.fn(async () => {}),
  },
}));

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

describe('Update Event Poster', () => {
  beforeEach(() => resetPrismaMock());

  // TC29: successful poster update
  it('TC29: updates poster successfully (200)', async () => {
    const app = makeApp(1);
    const eventId = 123;

    // Event exists and belongs to this admin's club (controller query returns a record)
    prismaMock.events.findFirst.mockResolvedValueOnce({
      id: eventId,
      name: 'Coding Marathon',
      date: new Date('2025-05-15'),
      poster: 'uploads/posters/old.png',
    });
    prismaMock.events.update.mockResolvedValueOnce({ id: eventId });

    const res = await request(app)
      .post(`/admin/update-poster/${eventId}`)
      .attach('poster', Buffer.from('new-image'), 'newposter.jpg');

    expect(res.status).toBe(200);
    // ensure DB was updated with a poster path
    const updateArgs = prismaMock.events.update.mock.calls[0][0];
    expect(updateArgs.where.id).toBe(eventId);
    expect(updateArgs.data.poster).toContain('uploads/posters/');
    expect(String(res.body.message || '')).toMatch(/updated successfully/i);
  });

  // TC30: non-existent event id
  it('TC30: fails for non-existent event (404)', async () => {
    const app = makeApp(1);
    const eventId = 999;

    prismaMock.events.findFirst.mockResolvedValueOnce(null);

    const res = await request(app)
      .post(`/admin/update-poster/${eventId}`)
      .attach('poster', Buffer.from('any'), 'p.png');

    expect(res.status).toBe(404);
    expect(String(res.body.message || '')).toMatch(/not found/i);
  });

  // TC31: unauthorized admin (event exists but not for this club)
  // Note: controller returns 404 with a permission message (not 401)
  it('TC31: fails when admin does not have permission for this event (404)', async () => {
    // Admin of club 2 trying to update event that doesn’t belong to their club
    const app = makeApp(2);
    const eventId = 321;

    // Query includes club constraint; simulate "not found or no permission"
    prismaMock.events.findFirst.mockResolvedValueOnce(null);

    const res = await request(app)
      .post(`/admin/update-poster/${eventId}`)
      .attach('poster', Buffer.from('any'), 'p.png');

    expect(res.status).toBe(404);
    expect(String(res.body.message || '')).toMatch(/do not have permission|not found/i);
  });
});