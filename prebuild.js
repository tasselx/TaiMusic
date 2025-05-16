const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// 获取当前平台和架构
const platform = os.platform();
const arch = os.arch();

console.log(`正在准备构建 - 平台: ${platform}, 架构: ${arch}`);

// 确定需要打包的二进制文件
let binaryFile;
if (platform === 'darwin') {
  // macOS
  binaryFile = arch === 'arm64' ? 'app_macos_arm64' : 'app_macos_x64';
} else if (platform === 'win32') {
  // Windows
  binaryFile = arch === 'arm64' ? 'app_win_arm64.exe' : 'app_win_x64.exe';
} else if (platform === 'linux') {
  // Linux
  binaryFile = arch === 'arm64' ? 'app_linux_arm64' : 'app_linux_x64';
} else {
  console.error(`不支持的操作系统: ${platform}`);
  process.exit(1);
}

console.log(`将打包二进制文件: ${binaryFile}`);

// 获取Rust目标三元组
let targetTriple = '';
try {
  if (platform === 'darwin') {
    targetTriple = arch === 'arm64' ? 'aarch64-apple-darwin' : 'x86_64-apple-darwin';
  } else if (platform === 'win32') {
    targetTriple = arch === 'arm64' ? 'aarch64-pc-windows-msvc' : 'x86_64-pc-windows-msvc';
  } else if (platform === 'linux') {
    targetTriple = arch === 'arm64' ? 'aarch64-unknown-linux-gnu' : 'x86_64-unknown-linux-gnu';
  }
  console.log(`当前目标三元组: ${targetTriple}`);
} catch (error) {
  console.error(`获取目标三元组失败: ${error.message}`);
}

// 创建目标平台的二进制文件副本
const binDir = path.join(__dirname, 'bin');
const sourcePath = path.join(binDir, binaryFile);
const targetBinaryName = `${binaryFile}-${targetTriple}`;
const targetPath = path.join(binDir, targetBinaryName);

// 复制二进制文件
try {
  if (fs.existsSync(sourcePath)) {
    fs.copySync(sourcePath, targetPath);
    console.log(`已创建二进制文件副本: ${targetBinaryName}`);
    
    // 设置执行权限(非Windows平台)
    if (platform !== 'win32') {
      fs.chmodSync(targetPath, '755');
    }
  } else {
    console.error(`错误: 找不到源二进制文件 ${sourcePath}`);
    process.exit(1);
  }
} catch (error) {
  console.error(`复制二进制文件失败: ${error.message}`);
  process.exit(1);
}

// 读取Tauri配置文件
const configPath = path.join(__dirname, 'src-tauri', 'tauri.conf.json');
const config = fs.readJsonSync(configPath);

// 更新配置文件
config.tauri.bundle.externalBin = [`../bin/${binaryFile}`];

// 写回配置文件
fs.writeJsonSync(configPath, config, { spaces: 2 });

console.log('已更新Tauri配置文件，只包含当前平台的二进制文件');

// 确保二进制文件有执行权限(非Windows平台)
if (platform !== 'win32') {
  try {
    fs.chmodSync(sourcePath, '755');
    console.log(`已设置二进制文件执行权限: ${sourcePath}`);
  } catch (error) {
    console.error(`无法设置二进制文件执行权限: ${error.message}`);
  }
}

console.log('预构建准备完成'); 