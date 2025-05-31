# TaiMusic 状态管理

本项目使用 Zustand 进行状态管理。Zustand 是一个轻量级的状态管理库，提供了简单而强大的 API，非常适合 React 应用。

## 状态管理结构

项目的状态管理分为以下几个模块：

### 1. 播放器状态 (playerStore)

管理音乐播放器相关的状态，包括：
- 当前播放状态
- 当前播放歌曲
- 播放列表
- 播放进度
- 音量
- 播放模式

```typescript
// 使用示例
import { usePlayerStore } from './store';

const MyComponent = () => {
  const { isPlaying, togglePlay, currentSong } = usePlayerStore();
  
  return (
    <button onClick={togglePlay}>
      {isPlaying ? '暂停' : '播放'}
    </button>
  );
};
```

### 2. UI 状态 (uiStore)

管理界面相关的状态，包括：
- 窗口尺寸
- 最大化状态
- 当前活动页面
- 侧边栏折叠状态

```typescript
// 使用示例
import { useUIStore } from './store';

const MyComponent = () => {
  const { windowWidth, isMaximized } = useUIStore();
  
  return (
    <div className={isMaximized ? 'fullscreen' : ''}>
      {/* 组件内容 */}
    </div>
  );
};
```

### 3. 搜索状态 (searchStore)

管理搜索相关的状态，包括：
- 搜索关键词
- 搜索结果
- 搜索历史
- 搜索状态

```typescript
// 使用示例
import { useSearchStore } from './store';

const MyComponent = () => {
  const { searchTerm, searchResults, performSearch } = useSearchStore();
  
  return (
    <>
      <input 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
      <button onClick={performSearch}>搜索</button>
      
      {searchResults.map(result => (
        <div key={result.id}>{result.name}</div>
      ))}
    </>
  );
};
```

### 4. 用户状态 (userStore)

管理用户相关的状态，包括：
- 用户信息
- 登录状态
- 登录错误信息

```typescript
// 使用示例
import { useUserStore } from './store';

const MyComponent = () => {
  const { userInfo, logout } = useUserStore();

  return (
    <>
      {userInfo ? (
        <>
          <div>欢迎, {userInfo.username}</div>
          <button onClick={logout}>退出登录</button>
        </>
      ) : (
        <button>登录</button>
      )}
    </>
  );
};
```

### 5. API 状态 (apiStore)

管理 API 相关的状态，包括：
- API 服务状态
- 轮播图数据
- 推荐歌单

```typescript
// 使用示例
import { useApiStore } from './store';

const MyComponent = () => {
  const { apiStatus, banners } = useApiStore();
  
  return (
    <>
      {apiStatus.status === 'success' ? (
        <div>
          {banners.map(banner => (
            <img key={banner.id} src={banner.imageUrl} alt={banner.title} />
          ))}
        </div>
      ) : (
        <div>加载中...</div>
      )}
    </>
  );
};
```

## 类型定义

所有状态相关的类型定义都在 `types.ts` 文件中，包括：
- 加载状态类型
- API 响应状态类型
- 搜索结果类型
- 歌单类型
- 歌曲类型
- 轮播图类型
- 用户类型

## 持久化存储

用户状态使用 Zustand 的 persist 中间件进行持久化存储，确保用户登录信息在页面刷新后仍然保持。
