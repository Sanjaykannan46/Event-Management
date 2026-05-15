import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Mock prisma before importing the router
jest.mock('../../src/prisma.ts', () => {
  const { prismaMock } = require('../mocks/prismaMock');
  return { __esModule: true, default: prismaMock };
});

// Stub fs-extra for poster handling (used only when file is attached)
jest.mock('fs-extra', () => ({
  __esModule: true,
  default: {
    ensureDir: jest.fn(async () => {}),
    writeFile: jest.fn(async () => {}),
    pathExists: jest.fn(async () => true),
    remove: jest.fn(async () => {}),
    readFile: jest.fn(async () => Buffer.from('')),
  },
}));

// Import router after mocks
import adminRouter from '../../src/api/admin/admin.js';
import { prismaMock, resetPrismaMock } from '../mocks/prismaMock';

const makeApp = (club_id = 1) => {
  const app = express();
  app.use((req, _res, next) => {
    // simulate admin auth middleware
    (req as any).admin_club_id = club_id;
    (req as any).admin_user_id = 10;
    next();
  });
  app.use(express.json());
  app.use(cookieParser());
  app.use('/admin', adminRouter);
  return app;
};

describe('Create Event', () => {
  const base = {
    name: 'Coding Marathon',
    about: 'A 24-hour coding competition',
    date: '2025-05-15',
    event_type: 'Competition',
    event_category: 'Technical',
    min_no_member: 2,
    max_no_member: 4,
    venue: 'Main Auditorium',
  };

  beforeEach(() => resetPrismaMock());

  // TC23: Verify successful event creation with all fields
  it('TC23: creates event successfully with full details', async () => {
    const app = makeApp(1);

    prismaMock.events.findFirst.mockResolvedValueOnce(null); // no duplicate
    prismaMock.events.create.mockResolvedValueOnce({ id: 50 });
    prismaMock.organizingclubs.create.mockResolvedValueOnce({});
    // convenors exist (pre-check)
    prismaMock.users.findMany
      .mockResolvedValueOnce([
        { id: 101, rollno: 'B220001CS' },
        { id: 102, rollno: 'B220045CS' },
      ])
      // convenors exist (post-create insert)
      .mockResolvedValueOnce([
        { id: 101, rollno: 'B220001CS' },
        { id: 102, rollno: 'B220045CS' },
      ]);
    // both are members of club 1
    prismaMock.clubmembers.findFirst
      .mockResolvedValueOnce({ user_id: 101, club_id: 1 })
      .mockResolvedValueOnce({ user_id: 102, club_id: 1 });
    prismaMock.eventconvenors.create.mockResolvedValue({});

    const res = await request(app)
      .post('/admin/create-event')
      .send({
        ...base,
        // controller expects a string for eventConvenors (JSON or comma-separated)
        eventConvenors: JSON.stringify(['B220001CS', 'B220045CS']),
      });

    expect(res.status).toBe(201);
    expect(prismaMock.events.create).toHaveBeenCalled();
    expect(prismaMock.organizingclubs.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ club_id: 1, event_id: 50 }) })
    );
  });

  // TC24: Missing required fields
  it('TC24: fails when required fields are missing (400)', async () => {
    const app = makeApp(1);

    const res = await request(app)
      .post('/admin/create-event')
      .send({
        // missing name/date/venue -> should 400 by controller validation
        about: base.about,
        event_type: base.event_type,
        event_category: base.event_category,
        min_no_member: base.min_no_member,
        max_no_member: base.max_no_member,
      });

    expect(res.status).toBe(400);
  });

  // TC25: Duplicate event (same name, date, venue)
  it('TC25: fails when event already exists (409)', async () => {
    const app = makeApp(1);

    prismaMock.events.findFirst.mockResolvedValueOnce({ id: 9 }); // duplicate found

    const res = await request(app).post('/admin/create-event').send({
      ...base,
    });

    expect(res.status).toBe(409);
  });

  // TC26: Invalid convenors (non-existent roll numbers)
  it('TC26: fails when provided convenors do not exist (422)', async () => {
    const app = makeApp(1);

    prismaMock.events.findFirst.mockResolvedValueOnce(null);
    prismaMock.events.create.mockResolvedValueOnce({ id: 60 });
    prismaMock.organizingclubs.create.mockResolvedValueOnce({});
    // users.findMany returns none => all convenors invalid
    prismaMock.users.findMany.mockResolvedValueOnce([]);

    const res = await request(app)
      .post('/admin/create-event')
      .send({
        ...base,
        eventConvenors: JSON.stringify(['B299999CS', 'B288888CS']),
      });

    expect(res.status).toBe(422);
    expect(String(res.body.message || '')).toMatch(/could not be added as convenors/i);
  });

  // TC27: Poster upload success
  it('TC27: creates event with poster upload; poster path stored', async () => {
    const app = makeApp(1);

    prismaMock.events.findFirst.mockResolvedValueOnce(null);
    prismaMock.events.create.mockResolvedValueOnce({ id: 70 });
    prismaMock.organizingclubs.create.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/admin/create-event')
      .field('name', base.name)
      .field('about', base.about)
      .field('date', base.date)
      .field('event_type', base.event_type)
      .field('event_category', base.event_category)
      .field('min_no_member', String(base.min_no_member))
      .field('max_no_member', String(base.max_no_member))
      .field('venue', base.venue)
      .attach('poster', Buffer.from('fake-image'), 'poster.png');

    expect(res.status).toBe(201);
    // ensure we attempted to store a poster path
    const createArgs = prismaMock.events.create.mock.calls[0][0];
    expect(createArgs.data.poster).toContain('uploads/posters/');
  });

  // TC28: Limit convenors to max 3
  it('TC28: only first 3 convenors are assigned when more provided', async () => {
    const app = makeApp(1);

    prismaMock.events.findFirst.mockResolvedValueOnce(null);
    prismaMock.events.create.mockResolvedValueOnce({ id: 80 });
    prismaMock.organizingclubs.create.mockResolvedValueOnce({});
    // Controller slices to 3; return three existing users
    prismaMock.users.findMany
      .mockResolvedValueOnce([
        { id: 1, rollno: 'B1' },
        { id: 2, rollno: 'B2' },
        { id: 3, rollno: 'B3' },
      ])
      // same list for the post-create insert
      .mockResolvedValueOnce([
        { id: 1, rollno: 'B1' },
        { id: 2, rollno: 'B2' },
        { id: 3, rollno: 'B3' },
      ]);
    prismaMock.clubmembers.findFirst
      .mockResolvedValueOnce({ user_id: 1, club_id: 1 })
      .mockResolvedValueOnce({ user_id: 2, club_id: 1 })
      .mockResolvedValueOnce({ user_id: 3, club_id: 1 });

    prismaMock.eventconvenors.create.mockResolvedValue({});

    const res = await request(app)
      .post('/admin/create-event')
      .send({
        ...base,
        eventConvenors: JSON.stringify(['B1', 'B2', 'B3', 'B4']), // 4 provided
      });

    expect(res.status).toBe(201);
    // Should create exactly 3 convenor records
    expect(prismaMock.eventconvenors.create).toHaveBeenCalledTimes(3);
  });
});