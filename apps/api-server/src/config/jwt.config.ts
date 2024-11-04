import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  SECRET:
    process.env.JWT_SECRET ||
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '3600s',
}));
