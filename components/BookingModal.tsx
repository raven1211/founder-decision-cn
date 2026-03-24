'use client';

import { useState } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CAL_COM_LINK = 'https://cal.com/raven-hu/30min';

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    message: ''
  });
  const [showCalLink, setShowCalLink] = useState(false);

  if (!isOpen) return null;

  const handleContinue = () => {
    // 保存诚意金到 localStorage，供后续参考
    if (formData.amount) {
      localStorage.setItem('bookingAmount', formData.amount);
    }
    if (formData.message) {
      localStorage.setItem('bookingMessage', formData.message);
    }
    setShowCalLink(true);
  };

  if (showCalLink) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center" onClick={e => e.stopPropagation()}>
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">前往 Cal.com 选时间</h3>
          <p className="text-sm text-gray-500 mb-6">
            你已填写诚意金参考 ¥{formData.amount || '0'}，点击下面按钮选时间
          </p>
          <a
            href={CAL_COM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="inline-block w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition text-center"
          >
            打开预约页面
          </a>
          <p className="text-xs text-gray-400 mt-4">预约完成后我们会邮件确认</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">预约 30 分钟深度咨询</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <p className="text-sm text-gray-500 mt-1">一对一聊聊你的项目，价格随喜</p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              诚意金参考（¥）
              <span className="text-gray-400 font-normal ml-1">— 随喜</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              placeholder="输入金额，0 表示免费咨询"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              这是一个参考值，实际随喜金额在咨询结束后确定
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              想聊什么（可选）
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full h-24 p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-gray-400"
              placeholder="简单描述你想深入探讨的问题..."
            />
          </div>

          <button
            onClick={handleContinue}
            className="w-full py-3.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
          >
            下一步：选择时间
          </button>

          <p className="text-xs text-gray-400 text-center">
            时间选择将在 Cal.com 完成
          </p>
        </div>
      </div>
    </div>
  );
}
