# 跨域问题完整解决方案

## 🎯 解决方案概述

本项目采用多层次的跨域解决方案，确保在不同环境下都能正常工作：

1. **服务器端CORS配置优化**
2. **Vite开发代理配置**
3. **环境自适应API配置**
4. **HTTP客户端统一管理**

## 🔧 具体实现

### 1. 服务器端CORS配置 (`src-tauri/src/assets/server.js`)

**优化前**：
```javascript
'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type'
```

**优化后**：
```javascript
'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type,Cache-Control,Authorization,Accept,Origin,User-Agent,DNT,Keep-Alive,X-Mx-ReqToken,X-Data-Type,X-Auth-Token,X-Language',
'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS,PATCH,HEAD',
'Access-Control-Expose-Headers': 'Set-Cookie'
```

**改进点**：
- ✅ 支持更多常用请求头
- ✅ 支持所有HTTP方法
- ✅ 暴露Set-Cookie头用于认证

### 2. Vite代理配置 (`vite.config.ts`)

**新增配置**：
```typescript
server: {
  port: 1420,
  strictPort: true,
  host: 'localhost',
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:3000',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/api/, ''),
      configure: (proxy, _options) => {
        // 添加详细的代理日志
        proxy.on('error', (err, _req, _res) => {
          console.log('proxy error', err);
        });
        proxy.on('proxyReq', (proxyReq, req, _res) => {
          console.log('Sending Request to the Target:', req.method, req.url);
        });
        proxy.on('proxyRes', (proxyRes, req, _res) => {
          console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
        });
      },
    }
  }
}
```

**特点**：
- ✅ 开发环境下避免跨域问题
- ✅ 详细的代理日志便于调试
- ✅ 自动重写API路径

### 3. 环境自适应配置 (`src/config/api.ts`)

**新增功能**：
```typescript
const apiConfigs: Record<Environment, ApiConfig> = {
  // 开发环境 - 使用Vite代理
  development: {
    baseURL: '/api',
    timeout: 10000,
    withCredentials: true,
  },
  
  // 生产环境 - 直接连接API服务器
  production: {
    baseURL: 'http://127.0.0.1:3000',
    timeout: 10000,
    withCredentials: true,
  },
  
  // Tauri环境 - 直接连接API服务器
  tauri: {
    baseURL: 'http://127.0.0.1:3000',
    timeout: 10000,
    withCredentials: true,
  },
};
```

**优势**：
- ✅ 自动检测运行环境
- ✅ 开发环境使用代理避免跨域
- ✅ 生产环境直连API服务器
- ✅ 统一的配置管理

### 4. HTTP客户端更新 (`src/utils/httpClient.ts`)

**更新内容**：
```typescript
import { currentApiConfig } from '../config/api';

const httpClient = axios.create({
  baseURL: currentApiConfig.baseURL,
  timeout: currentApiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: currentApiConfig.withCredentials,
});
```

**改进**：
- ✅ 使用环境配置自动选择API地址
- ✅ 统一的超时和认证配置

## 🌐 不同环境的工作方式

### 开发环境 (npm run dev)
```
前端 (localhost:1420) → Vite代理 (/api/*) → API服务器 (127.0.0.1:3000)
```
- 无跨域问题
- 请求路径：`/api/everyday/recommend`
- 实际转发：`http://127.0.0.1:3000/everyday/recommend`

### 生产环境 / Tauri环境
```
前端 → 直接请求 → API服务器 (127.0.0.1:3000)
```
- 依赖服务器CORS配置
- 请求路径：`http://127.0.0.1:3000/everyday/recommend`

## 🧪 测试验证

### 1. 开发环境测试
```bash
npm run dev
```
- 检查浏览器网络面板
- 确认请求路径为 `/api/*`
- 确认无CORS错误

### 2. 生产环境测试
```bash
npm run build
npm run preview
```
- 检查请求路径为完整URL
- 确认CORS头正确设置

### 3. API功能测试
- 每日推荐加载
- 歌曲播放功能
- 用户登录功能
- 搜索功能

## 📋 检查清单

- [x] 服务器CORS头配置完整
- [x] Vite代理配置正确
- [x] 环境检测逻辑实现
- [x] HTTP客户端使用新配置
- [x] 开发环境测试通过
- [x] 代理日志输出正常

## 🔍 故障排除

### 问题1：开发环境仍有跨域错误
**解决**：检查请求是否使用了 `/api` 前缀

### 问题2：生产环境API请求失败
**解决**：确认API服务器运行在 `127.0.0.1:3000`

### 问题3：认证信息丢失
**解决**：确认 `withCredentials: true` 配置正确

## 📝 注意事项

1. **开发环境**：所有API请求必须使用 `/api` 前缀
2. **生产环境**：确保API服务器可访问
3. **Tauri环境**：使用直连模式，依赖CORS配置
4. **调试**：查看控制台的代理日志和环境检测信息

## ✨ 总结

通过这套完整的跨域解决方案：
- ✅ 开发环境零配置，自动代理
- ✅ 生产环境CORS配置完善
- ✅ 环境自适应，无需手动切换
- ✅ 统一的HTTP客户端管理
- ✅ 详细的日志和调试信息
