import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Mock prisma before importing the router
jest.mock('../../src/prisma.ts', () => {
  const { prismaMock } = require('../mocks/prismaMock');
  return {
    __esModule: true,
    default: prismaMock,
  };
});

// Mock utils before importing the router
jest.mock('../../src/api/auth/userAuth/utils.ts', () => {
  const actual = jest.requireActual('../../src/api/auth/userAuth/utils.ts');
  return {
    __esModule: true,
    ...actual,
    generateSecurityCode: jest.fn(() => '123456'),
    generateAccessToken: jest.fn(() => 'access.jwt'),
    generateRefreshToken: jest.fn(() => 'refresh.jwt'),
  };
});

// Now import after mocks are set up
import userAuthRouter from '../../src/api/auth/userAuth/auth.js';

// Prepare Prisma mock helpers
import { prismaMock, resetPrismaMock } from '../mocks/prismaMock';

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/auth/user', userAuthRouter);
  return app;
};

describe('User Signup Flow', () => {
  const rollno = '23N206';
  const baseSignupBody = {
    name: 'John Doe',
    rollno,
    password: 'P@ssw0rd',
    department: 'CSE - AIML',
    phoneno: '9876543210',
    yearofstudy: 2,
    code: '123456',
  };

  beforeEach(() => {
    resetPrismaMock();
  });

  // TC1: Verify successful user signup with valid details
  it('TC1: signs up successfully with valid verification code and sets cookies', async () => {
    const app = makeApp();

    // generateemailcode: user must NOT exist, then create code
    prismaMock.users.findFirst.mockResolvedValueOnce(null);
    prismaMock.emailverification.create.mockResolvedValueOnce({
      id: 1, rollno, code: '123456', created_at: new Date(),
    });

    const genCodeRes = await request(app)
      .post('/auth/user/generateemailcode')
      .send({ rollno });

    expect(genCodeRes.status).toBe(201);

    // signup: code exists and matches, user not exists, then create user
    prismaMock.emailverification.findFirst.mockResolvedValueOnce({
      id: 1, rollno, code: '123456', created_at: new Date(),
    });
    prismaMock.users.findFirst.mockResolvedValueOnce(null);
    prismaMock.users.create.mockResolvedValueOnce({
      id: 101,
      name: baseSignupBody.name,
      rollno,
      department: baseSignupBody.department,
      email: `${rollno.toLowerCase()}@psgtech.ac.in`,
      phoneno: baseSignupBody.phoneno,
      yearofstudy: baseSignupBody.yearofstudy,
    });

    const res = await request(app).post('/auth/user/signup').send(baseSignupBody);

    expect(res.status).toBe(201);
    const setCookie = res.headers['set-cookie'] as string[] | string | undefined;
    const cookieStr = Array.isArray(setCookie) ? setCookie.join(';') : String(setCookie ?? '');
    expect(cookieStr).toContain('accesstoken=');
    expect(cookieStr).toContain('refreshtoken=');
    expect(res.body).toMatchObject({
      id: 101,
      name: baseSignupBody.name,
      rollno,
      department: baseSignupBody.department,
    });
    // no console logs; rely on Jest verbose output
  });

  // TC2: Invalid verification code
  it('TC2: fails signup with invalid verification code', async () => {
    const app = makeApp();

    // Code exists but different than submitted
    prismaMock.emailverification.findFirst.mockResolvedValueOnce({
      id: 1, rollno, code: '123456', created_at: new Date(),
    });
    prismaMock.users.findFirst.mockResolvedValueOnce(null);

    const res = await request(app).post('/auth/user/signup').send({
      ...baseSignupBody,
      code: '000000',
    });

    expect(res.status).toBe(400);
    expect(String(res.body.message || '')).toMatch(/code/i);
    // no console logs
  });

  // TC3: Expired verification code (410)
  it('TC3: fails signup with expired verification code (410)', async () => {
    const app = makeApp();

    // Mock code created long ago to simulate expiry
    // No emailverification record => treated as "expired"
    prismaMock.emailverification.findFirst.mockResolvedValueOnce(null);
    prismaMock.users.findFirst.mockResolvedValueOnce(null);

    const res = await request(app).post('/auth/user/signup').send(baseSignupBody);

    // Swagger for signup documents 410 on expiry
    expect(res.status).toBe(410);
    // no console logs
  });

  // TC4: Existing user (conflict)
  it('TC4: fails signup when user already exists (409)', async () => {
    const app = makeApp();

    prismaMock.emailverification.findFirst.mockResolvedValueOnce({
      id: 1, rollno, code: '123456', created_at: new Date(),
    });
    prismaMock.users.findFirst.mockResolvedValueOnce({ id: 99, rollno });

    const res = await request(app).post('/auth/user/signup').send(baseSignupBody);

    expect(res.status).toBe(409);
    // no console logs
  });

  // TC5: Missing required fields
  it('TC5: fails signup with missing required fields (400)', async () => {
    const app = makeApp();

    const res = await request(app)
      .post('/auth/user/signup')
      .send({ rollno, password: 'x', code: '123456' }); // missing name, department, phone, year

    expect(res.status).toBe(400);
    // no console logs
  });

  // TC6: Invalid phone number
  it('TC6: fails signup with invalid phone number (400)', async () => {
    const app = makeApp();

    prismaMock.emailverification.findFirst.mockResolvedValueOnce({
      id: 1, rollno, code: '123456', created_at: new Date(),
    });
    prismaMock.users.findFirst.mockResolvedValueOnce(null);

    const res = await request(app).post('/auth/user/signup').send({
      ...baseSignupBody,
      phoneno: '12345', // invalid
    });

    expect(res.status).toBe(400);
    expect(String(res.body.message || '')).toMatch(/phone/i);
    // no console logs
  });
});