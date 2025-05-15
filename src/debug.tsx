import React from 'react';

const Debug = () => {
  return (
    <div style={{ padding: 20, color: 'white' }}>
      <h1>调试模式</h1>
      <p>如果您看到这条消息，说明React组件正在正确渲染。</p>
      <ul>
        <li>检查控制台有无错误</li>
        <li>检查网络请求</li>
        <li>检查样式是否正确加载</li>
      </ul>
    </div>
  );
};

export default Debug; 