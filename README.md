# 互联网医院药房商城项目工作区

这是一个包含前后端项目的工作区，用于开发和维护互联网医院药房商城系统。

## 项目结构

```
mshlwyy_phamacy_mall/
├── mshlwyy_patient-mall/          # Android患者端应用
│   └── [独立Git仓库]
├── internet-hospital-mall/        # Java后端服务
│   └── [独立Git仓库]
├── .kiro/                         # Kiro AI助手配置
│   └── specs/                     # 功能规范文档
│       └── api-compatibility-audit/  # API兼容性审计规范
│           ├── requirements.md    # 需求文档
│           ├── design.md          # 设计文档
│           └── tasks.md           # 任务列表
└── README.md                      # 本文件
```

## 子项目

### 1. mshlwyy_patient-mall (患者端应用)
- **技术栈**: Android, Java, Retrofit, RxJava
- **仓库**: https://github.com/srn0621-Bob/mshlwyy_patient.git
- **分支**: main
- **功能**: 患者端移动应用，包含药品浏览、购物车、订单管理等功能

### 2. internet-hospital-mall (后端服务)
- **技术栈**: Spring Boot, MyBatis, MySQL
- **仓库**: https://github.com/srn0621-Bob/internet-hospital.git
- **分支**: master
- **功能**: 提供RESTful API服务，支持药品商城、订单管理、用户认证等

## 规范文档

### API兼容性审计规范
位于 `.kiro/specs/api-compatibility-audit/`

这个规范定义了一个自动化系统，用于：
- 扫描前端Retrofit API接口定义
- 扫描后端Spring MVC Controller定义
- 对比前后端API，识别不匹配问题
- 生成详细的兼容性审计报告
- 提供具体的解决方案

**主要文档**:
- `requirements.md` - 7个主要需求和验收标准
- `design.md` - 系统架构、组件设计、数据模型
- `tasks.md` - 17个实施任务的详细计划

## 开发指南

### 克隆项目
```bash
# 克隆工作区
git clone <workspace-repo-url> mshlwyy_phamacy_mall
cd mshlwyy_phamacy_mall

# 克隆子项目
git clone https://github.com/srn0621-Bob/mshlwyy_patient.git mshlwyy_patient-mall
git clone https://github.com/srn0621-Bob/internet-hospital.git internet-hospital-mall
```

### 使用Kiro AI助手
1. 在VS Code中打开工作区
2. 打开 `.kiro/specs/api-compatibility-audit/tasks.md`
3. 点击任务旁的"Start task"按钮开始实施

## 最近更新

- **2026-01-05**: 创建API兼容性审计规范
- **2026-01-05**: 整理项目文档到docs目录
- **2026-01-05**: 修复购物车功能和用户认证

## 许可证

[待定]
