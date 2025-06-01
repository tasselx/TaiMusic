/**
 * 封面图片尺寸使用示例
 * 展示如何在不同场景下使用合适的封面图片尺寸
 */
import React from 'react';
import { 
  formatCoverUrl, 
  formatCoverUrlByUsage, 
  COVER_SIZES, 
  getCoverSizeByUsage,
  type CoverUsageType 
} from '../utils/formatters';
import CachedImage from '../components/CachedImage';

// 示例封面URL（酷狗音乐API格式）
const EXAMPLE_COVER_URL = "http://imge.kugou.com/stdmusic/{size}/20250101/20250101073202450754.jpg";

/**
 * 封面图片尺寸示例组件
 */
const CoverSizeExample: React.FC = () => {
  // 所有可用的使用场景
  const usageTypes: CoverUsageType[] = ['thumbnail', 'list', 'player', 'fullscreen'];

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white' }}>
      <h1>封面图片尺寸规格示例</h1>
      
      {/* 标准尺寸规格展示 */}
      <section style={{ marginBottom: '40px' }}>
        <h2>标准尺寸规格</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {Object.entries(COVER_SIZES).map(([key, size]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <h3>{key}: {size}px</h3>
              <div style={{ 
                width: `${Math.min(size, 150)}px`, 
                height: `${Math.min(size, 150)}px`, 
                margin: '0 auto',
                border: '1px solid #333'
              }}>
                <CachedImage
                  src={formatCoverUrl(EXAMPLE_COVER_URL, size)}
                  alt={`${key} size example`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#888' }}>
                实际尺寸: {size}px × {size}px
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 使用场景示例 */}
      <section style={{ marginBottom: '40px' }}>
        <h2>使用场景示例</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {usageTypes.map((usage) => {
            const size = getCoverSizeByUsage(usage);
            const displaySize = Math.min(size, 120);
            
            return (
              <div key={usage} style={{ 
                padding: '15px', 
                border: '1px solid #333', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ textTransform: 'capitalize' }}>{usage}</h3>
                <div style={{ 
                  width: `${displaySize}px`, 
                  height: `${displaySize}px`, 
                  margin: '10px auto',
                  border: '1px solid #555'
                }}>
                  <CachedImage
                    src={formatCoverUrlByUsage(EXAMPLE_COVER_URL, usage)}
                    alt={`${usage} usage example`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <p style={{ fontSize: '12px', color: '#888' }}>
                  使用场景: {usage}<br/>
                  图片尺寸: {size}px × {size}px
                </p>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '8px' }}>
                  <strong>适用组件:</strong><br/>
                  {getUsageDescription(usage)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* API 使用示例 */}
      <section>
        <h2>API 使用示例</h2>
        <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px' }}>
          <h3>代码示例:</h3>
          <pre style={{ fontSize: '12px', color: '#a0a0a0', overflow: 'auto' }}>
{`// 1. 直接指定尺寸
const url1 = formatCoverUrl(coverUrl, 150);

// 2. 根据使用场景自动选择尺寸
const url2 = formatCoverUrlByUsage(coverUrl, 'thumbnail');
const url3 = formatCoverUrlByUsage(coverUrl, 'list');
const url4 = formatCoverUrlByUsage(coverUrl, 'player');
const url5 = formatCoverUrlByUsage(coverUrl, 'fullscreen');

// 3. 获取特定场景的尺寸值
const thumbnailSize = getCoverSizeByUsage('thumbnail'); // 64
const listSize = getCoverSizeByUsage('list');           // 150
const playerSize = getCoverSizeByUsage('player');       // 240
const fullscreenSize = getCoverSizeByUsage('fullscreen'); // 480`}
          </pre>
        </div>
      </section>
    </div>
  );
};

/**
 * 获取使用场景的描述
 */
function getUsageDescription(usage: CoverUsageType): string {
  switch (usage) {
    case 'thumbnail':
      return '歌曲列表、搜索结果、播放列表中的小图标';
    case 'list':
      return '推荐列表、专辑列表、歌单网格';
    case 'player':
      return '播放器主界面、当前播放歌曲显示';
    case 'fullscreen':
      return '全屏播放界面、高清显示需求';
    default:
      return '未知场景';
  }
}

export default CoverSizeExample;
