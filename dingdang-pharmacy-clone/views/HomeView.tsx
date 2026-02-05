
import React from 'react';
import { Product } from '../types';

interface HomeViewProps {
  onProductClick: (p: Product) => void;
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: '[仁和]足光散 20gx3袋',
    brand: '仁和',
    price: 12.8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD58avrFgcfytK8aPq-INiYxoCFmnRXEavRVZx_AlfCew1VrqgOWzkIMFhh2y2_hugYlhN65LtYqs8-L63IPEsHjO0HGyo_GYa2Z95WgKz7p5ygWTXoDuKZE7bIBFFnW28qkRtzJ9pcQiMolX7r6ARbFUEu0XvEznZnPLGjDLi65ai5Dl8SA6uqey6QyQhdI6WXT7OLh01R42WPdF5HSbn0OvmQwjQclnePQkfdh7QFkT0kEI1KaRl9JIdL6XLWO8kZVXEHDtcrXGY5',
    tags: ['快递送', '自营'],
    sales: 484
  },
  {
    id: '2',
    name: 'OTC [仁和]藿香正气胶囊 0.3gx12粒x2板',
    brand: '仁和',
    price: 15.6,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgf5L3GhOYGyf9Ap2uxeDWfGJ-QS7tc8yefDtYStwmgi0o4-xYqruAjZXna7yocdovr6U95ecCXOaxKD2un_aB6QYbAfpEIvL--izDHhJhM9sfxlKg77rEMaIhWgHJlTbdiJtQgrmUmSLQ-l0gioa0c8eXANkBe6eD4AOpMSQ3JJYQyB6uS-6vG9SYlD-h7Ro9qkp6lmqOfcBl-0Jv4aBw2280YyoLChZVi9fhxdemjx60j3bVH-Ft3OQwhHzP6P0DgornDn5fWc9F',
    tags: ['快递送', '自营', '赠'],
    sales: 435
  },
  {
    id: '3',
    name: 'OTC [仁和]曲安奈德益康唑乳膏+[氧和堂]足光散',
    brand: '仁和',
    price: 18,
    originalPrice: 39.6,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCV8NismZNbuXsI2ykdH4Na65hoAclMk_cJOX_87vNq19snFf3-ApXXylhYx6Zp4fA9OVz1Ra0ZY4O9yuKilkqvyPVbgH_50UlsfdLITkyNv-GJb6NbVQ5WIz9yQ-eNRsXFru-jzLP2t-1tCRAGnXDnQKRanX9-ItkH0BoLhpPbh26j53eqSUwIPaCuRB1Orhr-rXWTKuuyEvbOksB-_3j0G2hupflQ4Zqll7xx79kvIdTjEIkr2d6ZAfbTZ9OoLBlMYu_M0IKIE1s',
    tags: ['快递送', '自营'],
    sales: 120
  }
];

const HomeView: React.FC<HomeViewProps> = ({ onProductClick }) => {
  return (
    <div className="bg-bg-light min-h-screen">
      {/* Header */}
      <header className="bg-emerald-500 p-4 pt-6 text-white sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold">慈贞商城</h1>
            <p className="text-[10px] opacity-80">药企联盟直供 全国发货</p>
          </div>
          <div className="flex gap-4">
            <span className="material-icons-round">history</span>
            <span className="material-icons-round">local_shipping</span>
          </div>
        </div>
        <div className="relative mb-3">
          <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
          <input 
            type="text" 
            placeholder="缺铁性贫血" 
            className="w-full pl-9 pr-4 py-2.5 rounded-full border-none bg-white text-gray-800 text-sm focus:ring-0"
          />
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scroll text-xs whitespace-nowrap pb-1">
          {['补气血', '司美格鲁肽', '积食', '伟哥', '增强免疫力', '减肥'].map(tag => (
            <span key={tag} className="opacity-90">{tag}</span>
          ))}
        </div>
      </header>

      {/* Main Categories */}
      <section className="bg-white rounded-b-2xl p-4 shadow-sm mb-3">
        <div className="grid grid-cols-5 gap-y-4 text-center">
          {[
            { name: '防暑抗夏', icon: 'spa', color: 'bg-green-100 text-green-600' },
            { name: '皮肤用药', icon: 'medical_services', color: 'bg-blue-100 text-blue-600' },
            { name: '肠胃消化', icon: 'sick', color: 'bg-orange-100 text-orange-600' },
            { name: '呼吸止咳', icon: 'masks', color: 'bg-red-100 text-red-600' },
            { name: '心脑三高', icon: 'favorite', color: 'bg-purple-100 text-purple-600' },
            { name: '男科补肾', icon: 'face', color: 'bg-indigo-100 text-indigo-600' },
            { name: '妇科调理', icon: 'pregnant_woman', color: 'bg-pink-100 text-pink-600' },
            { name: '成人情趣', icon: 'volunteer_activism', color: 'bg-yellow-100 text-yellow-600' },
            { name: '肝胆用药', icon: 'healing', color: 'bg-teal-100 text-teal-600' },
            { name: '五官用药', icon: 'visibility', color: 'bg-gray-100 text-gray-600' },
          ].map(cat => (
            <div key={cat.name} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${cat.color}`}>
                <span className="material-icons-round text-xl">{cat.icon}</span>
              </div>
              <span className="text-[10px] font-medium">{cat.name}</span>
            </div>
          ))}
        </div>
        
        {/* Sub Categories */}
        <div className="grid grid-cols-5 gap-2 mt-5">
          {[
            { name: '免费问诊', icon: 'support_agent', color: 'text-blue-500', bg: 'bg-blue-50' },
            { name: '专家医生', icon: 'local_hospital', color: 'text-green-500', bg: 'bg-green-50' },
            { name: '智能器械', icon: 'monitor_heart', color: 'text-orange-500', bg: 'bg-orange-50' },
            { name: '肠胃健康', icon: 'stomach', color: 'text-red-500', bg: 'bg-red-50' },
            { name: '特药药房', icon: 'medication', color: 'text-yellow-500', bg: 'bg-yellow-50' },
          ].map(sub => (
            <div key={sub.name} className={`flex flex-col items-center p-2 rounded-lg ${sub.bg}`}>
              <span className={`material-icons-round text-lg mb-0.5 ${sub.color}`}>{sub.icon}</span>
              <span className="text-[10px] scale-90">{sub.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Product Feed */}
      <div className="p-3 grid grid-cols-2 gap-3 pb-8">
        {/* Left Column */}
        <div className="space-y-3">
          <div className="bg-blue-50 rounded-xl p-4 flex flex-col">
            <h3 className="font-bold text-blue-900 text-sm leading-tight">均衡营养<br/>各“瓶”实力</h3>
            <p className="text-[10px] text-blue-600 mt-1">部分商品满119减30元</p>
            <button className="bg-blue-500 text-white text-[8px] px-2 py-0.5 rounded-full mt-2 w-fit">点击查看 &gt;</button>
          </div>
          {PRODUCTS.slice(0, 2).map(p => (
            <div key={p.id} onClick={() => onProductClick(p)} className="bg-white rounded-xl p-3 shadow-sm">
              <img src={p.image} className="w-full h-32 object-contain mb-2 rounded" alt="" />
              <div className="flex gap-1 mb-1">
                {p.tags?.map(t => (
                  <span key={t} className="bg-orange-100 text-orange-600 text-[9px] px-1 rounded">{t}</span>
                ))}
              </div>
              <h4 className="text-xs font-medium line-clamp-2 h-8 leading-tight">{p.name}</h4>
              <div className="flex gap-1 mt-1 mb-2">
                <span className="border border-primary text-primary text-[8px] px-1 rounded">自营</span>
              </div>
              <p className="text-[9px] text-gray-400">月销{p.sales}件</p>
              {/* Removed the Price and Cart Button area as indicated in the screenshot */}
            </div>
          ))}
        </div>
        {/* Right Column */}
        <div className="space-y-3">
          {PRODUCTS.slice(2).concat(PRODUCTS).map((p, idx) => (
            <div key={`${p.id}-${idx}`} onClick={() => onProductClick(p)} className="bg-white rounded-xl p-3 shadow-sm">
              <img src={p.image} className="w-full h-32 object-contain mb-2 rounded" alt="" />
              <div className="flex gap-1 mb-1">
                {p.tags?.map(t => (
                  <span key={t} className="bg-orange-100 text-orange-600 text-[9px] px-1 rounded">{t}</span>
                ))}
              </div>
              <h4 className="text-xs font-medium line-clamp-2 h-8 leading-tight">{p.name}</h4>
              <div className="flex gap-1 mt-1 mb-2">
                <span className="border border-primary text-primary text-[8px] px-1 rounded">自营</span>
              </div>
              <p className="text-[9px] text-gray-400">月销{p.sales}件</p>
              {/* Removed the Price and Cart Button area as indicated in the screenshot */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
