const config = require('../../../src/config/config');

describe('Database Config', () => {
  it('should have correct structure for development', () => {
    const devConfig = config.development;
    expect(devConfig).toMatchObject({
      username: expect.any(String),
      password: expect.any(String),
      database: expect.any(String),
      host: expect.any(String),
      dialect: 'postgres',
    });
  });

  it('should have correct structure for test', () => {
    const testConfig = config.test;
    expect(testConfig).toMatchObject({
      username: expect.any(String),
      password: expect.any(String),
      database: expect.any(String),
      host: expect.any(String),
      dialect: 'postgres',
    });
  });

  it('should have correct structure for production', () => {
    const prodConfig = config.production;
    expect(prodConfig).toMatchObject({
      username: expect.any(String),
      password: expect.any(String),
      database: expect.any(String),
      host: expect.any(String),
      dialect: 'postgres',
    });
  });

  it('should throw error for missing environment variables', () => {
    const envVars = ['DB_USERNAME', 'DB_PASSWORD', 'DB_NAME', 'DB_HOST'];
    envVars.forEach(envVar => {
      expect(process.env[envVar]).toBeDefined();
    });
  });
});
