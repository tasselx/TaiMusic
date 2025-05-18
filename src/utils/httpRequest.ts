/**
 * HTTP请求工具
 * 基于axios封装的HTTP请求工具，提供统一的请求接口和错误处理
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * 响应数据接口
 */
export interface ResponseData<T = any> {
  code?: number;
  status?: number;
  errcode?: number;
  data: T;
  message?: string;
  error?: string;
  [key: string]: any;
}

/**
 * 请求配置接口
 * 扩展AxiosRequestConfig，添加自定义配置项
 */
export interface RequestConfig extends AxiosRequestConfig {
  // 是否显示错误提示，默认为true
  showError?: boolean;
  // 自定义错误处理函数
  errorHandler?: (error: any) => void;
  // 请求重试次数
  retryCount?: number;
  // 请求重试延迟(ms)
  retryDelay?: number;
}

/**
 * HTTP请求类
 * 封装axios，提供统一的请求接口和错误处理
 */
class HttpRequest {
  // axios实例
  private instance: AxiosInstance;
  // 默认配置
  private defaultConfig: RequestConfig = {
    baseURL: '/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    showError: true,
    retryCount: 0,
    retryDelay: 1000,
  };

  /**
   * 构造函数
   * @param config 自定义配置，会与默认配置合并
   */
  constructor(config: RequestConfig = {}) {
    // 合并配置
    this.defaultConfig = { ...this.defaultConfig, ...config };
    // 创建axios实例
    this.instance = axios.create(this.defaultConfig);
    
    // 初始化拦截器
    this.initInterceptors();
  }

  /**
   * 初始化拦截器
   */
  private initInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 在发送请求之前做些什么
        return config;
      },
      (error) => {
        // 对请求错误做些什么
        console.error('请求错误:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        // 对响应数据做些什么
        return response;
      },
      (error) => {
        // 对响应错误做些什么
        return this.handleError(error);
      }
    );
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @returns Promise.reject(error)
   */
  private handleError(error: AxiosError): Promise<never> {
    if (error.config && (error.config as RequestConfig).errorHandler) {
      (error.config as RequestConfig).errorHandler(error);
    } else if ((error.config as RequestConfig)?.showError !== false) {
      // 默认错误处理
      let message = '请求失败';
      
      if (error.response) {
        // 服务器返回错误状态码
        const status = error.response.status;
        switch (status) {
          case 400:
            message = '请求参数错误';
            break;
          case 401:
            message = '未授权，请重新登录';
            break;
          case 403:
            message = '拒绝访问';
            break;
          case 404:
            message = '请求的资源不存在';
            break;
          case 500:
            message = '服务器内部错误';
            break;
          default:
            message = `请求错误 (${status})`;
        }
      } else if (error.request) {
        // 请求已发出但没有收到响应
        message = '网络错误，服务器无响应';
      }
      
      console.error(`请求错误: ${message}`, error);
    }

    // 处理重试逻辑
    const config = error.config as RequestConfig;
    if (config && config.retryCount && config.retryCount > 0) {
      config.retryCount--;
      const delayRetryRequest = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log(`重试请求: ${config.url}`);
          resolve();
        }, config.retryDelay || 1000);
      });
      
      return delayRetryRequest.then(() => this.request(config));
    }

    return Promise.reject(error);
  }

  /**
   * 发送请求
   * @param config 请求配置
   * @returns Promise<AxiosResponse<ResponseData<T>>>
   */
  public request<T = any>(config: RequestConfig): Promise<AxiosResponse<ResponseData<T>>> {
    return this.instance.request(config);
  }

  /**
   * GET请求
   * @param url 请求地址
   * @param params 请求参数
   * @param config 请求配置
   * @returns Promise<ResponseData<T>>
   */
  public get<T = any>(
    url: string,
    params?: any,
    config?: RequestConfig
  ): Promise<ResponseData<T>> {
    return this.instance
      .get(url, { params, ...config })
      .then((res) => res.data);
  }

  /**
   * POST请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<ResponseData<T>>
   */
  public post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ResponseData<T>> {
    return this.instance
      .post(url, data, config)
      .then((res) => res.data);
  }

  /**
   * PUT请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<ResponseData<T>>
   */
  public put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ResponseData<T>> {
    return this.instance
      .put(url, data, config)
      .then((res) => res.data);
  }

  /**
   * DELETE请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns Promise<ResponseData<T>>
   */
  public delete<T = any>(
    url: string,
    config?: RequestConfig
  ): Promise<ResponseData<T>> {
    return this.instance
      .delete(url, config)
      .then((res) => res.data);
  }

  /**
   * 获取axios实例
   * @returns AxiosInstance
   */
  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

// 创建默认实例
const httpRequest = new HttpRequest();

export default httpRequest;
