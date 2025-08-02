import { refresh } from '../../../../../auth/authController';

export async function POST(request: Request) {
  return refresh(request as any);
} 