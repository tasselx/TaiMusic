/**
 * 颜色提取工具
 * 从图片中提取主色调，用于动态背景色
 */

// 颜色信息接口
export interface ColorInfo {
  rgb: [number, number, number];
  hex: string;
  hsl: [number, number, number];
  luminance: number;
}

// 颜色主题接口
export interface ColorTheme {
  primary: ColorInfo;
  secondary: ColorInfo;
  background: string;
  backgroundGradient: string;
  textColor: string;
  isDark: boolean;
}

// 缓存颜色结果
const colorCache = new Map<string, ColorTheme>();

/**
 * RGB转HSL
 * @param r 红色值 (0-255)
 * @param g 绿色值 (0-255)
 * @param b 蓝色值 (0-255)
 * @returns HSL数组 [h, s, l]
 */
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

/**
 * 计算颜色亮度
 * @param r 红色值 (0-255)
 * @param g 绿色值 (0-255)
 * @param b 蓝色值 (0-255)
 * @returns 亮度值 (0-1)
 */
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * RGB转十六进制
 * @param r 红色值 (0-255)
 * @param g 绿色值 (0-255)
 * @param b 蓝色值 (0-255)
 * @returns 十六进制颜色字符串
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${[r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
};

/**
 * 创建颜色信息对象
 * @param rgb RGB数组
 * @returns 颜色信息对象
 */
const createColorInfo = (rgb: [number, number, number]): ColorInfo => {
  const [r, g, b] = rgb;
  return {
    rgb,
    hex: rgbToHex(r, g, b),
    hsl: rgbToHsl(r, g, b),
    luminance: getLuminance(r, g, b)
  };
};

/**
 * 从图片数据中提取主要颜色
 * @param imageData 图片像素数据
 * @param sampleSize 采样大小，用于性能优化
 * @returns 主要颜色数组
 */
const extractColorsFromImageData = (imageData: ImageData, sampleSize: number = 10): ColorInfo[] => {
  const { data, width, height } = imageData;
  const colorMap = new Map<string, number>();
  
  // 采样像素以提高性能
  for (let y = 0; y < height; y += sampleSize) {
    for (let x = 0; x < width; x += sampleSize) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];
      
      // 跳过透明像素
      if (a < 128) continue;
      
      // 跳过过于接近白色或黑色的像素
      const luminance = getLuminance(r, g, b);
      if (luminance > 0.9 || luminance < 0.1) continue;
      
      // 量化颜色以减少颜色数量
      const quantizedR = Math.round(r / 32) * 32;
      const quantizedG = Math.round(g / 32) * 32;
      const quantizedB = Math.round(b / 32) * 32;
      
      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
      colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
    }
  }
  
  // 按出现频率排序并返回前几个颜色
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([colorKey]) => {
      const [r, g, b] = colorKey.split(',').map(Number);
      return createColorInfo([r, g, b]);
    });
  
  return sortedColors;
};

/**
 * 生成颜色主题
 * @param colors 提取的颜色数组
 * @returns 颜色主题
 */
const generateColorTheme = (colors: ColorInfo[]): ColorTheme => {
  if (colors.length === 0) {
    // 默认主题
    const defaultPrimary = createColorInfo([74, 144, 226]);
    return {
      primary: defaultPrimary,
      secondary: defaultPrimary,
      background: 'rgba(0, 0, 0, 0.8)',
      backgroundGradient: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7))',
      textColor: '#ffffff',
      isDark: true
    };
  }
  
  const primary = colors[0];
  const secondary = colors[1] || primary;
  const isDark = primary.luminance < 0.5;
  
  // 生成背景渐变
  const [r, g, b] = primary.rgb;
  const backgroundGradient = `linear-gradient(135deg, 
    rgba(${r}, ${g}, ${b}, 0.9), 
    rgba(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}, 0.7),
    rgba(0, 0, 0, 0.8)
  )`;
  
  return {
    primary,
    secondary,
    background: `rgba(${r}, ${g}, ${b}, 0.8)`,
    backgroundGradient,
    textColor: isDark ? '#ffffff' : '#000000',
    isDark
  };
};

/**
 * 从图片URL提取颜色主题
 * @param imageUrl 图片URL
 * @returns Promise<ColorTheme>
 */
export const extractColorThemeFromImage = async (imageUrl: string): Promise<ColorTheme> => {
  // 检查缓存
  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }
  
  try {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // 创建canvas来获取图片数据
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('无法获取canvas上下文');
          }
          
          // 缩放图片以提高性能
          const maxSize = 100;
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          // 绘制图片
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // 获取图片数据
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // 提取颜色
          const colors = extractColorsFromImageData(imageData);
          
          // 生成主题
          const theme = generateColorTheme(colors);
          
          // 缓存结果
          colorCache.set(imageUrl, theme);
          
          resolve(theme);
        } catch (error) {
          console.error('颜色提取失败:', error);
          resolve(generateColorTheme([])); // 返回默认主题
        }
      };
      
      img.onerror = () => {
        console.error('图片加载失败:', imageUrl);
        resolve(generateColorTheme([])); // 返回默认主题
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('颜色提取过程出错:', error);
    return generateColorTheme([]); // 返回默认主题
  }
};

/**
 * 清理颜色缓存
 */
export const clearColorCache = (): void => {
  colorCache.clear();
};

/**
 * 获取缓存大小
 */
export const getColorCacheSize = (): number => {
  return colorCache.size();
};
