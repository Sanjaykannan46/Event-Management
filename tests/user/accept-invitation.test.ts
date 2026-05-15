import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Mock prisma before importing the router
jest.mock('../../src/prisma.ts', () => {
  const { prismaMock } = require('../mocks/prismaMock');
  return { __esModule: true, default: prismaMock };
});

// Mock user auth middleware: inject logged-in user_id
jest.mock('../../src/middleware/authMiddleware.ts', () => ({
  __esModule: true,
  userAuthMiddleware: (req: any, _res: any, next: any) => {
    req.user_id = 42; // current user accepts invite
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

describe('Accept Invitation (/user/acceptTeamInvite)', () => {
  beforeEach(() => resetPrismaMock());

  // TC47: successful acceptance
  it('TC47: accepts invitation successfully (200)', async () => {
    const app = makeApp();

    const payload = { from_team_id: 900, event_id: 500 };

    // event exists and team not full
    prismaMock.events.findUnique.mockResolvedValueOnce({ id: payload.event_id, max_no_member: 3 });
    prismaMock.teammembers.count.mockResolvedValueOnce(1); // team has members => not treated as "team not found"
    // invitation exists
    prismaMock.invitation.findFirst.mockResolvedValueOnce({ id: 111, ...payload, to_user_id: 42 });
    // user not in any team yet for this event
    prismaMock.teammembers.findFirst.mockResolvedValueOnce(null);
    prismaMock.teammembers.create.mockResolvedValueOnce({});
    prismaMock.invitation.delete.mockResolvedValueOnce({});

    const res = await request(app).post('/user/acceptTeamInvite').send(payload);

    expect(res.status).toBe(200);
    expect(String(res.body.message || '')).toMatch(/accepted/i);
    // ensure invite was deleted
    expect(prismaMock.invitation.delete).toHaveBeenCalled();
  });

  // TC48: non-existent invitation
  it('TC48: fails when invitation does not exist (404)', async () => {
    const app = makeApp();

    const payload = { from_team_id: 901, event_id: 501 };

    prismaMock.events.findUnique.mockResolvedValueOnce({ id: payload.event_id, max_no_member: 3 });
    prismaMock.teammembers.count.mockResolvedValueOnce(1);
    prismaMock.invitation.findFirst.mockResolvedValueOnce(null); // invite not found

    const res = await request(app).post('/user/acceptTeamInvite').send(payload);

    expect(res.status).toBe(404);
    expect(String(res.body.error || res.body.message || '')).toMatch(/invite.*not found/i);
  });

  // TC49: team already full
  it('TC49: fails when team is already full (400)', async () => {
    const app = makeApp();

    const payload = { from_team_id: 902, event_id: 502 };

    prismaMock.events.findUnique.mockResolvedValueOnce({ id: payload.event_id, max_no_member: 2 });
    prismaMock.teammembers.count.mockResolvedValueOnce(2); // already full
    // invitation exists so it passes the invite check before fullness check
    prismaMock.invitation.findFirst.mockResolvedValueOnce({ id: 222, ...payload, to_user_id: 42 });

    const res = await request(app).post('/user/acceptTeamInvite').send(payload);

    expect(res.status).toBe(400);
    expect(String(res.body.message || '')).toMatch(/team.*full/i);
  });
});