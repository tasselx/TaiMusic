/**
 * HTTP客户端示例组件
 * 展示如何使用HTTP客户端进行API请求
 */
import React, { useState, useEffect } from 'react';
import { searchMusic, Song } from '../../services/musicService';
import { getUserDetail, UserInfo } from '../../services/userService';
import { uploadImageFile } from '../../services/uploadService';

const HttpClientExample: React.FC = () => {
  // 状态
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // 搜索音乐
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchMusic(searchTerm);
      setSongs(results);
    } catch (err) {
      setError('搜索失败，请稍后重试');
      console.error('搜索失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取用户信息
  const handleGetUserInfo = async () => {
    if (!userId.trim()) {
      setError('请输入用户ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const info = await getUserDetail(userId);
      setUserInfo(info);
    } catch (err) {
      setError('获取用户信息失败，请稍后重试');
      console.error('获取用户信息失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 上传图片
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const result = await uploadImageFile(file, 'other');

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.url) {
        setUploadedImageUrl(result.url);
      } else {
        setError(result.message || '上传失败，请稍后重试');
      }
    } catch (err) {
      setError('上传失败，请稍后重试');
      console.error('上传失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">HTTP客户端示例</h2>

      {/* 搜索音乐 */}
      <div className="mb-8 p-4 border rounded-lg">
        <h3 className="text-xl font-semibold mb-2">搜索音乐</h3>
        <div className="flex mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="输入歌曲名称"
            className="flex-1 p-2 border rounded-l-lg"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? '搜索中...' : '搜索'}
          </button>
        </div>

        {/* 搜索结果 */}
        {songs.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">搜索结果：</h4>
            <ul className="divide-y">
              {songs.map((song) => (
                <li key={song.id} className="py-2">
                  <div className="flex items-center">
                    <img src={song.imageUrl} alt={song.title} className="w-12 h-12 object-cover rounded mr-3" />
                    <div>
                      <p className="font-medium">{song.title}</p>
                      <p className="text-sm text-gray-600">{song.artist} - {song.album}</p>
                    </div>
                    <span className="ml-auto text-gray-500">{song.duration}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* 获取用户信息 */}
      <div className="mb-8 p-4 border rounded-lg">
        <h3 className="text-xl font-semibold mb-2">获取用户信息</h3>
        <div className="flex mb-4">
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="输入用户ID"
            className="flex-1 p-2 border rounded-l-lg"
          />
          <button
            onClick={handleGetUserInfo}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded-r-lg hover:bg-green-600 disabled:bg-gray-400"
          >
            {isLoading ? '获取中...' : '获取'}
          </button>
        </div>

        {/* 用户信息 */}
        {userInfo && (
          <div className="flex items-center p-3 bg-gray-100 rounded">
            <img src={userInfo.avatar} alt={userInfo.username} className="w-16 h-16 rounded-full mr-4" />
            <div>
              <p className="font-medium text-lg">{userInfo.username}</p>
              <p className="text-gray-600">ID: {userInfo.id}</p>
              {userInfo.nickname && <p className="text-gray-600">昵称: {userInfo.nickname}</p>}
            </div>
          </div>
        )}
      </div>

      {/* 上传图片 */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-xl font-semibold mb-2">上传图片</h3>
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* 上传进度 */}
        {isLoading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">上传进度: {uploadProgress}%</p>
          </div>
        )}

        {/* 上传结果 */}
        {uploadedImageUrl && (
          <div className="mt-4">
            <p className="font-medium mb-2">上传成功：</p>
            <img src={uploadedImageUrl} alt="Uploaded" className="max-w-xs rounded-lg border" />
          </div>
        )}
      </div>
    </div>
  );
};

export default HttpClientExample;
