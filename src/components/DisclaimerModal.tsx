import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface DisclaimerModalProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * 免责声明弹窗组件
 * 显示应用的免责声明和使用条款
 */
const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isVisible, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  // 点击遮罩层关闭弹窗
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === modalRef.current) {
      onClose();
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
      className="disclaimer-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        ref={contentRef}
        className="disclaimer-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 弹窗头部 */}
        <div className="disclaimer-modal-header">
          <h2 className="disclaimer-modal-title">免责声明</h2>
          <button
            className="disclaimer-modal-close-btn"
            onClick={onClose}
            aria-label="关闭弹窗"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* 弹窗内容 */}
        <div className="disclaimer-modal-body">
          <div className="disclaimer-content">
            <p><strong>0.</strong> 本程序是酷狗第三方客户端，并非酷狗官方，需要更完善的功能请下载官方客户端体验。</p>

            <p><strong>1.</strong> 本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为及非法用途！</p>

            <p><strong>2.</strong> 使用本项目的过程中可能会产生版权数据。对于这些版权数据，本项目不拥有它们的所有权。为了避免侵权，使用者务必在 24 小时内清除使用本项目的过程中所产生的版权数据。</p>

            <p><strong>3.</strong> 由于使用本项目产生的包括由于本协议或由于使用或无法使用本项目而引起的任何性质的任何直接、间接、特殊、偶然或结果性损害（包括但不限于因商誉损失、停工、计算机故障或故障引起的损害赔偿，或任何及所有其他商业损害或损失）由使用者负责。</p>

            <p><strong>4.</strong> 禁止在违反当地法律法规的情况下使用本项目。对于使用者在明知或不知当地法律法规不允许的情况下使用本项目所造成的任何违法违规行为由使用者承担，本项目不承担由此造成的任何直接、间接、特殊、偶然或结果性责任。</p>

            <p><strong>5.</strong> 音乐平台不易，请尊重版权，支持正版。</p>

            <p><strong>6.</strong> 本项目仅用于对技术可行性的探索及研究，不接受任何商业（包括但不限于广告等）合作及捐赠。</p>

            <p><strong>7.</strong> 如果官方音乐平台觉得本项目不妥，可联系本项目更改或移除。</p>
          </div>
        </div>

        {/* 弹窗底部 */}
        <div className="disclaimer-modal-footer">
          <div className="disclaimer-app-info">
            Tai Music v1.0.0
          </div>
          <button
            className="disclaimer-modal-confirm-btn"
            onClick={onClose}
          >
            确定
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DisclaimerModal;
