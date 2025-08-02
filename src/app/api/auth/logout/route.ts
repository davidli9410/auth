import { logout } from '../../../../../auth/authController';

export async function POST(request: Request) {
  return logout(request as any);
} 