import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Mock prisma before importing the router
jest.mock('../../src/prisma.ts', () => {
  const { prismaMock } = require('../mocks/prismaMock');
  return { __esModule: true, default: prismaMock };
});

// Inject authenticated user
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

describe('Reject Invitation (/user/rejectTeamInvite)', () => {
  beforeEach(() => resetPrismaMock());

  // TC50: successful rejection
  it('TC50: rejects invitation successfully (200)', async () => {
    const app = makeApp();
    const payload = { from_team_id: 900, to_user_id: 42, event_id: 500 };

    prismaMock.invitation.findFirst.mockResolvedValueOnce({
      id: 333,
      ...payload,
    });
    prismaMock.invitation.delete.mockResolvedValueOnce({});

    const res = await request(app).post('/user/rejectTeamInvite').send(payload);

    expect(res.status).toBe(200);
    expect(String(res.body.message || '')).toMatch(/rejected/i);
    expect(prismaMock.invitation.delete).toHaveBeenCalled();
  });

  // TC51: non-existent invitation
  it('TC51: fails when invitation not found (404)', async () => {
    const app = makeApp();
    const payload = { from_team_id: 901, to_user_id: 42, event_id: 501 };

    prismaMock.invitation.findFirst.mockResolvedValueOnce(null);

    const res = await request(app).post('/user/rejectTeamInvite').send(payload);

    expect(res.status).toBe(404);
    expect(String(res.body.error || res.body.message || '')).toMatch(/invite.*not found/i);
  });
});