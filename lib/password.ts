import bcrypt from "bcryptjs";

const DEFAULT_SALT_ROUNDS = 12;

export async function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, DEFAULT_SALT_ROUNDS);
}

export async function verifyPassword(
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> {
  if (!hashedPassword) return false;
  return bcrypt.compare(plainTextPassword, hashedPassword);
}


