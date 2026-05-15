import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Prisma mock
jest.mock('../../src/prisma.ts', () => {
  const { prismaMock } = require('../mocks/prismaMock');
  return { __esModule: true, default: prismaMock };
});

// Inject authenticated user
jest.mock('../../src/middleware/authMiddleware.ts', () => ({
  __esModule: true,
  userAuthMiddleware: (req: any, _res: any, next: any) => {
    req.user_id = 42; // inviter
    next();
  },
}));

// Router after mocks
import userRouter from '../../src/api/user/user.js';
import { prismaMock, resetPrismaMock } from '../mocks/prismaMock';

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/user', userRouter);
  return app;
};

describe('Team Invitation (/user/sendTeamInvitaion)', () => {
  beforeEach(() => resetPrismaMock());

  // TC43: successful invite
  it('TC43: sends invitation successfully (201)', async () => {
    const app = makeApp();
    const payload = { from_team_id: 900, to_user_id: 77, event_id: 500 };

    prismaMock.events.findUnique.mockResolvedValueOnce({ id: payload.event_id, max_no_member: 3 });
    prismaMock.teams.findUnique.mockResolvedValueOnce({ id: payload.from_team_id, name: 'Debuggers' });
    prismaMock.users.findUnique
      .mockResolvedValueOnce({ id: payload.to_user_id, email: 'invitee@example.com' }) // invitee exists
      .mockResolvedValueOnce({ id: 42, name: 'Inviter', email: 'inviter@example.com' }); // inviter details for email
    prismaMock.teammembers.findMany.mockResolvedValueOnce([{ id: 1 }]); // inviter is in the team
    prismaMock.teammembers.count.mockResolvedValueOnce(1); // team not full
    prismaMock.invitation.create.mockResolvedValueOnce({ id: 1 });

    const res = await request(app).post('/user/sendTeamInvitaion').send(payload);

    expect(res.status).toBe(201);
    expect(String(res.body.message || '')).toMatch(/invite|inviat/i);
  });

  // TC44: team full
  it('TC44: fails when team is already full (400)', async () => {
    const app = makeApp();
    const payload = { from_team_id: 900, to_user_id: 77, event_id: 500 };

    prismaMock.events.findUnique.mockResolvedValueOnce({ id: payload.event_id, max_no_member: 2 });
    prismaMock.teams.findUnique.mockResolvedValueOnce({ id: payload.from_team_id, name: 'Debuggers' });
    prismaMock.users.findUnique
      .mockResolvedValueOnce({ id: payload.to_user_id, email: 'invitee@example.com' });
    prismaMock.teammembers.findMany.mockResolvedValueOnce([{ id: 1 }]); // inviter is in the team
    prismaMock.teammembers.count.mockResolvedValueOnce(2); // team full

    const res = await request(app).post('/user/sendTeamInvitaion').send(payload);

    expect(res.status).toBe(400);
    expect(String(res.body.message || '')).toMatch(/max|full/i);
  });

  // TC45: invitee user not found
  it('TC45: fails for non-existent invitee user (404)', async () => {
    const app = makeApp();
    const payload = { from_team_id: 900, to_user_id: 7777, event_id: 500 };

    prismaMock.events.findUnique.mockResolvedValueOnce({ id: payload.event_id, max_no_member: 3 });
    prismaMock.teams.findUnique.mockResolvedValueOnce({ id: payload.from_team_id, name: 'Debuggers' });
    prismaMock.users.findUnique.mockResolvedValueOnce(null); // invitee not found

    const res = await request(app).post('/user/sendTeamInvitaion').send(payload);

    expect(res.status).toBe(404);
    expect(String(res.body.message || '')).toMatch(/user not found/i);
  });

  // TC46: inviter not part of the team
  it('TC46: fails when inviter is not part of the team (400)', async () => {
    const app = makeApp();
    const payload = { from_team_id: 900, to_user_id: 77, event_id: 500 };

    prismaMock.events.findUnique.mockResolvedValueOnce({ id: payload.event_id, max_no_member: 3 });
    prismaMock.teams.findUnique.mockResolvedValueOnce({ id: payload.from_team_id, name: 'Debuggers' });
    prismaMock.users.findUnique
      .mockResolvedValueOnce({ id: payload.to_user_id, email: 'invitee@example.com' }); // invitee exists
    prismaMock.teammembers.findMany.mockResolvedValueOnce([]); // inviter NOT in the team

    const res = await request(app).post('/user/sendTeamInvitaion').send(payload);

    expect(res.status).toBe(400);
    expect(String(res.body.message || '')).toMatch(/not part of this team/i);
  });
});