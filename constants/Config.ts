type Environment = 'development' | 'staging' | 'production';

type Config = {
  apiUrl: string;
  environment: string;
  isDevelopment: boolean;
};

type Configurations = {
  [key in Environment]: Config;
};

export const Config: Configurations = {
  development: {
    apiUrl: 'http://192.168.86.249:5001/api',
    environment: 'development',
    isDevelopment: true,
  },
  staging: {
    apiUrl: 'https://staging-api.example.com/api',
    environment: 'staging',
    isDevelopment: false,
  },
  production: {
    apiUrl: 'https://api.example.com/api',
    environment: 'production',
    isDevelopment: false,
  },
};

const environment = (process.env.NODE_ENV || 'development') as Environment;
export const currentConfig = Config[environment];

export default currentConfig; 