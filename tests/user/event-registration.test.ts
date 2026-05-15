import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Mock prisma before importing the router
jest.mock('../../src/prisma.ts', () => {
  const { prismaMock } = require('../mocks/prismaMock');
  return { __esModule: true, default: prismaMock };
});

// Mock user auth middleware to inject user_id
jest.mock('../../src/middleware/authMiddleware.ts', () => ({
  __esModule: true,
  userAuthMiddleware: (req: any, _res: any, next: any) => {
    req.user_id = 42;
    next();
  },
}));

// Import router after mocks
import userRouter from '../../src/api/user/user.js';
import { prismaMock, resetPrismaMock } from '../mocks/prismaMock';

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/user', userRouter);
  return app;
};

describe('Event Registration (/user/register)', () => {
  beforeEach(() => resetPrismaMock());

  // TC38: successful solo event registration
  it('TC38: registers successfully for solo event (201)', async () => {
    const app = makeApp();
    const event_id = 55;

    prismaMock.events.findUnique.mockResolvedValueOnce({
      id: event_id,
      min_no_member: 1,
      max_no_member: 1,
    });
    prismaMock.teammembers.findFirst.mockResolvedValueOnce(null);
    prismaMock.users.findUnique.mockResolvedValueOnce({ rollno: '20CS001' });
    prismaMock.teams.create.mockResolvedValueOnce({ id: 900 });
    prismaMock.eventregistration.create.mockResolvedValueOnce({});
    prismaMock.teammembers.create.mockResolvedValueOnce({});

    const res = await request(app).post('/user/register').send({ event_id });

    expect(res.status).toBe(201);
    expect(String(res.body.message || '')).toMatch(/Event Registration Successful/i);
    // team created with roll number as name
    const teamArgs = prismaMock.teams.create.mock.calls[0][0];
    expect(teamArgs.data).toMatchObject({ name: '20CS001', event_id });
  });

  // TC39: successful team event registration with provided team name
  it('TC39: registers team event successfully with team name (201)', async () => {
    const app = makeApp();
    const event_id = 77;

    prismaMock.events.findUnique.mockResolvedValueOnce({
      id: event_id,
      min_no_member: 2,
      max_no_member: 4,
    });
    prismaMock.teammembers.findFirst.mockResolvedValueOnce(null);
    prismaMock.teams.create.mockResolvedValueOnce({ id: 901 });
    prismaMock.eventregistration.create.mockResolvedValueOnce({});
    prismaMock.teammembers.create.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/user/register')
      .send({ event_id, teamName: 'Team Debuggers' });

    expect(res.status).toBe(201);
    const teamArgs = prismaMock.teams.create.mock.calls[0][0];
    expect(teamArgs.data).toMatchObject({ name: 'Team Debuggers', event_id });
  });

  // TC40: non-existent event
  it('TC40: fails for non-existent event (404)', async () => {
    const app = makeApp();
    prismaMock.events.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).post('/user/register').send({ event_id: 999 });

    expect(res.status).toBe(404);
    expect(String(res.body.message || '')).toMatch(/Event not found/i);
  });

  // TC41: already registered
  it('TC41: fails when already registered (409)', async () => {
    const app = makeApp();
    const event_id = 55;

    prismaMock.events.findUnique.mockResolvedValueOnce({
      id: event_id, min_no_member: 2, max_no_member: 4,
    });
    prismaMock.teammembers.findFirst.mockResolvedValueOnce({
      teams: { name: 'Existing Team' },
    });

    const res = await request(app)
      .post('/user/register')
      .send({ event_id, teamName: 'Any' });

    expect(res.status).toBe(409);
    expect(String(res.body.message || '')).toMatch(/already registered/i);
    expect(res.body.team_name).toBe('Existing Team');
  });

  // TC42: missing team name for team event
  it('TC42: fails for team event without team name (400)', async () => {
    const app = makeApp();
    const event_id = 88;

    prismaMock.events.findUnique.mockResolvedValueOnce({
      id: event_id, min_no_member: 2, max_no_member: 4,
    });
    prismaMock.teammembers.findFirst.mockResolvedValueOnce(null);

    const res = await request(app).post('/user/register').send({ event_id });

    expect(res.status).toBe(400);
    expect(String(res.body.message || '')).toMatch(/team name is required/i);
  });
});