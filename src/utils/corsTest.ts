/**
 * CORS配置测试工具
 * 用于验证跨域配置是否正确工作
 */

import { get } from './httpClient';
import { detectEnvironment, getApiConfig } from '../config/api';

/**
 * 测试API连接
 */
export const testApiConnection = async () => {
  const env = detectEnvironment();
  const config = getApiConfig();
  
  console.group('🌐 CORS配置测试');
  console.log('当前环境:', env);
  console.log('API配置:', config);
  
  try {
    // 测试基础连接
    console.log('📡 测试API基础连接...');
    const response = await get('/');
    console.log('✅ API连接成功:', response);
    
    // 测试每日推荐接口
    console.log('📡 测试每日推荐接口...');
    const dailyResponse = await get('/everyday/recommend');
    console.log('✅ 每日推荐接口成功:', dailyResponse?.data?.song_list?.length || 0, '首歌曲');
    
    // 测试轮播图接口
    console.log('📡 测试轮播图接口...');
    const bannerResponse = await get('/banner');
    console.log('✅ 轮播图接口成功:', bannerResponse?.data?.banner?.length || 0, '个轮播图');
    
    console.log('🎉 所有API测试通过！');
    return true;
    
  } catch (error) {
    console.error('❌ API测试失败:', error);
    
    // 分析错误类型
    if (error instanceof Error) {
      if (error.message.includes('CORS')) {
        console.error('🚨 CORS错误 - 跨域配置有问题');
      } else if (error.message.includes('Network Error')) {
        console.error('🚨 网络错误 - API服务器可能未启动');
      } else if (error.message.includes('timeout')) {
        console.error('🚨 超时错误 - API响应太慢');
      }
    }
    
    return false;
  } finally {
    console.groupEnd();
  }
};

/**
 * 测试不同请求方法
 */
export const testHttpMethods = async () => {
  console.group('🔧 HTTP方法测试');
  
  const methods = [
    { name: 'GET', test: () => get('/') },
    // 可以添加更多方法测试
  ];
  
  for (const method of methods) {
    try {
      console.log(`📡 测试 ${method.name} 方法...`);
      await method.test();
      console.log(`✅ ${method.name} 方法成功`);
    } catch (error) {
      console.error(`❌ ${method.name} 方法失败:`, error);
    }
  }
  
  console.groupEnd();
};

/**
 * 测试请求头
 */
export const testRequestHeaders = async () => {
  console.group('📋 请求头测试');
  
  try {
    // 测试带自定义请求头的请求
    const response = await get('/', {}, {
      headers: {
        'X-Test-Header': 'test-value',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('✅ 自定义请求头测试成功');
    return true;
  } catch (error) {
    console.error('❌ 自定义请求头测试失败:', error);
    return false;
  } finally {
    console.groupEnd();
  }
};

/**
 * 完整的CORS测试套件
 */
export const runCorsTestSuite = async () => {
  console.log('🚀 开始CORS配置测试套件...');
  
  const results = {
    apiConnection: await testApiConnection(),
    httpMethods: await testHttpMethods(),
    requestHeaders: await testRequestHeaders()
  };
  
  console.group('📊 测试结果汇总');
  console.log('API连接:', results.apiConnection ? '✅ 通过' : '❌ 失败');
  console.log('HTTP方法:', results.httpMethods ? '✅ 通过' : '❌ 失败');
  console.log('请求头:', results.requestHeaders ? '✅ 通过' : '❌ 失败');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('总体结果:', allPassed ? '🎉 全部通过' : '⚠️ 部分失败');
  console.groupEnd();
  
  return results;
};

// 在开发环境下自动暴露测试函数到全局
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).corsTest = {
    testApiConnection,
    testHttpMethods,
    testRequestHeaders,
    runCorsTestSuite
  };
  
  console.log('🧪 CORS测试工具已加载，使用 window.corsTest 访问测试函数');
}
