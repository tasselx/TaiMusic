/**
 * 用户服务
 * 封装与用户相关的API请求
 */
import { get, post } from '../utils/httpClient';

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string;
  username: string;
  nickname?: string;
  avatar: string;
  token?: string;
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
 * 登录响应接口
 */
export interface LoginResponse {
  token: string;
  userId: string;
  nickname?: string;
  avatar?: string;
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
    const response = await post('/login/cellphone', {
      phone: params.phone,
      captcha: params.code
    });

    if (response && response.data) {
      return {
        token: response.data.token || '',
        userId: response.data.userId || response.data.id || '',
        nickname: response.data.nickname || response.data.username || '',
        avatar: response.data.avatar || ''
      };
    }

    throw new Error('登录失败，请检查手机号和验证码');
  } catch (error) {
    console.error('手机验证码登录失败:', error);
    throw error;
  }
};

/**
 * 发送验证码
 * @param phone 手机号
 * @returns Promise<boolean>
 */
export const sendVerificationCode = async (phone: string): Promise<boolean> => {
  try {
    const response = await post('/captcha/sent', { phone });

    return response && response.code === 200;
  } catch (error) {
    console.error('发送验证码失败:', error);
    return false;
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

    return response && response.code === 200;
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

    return response && (response.code === 200 || response.status === 200);
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

    return response && (response.code === 200 || response.status === 200);
  } catch (error) {
    console.error('退出登录失败:', error);
    return false;
  }
};
