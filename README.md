# TaiMusic

TaiMusic是一个基于Tauri的应用程序，包含前端和后端服务。

## 项目特点

- 自动检测系统平台和架构，运行对应的后端二进制服务
- 支持多种平台：macOS (arm64/x64)、Windows (arm64/x64)、Linux (arm64/x64)
- 开发、测试和生产环境下都能自动启动后端服务
- 自动处理端口占用问题，跨平台释放被占用的3000端口
- 打包后的应用内置二进制服务，保证生产环境正常运行
- 智能打包系统，只包含当前平台的二进制文件，优化应用体积

## 开发指南

### 开发环境

```bash
# 启动开发环境（同时启动后端服务和Vite开发服务器）
npm run dev

# 启动Tauri开发环境（同时启动后端服务和Tauri开发环境）
npm run tauri:dev
```

### 构建应用

```bash
# 构建应用（自动包含当前平台的二进制文件）
npm run tauri:build
```

### 其他命令

```bash
# 仅启动后端服务
npm start

# 运行任意Tauri命令（会自动启动后端服务）
npm run tauri [command]
```

## 构建和打包

应用打包时会自动识别当前平台，只包含当前平台的二进制文件：

打包的应用将：
1. 只包含当前平台和架构的二进制文件，优化应用体积
2. 自动检测系统架构和平台
3. 在应用内部使用正确的二进制文件
4. 处理可能的端口冲突问题
5. 在标准位置查找资源（开发和生产环境都支持）

## 工作原理

项目使用Node.js脚本自动检测操作系统类型和架构，然后运行对应的二进制文件。在开发和构建过程中，会先启动二进制服务器，等待1秒后再执行相应的Tauri命令，确保后端服务已经就绪。

### 端口占用处理

启动服务前会自动检查3000端口是否被占用：
- 如果端口被占用，会根据不同平台执行相应命令释放端口
  - macOS/Linux: 使用`lsof`查找进程，`kill -9`终止进程
  - Windows: 使用`netstat`查找进程，`taskkill /F`终止进程
- 释放端口后，等待1秒确保端口完全释放，然后启动服务

## 支持的平台

- macOS (arm64, x64)
- Windows (arm64, x64)
- Linux (arm64, x64)

## 技术栈

- 前端：React, TypeScript, Vite
- 桌面应用框架：Tauri
- 后端：预编译的二进制服务（监听3000端口）

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
