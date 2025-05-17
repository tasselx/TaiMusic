import React, { useRef, useState } from 'react';
import '../styles/SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "搜索音乐、歌手、歌单"
}) => {
  // 跟踪输入框是否有焦点
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  // 处理清除按钮点击
  const clearInput = () => {
    // 直接调用onChange传入空字符串
    onChange('');

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
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <i className="fas fa-search search-icon"></i>

      {/* 清除按钮 - 仅在有文本且输入框有焦点时显示 */}
      {value && isFocused && (
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

export default SearchBar;
