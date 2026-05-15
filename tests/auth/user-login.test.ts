import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Mock prisma before importing the router
jest.mock('../../src/prisma.ts', () => {
  const { prismaMock } = require('../mocks/prismaMock');
  return { __esModule: true, default: prismaMock };
});

// Mock utils: stable token generation
jest.mock('../../src/api/auth/userAuth/utils.ts', () => {
  const actual = jest.requireActual('../../src/api/auth/userAuth/utils.ts');
  return {
    __esModule: true,
    ...actual,
    generateAccessToken: jest.fn(() => 'access.jwt'),
    generateRefreshToken: jest.fn(() => 'refresh.jwt'),
  };
});

// Import after mocks
import userAuthRouter from '../../src/api/auth/userAuth/auth.js';
import { prismaMock, resetPrismaMock } from '../mocks/prismaMock';

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/auth/user', userAuthRouter);
  return app;
};

describe('User Login Flow', () => {
  const rollno = '23N206';

  beforeEach(() => resetPrismaMock());

  // TC7: successful login
  it('TC7: logs in successfully with valid credentials and sets cookies', async () => {
    const app = makeApp();

    prismaMock.users.findFirst.mockResolvedValueOnce({
      id: 101,
      rollno: rollno.toLowerCase(),
      name: 'John',
      department: 'CSE - AIML',
      email: `${rollno.toLowerCase()}@psgtech.ac.in`,
      phoneno: BigInt(9876543210),
      yearofstudy: 2,
      password: 'hashed:goodpass', // bcrypt mock checks "hashed:<password>"
    });

    const res = await request(app).post('/auth/user/login').send({
      rollno,
      password: 'goodpass',
    });

    expect(res.status).toBe(200);
    const setCookie = res.headers['set-cookie'] as string[] | string | undefined;
    const cookieStr = Array.isArray(setCookie) ? setCookie.join(';') : String(setCookie ?? '');
    expect(cookieStr).toContain('accesstoken=');
    expect(cookieStr).toContain('refreshtoken=');
    expect(res.body).toMatchObject({
      id: 101,
      rollno: rollno.toLowerCase(),
    });
    // no console logs
  });

  // TC8: wrong password
  it('TC8: fails with wrong password (401)', async () => {
    const app = makeApp();

    prismaMock.users.findFirst.mockResolvedValueOnce({
      id: 101,
      rollno: rollno.toLowerCase(),
      password: 'hashed:correct',
    });

    const res = await request(app).post('/auth/user/login').send({
      rollno,
      password: 'wrong',
    });

    expect(res.status).toBe(401);
    expect(String(res.body.message || '')).toMatch(/wrong password/i);
    // no console logs
  });

  // TC9: non-existent user
  it('TC9: fails when user does not exist (404)', async () => {
    const app = makeApp();

    prismaMock.users.findFirst.mockResolvedValueOnce(null);

    const res = await request(app).post('/auth/user/login').send({
      rollno,
      password: 'anything',
    });

    expect(res.status).toBe(404);
    expect(String(res.body.message || '')).toMatch(/does not exist/i);
    // no console logs
  });

  // TC10: missing credentials
  it('TC10: fails with missing credentials (400)', async () => {
    const app = makeApp();

    const res = await request(app).post('/auth/user/login').send({
      rollno, // missing password
    });

    expect(res.status).toBe(400);
    expect(String(res.body.message || '')).toMatch(/required/i);
    // no console logs
  });
});