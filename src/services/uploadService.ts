/**
 * 上传服务
 * 封装与文件上传相关的API请求
 */
import { uploadImage } from '../utils/httpClient';

/**
 * 上传结果接口
 */
export interface UploadResult {
  success: boolean;
  url?: string;
  message?: string;
}

/**
 * 上传图片
 * @param file 图片文件
 * @param type 图片类型（avatar: 头像, cover: 封面, other: 其他）
 * @returns Promise<UploadResult>
 */
export const uploadImageFile = async (file: File, type: 'avatar' | 'cover' | 'other' = 'other'): Promise<UploadResult> => {
  try {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        message: '只能上传图片文件'
      };
    }
    
    // 验证文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        message: '图片大小不能超过5MB'
      };
    }
    
    // 根据类型选择不同的上传接口
    let uploadUrl = '/upload';
    switch (type) {
      case 'avatar':
        uploadUrl = '/upload/avatar';
        break;
      case 'cover':
        uploadUrl = '/upload/cover';
        break;
      default:
        uploadUrl = '/upload/image';
    }
    
    // 上传图片
    const response = await uploadImage(uploadUrl, file, { type });
    
    if (response && response.code === 200 && response.data && response.data.url) {
      return {
        success: true,
        url: response.data.url
      };
    }
    
    return {
      success: false,
      message: '上传失败，请稍后重试'
    };
  } catch (error) {
    console.error('上传图片失败:', error);
    return {
      success: false,
      message: '上传失败，请稍后重试'
    };
  }
};

/**
 * 上传音频文件
 * @param file 音频文件
 * @param metadata 音频元数据
 * @returns Promise<UploadResult>
 */
export const uploadAudioFile = async (file: File, metadata: {
  title?: string;
  artist?: string;
  album?: string;
} = {}): Promise<UploadResult> => {
  try {
    // 验证文件类型
    if (!file.type.startsWith('audio/')) {
      return {
        success: false,
        message: '只能上传音频文件'
      };
    }
    
    // 验证文件大小（限制为50MB）
    if (file.size > 50 * 1024 * 1024) {
      return {
        success: false,
        message: '音频大小不能超过50MB'
      };
    }
    
    // 构建表单数据
    const formData = new FormData();
    formData.append('file', file);
    
    // 添加元数据
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.artist) formData.append('artist', metadata.artist);
    if (metadata.album) formData.append('album', metadata.album);
    
    // 上传音频
    const response = await uploadImage('/upload/audio', file, metadata);
    
    if (response && response.code === 200 && response.data && response.data.url) {
      return {
        success: true,
        url: response.data.url
      };
    }
    
    return {
      success: false,
      message: '上传失败，请稍后重试'
    };
  } catch (error) {
    console.error('上传音频失败:', error);
    return {
      success: false,
      message: '上传失败，请稍后重试'
    };
  }
};
