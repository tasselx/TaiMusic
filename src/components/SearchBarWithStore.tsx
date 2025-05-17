import React, { useRef, useState } from 'react';
import '../styles/SearchBar.css';
import { useSearchStore } from '../store';

/**
 * 使用Zustand状态管理的搜索栏组件
 */
const SearchBarWithStore: React.FC = () => {
  // 从Zustand获取状态和方法
  const { 
    searchTerm, 
    setSearchTerm, 
    performSearch 
  } = useSearchStore();
  
  // 跟踪输入框是否有焦点
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  // 处理清除按钮点击
  const clearInput = () => {
    // 直接调用setSearchTerm传入空字符串
    setSearchTerm('');

    // 清除后保持输入框焦点
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 处理焦点事件
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // 阻止事件冒泡
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="search-container"
      onClick={stopPropagation}
      onDoubleClick={stopPropagation}
    >
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder="搜索音乐、歌手、歌单"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <i className="fas fa-search search-icon"></i>

      {/* 清除按钮 - 仅在有文本且输入框有焦点时显示 */}
      {searchTerm && isFocused && (
        <button
          type="button"
          className="clear-button"
          onClick={clearInput}
          onMouseDown={(e) => {
            e.preventDefault(); // 防止按钮点击导致输入框失去焦点
            e.stopPropagation();
            clearInput();
          }}
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default SearchBarWithStore;
