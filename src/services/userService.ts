/**
 * 用户服务
 * 封装与用户相关的API请求
 */
import { get, post } from '../utils/httpClient';
import { API_ENDPOINTS } from '../utils/api';

/**
 * 用户信息接口 - 根据实际API响应结构定义
 */
export interface UserInfo {
  id: string;
  username: string;
  nickname?: string;
  avatar: string;
  token?: string;
  vip_type?: number;    // VIP类型 (0:普通 1:VIP)
  vip_token?: string;   // VIP令牌
}

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
  userId: number;       // 实际返回的是数字类型
  nickname?: string;
  avatar?: string;
  vip_type?: number;    // VIP类型
  vip_token?: string;   // VIP令牌
}

/**
 * 用户登录
 * @param params 登录参数
 * @returns Promise<LoginResponse>
 */
export const login = async (params: LoginParams): Promise<LoginResponse> => {
  try {
    const response = await post('/login', params);

    if (response && response.data) {
      return {
        token: response.data.token || '',
        userId: response.data.userId || response.data.id || '',
        nickname: response.data.nickname || response.data.username || '',
        avatar: response.data.avatar || ''
      };
    }

    throw new Error('登录失败，请检查用户名和密码');
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
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
 * 验证验证码
 * @param phone 手机号
 * @param code 验证码
 * @returns Promise<boolean>
 */
export const verifyCode = async (phone: string, code: string): Promise<boolean> => {
  try {
    const response = await post('/captcha/verify', { phone, captcha: code });

    return response && response.status === 1;
  } catch (error) {
    console.error('验证验证码失败:', error);
    return false;
  }
};

/**
 * 获取用户详情
 * @param userId 用户ID
 * @returns Promise<UserInfo>
 */
export const getUserDetail = async (userId: string): Promise<UserInfo> => {
  try {
    const response = await get('/user/detail', { userid: userId });

    if (response && response.data) {
      return {
        id: userId,
        username: response.data.nickname || `用户${userId.substring(0, 4)}`,
        nickname: response.data.nickname,
        avatar: response.data.avatar || 'https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg',
      };
    }

    // 如果没有获取到用户信息，使用默认值
    return {
      id: userId,
      username: `用户${userId.substring(0, 4)}`,
      avatar: 'https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg',
    };
  } catch (error) {
    console.error('获取用户详情失败:', error);
    // 返回默认用户信息
    return {
      id: userId,
      username: `用户${userId.substring(0, 4)}`,
      avatar: 'https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg',
    };
  }
};

/**
 * 检查用户登录状态
 * @param token 用户令牌
 * @returns Promise<boolean>
 */
export const checkUserStatus = async (token: string): Promise<boolean> => {
  try {
    const response = await get('/user/status', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response && response.status === 1;
  } catch (error) {
    console.error('检查用户状态失败:', error);
    return false;
  }
};

/**
 * 退出登录
 * @returns Promise<boolean>
 */
export const logout = async (): Promise<boolean> => {
  try {
    const response = await post('/logout');

    return response && response.status === 1;
  } catch (error) {
    console.error('退出登录失败:', error);
    return false;
  }
};
