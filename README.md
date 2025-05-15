# TaiMusic

TaiMusic是一个使用Tauri、React和TypeScript构建的现代音乐播放器桌面应用。

## 特性

- 美观的用户界面，支持亮色和暗色模式
- 音乐库管理
- 播放列表创建和管理
- 支持多种音频格式
- 跨平台支持（Windows、macOS、Linux）

## 技术栈

- **后端**: Tauri + Rust
- **前端**: React + TypeScript
- **UI组件**: Chakra UI
- **状态管理**: Zustand
- **路由**: React Router
- **构建工具**: Vite

## 开发

### 环境要求

- Node.js (v16+)
- Rust (v1.60+)
- bun 包管理器

### 安装依赖

```bash
bun install
```

### 开发模式

```bash
bun run tauri dev
```

### 打包应用

```bash
bun run tauri build
```

## 项目结构

```
TaiMusic/
├── src/                    # 前端源代码
│   ├── components/         # 可复用组件
│   ├── pages/              # 页面组件
│   ├── layouts/            # 布局组件
│   ├── services/           # 服务层
│   ├── store/              # 状态管理
│   ├── styles/             # 样式文件
│   ├── utils/              # 工具函数
│   ├── hooks/              # 自定义Hook
│   ├── types/              # TypeScript类型定义
│   └── App.tsx             # 主应用组件
├── src-tauri/              # Tauri后端源代码
│   ├── src/                # Rust代码
│   │   ├── main.rs         # 主入口
│   │   └── music_library.rs # 音乐库管理
│   ├── Cargo.toml          # Rust依赖配置
│   └── tauri.conf.json     # Tauri配置
└── public/                 # 静态资源
```

## 许可证

MIT
