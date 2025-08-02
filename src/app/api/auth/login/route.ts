import { login } from '../../../../../auth/authController';

export async function POST(request: Request) {
  return login(request as any);
} 