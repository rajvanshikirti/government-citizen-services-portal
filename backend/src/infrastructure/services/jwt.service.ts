import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { JwtPayload, AuthTokens } from '../../domain/interfaces/types';

export class JwtService {
  generateToken(payload: JwtPayload): AuthTokens {
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] };
    const accessToken = jwt.sign(payload, env.JWT_SECRET, options);

    return {
      accessToken,
      expiresIn: env.JWT_EXPIRES_IN,
    };
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }
}

export const jwtService = new JwtService();
