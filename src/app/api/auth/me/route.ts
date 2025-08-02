import { getUser   } from '../../../../../auth/authController';

export async function GET(request: Request) {
  return getUser(request as any);
} 