process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '4001';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh';
process.env.JWT_TOKEN_EXPIRY_MINUTES = process.env.JWT_TOKEN_EXPIRY_MINUTES || '60';
process.env.JWT_REFRESH_TOKEN_EXPIRY_MINUTES = process.env.JWT_REFRESH_TOKEN_EXPIRY_MINUTES || '600';
process.env.USER_EMAIL = process.env.USER_EMAIL || 'tester@example.com';
process.env.EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD || 'app-pass';

// Nodemailer: avoid real emails
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn((opts: any, cb: any) => cb?.(null, { response: 'OK' })),
  }),
}));

// Mock the email sender module to no-op
jest.mock('../src/mailer/sendMail.ts', () => ({ __esModule: true,
  sendSecurityCodeEmail: jest.fn(),
  sendEmailVerificationCode: jest.fn(),
  sendInvitation: jest.fn(),
}));