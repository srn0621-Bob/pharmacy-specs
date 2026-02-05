
import React, { useState } from 'react';

interface CheckoutViewProps {
  onBack: () => void;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ onBack }) => {
  const [selectedPay, setSelectedPay] = useState('wechat');

  return (
    <div className="bg-bg-light min-h-screen pb-32">
      {/* Dynamic Header Background */}
      <div className="bg-emerald-600 pb-20 pt-6 px-4 text-white">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="p-1">
            <span className="material-icons-round">arrow_back_ios_new</span>
          </button>
          <h1 className="font-bold text-lg">收银台</h1>
          <div className="w-6"></div>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">¥</span>
            <span className="text-6xl font-black">49.80</span>
          </div>
          <div className="mt-4 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm font-mono flex items-center gap-2">
            <span className="opacity-80">剩余支付时间</span>
            <span className="font-bold">5:59:54</span>
          </div>
        </div>
      </div>

      {/* Main Content Overlay */}
      <main className="px-4 -mt-10 space-y-4 relative z-10">
        {/* Status Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm flex gap-4">
          <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-2">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrUJSodSLbhvPCg2nsIWTIiEJyByHWfjEykb-aVanaKI31PTawQswu7DrVIcH6G3tBulTtlsSV_Kc_ACWl04esrn61-WF79beN_z-uZUjCB8GBj8pHkaL81X_x1hIsFJYbIzbnEb5f7ju7w1fRTOzGx0A5pu5blUsjIc7aS5dmTZW4r0biwsiMqcuWvy6HjBIk172twr5m3TpMEvgakJPo7GbzYTidY8oiNDPIPVGSJKfYmfXfYscdomId_ydM6sjIqC7ZoUHMlEPt" alt="" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg mb-1">清单已提交</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              请在1月24日19时48分前支付备货定金, 该金额由慈贞快药代收, 超时清单自动取消
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold mb-6">支付方式</h3>
          <div className="space-y-6">
            <div onClick={() => setSelectedPay('wechat')} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <span className="material-icons-round text-lg">chat</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">微信</span>
                  <span className="text-[10px] text-gray-400">亿万用户的选择，更快更安全</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPay === 'wechat' ? 'border-primary' : 'border-gray-200'}`}>
                {selectedPay === 'wechat' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
              </div>
            </div>

            <div className="h-px bg-gray-50 ml-12"></div>

            <div onClick={() => setSelectedPay('alipay')} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                  <span className="font-bold text-xs">支</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">支付宝</span>
                  <span className="text-[10px] text-gray-400">支付宝 APP 内完成支付</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPay === 'alipay' ? 'border-primary' : 'border-gray-200'}`}>
                {selectedPay === 'alipay' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
              </div>
            </div>

            <div className="h-px bg-gray-50 ml-12"></div>

            <div onClick={() => setSelectedPay('union')} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-sm bg-gradient-to-r from-red-500 via-blue-500 to-green-500 p-[1px]">
                  <div className="bg-white w-full h-full flex items-center justify-center">
                    <span className="text-[8px] font-bold text-blue-900">银联</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-bold">银联</span>
                    <span className="material-icons-round text-xs text-gray-300">help_outline</span>
                  </div>
                  <span className="text-[10px] text-gray-400">工银信用卡满 50 元立减 5 元</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPay === 'union' ? 'border-primary' : 'border-gray-200'}`}>
                {selectedPay === 'union' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 pb-12 bg-white border-t border-gray-100 z-50">
        <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 active:scale-[0.98] transition-transform">
          支付备货定金 ¥ 49.80
        </button>
      </footer>
    </div>
  );
};

export default CheckoutView;
