import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should pass with valid production configuration', () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '4000';
    process.env.JWT_SECRET = 'super_secure_random_production_secret_key_1234567890';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    expect(() => validateEnv()).not.toThrow();
  });

  it('should throw error if JWT_SECRET is a known weak fallback', () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '4000';
    process.env.JWT_SECRET = 'default_secret_with_32_chars_padding_long_enough';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    expect(() => validateEnv()).toThrow();
  });

  it('should throw error if JWT_SECRET is too short', () => {
    process.env.NODE_ENV = 'development';
    process.env.PORT = '4000';
    process.env.JWT_SECRET = 'short_key';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    expect(() => validateEnv()).toThrow();
  });
});
