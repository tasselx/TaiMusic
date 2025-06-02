/**
 * 音频播放器测试组件
 * 用于测试首次播放问题的修复效果
 */
import React, { useState, useEffect } from 'react';
import { useAudioPlayerStore } from '../store/audioPlayerStore';
import { audioPlayerDebugger } from '../utils/audioPlayerDebugger';
import { toast } from '../store/toastStore';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
  timestamp: number;
}

const AudioPlayerTester: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const { 
    play, 
    pause, 
    stop, 
    isPlaying, 
    isLoading, 
    currentSong, 
    ensurePlayerReady,
    initializePlayer 
  } = useAudioPlayerStore();

  // 测试歌曲数据
  const testSong = {
    id: 'test-song-1',
    title: '测试歌曲',
    artist: '测试艺术家',
    album: '测试专辑',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // 公共测试音频
    coverUrl: 'https://via.placeholder.com/150x150?text=Test',
    duration: 30
  };

  /**
   * 添加测试结果
   */
  const addTestResult = (test: string, status: TestResult['status'], message: string) => {
    const result: TestResult = {
      test,
      status,
      message,
      timestamp: Date.now()
    };
    setTestResults(prev => [...prev, result]);
  };

  /**
   * 清除测试结果
   */
  const clearResults = () => {
    setTestResults([]);
  };

  /**
   * 测试播放器初始化
   */
  const testPlayerInitialization = async () => {
    try {
      addTestResult('播放器初始化', 'pending', '正在测试播放器初始化...');
      
      const isReady = await ensurePlayerReady();
      if (isReady) {
        addTestResult('播放器初始化', 'success', '播放器初始化成功');
      } else {
        addTestResult('播放器初始化', 'failed', '播放器初始化失败');
      }
    } catch (error) {
      addTestResult('播放器初始化', 'failed', `初始化错误: ${error}`);
    }
  };

  /**
   * 测试首次播放
   */
  const testFirstPlay = async () => {
    try {
      addTestResult('首次播放', 'pending', '正在测试首次播放...');
      
      await play(testSong);
      
      // 等待一段时间检查播放状态
      setTimeout(() => {
        if (isPlaying) {
          addTestResult('首次播放', 'success', '首次播放成功');
        } else {
          addTestResult('首次播放', 'failed', '首次播放失败 - 音频未开始播放');
        }
      }, 2000);
      
    } catch (error) {
      addTestResult('首次播放', 'failed', `播放错误: ${error}`);
    }
  };

  /**
   * 测试播放控制
   */
  const testPlaybackControls = async () => {
    try {
      addTestResult('播放控制', 'pending', '正在测试播放控制...');
      
      // 测试暂停
      if (isPlaying) {
        pause();
        setTimeout(() => {
          if (!isPlaying) {
            // 测试恢复播放
            play();
            setTimeout(() => {
              if (isPlaying) {
                addTestResult('播放控制', 'success', '播放控制测试成功');
              } else {
                addTestResult('播放控制', 'failed', '恢复播放失败');
              }
            }, 1000);
          } else {
            addTestResult('播放控制', 'failed', '暂停功能失败');
          }
        }, 1000);
      } else {
        addTestResult('播放控制', 'failed', '当前没有播放中的音频');
      }
    } catch (error) {
      addTestResult('播放控制', 'failed', `控制错误: ${error}`);
    }
  };

  /**
   * 运行所有测试
   */
  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    
    try {
      // 停止当前播放
      stop();
      
      // 等待一段时间确保停止
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 依次运行测试
      await testPlayerInitialization();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testFirstPlay();
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await testPlaybackControls();
      
    } catch (error) {
      console.error('测试运行错误:', error);
      toast.error(`测试运行失败: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * 获取调试信息
   */
  const getDebugInfo = async () => {
    try {
      const info = await audioPlayerDebugger.getDebugInfo();
      setDebugInfo(info);
      toast.success('调试信息已获取');
    } catch (error) {
      toast.error(`获取调试信息失败: ${error}`);
    }
  };

  /**
   * 打印调试信息到控制台
   */
  const printDebugInfo = async () => {
    try {
      await audioPlayerDebugger.printDebugInfo();
      toast.success('调试信息已打印到控制台');
    } catch (error) {
      toast.error(`打印调试信息失败: ${error}`);
    }
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="audio-player-tester p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">🎵 音频播放器测试工具</h2>
      
      {/* 当前状态 */}
      <div className="status-info mb-6 p-4 bg-gray-700 rounded">
        <h3 className="text-lg font-semibold text-white mb-2">当前状态</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-300">播放状态:</span>
            <span className={`ml-2 ${isPlaying ? 'text-green-400' : 'text-gray-400'}`}>
              {isPlaying ? '播放中' : '未播放'}
            </span>
          </div>
          <div>
            <span className="text-gray-300">加载状态:</span>
            <span className={`ml-2 ${isLoading ? 'text-yellow-400' : 'text-gray-400'}`}>
              {isLoading ? '加载中' : '空闲'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-300">当前歌曲:</span>
            <span className="ml-2 text-blue-400">
              {currentSong ? `${currentSong.title} - ${currentSong.artist}` : '无'}
            </span>
          </div>
        </div>
      </div>

      {/* 测试按钮 */}
      <div className="test-controls mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? '测试运行中...' : '运行所有测试'}
          </button>
          
          <button
            onClick={testPlayerInitialization}
            disabled={isRunning}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            测试初始化
          </button>
          
          <button
            onClick={testFirstPlay}
            disabled={isRunning}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            测试首次播放
          </button>
          
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            清除结果
          </button>
        </div>
      </div>

      {/* 调试工具 */}
      <div className="debug-tools mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">调试工具</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={getDebugInfo}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            获取调试信息
          </button>
          
          <button
            onClick={printDebugInfo}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            打印到控制台
          </button>
        </div>
      </div>

      {/* 测试结果 */}
      <div className="test-results">
        <h3 className="text-lg font-semibold text-white mb-3">测试结果</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-400">暂无测试结果</p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="p-3 bg-gray-700 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">{getStatusIcon(result.status)}</span>
                    <span className="font-medium text-white">{result.test}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className={`mt-1 text-sm ${getStatusColor(result.status)}`}>
                  {result.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 调试信息显示 */}
      {debugInfo && (
        <div className="debug-info mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">调试信息</h3>
          <div className="p-4 bg-gray-900 rounded text-xs text-gray-300 overflow-auto max-h-64">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayerTester;
