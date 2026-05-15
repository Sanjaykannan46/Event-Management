import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

// Mock prisma before importing the router
jest.mock('../../src/prisma.ts', () => {
  const { prismaMock } = require('../mocks/prismaMock');
  return { __esModule: true, default: prismaMock };
});

// Import router after mocks
import globalRouter from '../../src/api/global/global.js';
import { prismaMock, resetPrismaMock } from '../mocks/prismaMock';

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/global', globalRouter);
  return app;
};

describe('Club Creation (Global Admin) - /global/createclub', () => {
  beforeEach(() => resetPrismaMock());

  // TC55: Verify successful club creation
  it('TC55: creates club successfully (201)', async () => {
    const app = makeApp();

    prismaMock.clubs.findFirst.mockResolvedValueOnce(null); // not existing
    prismaMock.clubs.create.mockResolvedValueOnce({ id: 1, name: 'Coding Club', about: 'desc' });

    const res = await request(app).post('/global/createclub').send({
      name: 'Coding Club',
      about: 'desc',
    });

    expect(res.status).toBe(201);
    expect(String(res.body.message || '')).toMatch(/created successfully/i);
  });

  // TC56: Verify club creation fails with missing name
  it('TC56: fails with missing club name (400)', async () => {
    const app = makeApp();

    const res = await request(app).post('/global/createclub').send({ about: 'desc' });

    expect(res.status).toBe(400);
    expect(String(res.body.message || '')).toMatch(/name is required/i);
  });
});