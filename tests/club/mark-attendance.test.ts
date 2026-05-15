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

describe('Mark Attendance (Admin) - /admin/attendance', () => {
  beforeEach(() => resetPrismaMock());

  // TC52: successful attendance marking
  it('TC52: updates attendance successfully (200)', async () => {
    const app = makeApp(1);

    prismaMock.teammembers.updateMany.mockResolvedValueOnce({ count: 1 });

    const res = await request(app).post('/admin/attendance').send({
      event_id: 123,
      user_id: 456,
      is_present: true,
    });

    expect(res.status).toBe(200);
    expect(String(res.body.message || '')).toMatch(/Attendance updated successfully/i);
  });

  // TC53: unregistered user (no matching record)
  it('TC53: fails when no matching record for event_id and user_id (404)', async () => {
    const app = makeApp(1);

    prismaMock.teammembers.updateMany.mockResolvedValueOnce({ count: 0 });

    const res = await request(app).post('/admin/attendance').send({
      event_id: 123,
      user_id: 999, // not registered
      is_present: false,
    });

    expect(res.status).toBe(404);
    expect(String(res.body.message || '')).toMatch(/No record found/i);
  });

  // TC54: missing required fields
  it('TC54: fails when required fields are missing (400)', async () => {
    const app = makeApp(1);

    const res = await request(app).post('/admin/attendance').send({
      // missing user_id and is_present
      event_id: 123,
    });

    expect(res.status).toBe(400);
    expect(String(res.body.message || '')).toMatch(/Required fields missing/i);
  });
});