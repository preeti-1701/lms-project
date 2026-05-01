import prisma from "../config/db.js";

export const createSession = async (userId, req) => {
  await prisma.session.updateMany({
    where: { userId },
    data: { isActive: false },
  });

  return prisma.session.create({
    data: {
      userId,
      ip: req.ip,
      device: req.headers["user-agent"],
    },
  });
};