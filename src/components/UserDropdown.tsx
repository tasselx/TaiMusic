import React, { useState, useRef, useEffect } from 'react';
import useUserStore from '../store/userStore';
import DisclaimerModal from './DisclaimerModal';

interface UserDropdownProps {
  className?: string;
}

/**
 * 用户头像下拉菜单组件
 * 包含设置、登录、更新、关于等功能选项
 */
const UserDropdown: React.FC<UserDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // 获取用户状态
  const { user, logout } = useUserStore();
  const isLoggedIn = user?.isLoggedIn || false;

  // 切换下拉菜单显示状态
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // 关闭下拉菜单
  const closeDropdown = () => {
    setIsOpen(false);
  };

  // 点击外部区域关闭菜单和键盘事件处理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // 菜单项点击处理
  const handleMenuItemClick = (action: string) => {
    closeDropdown();

    switch (action) {
      case 'settings':
        console.log('打开设置');
        // TODO: 实现设置功能
        alert('设置功能即将推出！');
        break;
      case 'login':
        console.log('打开登录');
        // 模拟登录功能
        handleMockLogin();
        break;
      case 'logout':
        console.log('用户登出');
        logout();
        alert('已成功登出');
        break;
      case 'updates':
        console.log('检查更新');
        // TODO: 实现更新检查功能
        alert('当前已是最新版本！');
        break;
      case 'about':
        console.log('关于应用');
        setShowDisclaimerModal(true);
        break;
      default:
        break;
    }
  };

  // 模拟登录功能
  const handleMockLogin = () => {
    const { setUser } = useUserStore.getState();
    setUser({
      id: 'mock_user_123',
      username: '测试用户',
      avatar: 'https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg',
      isLoggedIn: true,
      token: 'mock_token_123'
    });
    alert('模拟登录成功！');
  };

  return (
    <div className={`user-dropdown-container ${className}`}>
      {/* 头像按钮 */}
      <div
        ref={buttonRef}
        className={`user-button ${isOpen ? 'active' : ''}`}
        onClick={toggleDropdown}
        title={isLoggedIn ? `${user?.username || '用户'}` : '点击查看选项'}
      >
        {isLoggedIn && user?.avatar ? (
          <img
            src={user.avatar}
            alt="用户头像"
            className="user-avatar"
          />
        ) : (
          <i className="fas fa-user"></i>
        )}
      </div>

      {/* 下拉菜单 */}
      {isOpen && (
        <div ref={dropdownRef} className="user-dropdown-menu">
          {/* 设置 */}
          <div
            className="dropdown-item"
            onClick={() => handleMenuItemClick('settings')}
          >
            <i className="fas fa-cog"></i>
            <span>设置</span>
          </div>

          {/* 登录/登出 */}
          {!isLoggedIn ? (
            <div
              className="dropdown-item"
              onClick={() => handleMenuItemClick('login')}
            >
              <i className="fas fa-sign-in-alt"></i>
              <span>登录</span>
            </div>
          ) : (
            <div
              className="dropdown-item"
              onClick={() => handleMenuItemClick('logout')}
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>登出</span>
            </div>
          )}

          {/* 分隔线 */}
          <div className="dropdown-divider"></div>

          {/* 更新 */}
          <div
            className="dropdown-item"
            onClick={() => handleMenuItemClick('updates')}
          >
            <i className="fas fa-download"></i>
            <span>更新</span>
          </div>

          {/* 关于 */}
          <div
            className="dropdown-item"
            onClick={() => handleMenuItemClick('about')}
          >
            <i className="fas fa-info-circle"></i>
            <span>关于</span>
          </div>
        </div>
      )}

      {/* 免责声明弹窗 */}
      <DisclaimerModal
        isVisible={showDisclaimerModal}
        onClose={() => setShowDisclaimerModal(false)}
      />
    </div>
  );
};

export default UserDropdown;
