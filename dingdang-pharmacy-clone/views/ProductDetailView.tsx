
import React, { useState } from 'react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product | null;
  onBack: () => void;
  onGoToCart: () => void;
}

const RECOMMENDED_PRODUCTS: Partial<Product>[] = [
  { id: 'r1', name: 'OTC [九芝堂] 足光散 40gx3袋', price: 18.3, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-EQUGeh9j8L8hwEQdvzQRvsuw4jfA4nsuFVaQznoKtM-8sJc6Lm11eKRwFj5Uucgj07kFD_mEUYfF3wHZDj_2sjlfTn6iD180xaHvukpYn1Y-PSdej6wHMzLSueESUJFoaljG-F9RjDFvzVoAudRURVvqAJAue3KyxnroMZHAURDBBIrpm_wdeeM4NVOLurJtpOH6QDZhe7rZkIlEjYJeSP3eoAxzjkPzA8jGMaw1wmZlOlDF4KPFrLFbCalXxGF31b7n3x5W_IP_' },
  { id: 'r2', name: 'OTC [仁和] 盐酸特比萘芬乳膏', price: 14.8, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYiCjcI2PWVPuDJ7CujWP-eG4504Ql08bW3M32WUaFKS1xgwDj9l5cmYKMtHG2mHqRO3J8n-Exi8hSAqS_MeSlclcRgYbA0AfIlKeizC4rOzfghfc90Mm2IQkCOW9q6yzP7U2GnsY9PYC4v-qLy0dADkVFeO9o0pn7H1XayYgrlQgdcxZLMoOQeyJgGxjwnwA-KsjgNFmnedcz_yyaqhbIHWACrq7B56yiB8TMNEWCjRPQqG9Hr3AqyiRj-luzGVf0zoHCVaNIVk2J' },
  { id: 'r3', name: 'OTC [仁和] 硝酸咪康唑乳膏', price: 16, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXf4VRxrLOzCIQkJtyYThLXS-pa72O9pjIYqP4Bf9k-bUEglKFYzJJHAHEbKJLn2ROsMWALxAFk8cwj9vhXgIKU40uvx5V_ZBkpDazbnX9Ta7_1yUBp4i9DYEHms5KPj5TMM97zNy0Z45mxJery4GEwVmB3hRPr1hY0Dj_rNRlGYpAoTL6he9Vrt6dK7ERRpFDz0QLTZBZ-qqsyNRHTS7hXVg-N9gKx9MtFeAMLd_2KHfcgf_UWBniYaeCdk2WcBqyAFjO3SrmioZl' },
  { id: 'r4', name: 'OTC [仁和] 硝酸益康唑喷雾', price: 28, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyCjBBSt-NqhvNWkghSqqt-7faFSuUHa6_oj4Cjq7nTI4v7PtW3WMvBQciTaJTbdyaU8QwnteZkYeryQ-Ieaq2r_w6SbzVgHyYacuvUIK5vPaz11R5F1PqHyPIezg4Ru5FJZYK1hrJjHvnBRqRGg0Wo5DsWevPBVA6QIO3x8x60I-tNPiqhKDGPMKh7n2Bs5vtL9PDqTcH_NQ7wATfq0R08hvvfNGiuQZSzeLFjEySzN5-_kCECW6jwH8FvUdNqt8faWAcxoHRjNFY' },
  { id: 'r5', name: 'OTC [达克宁] 硝酸咪康唑', price: 39, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDY-Z5K_lu3G-YqKTZ58hwSfgutit1iG6OGL_MXyZLQbdnjih8ccbka98G62pG1xznA4GOOZ5tb-eq6-D1MFxPI1syhsNNEGuG7ni_IUNtnjsXdOhoXenn_trhYNp0PGrqacWsMIYBGyXHMWWIQ7PnHO1T0yfSYTwXhh6_Piylr2lsbu6LSQU0huiXzAeLLO0n44GsDXQd2yt87weJ7efwtqAnmPEXH-HlxL9IQrOkgBWu8CC2PG3hIWovmIar59jpkJ5OP3lPFgLW' },
  { id: 'r6', name: 'OTC [神奇] 珊瑚癣净 250ml', price: 45, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtnw7eXEz-618pGrcjNeagC53nEEwexJ5_7SCFcbnB_wlCIhYV5FzSRgqHdVfBwQiBwZqgxpWMY8BomYUQFuoR138qMJ5ew9sxjG9UvVONqHtG35K6GmDxjeJbQirSu_jtfceE0H2Qp0GNFpwrKrXa2wXeAVajV4G6Xg818lREceQhNOul1C5l15uisrTIJmmnCKr48L9YTGXns3JNf5C2GXX71t7cE3O-y1xqeuRgYRJlTpAwR4fYSo3UrupRLJrgrenkorgAAswY' },
];

const ProductDetailView: React.FC<ProductDetailProps> = ({ product, onBack, onGoToCart }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!product) return null;

  return (
    <div className="bg-bg-light min-h-screen pb-24 font-sans relative">
      {/* Success Modal Overlay */}
      {isModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[60] transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-[70] transition-transform duration-300 transform translate-y-0 max-w-md mx-auto">
            <div className="bg-white rounded-t-[32px] pt-8 pb-10 px-4 shadow-2xl max-h-[90vh] flex flex-col relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-6 text-gray-400"
              >
                <span className="material-icons-round text-2xl">close</span>
              </button>
              
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-icons-round text-primary text-3xl">check_circle</span>
                  <h2 className="text-xl font-bold text-gray-900">添加清单成功</h2>
                </div>
                <p className="text-sm text-gray-500">搭配组合商品</p>
              </div>

              <div className="flex-1 overflow-y-auto hide-scroll pb-4">
                <div className="grid grid-cols-3 gap-3">
                  {RECOMMENDED_PRODUCTS.map((p) => (
                    <div key={p.id} className="flex flex-col bg-white border border-gray-100 rounded-xl p-2 relative shadow-sm">
                      <img src={p.image} className="w-full aspect-square object-contain rounded-lg mb-2" alt="" />
                      <h3 className="text-[11px] leading-tight text-gray-800 line-clamp-2 mb-2 h-7">{p.name}</h3>
                      <div className="mt-auto">
                        <div className="text-[10px] text-primary bg-emerald-50 inline-block px-1 rounded mb-1">到手约</div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">¥{p.price}</span>
                          <button className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                            <span className="material-icons-round text-sm">shopping_cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-2 mb-4">
                <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-primary/40"></div>
                </div>
              </div>

              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 border-2 border-primary text-primary font-bold rounded-full bg-white active:bg-gray-50"
                >
                  返回商品
                </button>
                <button 
                  onClick={onGoToCart}
                  className="flex-1 py-3.5 bg-primary text-white font-bold rounded-full shadow-lg shadow-emerald-200 active:bg-emerald-600"
                >
                  去清单结算
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Navbar Overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center max-w-md mx-auto pointer-events-none">
        <button onClick={onBack} className="p-2 rounded-full bg-black/20 text-white backdrop-blur pointer-events-auto">
          <span className="material-icons-round">arrow_back_ios_new</span>
        </button>
        <div className="flex gap-3 pointer-events-auto">
          <button className="p-2 rounded-full bg-black/20 text-white backdrop-blur">
            <span className="material-icons-round">share</span>
          </button>
          <button className="p-2 rounded-full bg-black/20 text-white backdrop-blur">
            <span className="material-icons-round">more_horiz</span>
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div className="bg-white p-8 aspect-square flex items-center justify-center relative shadow-sm">
        <img src={product.image} className="max-w-full max-h-full object-contain" alt="" />
        <div className="absolute bottom-4 right-4 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur">1/5</div>
      </div>

      {/* Pricing & Titles */}
      <div className="bg-white px-4 py-5 mb-2 rounded-b-3xl">
        <div className="flex justify-between items-baseline mb-3">
          <div className="flex items-baseline text-primary font-bold">
            <span className="text-sm">¥</span>
            <span className="text-3xl ml-0.5">{product.price}</span>
          </div>
          <span className="text-xs text-gray-400">月销{product.sales}件</span>
        </div>
        <div className="flex gap-2 mb-4 overflow-x-auto hide-scroll">
          <span className="px-2 py-0.5 border border-primary text-primary text-[10px] rounded whitespace-nowrap">低价换购</span>
          <span className="px-2 py-0.5 border border-primary text-primary text-[10px] rounded whitespace-nowrap">返12个慈贞币</span>
          <span className="px-2 py-0.5 bg-green-50 text-primary text-[10px] rounded whitespace-nowrap">满99减50</span>
          <span className="px-2 py-0.5 bg-green-50 text-primary text-[10px] rounded whitespace-nowrap">满499减100</span>
        </div>
        <h1 className="text-lg font-bold leading-tight flex items-start gap-1">
          <span className="bg-secondary text-white text-[10px] px-1 py-0.5 rounded mt-1 flex-shrink-0">快递送</span>
          <span className="bg-primary text-white text-[10px] px-1 py-0.5 rounded mt-1 flex-shrink-0">自营</span>
          {product.name}
        </h1>

        {/* Medication Info Bar */}
        <div className="mt-5 bg-gray-50 rounded-xl p-3 flex divide-x divide-gray-200">
          <div className="flex-1 pr-3 flex gap-2">
            <div className="text-[10px] font-bold text-gray-400 flex flex-col justify-center">用药<br/>指导</div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-800 flex items-center">
                <span className="material-icons-round text-xs mr-0.5 text-gray-300">healing</span>
                功能主治
              </span>
              <p className="text-[10px] text-gray-500 line-clamp-1">清热燥湿，杀虫敛汗...</p>
            </div>
          </div>
          <div className="flex-1 pl-3 flex flex-col">
            <span className="text-[10px] font-bold text-gray-800 flex items-center">
              <span className="material-icons-round text-xs mr-0.5 text-gray-300">medication</span>
              用法用量
            </span>
            <p className="text-[10px] text-gray-500 line-clamp-1">外用，取粉40g沸水...</p>
          </div>
        </div>
        <div className="mt-3 bg-green-50 text-primary text-[10px] p-2 rounded">
          限购说明：本商品单次限购6件
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-white p-4 mb-2 space-y-4">
        <div className="flex items-center text-xs">
          <span className="w-12 text-gray-400">规格</span>
          <span className="text-gray-900">20gx3袋</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="material-icons-round text-green-500 text-sm">check_circle_outline</span>
            <span>本品不支持7天无理由退换货</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="material-icons-round text-green-500 text-sm">check_circle_outline</span>
            <span>新老包装随机发货</span>
          </div>
          <div className="flex items-start gap-1.5 text-[10px] text-gray-400 leading-tight">
            <span className="material-icons-round text-green-500 text-sm mt-0.5">check_circle_outline</span>
            <span>*非处方药 (OTC) 请仔细阅读说明书并按说明使用或在药师指导下购买</span>
          </div>
        </div>
      </div>

      {/* Shop Info */}
      <div className="bg-white p-4 mb-2 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-[10px] text-primary font-bold text-center leading-tight">
            慈贞<br/>商城
          </div>
          <div>
            <h4 className="text-sm font-bold">慈贞商城旗舰店</h4>
            <p className="text-[10px] text-gray-400">满 ¥48包邮，快递送</p>
          </div>
        </div>
        <span className="material-icons-round text-gray-300">chevron_right</span>
      </div>

      {/* Specs Sheet */}
      <div className="bg-white p-4 mb-2">
        <h2 className="text-sm font-bold mb-4">说明书</h2>
        <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
          {[
            ['通用名称', '足光散'],
            ['商品名称', '[仁和]足光散'],
            ['药品成分', '水杨酸、苯甲酸、硼酸、苦参'],
            ['功能主治', '清热燥湿，杀虫敛汗。用于湿热下注...'],
            ['生产厂商', '广东恒诚制药股份有限公司'],
          ].map(([label, val]) => (
            <div key={label} className="flex border-b border-gray-50 last:border-none">
              <div className="w-24 bg-gray-50 p-3 text-gray-400 font-medium">{label}</div>
              <div className="p-3 text-gray-800 flex-1">{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-4 py-2 pb-6 flex items-center justify-between z-50">
        <div className="flex gap-6 pr-4">
          <div className="flex flex-col items-center text-primary">
            <span className="material-icons-round text-xl">medication_liquid</span>
            <span className="text-[9px]">药师指导</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <span className="material-icons-round text-xl">share</span>
            <span className="text-[9px]">分享</span>
          </div>
          <div onClick={onGoToCart} className="flex flex-col items-center text-gray-400 relative">
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">2</span>
            <span className="material-icons-round text-xl">receipt_long</span>
            <span className="text-[9px]">清单</span>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 bg-primary text-white font-bold py-3 rounded-full shadow-lg shadow-emerald-200"
        >
          加入清单
        </button>
      </div>
    </div>
  );
};

export default ProductDetailView;
