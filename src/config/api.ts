/**
 * API配置文件
 * 根据环境自动选择合适的API地址
 */

// 环境类型
type Environment = 'development' | 'production' | 'tauri';

// API配置接口
interface ApiConfig {
  baseURL: string;
  timeout: number;
  withCredentials: boolean;
}

/**
 * 检测当前运行环境
 */
const detectEnvironment = (): Environment => {
  // 检查是否在Tauri环境中
  if (typeof window !== 'undefined' && (window as any).__TAURI__) {
    return 'tauri';
  }
  
  // 检查是否为生产环境
  if (import.meta.env.PROD) {
    return 'production';
  }
  
  return 'development';
};

/**
 * 不同环境的API配置
 */
const apiConfigs: Record<Environment, ApiConfig> = {
  // 开发环境 - 使用Vite代理
  development: {
    baseURL: '/api',
    timeout: 10000,
    withCredentials: true,
  },
  
  // 生产环境 - 直接连接API服务器
  production: {
    baseURL: 'http://127.0.0.1:3000',
    timeout: 10000,
    withCredentials: true,
  },
  
  // Tauri环境 - 直接连接API服务器
  tauri: {
    baseURL: 'http://127.0.0.1:3000',
    timeout: 10000,
    withCredentials: true,
  },
};

/**
 * 获取当前环境的API配置
 */
export const getApiConfig = (): ApiConfig => {
  const env = detectEnvironment();
  const config = apiConfigs[env];
  
  console.log(`🌐 API环境: ${env}, 基础URL: ${config.baseURL}`);
  
  return config;
};

/**
 * 获取完整的API地址
 * @param endpoint API端点
 * @returns 完整的API地址
 */
export const getApiUrl = (endpoint: string): string => {
  const config = getApiConfig();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // 如果使用代理，直接返回端点
  if (config.baseURL === '/api') {
    return `/api${cleanEndpoint}`;
  }
  
  // 否则返回完整URL
  return `${config.baseURL}${cleanEndpoint}`;
};

/**
 * 导出当前配置
 */
export const currentApiConfig = getApiConfig();

/**
 * 导出环境检测函数
 */
export { detectEnvironment };

/**
 * 导出配置类型
 */
export type { ApiConfig, Environment };
