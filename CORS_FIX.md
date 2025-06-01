# CORS 问题修复说明

## 🚨 问题描述

在二维码登录功能中遇到了CORS（跨域资源共享）错误：

```
Access to XMLHttpRequest at 'http://127.0.0.1:3000/login/qr/check?key=...' 
from origin 'http://localhost:1420' has been blocked by CORS policy: 
Request header field cache-control is not allowed by Access-Control-Allow-Headers in preflight response.
```

## 🔍 问题分析

### 根本原因
1. **前端应用**运行在 `http://localhost:1420`
2. **API服务器**运行在 `http://127.0.0.1:3000`
3. **跨域请求**：前端向API服务器发送请求时触发CORS预检请求
4. **请求头冲突**：我们在请求中添加了 `Cache-Control: no-cache` 请求头
5. **服务器限制**：API服务器的CORS配置只允许特定的请求头

### 服务器CORS配置
在 `src-tauri/src/assets/server.js` 第72行：
```javascript
'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type'
```

服务器只允许 `X-Requested-With` 和 `Content-Type` 请求头，但我们的请求包含了 `Cache-Control` 请求头。

## ✅ 解决方案

### 方案1：移除客户端Cache-Control请求头（已实施）

**修改文件**: `src/services/userService.ts`

**修改前**:
```typescript
const response: any = await get(`${API_ENDPOINTS.LOGIN_QR_CHECK}?key=${key}&timestamp=${Date.now()}`, {}, {
  headers: {
    'Cache-Control': 'no-cache'
  }
});
```

**修改后**:
```typescript
const response: any = await get(`${API_ENDPOINTS.LOGIN_QR_CHECK}?key=${key}&timestamp=${Date.now()}`);
```

**原理**:
- 移除了 `Cache-Control` 请求头，避免CORS冲突
- 保留URL中的时间戳参数 `timestamp=${Date.now()}` 来防止缓存
- 时间戳参数同样能有效防止浏览器和代理服务器缓存响应

### 方案2：修改服务器CORS配置（备选方案）

如果需要保留 `Cache-Control` 请求头，可以修改服务器配置：

**文件**: `src-tauri/src/assets/server.js` 第72行

**修改前**:
```javascript
'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type'
```

**修改后**:
```javascript
'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type,Cache-Control'
```

## 🎯 防缓存策略

### 当前实现
使用URL时间戳参数防止缓存：
```typescript
`${API_ENDPOINTS.LOGIN_QR_CHECK}?key=${key}&timestamp=${Date.now()}`
```

### 效果
- ✅ 每次请求都有唯一的URL
- ✅ 浏览器不会缓存响应
- ✅ 代理服务器也不会缓存
- ✅ 避免了CORS问题

## 🧪 测试验证

### 测试步骤
1. 启动应用：`npm run dev`
2. 打开登录弹窗
3. 切换到"扫码登录"标签页
4. 观察浏览器网络面板，确认：
   - 请求成功发送
   - 没有CORS错误
   - 每次请求URL都包含不同的时间戳

### 预期结果
- ✅ 二维码正常生成
- ✅ 状态轮询正常工作
- ✅ 没有CORS错误
- ✅ 登录流程完整

## 📝 技术说明

### CORS预检请求
当浏览器发送跨域请求且包含自定义请求头时，会先发送OPTIONS预检请求：
1. 浏览器检查请求是否为"简单请求"
2. 如果不是，发送OPTIONS预检请求
3. 服务器返回允许的请求头列表
4. 如果请求头被允许，发送实际请求

### 防缓存最佳实践
1. **URL参数**：添加时间戳或随机数（推荐）
2. **请求头**：Cache-Control, Pragma等（可能触发CORS）
3. **HTTP方法**：POST请求通常不被缓存

## 🔧 相关文件

- `src/services/userService.ts` - 修复CORS问题
- `src-tauri/src/assets/server.js` - 服务器CORS配置
- `src/components/LoginModal.tsx` - 二维码登录UI

## ✨ 总结

通过移除不必要的 `Cache-Control` 请求头并使用URL时间戳参数，我们成功解决了CORS问题，同时保持了防缓存功能。这种方案更加简洁且兼容性更好。
