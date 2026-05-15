type Fn = jest.Mock<any, any>;
export interface PrismaMock {
  users: { findFirst: Fn; findMany: Fn; findUnique: Fn; create: Fn; update: Fn; };
  emailverification: { findFirst: Fn; create: Fn; };
  usersecuritycode: { findFirst: Fn; create: Fn; update: Fn; };
  clubmembers: { findFirst: Fn; };
  globaladmins: { findFirst: Fn; create: Fn; };
  events: { findFirst: Fn; findMany: Fn; findUnique: Fn; create: Fn; update: Fn; };
  organizingclubs: { create: Fn; };
  eventconvenors: { create: Fn; };
  teams: { create: Fn; findUnique: Fn; };
  eventregistration: { create: Fn; };
  teammembers: { findFirst: Fn; create: Fn; findMany: Fn; count: Fn; update: Fn; updateMany: Fn; delete: Fn; };
  invitation: { create: Fn; findFirst: Fn; delete: Fn; };
  clubs: { findFirst: Fn; findUnique: Fn; findMany: Fn; create: Fn; };
}

export const prismaMock: PrismaMock = {
  users: { findFirst: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  emailverification: { findFirst: jest.fn(), create: jest.fn() },
  usersecuritycode: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  clubmembers: { findFirst: jest.fn() },
  globaladmins: { findFirst: jest.fn(), create: jest.fn() },
  events: { findFirst: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  organizingclubs: { create: jest.fn() },
  eventconvenors: { create: jest.fn() },
  teams: { create: jest.fn(), findUnique: jest.fn() },
  eventregistration: { create: jest.fn() },
  teammembers: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn(), count: jest.fn(), update: jest.fn(), updateMany: jest.fn(), delete: jest.fn() },
  invitation: { create: jest.fn(), findFirst: jest.fn(), delete: jest.fn() },
  clubs: { findFirst: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
};

export const resetPrismaMock = () => {
  Object.values(prismaMock).forEach((model: any) => {
    Object.values(model).forEach((fn: any) => fn.mockReset());
  });
};