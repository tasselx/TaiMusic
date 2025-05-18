/**
 * 缓存图片组件
 * 自动处理图片缓存，提供加载状态和错误处理
 */
import React, { useState, useEffect } from 'react';
import { getCachedImage, cacheImage } from '../utils/imageCache';
import { DEFAULT_COVER } from '../constants';
import httpClient from '../utils/httpClient';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const CachedImage: React.FC<CachedImageProps> = ({
  src,
  alt,
  fallbackSrc = DEFAULT_COVER,
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(fallbackSrc);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!src) {
        setImageSrc(fallbackSrc);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setHasError(false);

        // 尝试从缓存获取图片
        const cachedBlob = await getCachedImage(src);

        if (cachedBlob && isMounted) {
          // 如果有缓存，直接使用
          const objectUrl = URL.createObjectURL(cachedBlob);
          setImageSrc(objectUrl);
          setIsLoading(false);
          onLoad?.();
          return;
        }

        // 如果没有缓存，使用httpClient从网络加载
        const response = await httpClient.get(src, {}, {
          responseType: 'blob',
          baseURL: '', // 覆盖默认的baseURL，直接使用完整URL
          timeout: 15000 // 图片加载可能需要更长的超时时间
        });

        if (!response.data) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = response.data;

        // 缓存图片
        await cacheImage(src, blob);

        if (isMounted) {
          const objectUrl = URL.createObjectURL(blob);
          setImageSrc(objectUrl);
          setIsLoading(false);
          onLoad?.();
        }
      } catch (error) {
        console.error('加载图片失败:', error);

        if (isMounted) {
          setImageSrc(fallbackSrc);
          setIsLoading(false);
          setHasError(true);
          onError?.();
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src, fallbackSrc, onLoad, onError]);

  return (
    <>
      {isLoading && (
        <div className="image-loading-placeholder" style={{ width: '100%', height: '100%' }}>
          <div className="loading-spinner"></div>
        </div>
      )}
      <img
        {...props}
        src={imageSrc}
        alt={alt}
        style={{
          ...props.style,
          display: isLoading ? 'none' : 'block'
        }}
      />
    </>
  );
};

export default CachedImage;
