import { AppError } from '../src/domain/entities/errors';

describe('AppError', () => {
  it('should create error with status code and message', () => {
    const error = new AppError(400, 'Bad request');
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad request');
    expect(error.isOperational).toBe(true);
  });
});

describe('Health Check', () => {
  it('should pass placeholder test', () => {
    expect(true).toBe(true);
  });
});
