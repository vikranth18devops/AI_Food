export interface AppConfig {
  nodeEnv: string;
  databaseUrl: string;
  redisUrl: string;
  rabbitmqUrl: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiration: string;
  jwtRefreshExpiration: string;
  storagePath: string;
  maxFileSizeMb: number;
  mockExternalServices: boolean;
  aiProvider: string;
  aiApiKey?: string;
  nutritionApiKey?: string;
  youtubeApiKey?: string;
  authServiceUrl: string;
  imageServiceUrl: string;
}

export function loadAppConfig(): AppConfig {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://foodlens_user:foodlens_password@localhost:5432/foodlens_db?schema=public',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'default-jwt-access-secret-foodlens',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-jwt-refresh-secret-foodlens',
    jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    storagePath: process.env.STORAGE_PATH || './uploads',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
    mockExternalServices: process.env.MOCK_EXTERNAL_SERVICES !== 'false',
    aiProvider: process.env.AI_PROVIDER || 'openai',
    aiApiKey: process.env.AI_API_KEY,
    nutritionApiKey: process.env.NUTRITION_API_KEY,
    youtubeApiKey: process.env.YOUTUBE_API_KEY,
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    imageServiceUrl: process.env.IMAGE_SERVICE_URL || 'http://localhost:3002',
  };
}
