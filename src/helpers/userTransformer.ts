import { z } from 'zod';
import { BadRequestException } from '../utils/error.util.js';

const userSchema = z.object({
  userid: z.string().uuid(),
  email: z.string(),
  password_hash: z.string(),
  createdat: z.date(),
});

export function userTransformer(user: JSON): UserData {
  try {
    return { ...userSchema.parse(user) };
  }
  catch (err) {
    throw new BadRequestException("User data is invalid.");
  }
}