import { updateProfile } from '../../../../../auth/authController';

export async function PUT(request: Request) {
  return updateProfile(request as any);
} 