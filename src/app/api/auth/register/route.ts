import { register } from '../../../../../auth/authController';

export async function POST(request: Request) {
  return register(request as any);
} 