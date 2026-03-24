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
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">前往 Cal.com 选时间</h3>
          <p className="text-sm text-gray-500 mb-6">
            你已填写诚意金参考 ¥{formData.amount || '0'}，点击下面按钮选时间
          </p>
          
          <a
            href={CAL_COM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="block w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition text-center"
          >
            打开预约页面
          </a>
          
          <p className="text-xs text-gray-400 mt-4">预约完成后我们会邮件确认</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">预约深度咨询</h3>
                <p className="text-sm text-gray-500">30 分钟一对一，价格随喜</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
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
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
              placeholder="输入金额，0 表示免费咨询"
            />
            <p className="text-xs text-gray-400 mt-2">
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
              className="w-full h-24 px-4 py-3 bg-white border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
              placeholder="简单描述你想深入探讨的问题..."
            />
          </div>

          <button
            onClick={handleContinue}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 active:scale-[0.98] transition"
          >
            下一步：选择时间
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            时间选择将在 Cal.com 安全完成
          </div>
        </div>
      </div>
    </div>
  );
}
