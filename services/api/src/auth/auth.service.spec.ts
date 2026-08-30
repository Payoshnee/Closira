import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { AuthService } from "./auth.service";

describe("AuthService security flows", () => {
  const response = { cookie: jest.fn(), clearCookie: jest.fn() };
  const mail = { sendVerificationEmail: jest.fn(), sendPasswordResetEmail: jest.fn() };
  const prisma = {
    user: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn()
    },
    session: {
      create: jest.fn(),
      updateMany: jest.fn()
    },
    aiProviderSetting: {
      updateMany: jest.fn()
    },
    imageEmbedding: {
      deleteMany: jest.fn()
    },
    aiJob: {
      updateMany: jest.fn()
    },
    wardrobeImage: {
      deleteMany: jest.fn()
    },
    wardrobeItem: {
      updateMany: jest.fn()
    },
    auditLog: {
      create: jest.fn()
    },
    $transaction: jest.fn((ops) => Promise.all(ops))
  };

  beforeEach(() => {
    jest.resetAllMocks();
    delete process.env.JWT_PREVIOUS_ACCESS_SECRET;
    delete process.env.JWT_PREVIOUS_REFRESH_SECRET;
    process.env.AUTH_LOCK_MAX_FAILURES = "2";
  });

  it("locks login after repeated bad passwords", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "user_1", email: "user@example.com", passwordHash: await bcrypt.hash("correct-password", 4), deletedAt: null });
    const service = new AuthService(prisma as never, mail as never);

    await expect(service.login({ email: "user@example.com", password: "wrong-password" }, response)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.login({ email: "user@example.com", password: "wrong-password" }, response)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.login({ email: "user@example.com", password: "correct-password" }, response)).rejects.toThrow("Too many failed login attempts");
  });

  it("soft deletes an account and revokes sessions", async () => {
    process.env.JWT_ACCESS_SECRET = "test-access-secret";
    const token = jwt.sign({ sub: "user_1", email: "user@example.com", role: "USER" }, process.env.JWT_ACCESS_SECRET, { expiresIn: 60 });
    prisma.user.findUniqueOrThrow.mockResolvedValue({ id: "user_1", email: "user@example.com", passwordHash: await bcrypt.hash("correct-password", 4) });
    const service = new AuthService(prisma as never, mail as never);

    await expect(service.deleteAccount(token, "correct-password", response)).resolves.toEqual({ ok: true });
    expect(prisma.session.updateMany).toHaveBeenCalledWith({ where: { userId: "user_1", revokedAt: null }, data: { revokedAt: expect.any(Date) } });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: expect.objectContaining({ deletedAt: expect.any(Date), name: "Deleted user" })
    });
  });

  it("accepts previous access secret during JWT rotation", async () => {
    process.env.JWT_ACCESS_SECRET = "new-access-secret";
    process.env.JWT_PREVIOUS_ACCESS_SECRET = "old-access-secret";
    const token = jwt.sign({ sub: "user_1", email: "user@example.com", role: "USER" }, "old-access-secret", { expiresIn: 60 });
    prisma.user.findUniqueOrThrow.mockResolvedValue({ id: "user_1", name: "User", email: "user@example.com", role: "USER", emailVerifiedAt: null, _count: { wardrobeItems: 0 } });
    const service = new AuthService(prisma as never, mail as never);

    await expect(service.me(token)).resolves.toEqual({
      user: expect.objectContaining({ id: "user_1", email: "user@example.com" })
    });
  });
});
