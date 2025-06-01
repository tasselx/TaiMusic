/**
 * 用户服务
 * 封装与用户相关的API请求
 */
import { get } from '../utils/httpClient';
import { API_ENDPOINTS } from '../utils/api';

/**
 * 登录参数接口
 */
export interface LoginParams {
  username: string;
  password: string;
}

/**
 * 手机验证码登录参数接口
 */
export interface PhoneLoginParams {
  phone: string;
  code: string;
}

/**
 * 登录响应接口 - 根据实际API响应结构定义
 */
export interface LoginResponse {
  token: string;
  userId: number;       // 实际返回的是数字类型，但API可能返回userid字段
  nickname?: string;
  avatar?: string;
  vip_type?: number;    // VIP类型
  vip_token?: string;   // VIP令牌
}

/**
 * 二维码登录相关接口
 */
export interface QRCodeKeyResponse {
  qrcode: string;       // 二维码key
}

export interface QRCodeCreateResponse {
  base64: string;       // 二维码图片base64
}

export interface QRCodeCheckResponse {
  status: number;       // 二维码状态：0-过期，2-已扫码待确认，4-登录成功
  nickname?: string;    // 用户昵称（状态2时返回）
  token?: string;       // 登录token（状态4时返回）
  userid?: number;      // 用户ID（状态4时返回）
  pic?: string;         // 用户头像（状态4时返回）
  vip_type?: number;    // VIP类型（状态4时返回）
  vip_token?: string;   // VIP令牌（状态4时返回）
}

/**
 * 账号密码登录 - 完全按照Vue代码实现
 * @param params 登录参数
 * @returns Promise<LoginResponse>
 */
export const login = async (params: LoginParams): Promise<LoginResponse> => {
  try {
    console.log('账号登录请求:', { username: params.username, password: '***' });

    // 使用GET请求，参数放在URL中，与Vue代码保持一致
    // 对密码进行URL编码处理
    const encodedPassword = encodeURIComponent(params.password);
    const response = await get(`${API_ENDPOINTS.LOGIN}?username=${params.username}&password=${encodedPassword}`);

    console.log('账号登录响应:', response);

    // 检查响应状态，status === 1 表示登录成功
    if (response && response.status === 1) {
      return {
        token: response.data.token || '',
        userId: response.data.userid || response.data.userId || response.data.id || 0,
        nickname: response.data.nickname || response.data.username || '',
        avatar: response.data.pic || response.data.avatar || '',
        vip_type: response.data.vip_type || 0,
        vip_token: response.data.vip_token || ''
      };
    }

    // 如果登录失败，抛出错误信息
    const errorMessage = (response as any)?.message || (response as any)?.msg || '登录失败，请检查用户名和密码';
    throw new Error(errorMessage);
  } catch (error: any) {
    console.error('账号登录失败:', error);

    // 提取详细的错误信息
    if (error.response) {
      const responseData = error.response.data;
      const errorMessage = responseData?.message || responseData?.msg || responseData?.error || '登录失败，请检查用户名和密码';

      console.error('登录服务器错误响应:', {
        status: error.response.status,
        data: responseData
      });

      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('网络连接失败，请检查网络连接');
    } else {
      throw error;
    }
  }
};

/**
 * 手机验证码登录
 * @param params 手机验证码登录参数
 * @returns Promise<LoginResponse>
 */
export const phoneLogin = async (params: PhoneLoginParams): Promise<LoginResponse> => {
  try {
    console.log('手机号登录请求:', { mobile: params.phone, code: '***' });
    // 使用GET请求，参数放在URL中，与Vue代码保持一致
    const response = await get(`${API_ENDPOINTS.LOGIN_CELLPHONE}?mobile=${params.phone}&code=${params.code}`);

    console.log('手机号登录响应:', response);

    // 检查响应状态，status === 1 表示请求成功，与Vue代码保持一致
    if (response && response.status === 1) {
      const userData = response.data; // 用户数据在 data 中
      return {
        token: userData.token || '',
        userId: userData.userid || userData.id || 0, // 使用 userid 字段
        nickname: userData.nickname || '',
        avatar: userData.pic || '', // 使用 pic 字段作为头像
        vip_type: userData.vip_type || 0,
        vip_token: userData.vip_token || ''
      };
    }

    // 如果登录失败，抛出错误信息
    const errorMessage = (response as any)?.message || (response as any)?.msg || '登录失败，请检查手机号和验证码';
    throw new Error(errorMessage);
  } catch (error: any) {
    console.error('手机验证码登录失败:', error);

    // 提取详细的错误信息
    if (error.response) {
      const responseData = error.response.data;
      const errorMessage = responseData?.message || responseData?.msg || responseData?.error || '登录失败，请检查手机号和验证码';

      console.error('登录服务器错误响应:', {
        status: error.response.status,
        data: responseData
      });

      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('网络连接失败，请检查网络连接');
    } else {
      throw error;
    }
  }
};

/**
 * 发送验证码
 * @param phone 手机号
 * @returns Promise<{ success: boolean; message?: string; errorCode?: string; errorDetails?: any }>
 */
export const sendVerificationCode = async (phone: string): Promise<{ success: boolean; message?: string; errorCode?: string; errorDetails?: any }> => {
  try {
    console.log('发送验证码请求:', { mobile: phone });
    // 使用GET请求，参数放在URL中，与Vue代码保持一致
    const response = await get(`${API_ENDPOINTS.CAPTCHA_SENT}?mobile=${phone}`);

    console.log('发送验证码响应:', response);

    // 检查响应状态，status === 1 表示请求成功
    if (response && response.status === 1) {
      return {
        success: true,
        message: (response as any).message || '验证码已发送'
      };
    } else {
      // 返回服务器的具体错误信息
      return {
        success: false,
        message: (response as any)?.message || (response as any)?.msg || '发送验证码失败',
        errorCode: (response as any)?.code?.toString() || (response as any)?.status?.toString(),
        errorDetails: response
      };
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error);

    // 详细的错误信息提取
    let errorMessage = '发送验证码失败，请稍后重试';
    let errorCode = 'UNKNOWN_ERROR';
    let errorDetails = error;

    if (error.response) {
      // 服务器返回了错误响应
      const responseData = error.response.data;
      errorMessage = responseData?.message || responseData?.msg || responseData?.error || `服务器错误 (${error.response.status})`;
      errorCode = responseData?.code?.toString() || error.response.status?.toString();
      errorDetails = responseData;

      console.error('服务器错误响应:', {
        status: error.response.status,
        data: responseData,
        headers: error.response.headers
      });
    } else if (error.request) {
      // 请求已发出但没有收到响应
      errorMessage = '网络连接失败，请检查网络连接';
      errorCode = 'NETWORK_ERROR';
      console.error('网络错误:', error.request);
    } else {
      // 请求配置出错
      errorMessage = '请求配置错误: ' + error.message;
      errorCode = 'REQUEST_CONFIG_ERROR';
      console.error('请求配置错误:', error.message);
    }

    return {
      success: false,
      message: errorMessage,
      errorCode,
      errorDetails
    };
  }
};

/**
 * 获取二维码key
 * @returns Promise<string>
 */
export const getQRCodeKey = async (): Promise<string> => {
  try {
    console.log('📝 调用获取二维码key API...');
    // 获取二维码 key - 完全按照Vue代码实现
    const keyResponse: any = await get(API_ENDPOINTS.LOGIN_QR_KEY);
    console.log('📝 获取二维码key响应:', keyResponse);

    // httpClient已经返回了response.data，所以直接访问status和data
    if (keyResponse.status === 1) {
      const qrKey = keyResponse.data.qrcode;
      console.log('✅ 获取二维码key成功:', qrKey);
      return qrKey;
    } else {
      console.error('❌ 获取二维码key失败，状态码:', keyResponse.status);
      throw new Error('二维码key生成失败');
    }
  } catch (error: any) {
    console.error('❌ 获取二维码key失败:', error);
    throw new Error(error?.message || '二维码key生成失败');
  }
};

/**
 * 创建二维码
 * @param key 二维码key
 * @returns Promise<string> 返回二维码图片的base64字符串
 */
export const createQRCode = async (key: string): Promise<string> => {
  try {
    console.log('🎨 调用创建二维码 API，key:', key);
    // 使用 key 创建二维码 - 完全按照Vue代码实现
    const qrResponse: any = await get(`${API_ENDPOINTS.LOGIN_QR_CREATE}?key=${key}&qrimg=true`);
    console.log('🎨 创建二维码响应:', qrResponse);

    // httpClient已经返回了response.data，所以直接访问code和data
    if (qrResponse.code === 200) {
      const base64Image = qrResponse.data.base64;
      console.log('✅ 创建二维码成功，base64长度:', base64Image?.length);
      return base64Image;
    } else {
      console.error('❌ 创建二维码失败，状态码:', qrResponse.code);
      throw new Error('获取二维码失败');
    }
  } catch (error: any) {
    console.error('❌ 创建二维码失败:', error);
    throw new Error(error?.message || '二维码生成失败');
  }
};

/**
 * 检查二维码扫描状态
 * @param key 二维码key
 * @returns Promise<QRCodeCheckResponse>
 */
export const checkQRCodeStatus = async (key: string): Promise<QRCodeCheckResponse> => {
  try {
    console.log('🔍 调用检查二维码状态 API，key:', key);
    // 添加时间戳防止缓存，移除Cache-Control请求头以避免CORS问题
    const response: any = await get(`${API_ENDPOINTS.LOGIN_QR_CHECK}?key=${key}&timestamp=${Date.now()}`);
    console.log('🔍 检查二维码状态响应:', response);

    // 检查响应状态，status === 1 表示请求成功 - 完全按照Vue代码实现
    if (response.status === 1) {
      const statusData = {
        status: response.data.status,
        nickname: response.data.nickname,
        token: response.data.token,
        userid: response.data.userid,
        pic: response.data.pic,
        vip_type: response.data.vip_type,
        vip_token: response.data.vip_token
      };
      console.log('✅ 检查二维码状态成功:', statusData);
      return statusData;
    }

    console.error('❌ 检查二维码状态失败，响应状态:', response.status);
    throw new Error('检查二维码状态失败');
  } catch (error: any) {
    console.error('❌ 检查二维码状态失败:', error);
    throw new Error(error?.message || '检查二维码状态失败，请稍后重试');
  }
};


