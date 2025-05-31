import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useUserStore from '../store/userStore';
import { toast } from '../store/toastStore';
import { sendVerificationCode, phoneLogin } from '../services/userService';

interface LoginModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type LoginTab = 'phone' | 'account' | 'qrcode';

/**
 * 登录模态对话框组件
 * 包含手机号登录、账号登录、扫码登录三种方式
 */
const LoginModal: React.FC<LoginModalProps> = ({ isVisible, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Tab状态
  const [activeTab, setActiveTab] = useState<LoginTab>('phone');

  // 表单状态
  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    code: '',
    isCodeSent: false,
    countdown: 0,
    lastSendTime: 0  // 上次发送验证码的时间戳，用于防止频繁调用
  });

  const [accountForm, setAccountForm] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const [qrcodeForm, setQrcodeForm] = useState({
    qrCodeUrl: 'https://ai-public.mastergo.com/ai/img_res/d182eccb133f8f85f65ac0b0c56773fb.jpg', // 默认二维码
    isRefreshing: false
  });

  // 加载状态和错误信息
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取用户状态管理
  const { setUserInfo, setLoginStatus } = useUserStore();

  // 处理ESC键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, onClose]);

  // 验证码倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phoneForm.countdown > 0) {
      timer = setTimeout(() => {
        setPhoneForm(prev => ({ ...prev, countdown: prev.countdown - 1 }));
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [phoneForm.countdown]);

  // 点击遮罩层关闭弹窗
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === modalRef.current) {
      onClose();
    }
  };

  // 重置表单状态
  const resetForms = () => {
    setPhoneForm({ phone: '', code: '', isCodeSent: false, countdown: 0, lastSendTime: 0 });
    setAccountForm({ username: '', password: '', rememberMe: false });
    setError(null);
    setIsLoading(false);
  };

  // 关闭弹窗
  const handleClose = () => {
    resetForms();
    onClose();
  };

  // Tab切换
  const handleTabChange = (tab: LoginTab) => {
    setActiveTab(tab);
    setError(null);
  };

  // 发送验证码
  const handleSendCode = async () => {
    console.log('🔥 开始发送验证码流程');

    if (!phoneForm.phone) {
      console.log('❌ 手机号为空');
      setError('请输入手机号');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
      console.log('❌ 手机号格式不正确:', phoneForm.phone);
      setError('请输入正确的手机号');
      return;
    }

    console.log('✅ 手机号验证通过:', phoneForm.phone);

    // 防止频繁调用：60秒内不能重复发送
    const now = Date.now();
    if (phoneForm.lastSendTime && (now - phoneForm.lastSendTime) < 60000) {
      const remainingTime = Math.ceil((60000 - (now - phoneForm.lastSendTime)) / 1000);
      setError(`请等待 ${remainingTime} 秒后再试`);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 调用真实的发送验证码API
      const result = await sendVerificationCode(phoneForm.phone);

      if (result.success) {
        setPhoneForm(prev => ({
          ...prev,
          isCodeSent: true,
          countdown: 60,
          lastSendTime: now  // 记录发送时间
        }));

        toast.success(result.message || '验证码已发送', { title: '发送成功' });
      } else {
        // 显示详细的错误信息
        const errorMessage = result.message || '发送验证码失败';
        const errorCode = result.errorCode;

        setError(errorMessage);

        // 在控制台输出详细错误信息，便于调试
        console.error('发送验证码失败详情:', {
          message: errorMessage,
          errorCode: errorCode,
          errorDetails: result.errorDetails
        });

        // Toast显示用户友好的错误信息
        let toastMessage = errorMessage;
        if (errorCode) {
          toastMessage += ` (错误代码: ${errorCode})`;
        }

        toast.error(toastMessage, {
          title: '发送失败',
          duration: 5000  // 错误信息显示更长时间
        });
      }
    } catch (err: any) {
      // 这里处理意外的错误（通常不会到达这里，因为sendVerificationCode已经处理了所有错误）
      const errorMessage = err?.message || '发送验证码失败，请稍后重试';
      setError(errorMessage);

      console.error('发送验证码意外错误:', err);

      toast.error(errorMessage, {
        title: '发送失败',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 手机号登录
  const handlePhoneLogin = async () => {
    console.log('🚀 开始手机号登录流程');
    console.log('手机号:', phoneForm.phone);
    console.log('验证码:', phoneForm.code ? '已输入' : '未输入');

    if (!phoneForm.phone || !phoneForm.code) {
      console.log('❌ 手机号或验证码为空');
      setError('请输入手机号和验证码');
      return;
    }

    // 检查是否已经登录，避免重复登录
    const currentUserInfo = useUserStore.getState().userInfo;
    if (currentUserInfo && currentUserInfo.isLoggedIn) {
      toast.warning('您已经登录，无需重复登录', { title: '提示' });
      handleClose();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 设置登录中状态
      setLoginStatus('loading');

      // 调用真实的手机号登录API
      const result = await phoneLogin({
        phone: phoneForm.phone,
        code: phoneForm.code
      });

      // 登录成功，构建用户信息对象
      const username = result.nickname || `用户${phoneForm.phone.slice(-4)}`;
      const userInfo = {
        id: result.userId.toString(), // 转换为字符串以匹配UserInfo接口
        username,
        avatar: result.avatar || 'https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg',
        isLoggedIn: true,
        token: result.token,
        vip_type: result.vip_type,
        vip_token: result.vip_token
      };

      // 设置用户信息并进行持久化存储
      setUserInfo(userInfo);

      // 设置登录成功状态
      setLoginStatus('success');

      console.log('登录成功，用户信息已保存:', userInfo);

      toast.success(`欢迎回来，${username}！`, { title: '登录成功' });
      handleClose();
    } catch (err: any) {
      const errorMessage = err?.message || '登录失败，请检查手机号和验证码';
      setError(errorMessage);

      // 设置登录失败状态
      setLoginStatus('error', errorMessage);

      // 在控制台输出详细错误信息，便于调试
      console.error('手机号登录失败详情:', {
        message: errorMessage,
        error: err
      });

      toast.error(errorMessage, {
        title: '登录失败',
        duration: 5000  // 错误信息显示更长时间
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 账号登录
  const handleAccountLogin = async () => {
    if (!accountForm.username || !accountForm.password) {
      setError('请输入用户名和密码');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 设置登录中状态
      setLoginStatus('loading');

      // 模拟登录
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 构建用户信息对象
      const userInfo = {
        id: 'account_user_' + Date.now(),
        username: accountForm.username,
        avatar: 'https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg',
        isLoggedIn: true,
        token: 'account_token_' + Date.now()
      };

      // 设置用户信息并进行持久化存储
      setUserInfo(userInfo);

      // 设置登录成功状态
      setLoginStatus('success');

      console.log('账号登录成功，用户信息已保存:', userInfo);

      toast.success(`欢迎回来，${accountForm.username}！`, { title: '登录成功' });
      handleClose();
    } catch (err) {
      const errorMessage = '登录失败，请检查用户名和密码';
      setError(errorMessage);

      // 设置登录失败状态
      setLoginStatus('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新二维码
  const handleRefreshQRCode = async () => {
    try {
      setQrcodeForm(prev => ({ ...prev, isRefreshing: true }));

      // 模拟刷新二维码
      await new Promise(resolve => setTimeout(resolve, 1000));

      setQrcodeForm(prev => ({
        ...prev,
        isRefreshing: false,
        qrCodeUrl: prev.qrCodeUrl + '?t=' + Date.now() // 添加时间戳刷新
      }));
    } catch (err) {
      setQrcodeForm(prev => ({ ...prev, isRefreshing: false }));
    }
  };

  // 如果不可见，不渲染组件
  if (!isVisible) {
    return null;
  }

  // 使用Portal将模态弹窗渲染到body级别，避免层叠上下文问题
  return createPortal(
    <div
      ref={modalRef}
      className="login-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        ref={contentRef}
        className="login-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 弹窗头部 */}
        <div className="login-modal-header">
          <h2 className="login-modal-title">登录</h2>
          <button
            className="login-modal-close-btn"
            onClick={handleClose}
            aria-label="关闭登录弹窗"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* 说明文字 */}
        <div className="login-modal-description">
          <p>请使用酷狗音乐账号登录</p>
        </div>

        {/* Tab标签页 */}
        <div className="login-modal-tabs">
          <button
            className={`login-tab ${activeTab === 'phone' ? 'active' : ''}`}
            onClick={() => handleTabChange('phone')}
          >
            手机号登录
          </button>
          <button
            className={`login-tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => handleTabChange('account')}
          >
            账号登录
          </button>
          <button
            className={`login-tab ${activeTab === 'qrcode' ? 'active' : ''}`}
            onClick={() => handleTabChange('qrcode')}
          >
            扫码登录
          </button>
        </div>

        {/* 弹窗内容 */}
        <div className="login-modal-body">
          {/* 错误提示 */}
          {error && (
            <div className="login-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* 手机号登录 */}
          {activeTab === 'phone' && (
            <div className="login-form">
              <div className="login-form-group">
                <label className="login-form-label">手机号</label>
                <input
                  type="tel"
                  className="login-form-input"
                  placeholder="请输入手机号"
                  value={phoneForm.phone}
                  onChange={(e) => setPhoneForm(prev => ({ ...prev, phone: e.target.value }))}
                  maxLength={11}
                />
              </div>

              <div className="login-form-group">
                <label className="login-form-label">验证码</label>
                <div className="login-form-code-group">
                  <input
                    type="text"
                    className="login-form-input"
                    placeholder="请输入验证码"
                    value={phoneForm.code}
                    onChange={(e) => setPhoneForm(prev => ({ ...prev, code: e.target.value }))}
                    maxLength={6}
                  />
                  <button
                    className="login-form-code-btn"
                    onClick={handleSendCode}
                    disabled={isLoading || phoneForm.countdown > 0}
                  >
                    {phoneForm.countdown > 0 ? `${phoneForm.countdown}s` : '获取验证码'}
                  </button>
                </div>
              </div>

              <button
                className="login-form-submit"
                onClick={handlePhoneLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </button>
            </div>
          )}

          {/* 账号登录 */}
          {activeTab === 'account' && (
            <div className="login-form">
              <div className="login-form-group">
                <label className="login-form-label">用户名/邮箱</label>
                <input
                  type="text"
                  className="login-form-input"
                  placeholder="请输入用户名或邮箱"
                  value={accountForm.username}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>

              <div className="login-form-group">
                <label className="login-form-label">密码</label>
                <input
                  type="password"
                  className="login-form-input"
                  placeholder="请输入密码"
                  value={accountForm.password}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <div className="login-form-checkbox">
                <label className="login-checkbox-label">
                  <input
                    type="checkbox"
                    checked={accountForm.rememberMe}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  />
                  <span className="login-checkbox-custom"></span>
                  记住密码
                </label>
              </div>

              <button
                className="login-form-submit"
                onClick={handleAccountLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </button>
            </div>
          )}

          {/* 扫码登录 */}
          {activeTab === 'qrcode' && (
            <div className="login-qrcode">
              <div className="login-qrcode-container">
                <img
                  src={qrcodeForm.qrCodeUrl}
                  alt="登录二维码"
                  className="login-qrcode-image"
                />
                {qrcodeForm.isRefreshing && (
                  <div className="login-qrcode-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                  </div>
                )}
              </div>

              <div className="login-qrcode-actions">
                <button
                  className="login-qrcode-refresh"
                  onClick={handleRefreshQRCode}
                  disabled={qrcodeForm.isRefreshing}
                >
                  <i className="fas fa-sync-alt"></i>
                  刷新二维码
                </button>
              </div>

              <div className="login-qrcode-tips">
                <p>请使用手机扫描二维码登录</p>
                <p className="login-qrcode-tips-sub">扫码后请在手机上确认登录</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LoginModal;
