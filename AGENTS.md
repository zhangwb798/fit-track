# 项目上下文

## 技术栈

- **核心**: Vite 7, TypeScript, Express
- **UI**: Tailwind CSS
- **数据存储**: localStorage（纯前端，无需后端）

## 项目概览

健身记录单页 Web 应用，移动端优先，适配微信浏览器。用户可记录每日健身打卡、查看出勤日历、统计出勤率和各部位锻炼占比。

## 目录结构

```
├── scripts/            # 构建与启动脚本
├── server/             # Express 服务（仅提供静态资源 + Vite 中间件）
├── src/                # 前端源码
│   ├── components/     # 通用组件
│   │   ├── donutChart.ts           # SVG 环形图
│   │   ├── partPicker.ts           # 部位选择弹窗
│   │   ├── recordModal.ts          # 补卡/记录列表弹窗
│   │   ├── initialSettingsModal.ts # 初始数据设置弹窗
│   │   └── toast.ts                # Toast 提示
│   ├── data/           # 数据层
│   │   ├── storage.ts        # localStorage 打卡记录读写
│   │   └── config.ts         # localStorage 配置（初始日期/次数）
│   ├── pages/          # 页面
│   │   ├── home.ts           # 首页（打卡、出勤表、数据总览）
│   │   ├── stats.ts          # 统计页（出勤率、部位占比）
│   │   └── settings.ts       # 设置页（补卡、删除、导入导出）
│   ├── types/          # 类型定义
│   │   └── bodyPart.ts       # 锻炼部位定义
│   ├── utils/          # 工具函数
│   │   └── dateUtils.ts      # 日期计算与统计
│   ├── index.css       # 全局样式
│   ├── index.ts        # 客户端入口
│   └── main.ts         # 主逻辑（Tab 路由 + 页面调度）
├── index.html          # 入口 HTML
├── DESIGN.md           # 设计规范
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 核心数据结构

```ts
interface WorkoutRecord {
  id: string;          // 唯一 ID
  date: string;        // YYYY-MM-DD
  parts: BodyPart[];   // 锻炼部位
  createdAt: number;   // 时间戳
  note?: string;
}
```

部位：`chest`(胸)、`back`(背)、`shoulder`(肩)、`arm`(臂)、`leg`(腿)、`core`(核心)、`cardio`(有氧)

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。

## 开发规范

- 使用 Tailwind CSS 进行样式开发
- 默认按 TypeScript `strict` 心智写代码
- 禁止隐式 `any` 和 `as any`
- 函数参数、返回值必须有明确类型

## 构建与运行

```bash
pnpm install    # 安装依赖
pnpm run dev    # 开发模式
pnpm run build  # 构建生产版本
pnpm run start  # 生产启动
pnpm ts-check   # 类型检查
pnpm lint       # 代码检查
```
