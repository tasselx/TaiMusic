/**
 * HTTP客户端工具
 * 基于axios封装的HTTP客户端，提供统一的请求接口、错误处理和认证管理
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useUserStore } from '../store';

/**
 * 创建axios实例
 */
const httpClient = axios.create({
  baseURL: 'http://127.0.0.1:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * 请求拦截器
 * 在请求发送前自动添加认证信息
 */
httpClient.interceptors.request.use(
  config => {
    // 获取用户信息
    const userStore = useUserStore.getState();
    const user = userStore.user;

    // 如果用户已登录，添加认证信息
    if (user && user.token && user.id) {
      // 构建cookie参数
      const cookieParam = `cookie=token=${encodeURIComponent(user.token)};userid=${encodeURIComponent(user.id)}`;
      
      // 将认证信息添加到URL参数中
      if (config.url) {
        config.url += config.url.includes('?') ? `&${cookieParam}` : `?${cookieParam}`;
      }
    }
    
    return config;
  },
  error => {
    console.error('请求配置错误:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * 统一处理响应数据和错误
 */
httpClient.interceptors.response.use(
  response => {
    // 直接返回响应数据
    return response.data;
  },
  error => {
    if (error.response) {
      // 服务器返回错误状态码
      console.error(`HTTP错误状态: ${error.response.status}`, error.response.data);
      
      // 检查是否有详细错误信息
      if (error.response?.data?.data) {
        console.error(error.response.data.data);
      } else {
        // 显示通用错误消息
        console.error('服务器错误，请稍后再试!');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('服务器未响应:', error.request);
      console.error('服务器未响应，请稍后再试!');
    } else {
      // 请求配置出错
      console.error('请求错误:', error.message);
      console.error('请求错误，请稍后再试!');
    }
    
    return Promise.reject(error);
  }
);

/**
 * 封装GET请求
 * @param url 请求地址
 * @param params 请求参数
 * @param config 请求配置
 * @param onSuccess 成功回调
 * @param onError 错误回调
 * @returns Promise
 */
export const get = async (url: string, params = {}, config = {}, onSuccess = null, onError = null) => {
  try {
    const response = await httpClient.get(url, { params, ...config });
    if (onSuccess) onSuccess(response);
    return response;
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
};

/**
 * 封装POST请求
 * @param url 请求地址
 * @param data 请求数据
 * @param config 请求配置
 * @param onSuccess 成功回调
 * @param onError 错误回调
 * @returns Promise
 */
export const post = async (url: string, data = {}, config = {}, onSuccess = null, onError = null) => {
  try {
    const response = await httpClient.post(url, data, config);
    if (onSuccess) onSuccess(response);
    return response;
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
};

/**
 * 封装PUT请求
 * @param url 请求地址
 * @param data 请求数据
 * @param config 请求配置
 * @param onSuccess 成功回调
 * @param onError 错误回调
 * @returns Promise
 */
export const put = async (url: string, data = {}, config = {}, onSuccess = null, onError = null) => {
  try {
    const response = await httpClient.put(url, data, config);
    if (onSuccess) onSuccess(response);
    return response;
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
};

/**
 * 封装DELETE请求
 * @param url 请求地址
 * @param config 请求配置
 * @param onSuccess 成功回调
 * @param onError 错误回调
 * @returns Promise
 */
export const del = async (url: string, config = {}, onSuccess = null, onError = null) => {
  try {
    const response = await httpClient.delete(url, config);
    if (onSuccess) onSuccess(response);
    return response;
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
};

/**
 * 封装PATCH请求
 * @param url 请求地址
 * @param data 请求数据
 * @param config 请求配置
 * @param onSuccess 成功回调
 * @param onError 错误回调
 * @returns Promise
 */
export const patch = async (url: string, data = {}, config = {}, onSuccess = null, onError = null) => {
  try {
    const response = await httpClient.patch(url, data, config);
    if (onSuccess) onSuccess(response);
    return response;
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
};

/**
 * 封装上传图片请求
 * @param url 请求地址
 * @param file 文件对象
 * @param additionalData 附加数据
 * @param config 请求配置
 * @param onSuccess 成功回调
 * @param onError 错误回调
 * @returns Promise
 */
export const uploadImage = async (url: string, file: File, additionalData = {}, config = {}, onSuccess = null, onError = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // 添加附加数据
    for (const key in additionalData) {
      if (Object.prototype.hasOwnProperty.call(additionalData, key)) {
        formData.append(key, additionalData[key]);
      }
    }

    // 设置Content-Type为multipart/form-data
    const response = await httpClient.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (onSuccess) onSuccess(response);
    return response;
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
};

// 导出httpClient实例，以便在需要时直接使用
export default httpClient;
