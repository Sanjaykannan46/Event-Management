import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Mock prisma before importing the router
jest.mock('../../src/prisma.ts', () => {
  const { prismaMock } = require('../mocks/prismaMock');
  return { __esModule: true, default: prismaMock };
});

// Mock global-admin token utils for deterministic cookies
jest.mock('../../src/api/auth/globalAuth/utils.ts', () => ({
  __esModule: true,
  generateGlobalAdminAccessToken: jest.fn(() => 'global.access.jwt'),
  generateGlobalAdminRefreshToken: jest.fn(() => 'global.refresh.jwt'),
}));

// Import router after mocks
import globalAuthRouter from '../../src/api/auth/globalAuth/auth.js';
import { prismaMock, resetPrismaMock } from '../mocks/prismaMock';

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/auth/global', globalAuthRouter);
  return app;
};

describe('Global Admin Auth', () => {
  beforeEach(() => resetPrismaMock());

  // TC19: successful global admin login
  it('TC19: logs in successfully with valid credentials', async () => {
    const app = makeApp();

    prismaMock.globaladmins.findFirst.mockResolvedValueOnce({
      id: 1,
      username: 'admin',
      password: 'hashed:secret',
    });

    const res = await request(app).post('/auth/global/login').send({
      username: 'admin',
      password: 'secret',
    });

    expect(res.status).toBe(200);
    const setCookie = res.headers['set-cookie'] as string[] | string | undefined;
    const cookieStr = Array.isArray(setCookie) ? setCookie.join(';') : String(setCookie ?? '');
    expect(cookieStr).toContain('globaladminaccesstoken=');
    expect(cookieStr).toContain('globaladminrefreshtoken=');
  });

  // TC20: wrong password
  it('TC20: fails login with wrong password (401)', async () => {
    const app = makeApp();

    prismaMock.globaladmins.findFirst.mockResolvedValueOnce({
      id: 1,
      username: 'admin',
      password: 'hashed:correct',
    });

    const res = await request(app).post('/auth/global/login').send({
      username: 'admin',
      password: 'wrong',
    });

    expect(res.status).toBe(401);
    expect(String(res.body.message || '')).toMatch(/invalid password/i);
  });

  // TC21: non-existent username
  it('TC21: fails login for non-existent username (404)', async () => {
    const app = makeApp();

    prismaMock.globaladmins.findFirst.mockResolvedValueOnce(null);

    const res = await request(app).post('/auth/global/login').send({
      username: 'nouser',
      password: 'any',
    });

    expect(res.status).toBe(404);
    expect(String(res.body.message || '')).toMatch(/not found/i);
  });

  // TC22: signup creates new global admin
  it('TC22: signs up new global admin successfully (201)', async () => {
    const app = makeApp();

    // No existing admin with username
    prismaMock.globaladmins.findFirst.mockResolvedValueOnce(null);
    // Create new admin; bcrypt mock hashes as "hashed:<password>"
    prismaMock.globaladmins.create.mockResolvedValueOnce({
      id: 2,
      username: 'newadmin',
      password: 'hashed:secret',
    });

    const res = await request(app).post('/auth/global/signup').send({
      username: 'newadmin',
      password: 'secret',
    });

    expect(res.status).toBe(201);
    const setCookie = res.headers['set-cookie'] as string[] | string | undefined;
    const cookieStr = Array.isArray(setCookie) ? setCookie.join(';') : String(setCookie ?? '');
    expect(cookieStr).toContain('globaladminaccesstoken=');
    expect(cookieStr).toContain('globaladminrefreshtoken=');

    // Ensure password was hashed before insert
    const createArgs = prismaMock.globaladmins.create.mock.calls[0][0];
    expect(createArgs.data.password).toBe('hashed:secret');
  });
});