import prisma from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/hash.js";

export const registerUser = async (data) => {
  const hashed = await hashPassword(data.password);

  return prisma.user.create({
    data: { ...data, password: hashed },
  });
};

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("User not found");

  const valid = await comparePassword(password, user.password);

  if (!valid) throw new Error("Wrong password");

  return user;
};