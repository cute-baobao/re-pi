# Agent Rebuild RoadMap

这是 `pi-agent-roadmap.html` 的 Next.js App Router 版本。原始单文件 HTML 被保留为只读快照；Next.js 版本把内容、运行时校验、进度状态和界面拆开，便于持续补充学习资料与阶段任务。

当前包含两份 RoadMap，共用同一套页面与进度组件：

- **Pi Agent Rebuild RoadMap**(`/concepts` + `/implementation`)：复刻 [earendil-works/pi](https://github.com/earendil-works/pi) 编码 Agent
- **DeepSeek Harness Rebuild RoadMap**(`/dsh`)：复刻 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) Agent Harness

## 技术选择

- **Next.js + TypeScript**：组织页面、组件与静态导出，不引入后端依赖。
- **Zod**：在构建阶段校验两份 RoadMap JSON，并校验导入的进度文件。
- **Zustand persist**：维护任务、概念、笔记和耗时；Pi 版继续使用旧 HTML 的 `localStorage` key 与数据形状。
- **Fuse.js**：为阶段、任务、概念和资料提供浏览器端模糊搜索。
- **原生 `<dialog>` / `<details>` / `<progress>`**：避免为已有浏览器能力再引入 UI 组件库。

没有引入 Tailwind、shadcn/ui、动画库或数据库。当前 RoadMap 是单页本地工具，这些依赖不会改善核心维护问题；需要多设备同步时，再为 Zustand 增加远端 storage adapter 即可。

## 本地开发

```bash
npm install
npm run dev
```

访问 `http://localhost:3000/concepts` 查看 Pi 概念页面，访问 `http://localhost:3000/implementation` 查看 Pi 实现页面；根路径 `/` 会跳转到概念页面。快捷键 `⌘ K` / `Ctrl K` 打开当前页面的搜索。

## 校验与构建

```bash
npm run typecheck
npm run build
```

`next.config.ts` 使用 `output: "export"`，构建结果位于 `out/`，可以交给任意静态文件服务器或静态托管平台。

## 如何维护 RoadMap

1. 在 `data/roadmap.json`(Pi)或 `data/dsh-roadmap.json`(DSH)增删资料、概念、阶段和任务。
2. `lib/roadmap-schema.ts` 是数据契约；构建时会检查 URL、日期、commit 长度以及所有资料引用是否存在。
3. 页面结构与交互位于 `components/roadmap-app.tsx`；页面级文案(hero、概念图谱、loop 流程、capstone 等)在各自 JSON 的 `display` 字段里，不写死在组件中。
4. 视觉 token 集中在 `tokens.css`，布局和组件样式位于 `app/globals.css`。
5. 运行 `npm run typecheck && npm run build`。错误的资料 ID 或数据格式会直接阻止构建。

## 进度兼容性

静态 HTML 与 Next.js 版本的 Pi 路线都使用：

```text
pi-agent-roadmap-progress-v1
```

当 Next.js 静态导出替换到原页面的同一域名时，已有本地进度会自动读取。开发服务器端口属于不同 origin，因此不会自动看到旧端口的数据；可用页面里的“导出进度 / 导入进度”迁移。DSH 路线使用独立的 `dsh-agent-roadmap-progress-v1` key，两份路线互不干扰。

## 主要文件

- `pi-agent-roadmap.html`：保留的原始 HTML 快照
- `app/concepts/page.tsx`：Pi Agent 核心概念与资料页面
- `app/implementation/page.tsx`：Pi Agent TypeScript 实现 RoadMap 与进度页面
- `data/roadmap.json`：Pi RoadMap 唯一内容源
- `data/dsh-roadmap.json`：DeepSeek Harness RoadMap 唯一内容源
- `lib/roadmap-schema.ts`：Zod schema、交叉校验引用与展示文案契约
- `lib/progress-store.ts`：Zustand 本地进度工厂与旧格式兼容层(Pi key)
- `lib/dsh-progress-store.ts`：DSH 路线的本地进度(独立 key)
- `components/roadmap-app.tsx`：页面和交互组件(两份路线共用)
- `app/page.tsx` / `app/concepts/page.tsx` / `app/implementation/page.tsx`：Pi 的入口与两个主题页面
- `app/dsh/page.tsx`：DeepSeek Harness 独立入口
- `next.config.ts`：Next.js 静态导出配置
