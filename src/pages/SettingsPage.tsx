import { useState } from 'react';
import '../components/components.scss';

const SettingsPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const [showToast, setShowToast] = useState(false);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">设置</h1>

      <div className="max-w-[800px] space-y-6">
        <div className="card">
          <h2 className="mb-4 text-lg font-bold">
            外观
          </h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <label htmlFor="dark-mode" className="mb-0 mr-2">
                暗色模式
              </label>
              <div className="switch">
                <input 
                  type="checkbox" 
                  id="dark-mode" 
                  className="switch__input" 
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                />
                <div className="switch__slider"></div>
              </div>
            </div>
            <div>
              <label className="block mb-2">主题颜色</label>
              <select className="input" defaultValue="default">
                <option value="default">默认蓝色</option>
                <option value="purple">紫色</option>
                <option value="green">绿色</option>
                <option value="red">红色</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-bold">
            音乐库
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">音乐库位置</label>
              <input 
                type="text" 
                className="input"
                defaultValue="/Users/Music" 
              />
            </div>
            <div className="flex items-center">
              <label htmlFor="scan-startup" className="mb-0 mr-2">
                启动时扫描音乐库
              </label>
              <div className="switch">
                <input 
                  type="checkbox" 
                  id="scan-startup" 
                  className="switch__input" 
                  defaultChecked
                />
                <div className="switch__slider"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-bold">
            音频设置
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">音频输出设备</label>
              <select className="input" defaultValue="default">
                <option value="default">系统默认</option>
                <option value="speakers">扬声器</option>
                <option value="headphones">耳机</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">音质</label>
              <select className="input" defaultValue="high">
                <option value="low">低 (128kbps)</option>
                <option value="medium">中 (256kbps)</option>
                <option value="high">高 (320kbps)</option>
                <option value="lossless">无损</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-bold">
            关于
          </h2>
          <p className="mb-2">TaiMusic 版本: 1.0.0</p>
          <p className="mb-4">Tauri 版本: 2.0</p>
          <hr className="my-4 border" />
          <p className="text-sm text-gray">
            © 2024 TaiMusic. 保留所有权利。
          </p>
        </div>

        <div>
          <button 
            className="btn btn-primary"
            onClick={handleSave}
          >
            保存设置
          </button>
        </div>
      </div>

      {/* Toast 通知 */}
      {showToast && (
        <div className="toast toast--success">
          设置已保存
        </div>
      )}
    </div>
  );
};

export default SettingsPage; 