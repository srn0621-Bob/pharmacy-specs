
import React from 'react';
import { ViewType } from '../types';

interface NavbarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, onViewChange }) => {
  const items = [
    { id: ViewType.HOME, label: '慈贞快药', icon: 'home' },
    { id: ViewType.STORE, label: '慈贞商城', icon: 'storefront' },
    { id: ViewType.GROUP_BUY, label: '拼团', icon: 'groups', special: true },
    { id: ViewType.LIST, label: '清单列表', icon: 'article' },
    { id: ViewType.MINE, label: '我的', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 py-2 px-1 z-50 flex justify-around items-end safe-pb">
      {items.map((item) => {
        if (item.special) {
          return (
            <div key={item.id} className="relative -top-4">
              <div className="absolute -inset-1.5 bg-bg-light rounded-full"></div>
              <button 
                onClick={() => onViewChange(item.id)}
                className="relative bg-gradient-to-tr from-emerald-500 to-green-400 w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-lg shadow-emerald-200 border-2 border-white"
              >
                <span className="text-[10px] font-bold">特价</span>
                <span className="text-[12px] font-bold">拼团</span>
              </button>
            </div>
          );
        }

        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center flex-1 transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`}
          >
            <span className="material-icons-round">{item.icon}</span>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navbar;
