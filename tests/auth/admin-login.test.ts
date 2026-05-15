import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Mock prisma before importing the router
jest.mock('../../src/prisma.ts', () => {
  const { prismaMock } = require('../mocks/prismaMock');
  return { __esModule: true, default: prismaMock };
});

// Mock admin token utils for deterministic tokens
jest.mock('../../src/api/auth/adminAuth/util.ts', () => ({
  __esModule: true,
  generateAdminAccessToken: jest.fn(() => 'admin.access.jwt'),
  generateAdminRefreshToken: jest.fn(() => 'admin.refresh.jwt'),
}));

// Import router after mocks
import adminAuthRouter from '../../src/api/auth/adminAuth/auth.js';
import { prismaMock, resetPrismaMock } from '../mocks/prismaMock';

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/auth/admin', adminAuthRouter);
  return app;
};

describe('Admin Login Flow', () => {
  const rollno = '23N206';
  const club_id = 1;

  beforeEach(() => resetPrismaMock());

  // TC15: successful admin login
  it('TC15: admin logs in successfully with valid credentials', async () => {
    const app = makeApp();

    prismaMock.users.findFirst.mockResolvedValueOnce({
      id: 10,
      rollno: rollno.toLowerCase(),
      password: 'hashed:secret',
    });
    prismaMock.clubmembers.findFirst.mockResolvedValueOnce({
      user_id: 10,
      club_id,
      is_admin: true,
    });

    const res = await request(app).post('/auth/admin/login').send({
      rollno,
      club_id,
      password: 'secret',
    });

    expect(res.status).toBe(200);
    const setCookie = res.headers['set-cookie'] as string[] | string | undefined;
    const cookieStr = Array.isArray(setCookie) ? setCookie.join(';') : String(setCookie ?? '');
    expect(cookieStr).toContain('adminaccesstoken=');
    expect(cookieStr).toContain('adminrefreshtoken=');
  });

  // TC16: user is not an admin
  it('TC16: fails when user is club member but not admin (400)', async () => {
    const app = makeApp();

    prismaMock.users.findFirst.mockResolvedValueOnce({
      id: 10,
      rollno: rollno.toLowerCase(),
      password: 'hashed:secret',
    });
    prismaMock.clubmembers.findFirst.mockResolvedValueOnce({
      user_id: 10,
      club_id,
      is_admin: false,
    });

    const res = await request(app).post('/auth/admin/login').send({
      rollno,
      club_id,
      password: 'secret',
    });

    expect(res.status).toBe(400);
    expect(String(res.body.message || '')).toMatch(/not an admin/i);
  });

  // TC17: wrong password
  it('TC17: fails admin login with wrong password (401)', async () => {
    const app = makeApp();

    prismaMock.users.findFirst.mockResolvedValueOnce({
      id: 10,
      rollno: rollno.toLowerCase(),
      password: 'hashed:correct',
    });
    prismaMock.clubmembers.findFirst.mockResolvedValueOnce({
      user_id: 10,
      club_id,
      is_admin: true,
    });

    const res = await request(app).post('/auth/admin/login').send({
      rollno,
      club_id,
      password: 'wrong',
    });

    expect(res.status).toBe(401);
    expect(String(res.body.message || '')).toMatch(/wrong password/i);
  });

  // TC18: invalid club (admin record not found)
  it('TC18: fails admin login with invalid club (400)', async () => {
    const app = makeApp();

    prismaMock.users.findFirst.mockResolvedValueOnce({
      id: 10,
      rollno: rollno.toLowerCase(),
      password: 'hashed:secret',
    });
    prismaMock.clubmembers.findFirst.mockResolvedValueOnce(null); // no admin membership for club

    const res = await request(app).post('/auth/admin/login').send({
      rollno,
      club_id: 999, // non-existent for this user
      password: 'secret',
    });

    expect(res.status).toBe(400);
    expect(String(res.body.message || '')).toMatch(/admin not found/i);
  });
});