import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Mock prisma before importing the router
jest.mock('../../src/prisma.ts', () => {
  const { prismaMock } = require('../mocks/prismaMock');
  return { __esModule: true, default: prismaMock };
});

// Mock utils, but keep security-code/token helpers real
jest.mock('../../src/api/auth/userAuth/utils.ts', () => {
  const actual = jest.requireActual('../../src/api/auth/userAuth/utils.ts');
  return {
    __esModule: true,
    ...actual,
    // keep generateSecurityCode and generateSecurityToken real
    generateAccessToken: jest.fn(() => 'access.jwt'),
    generateRefreshToken: jest.fn(() => 'refresh.jwt'),
  };
});

// Import after mocks
import userAuthRouter from '../../src/api/auth/userAuth/auth.js';
import { prismaMock, resetPrismaMock } from '../mocks/prismaMock';
import { generateSecurityToken } from '../../src/api/auth/userAuth/utils.js';

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/auth/user', userAuthRouter);
  return app;
};

describe('Password Reset Flow', () => {
  const rollno = '23N206';
  const code = 'A1B2C3';
  const userId = 101;

  beforeEach(() => resetPrismaMock());

  // TC11: successful reset
  it('TC11: resets password successfully after verifying code', async () => {
    const app = makeApp();

    // Step 1: verify security code
    prismaMock.users.findFirst
      .mockResolvedValueOnce({ id: userId, rollno: rollno.toLowerCase() }); // for verify
    // security code exists for this user
    prismaMock.usersecuritycode.findFirst
      .mockResolvedValueOnce({ user_id: userId, code });

    const verifyRes = await request(app)
      .post('/auth/user/verifycode')
      .send({ rollno, code });

    expect(verifyRes.status).toBe(200);
    const token: string = verifyRes.body.token;

    // Step 2: reset password with token
    prismaMock.usersecuritycode.findFirst
      .mockResolvedValueOnce({ user_id: userId, code }); // token decodes to this code
    prismaMock.users.findFirst
      .mockResolvedValueOnce({ id: userId, rollno: rollno.toLowerCase() }); // for reset
    prismaMock.users.update.mockResolvedValueOnce({ id: userId });

    const resetRes = await request(app)
      .post('/auth/user/resetpassword')
      .send({ rollno, password: 'newpass', token });

    expect(resetRes.status).toBe(200);
    expect(String(resetRes.body.message || '')).toMatch(/password reset/i);

    // Ensure password is hashed (bcrypt mock: "hashed:<pwd>")
    const updateArgs = prismaMock.users.update.mock.calls[0][0];
    expect(updateArgs.data.password).toBe('hashed:newpass');
  });

  // TC12: invalid security code during verification
  it('TC12: fails password reset with invalid security code (400 on verify)', async () => {
    const app = makeApp();

    prismaMock.users.findFirst
      .mockResolvedValueOnce({ id: userId, rollno: rollno.toLowerCase() });
    prismaMock.usersecuritycode.findFirst
      .mockResolvedValueOnce({ user_id: userId, code }); // stored code

    const res = await request(app)
      .post('/auth/user/verifycode')
      .send({ rollno, code: 'WR0NG0' }); // wrong code

    expect(res.status).toBe(400);
    expect(String(res.body.message || '')).toMatch(/not matched/i);
  });

  // TC13: invalid/expired token on reset
  it('TC13: fails password reset with invalid token (401)', async () => {
    const app = makeApp();

    // First obtain a valid token by verifying the right code
    prismaMock.users.findFirst
      .mockResolvedValueOnce({ id: userId, rollno: rollno.toLowerCase() });
    prismaMock.usersecuritycode.findFirst
      .mockResolvedValueOnce({ user_id: userId, code });
    const verifyRes = await request(app)
      .post('/auth/user/verifycode')
      .send({ rollno, code });
    expect(verifyRes.status).toBe(200);

    const token = verifyRes.body.token as string;

    // Now simulate expiry: code no longer exists in DB when resetting
    prismaMock.usersecuritycode.findFirst.mockResolvedValueOnce(null);

    const resetRes = await request(app)
      .post('/auth/user/resetpassword')
      .send({ rollno, password: 'newpass', token });

    expect(resetRes.status).toBe(401);
    expect(String(resetRes.body.message || '')).toMatch(/unauthorized/i);
  });

  // TC14: request code for non-existent user
  it('TC14: fails requesting security code for non-existent user (404)', async () => {
    const app = makeApp();

    prismaMock.users.findFirst.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/auth/user/generatecode')
      .send({ rollno: 'unknown' });

    expect(res.status).toBe(404);
    expect(String(res.body.message || '')).toMatch(/does not exist|not exist/i);
  });
});