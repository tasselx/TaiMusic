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

// 检查二进制文件存在
const binDir = path.join(__dirname, 'bin');
const sourcePath = path.join(binDir, binaryFile);

// 验证二进制文件存在
try {
  if (fs.existsSync(sourcePath)) {
    console.log(`将使用二进制文件: ${binaryFile}`);
  } else {
    console.error(`错误: 找不到源二进制文件 ${sourcePath}`);
    process.exit(1);
  }
} catch (error) {
  console.error(`检查二进制文件失败: ${error.message}`);
  process.exit(1);
}

// 读取Tauri配置文件
const configPath = path.join(__dirname, 'src-tauri', 'tauri.conf.json');
const config = fs.readJsonSync(configPath);

// 创建带有平台三元组后缀的二进制文件
const targetBinaryName = `${binaryFile}-${targetTriple}`;
const targetPath = path.join(binDir, targetBinaryName);

// 清理任何已存在的链接或文件
if (fs.existsSync(targetPath)) {
  fs.removeSync(targetPath);
}

// 更新配置文件，使用符合Tauri要求的二进制名称
config.tauri.bundle.externalBin = [`../bin/${binaryFile}`];

// 创建软链接
try {
  if (platform === 'win32') {
    // Windows上创建软链接（需要管理员权限）或硬链接
    try {
      execSync(`mklink "${targetPath}" "${sourcePath}"`, { shell: true });
    } catch (e) {
      // 如果软链接失败，尝试创建硬链接
      execSync(`mklink /h "${targetPath}" "${sourcePath}"`, { shell: true });
    }
  } else {
    // macOS和Linux上创建软链接
    fs.symlinkSync(path.basename(sourcePath), targetPath);
  }
  console.log(`创建了软链接: ${targetBinaryName} -> ${binaryFile}`);
} catch (error) {
  // 如果软链接失败，就复制文件
  console.log(`软链接创建失败，正在复制文件`);
  fs.copySync(sourcePath, targetPath);
  console.log(`已复制文件: ${binaryFile} -> ${targetBinaryName}`);
}

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