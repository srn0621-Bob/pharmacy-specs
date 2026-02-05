# Android 实现指南 - 100% 还原慈贞药房 UI

## 🎨 第一步：设计资源准备

### 1.1 颜色定义 (精确匹配)

```xml
<!-- mshlwyy_patient-mall/app/src/main/res/values/colors_dingdang_exact.xml -->
<resources>
    <!-- 主色系 - 精确匹配 React Tailwind emerald -->
    <color name="dingdang_primary">#10B981</color>          <!-- emerald-500 -->
    <color name="dingdang_primary_dark">#059669</color>     <!-- emerald-600 -->
    <color name="dingdang_primary_light">#34D399</color>    <!-- emerald-400 -->
    
    <!-- 背景色 -->
    <color name="dingdang_bg_light">#F9FAFB</color>         <!-- gray-50 -->
    <color name="dingdang_bg_white">#FFFFFF</color>
    
    <!-- 文字色 -->
    <color name="dingdang_text_primary">#111827</color>     <!-- gray-900 -->
    <color name="dingdang_text_secondary">#6B7280</color>   <!-- gray-500 -->
    <color name="dingdang_text_tertiary">#9CA3AF</color>    <!-- gray-400 -->
    
    <!-- 标签色 -->
    <color name="dingdang_tag_orange_bg">#FED7AA</color>    <!-- orange-200 -->
    <color name="dingdang_tag_orange_text">#EA580C</color>  <!-- orange-600 -->
    <color name="dingdang_tag_green_bg">#D1FAE5</color>     <!-- green-100 -->
