/**
 * 缓存图片组件
 * 自动处理图片缓存，提供加载状态和错误处理
 */
import React, { useState, useEffect } from 'react';
import { getCachedImage, cacheImage } from '../utils/imageCache';
import { DEFAULT_COVER } from '../constants';

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

        // 如果没有缓存，尝试使用原生fetch加载图片
        // 避免httpClient的响应拦截器可能造成的问题
        const response = await fetch(src, {
          mode: 'cors',
          cache: 'default'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        if (!blob || !(blob instanceof Blob)) {
          throw new Error(`Failed to fetch image: invalid blob response`);
        }

        // 缓存图片
        await cacheImage(src, blob);

        if (isMounted) {
          const objectUrl = URL.createObjectURL(blob);
          setImageSrc(objectUrl);
          setIsLoading(false);
          onLoad?.();
        }
      } catch (error) {
        console.error('CachedImage: 加载图片失败:', src, error);

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
