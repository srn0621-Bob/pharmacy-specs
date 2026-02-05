
import React from 'react';
import { Product } from '../types';

interface CartViewProps {
  onBack: () => void;
  onCheckout: () => void;
  onProductClick: (p: Product) => void;
}

const CART_ITEMS = [
  {
    id: '1',
    name: 'OTC[仁和]足光散 20gx3袋',
    price: 12.8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDQr1ewzBlYUIzP9iZmTuAe5QFeyq9zmta_QQXZwIFZ3mLYbhcx--Q7tL99ag0QI19MGLX7uqo7MKSjwMuEn9to5LJTXP7xYvbC3p-PmEooFxVnA9d_cloMrlyrX_nN6LgAav0F8NzYVtp0NWURehvd1Dglmy6Rm3X1EuYJ7eoC42l_n97wBBqXEEsFZRFa0pnry_r6Fnn2avUvJnxJsdeq5124cywvOjVcy0APYRhBiVneHuyg80RlHPTXmNTbszgJBOuDtbWzRI5',
    quantity: 1,
    tag: '超值换购'
  },
  {
    id: '2',
    name: 'OTC[九芝堂]小柴胡颗粒 10gx9袋',
    price: 18.2,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzIL0HzfUbtwU-IB88K23PWj2IAWVvrBySVNgPJFI1sXxso49lwwk7PFqjUi497bgX-9UpCjmRbXz46URBvvfJU6AZZ1h8RK9E_Yw0kttc_PW8LquQr7Y8bebei-kAY-D3-vt45jSbFH5FMWrBXATIFfFjYzUsd9KzKSDVoTaZbRiqypkXbWJM8-P2y8Kir97NR5UkDyS4g3c5QManJbyMLj-LzQ1uxe3mjifMryYEmvV4v0IZdEYngikXR77wlOjDDHEAgfrvs84v',
    quantity: 1,
    promoPrice: 12,
    tag: '超值换购'
  }
];

const OFTEN_BOUGHT: Partial<Product>[] = [
  {
    id: 'ob1',
    name: '[海氏海诺]医用碘伏消毒棉球 25粒',
    price: 4.5,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqvxKj30uuc10ciQXAUOgvJ2s9O67g9XUvbkLY1kCziiqSfquMquUNbPxb0NthVCHJ2rCkXt92dcfNDstTLHThNy03sOhVt8-NGk2AM6eRrjs5zJ5we8amG2HvqJ7ROntlpbAVHJaycB7AKlp11tDvvk7vHMADZvmLBypRZZUfDHsETRheMX9hXlxDYzTZxdaT_sHPOKKUU6OyptnXLDm5h6V6W1Uzrvh6hb2_cUhHvkoXQaxUrIvQy6zEKfk5Q0-9RexnbDICgxMD',
    sales: 419,
    tags: ['快递送', '自营']
  },
  {
    id: 'ob2',
    name: '[仁和健途]医用碘伏消毒棉球 25粒',
    price: 2.9,
    originalPrice: 5.9,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9BP4uooLhQ-c6l2U7zAPtY6k84s76H6NaxOq3CqhbKM_JuSky3qlMfSZs9crjXtc-zcv5b4EPu9EtuAUFx6osTLCXQI1XjTEf64XDUjecDnmCQqIaeGu7iUPxFnRNl0TO7jazCt9RWrFIehlB7b5af97x5RecLUaG8ezJxL_jThllFAp9diHxLpy1WLGNYeqt9uROifzEYzfMt6t9gQatg8pbrVpw41iaZWXy49MFs3LVVuyYiw2EbQMnyapMkXOjyQgvaZww-hRq',
    sales: 1514,
    tags: ['快递送', '自营', '直降']
  }
];

const CartView: React.FC<CartViewProps> = ({ onBack, onCheckout, onProductClick }) => {
  return (
    <div className="bg-bg-light min-h-screen pb-40 font-sans">
      {/* Header */}
      <header className="sticky top-0 bg-white px-4 py-3 flex justify-between items-center shadow-sm z-40">
        <button onClick={onBack} className="p-1">
          <span className="material-icons-round text-2xl">arrow_back_ios_new</span>
        </button>
        <h1 className="font-bold text-lg">清单</h1>
        <button className="text-gray-600 font-medium">编辑</button>
      </header>

      {/* Cart Content */}
      <div className="m-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center mt-1">
            <span className="material-icons-round text-white text-xs">done</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-600 text-[10px] px-1 rounded">商城</span>
              <span className="bg-primary text-white text-[10px] px-1 rounded">自营</span>
              <span className="font-bold text-sm">慈贞商城旗舰店</span>
              <span className="material-icons-round text-sm text-gray-300">chevron_right</span>
            </div>
            <p className="text-[10px] text-primary mt-1">满48元包邮, 快递送</p>
          </div>
        </div>

        <div className="bg-green-50 p-2.5 rounded-xl flex justify-between items-center mb-5">
          <span className="text-[10px] text-gray-600">店铺有1个活动，可超值换购1元商品!</span>
          <span className="text-[10px] text-primary font-bold">查看更多 &gt;</span>
        </div>

        <div className="space-y-8">
          {CART_ITEMS.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="pt-8">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-icons-round text-white text-xs">done</span>
                </div>
              </div>
              <img src={item.image} className="w-20 h-20 object-contain border border-gray-100 rounded-xl" alt="" />
              <div className="flex-1">
                <h4 className="text-sm font-bold line-clamp-2 leading-tight">{item.name}</h4>
                <div className="mt-1 flex gap-1">
                  <span className="border border-primary text-primary text-[8px] px-1 rounded">{item.tag}</span>
                </div>
                <div className="mt-3 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-primary font-bold">¥{item.price}</span>
                    {item.promoPrice && <span className="text-[9px] text-primary bg-green-50 px-1 rounded mt-0.5">预估到手价 ¥{item.promoPrice}</span>}
                  </div>
                  <div className="flex border border-gray-200 rounded-md bg-gray-50 overflow-hidden items-center">
                    <button className="px-2 py-0.5 text-gray-400 font-bold">-</button>
                    <span className="px-3 py-0.5 text-xs font-bold border-x border-gray-200 bg-white">{item.quantity}</span>
                    <button className="px-2 py-0.5 text-gray-400 font-bold">+</button>
                  </div>
                </div>
                <p className="text-[9px] text-primary mt-1">{item.id === '1' ? '该商品单笔限购6件' : '已参加直降'}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-5 border-t border-gray-50">
          <h5 className="text-[11px] font-bold text-gray-800 mb-4">仁和青果薄荷糖买赠(数量有限，赠完即止)</h5>
          <div className="flex gap-3 opacity-60 grayscale">
            <div className="w-16 h-16 bg-gray-100 rounded-xl relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                <span className="text-[9px] font-bold text-white border border-white px-2 py-0.5 rounded-full">已赠完</span>
              </div>
              <img src="https://picsum.photos/seed/gift/100/100" className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold">¥ 0</span>
              <span className="text-[10px] text-gray-400 line-through">¥ 3.90</span>
              <span className="text-[10px] text-gray-400 mt-1">x1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Often Bought section */}
      <div className="px-4 mt-8">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px bg-gray-200 flex-1"></div>
          <h2 className="text-gray-400 text-sm font-bold">常买常逛</h2>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {OFTEN_BOUGHT.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-3 shadow-sm flex flex-col">
              <img src={p.image} className="w-full h-32 object-contain mb-3 rounded-xl bg-gray-50" alt="" />
              <div className="flex flex-wrap gap-1 mb-1.5">
                {p.tags?.map(t => (
                  <span key={t} className={`${t === '快递送' ? 'bg-orange-400 text-white' : 'text-primary border border-primary'} text-[8px] px-1 rounded-sm`}>
                    {t}
                  </span>
                ))}
              </div>
              <h4 className="text-xs font-bold line-clamp-2 h-8 leading-tight text-gray-800">{p.name}</h4>
              <p className="text-[10px] text-gray-400 mt-1">月销{p.sales}件</p>
              <div className="mt-auto flex justify-between items-end">
                <div className="flex flex-col">
                  {p.originalPrice && <span className="text-[9px] text-gray-400 line-through">¥{p.originalPrice}</span>}
                  <span className="text-primary font-bold text-lg">¥{p.price}</span>
                </div>
                <button className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                  <span className="material-icons-round text-sm">shopping_cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Summary - Always fixed, no navbar underneath */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 pb-8 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <span className="material-icons-round text-white text-xs">done</span>
          </div>
          <span className="text-sm text-gray-500 font-medium">全选</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-sm font-bold">总计:</span>
              <span className="text-primary font-bold text-xl">¥43.8</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 justify-end">
              <span className="text-[9px] text-gray-400">明细</span>
              <span className="material-icons-round text-[10px] text-gray-400">expand_less</span>
              <span className="text-[9px] text-gray-400 ml-2">已优惠: ¥17.1</span>
            </div>
          </div>
          <button 
            onClick={onCheckout}
            className="bg-gradient-to-r from-emerald-600 to-green-500 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-transform flex flex-col items-center justify-center h-12 w-28"
          >
            <span className="text-base leading-none">提交</span>
            <span className="text-[10px] opacity-90 leading-none mt-1">1个店铺</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CartView;
