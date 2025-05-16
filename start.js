const { execFile, exec } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const net = require('net');

// 服务端口
const PORT = 3000;

// 检查端口是否被占用
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // 端口被占用
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false); // 端口未被占用
    });
    
    server.listen(port);
  });
}

// 根据平台查找并杀死占用端口的进程
async function killProcessOnPort(port) {
  const platform = os.platform();
  
  try {
    if (platform === 'win32') {
      // Windows平台
      const { stdout } = await new Promise((resolve, reject) => {
        exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
          if (error && error.code !== 1) {
            reject(error);
            return;
          }
          resolve({ stdout, stderr });
        });
      });
      
      // 提取PID
      const lines = stdout.split('\n');
      let pid = null;
      
      for (const line of lines) {
        if (line.includes(`LISTENING`)) {
          const match = line.match(/(\d+)$/);
          if (match && match[1]) {
            pid = match[1];
            break;
          }
        }
      }
      
      if (pid) {
        console.log(`找到占用${port}端口的进程PID: ${pid}，正在终止...`);
        await new Promise((resolve, reject) => {
          exec(`taskkill /F /PID ${pid}`, (error) => {
            if (error) {
              console.error(`无法终止进程: ${error.message}`);
              reject(error);
              return;
            }
            console.log(`已终止占用端口的进程`);
            resolve();
          });
        });
      }
    } else {
      // macOS 和 Linux 平台
      const { stdout } = await new Promise((resolve, reject) => {
        exec(`lsof -i :${port} -t`, (error, stdout, stderr) => {
          if (error && error.code !== 1) {
            reject(error);
            return;
          }
          resolve({ stdout, stderr });
        });
      });
      
      if (stdout.trim()) {
        const pids = stdout.trim().split('\n');
        for (const pid of pids) {
          if (pid) {
            console.log(`找到占用${port}端口的进程PID: ${pid}，正在终止...`);
            await new Promise((resolve) => {
              exec(`kill -9 ${pid}`, (error) => {
                if (error) {
                  console.error(`无法终止进程: ${error.message}`);
                } else {
                  console.log(`已终止占用端口的进程`);
                }
                resolve();
              });
            });
          }
        }
      }
    }
    
    // 稍等片刻，确保端口已释放
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error(`检查或释放端口时出错: ${error.message}`);
  }
}

// 查找二进制文件路径
function findBinaryPath(binaryName) {
  // 可能的路径列表，按优先级排序
  const possiblePaths = [
    // 打包后的应用内路径
    process.env.TAURI_RESOURCES, // Tauri资源目录
    process.env.TAURI_BIN_DIR, // Tauri二进制目录
    // 开发环境路径
    path.join(__dirname, 'bin'),
    path.join(process.cwd(), 'bin')
  ].filter(Boolean); // 过滤掉undefined值

  // 检查Tauri环境
  if (process.resourcesPath) {
    // 打包环境
    possiblePaths.unshift(path.join(process.resourcesPath, 'bin'));
  }

  // 尝试找到二进制文件
  for (const basePath of possiblePaths) {
    const fullPath = path.join(basePath, binaryName);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  // 如果是Tauri环境，可能需要使用特定的命名约定
  if (process.env.TAURI_RESOURCES || process.env.TAURI_BIN_DIR || process.resourcesPath) {
    // Tauri打包环境会将externalBin放在特定位置
    if (process.platform === 'win32') {
      // Windows使用.exe扩展名
      return binaryName;
    } else {
      // macOS和Linux
      return binaryName.replace('.exe', '');
    }
  }

  return null;
}

// 启动应用
async function startApp() {
  // 获取操作系统类型和架构
  const platform = os.platform();
  const arch = os.arch();

  // 映射操作系统和架构到二进制文件名
  let binaryName;
  if (platform === 'darwin') {
    // macOS
    binaryName = arch === 'arm64' ? 'app_macos_arm64' : 'app_macos_x64';
  } else if (platform === 'win32') {
    // Windows
    binaryName = arch === 'arm64' ? 'app_win_arm64.exe' : 'app_win_x64.exe';
  } else if (platform === 'linux') {
    // Linux
    binaryName = arch === 'arm64' ? 'app_linux_arm64' : 'app_linux_x64';
  } else {
    console.error(`不支持的操作系统: ${platform}`);
    process.exit(1);
  }

  // 查找二进制文件路径
  const binaryPath = findBinaryPath(binaryName);

  if (!binaryPath) {
    console.error(`找不到二进制文件: ${binaryName}`);
    process.exit(1);
  }

  console.log(`找到二进制文件: ${binaryPath}`);

  // 在非Windows系统上设置可执行权限
  if (platform !== 'win32' && !process.env.TAURI_BIN_DIR) {
    // 在Tauri打包环境中不需要设置权限
    try {
      fs.chmodSync(binaryPath, '755');
    } catch (error) {
      console.error(`设置可执行权限失败: ${error.message}`);
      process.exit(1);
    }
  }

  // 检查端口占用情况并处理
  const isPortInUse = await checkPort(PORT);
  if (isPortInUse) {
    console.log(`端口 ${PORT} 已被占用，尝试释放...`);
    await killProcessOnPort(PORT);
  }

  console.log(`正在启动 ${binaryName}...`);

  // 启动二进制文件
  const childProcess = execFile(binaryPath, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行失败: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`错误输出: ${stderr}`);
    }
    if (stdout) {
      console.log(`标准输出: ${stdout}`);
    }
  });

  // 捕获SIGINT信号(Ctrl+C)以正常退出
  process.on('SIGINT', () => {
    console.log('正在关闭服务...');
    childProcess.kill();
    process.exit(0);
  });

  console.log(`服务已启动，监听端口${PORT}`);
}

// 执行启动流程
startApp().catch(error => {
  console.error(`启动失败: ${error.message}`);
  process.exit(1);
}); 