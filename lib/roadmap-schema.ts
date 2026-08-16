import { z } from 'zod';

import rawRoadmap from '@/data/roadmap.json';
import rawDshRoadmap from '@/data/dsh-roadmap.json';

export const ResourceSchema = z.tuple([
  z.string().min(1),
  z.url(),
  z.string().min(1),
]);

export const TaskSchema = z.tuple([
  z.string().min(1),
  z.string().min(1),
  z.string().min(1),
  z.array(z.string().min(1)),
]);

export const ConceptSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  pi: z.string().min(1),
  summary: z.string().min(1),
  learn: z.array(z.string().min(1)).min(1),
  experiment: z.string().min(1),
  mastery: z.string().min(1),
  resources: z.array(z.tuple([
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
  ])).min(1),
});

export const PhaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  weeks: z.string().min(1),
  hours: z.string().min(1),
  output: z.string().min(1),
  why: z.string().min(1),
  resources: z.array(z.string().min(1)),
  tasks: z.array(TaskSchema).min(1),
});

export const MetaSchema = z.object({
  title: z.string().min(1),
  repo: z.url(),
  sourceCommit: z.string().length(40),
  sourceVersion: z.string().min(1),
  nodeVersion: z.string().min(1),
  updatedAt: z.iso.date(),
});

/** 页面级展示文案:把 RoadmapApp 里原来写死的 Pi 文案抽成数据,DSH 版用自己的文案。 */
export const ConceptMapRowSchema = z.object({
  agent: z.string().min(1),
  impl: z.string().min(1),
  note: z.string().min(1),
});

export const DisplaySchema = z.object({
  wordmark: z.string().min(1),
  wordmarkNote: z.string().min(1),
  eyebrow: z.string().min(1),
  heroTitle: z.string().min(1),
  heroLeadBefore: z.string().min(1),
  heroLeadStrong: z.string().min(1),
  heroLeadAfter: z.string().min(1),
  repoLabel: z.string().min(1),
  repoName: z.string().min(1),
  repoUrl: z.url(),
  language: z.string().min(1),
  license: z.string().min(1),
  safetyTitle: z.string().min(1),
  safetyNote: z.string().min(1),
  sourceBoundaryTitle: z.string().min(1),
  sourceBoundaryText: z.string().min(1),
  sourceBoundaryLinks: z.array(z.tuple([z.string().min(1), z.url()])).min(1),
  conceptHeadTitle: z.string().min(1),
  conceptHeadText: z.string().min(1),
  mindModelTitle: z.string().min(1),
  mindModelLead: z.string().min(1),
  conceptMap: z.array(ConceptMapRowSchema).min(1),
  loopTitle: z.string().min(1),
  loopLead: z.string().min(1),
  loopSteps: z.array(z.tuple([z.string().min(1), z.string().min(1)])).min(1),
  loopNote: z.string().min(1),
  routeTitle: z.string().min(1),
  routeLead: z.string().min(1),
  routeRole: z.string().min(1),
  routeHeading: z.string().min(1),
  routeThesis: z.string().min(1),
  capstoneTitle: z.string().min(1),
  capstoneLead: z.string().min(1),
  capstonePoint: z.string().min(1),
  architecture: z.array(z.tuple([z.string().min(1), z.string().min(1)])).min(1),
  /** 支持 {version} / {commit} / {date} 占位符。 */
  sourceNote: z.string().min(1),
  footerText: z.string().min(1),
  footerLink: z.tuple([z.string().min(1), z.url()]),
  exportFilePrefix: z.string().min(1),
  nextAllDone: z.string().min(1),
  searchPlaceholder: z.string().min(1),
  searchEmpty: z.string().min(1),
});

const piDisplay: z.infer<typeof DisplaySchema> = {
  wordmark: 'Pi / Rebuild',
  wordmarkNote: 'next · local tracker',
  eyebrow: 'PI AGENT · FROM SOURCE TO SYSTEM',
  heroTitle: '把 Pi 拆开，再亲手装回去',
  heroLeadBefore: '目标不是“会调用一个 Agent 框架”，而是理解并实现 ',
  heroLeadStrong: 'Model Adapter → Agent Loop → Tool Runtime → Session → Harness → Protocol → Eval',
  heroLeadAfter: ' 的每一层。',
  repoLabel: '跟踪仓库',
  repoName: 'earendil-works/pi',
  repoUrl: 'https://github.com/earendil-works/pi',
  language: 'TypeScript',
  license: 'MIT',
  safetyTitle: '安全边界：',
  safetyNote: 'Pi 默认以当前用户权限运行，没有内建文件、进程、网络或凭据隔离。学习 shell/tool 阶段必须把信任、审批、最小权限与沙箱当成核心功能。',
  sourceBoundaryTitle: '源码边界',
  sourceBoundaryText: 'Pi 可作为完整实现主线。Claude Code 官方仓库公开的是插件、示例、脚本与问题追踪，许可证是 Anthropic 商业条款，并不提供完整核心实现；Claude Agent SDK 适合观察集成边界，不应当作可逐层复刻的源码。来源不明的泄露、反编译仓库不进入本路线。',
  sourceBoundaryLinks: [
    ['Pi 仓库', 'https://github.com/earendil-works/pi'],
    ['Claude Code 官方仓库', 'https://github.com/anthropics/claude-code'],
    ['Claude Agent SDK', 'https://github.com/anthropics/claude-agent-sdk-typescript'],
  ],
  conceptHeadTitle: '核心概念资料图谱',
  conceptHeadText: '资料按“心智模型 → 中文系统读物 → 论文/工程经验 → Pi 对照源码 → 小实验”排序。仓库只是证据之一；真正目标是能解释设计取舍，并用实验看到它为何存在。',
  mindModelTitle: '第一步：建立正确心智模型',
  mindModelLead: 'LLM 只是一个带概率的决策组件。Agent 是围绕模型建立的闭环系统；Pi 的价值主要不在“提示词”，而在把上下文、工具、状态、会话、扩展和交互组织成一个可控 Harness。',
  conceptMap: [
    { agent: '目标与终止', impl: 'prompt · stopReason · shouldStopAfterTurn', note: '系统要知道“想完成什么、什么时候停”。没有可检查目标与预算，循环就可能空转、失控或只是看起来很忙。' },
    { agent: '状态与观察', impl: 'AgentState · AgentMessage · events', note: 'Agent 不是一次问答。消息、当前模型、工具调用、错误、队列与流式事件共同组成可演进状态。' },
    { agent: '策略与推理', impl: 'model · thinking · transformContext', note: '模型根据压缩后的上下文选择下一步。ReAct、规划、反思都是策略形态，不应与运行时混成一层。' },
    { agent: '动作与工具', impl: 'Pi: TypeBox · 你的实现: Zod · execute', note: '工具把语言决策变成外部动作。Zod 负责运行时输入验证与类型推导；并发语义、取消、错误回传与权限控制决定了系统是否可靠。' },
    { agent: '反馈与控制', impl: 'tool result · event stream · steering queue', note: '动作结果必须回到上下文，形成下一轮观察；人类 steering、hooks 与 abort 则在循环外提供控制面。' },
    { agent: '记忆与持续性', impl: 'JSONL session tree · compaction · branch summary', note: '短期上下文不等于长期记忆。Pi 把完整历史、活动分支、压缩摘要和派生 UI 状态明确分开。' },
    { agent: 'Harness', impl: 'AgentSession · resources · extensions · skills', note: 'Agent = Model + Harness。Harness 负责给模型正确上下文和能力，并通过约束、验证、纠错把不确定推理变成工程系统。' },
    { agent: '边界与协议', impl: 'SDK · JSONL RPC · CBOR protocol · client/server', note: '把核心状态和 UI、进程、网络解耦，才能嵌入 IDE、Web 应用或远程执行环境，并独立验证每一层。' },
  ],
  loopTitle: '一个 Agent Turn 到底发生什么',
  loopLead: '阅读 `packages/agent/src/agent-loop.ts` 时，始终把代码对应到这个状态机。完成工具调用后不是“返回答案”，而是把 observation 追加回上下文，再让模型决定下一步。',
  loopSteps: [
    ['01 · RECEIVE', '接收 prompt / steering'],
    ['02 · TRANSFORM', '整理并压缩上下文'],
    ['03 · STREAM', '模型增量生成消息'],
    ['04 · DECIDE', '回答、调用工具或停止'],
    ['05 · VALIDATE', '校验工具名与参数'],
    ['06 · EXECUTE', '并发/顺序执行与取消'],
    ['07 · OBSERVE', '写入 tool result 与事件'],
    ['08 · CONTINUE', '下一轮或满足终止条件'],
  ],
  loopNote: '贯穿全程的控制面：hooks · abort signal · max turns / cost budget · human steering · telemetry · policy / sandbox。',
  routeTitle: '单语言路线：TypeScript 做到底',
  routeLead: 'Pi 的核心包、工具运行时、Session、协议和 TUI 本来就是 TypeScript。学习阶段统一使用 TypeScript + Node.js，可以减少语言切换，把时间集中在 Agent Harness 的架构与运行语义上。',
  routeRole: 'ONLY TRACK · 唯一实现主线',
  routeHeading: 'TypeScript + Zod + Node.js',
  routeThesis: '从 Model Adapter 一直实现到 Eval Harness 与 CLI/TUI。Zod schema 是运行时边界的事实源，TypeScript 通过 z.infer 获得静态类型，Node.js 承担运行时；测试使用 Vitest / fast-check，行为评测和红队使用 TypeScript 脚本与 Promptfoo。其他语言项目只作为架构阅读材料，不进入实现栈。',
  capstoneTitle: '最终作品：Bao Agent SDK',
  capstoneLead: '不是 Pi 的逐行复制，而是保留它最值得学习的分层：runtime-neutral core、权威 session state、事件驱动 UI、可插拔资源、明确安全边界与可复现 eval。',
  capstonePoint: '第一条垂直场景：让 Agent 在一个隔离的示例仓库里读取任务、搜索代码、提出补丁、运行测试，并产出带证据的完成报告。',
  architecture: [
    ['core-ts', 'messages · model adapter · stream · loop · tools'],
    ['session-ts', 'JSONL · branch · compaction · replay'],
    ['runtime-ts', 'filesystem · process · policy · approvals'],
    ['protocol-ts', 'JSONL RPC · CBOR framing · client/server'],
    ['eval-ts', 'fixtures · scorers · adversarial cases · reports'],
    ['cli-tui-ts', 'event timeline · approvals · interactive controls'],
  ],
  sourceNote: '路线快照：基于 Pi v{version}、commit {commit}（{date}）。Pi 正在快速演进，所以源码链接固定到该提交；学习思想可持续，文件路径以后可能变化。',
  footerText: 'Pi Agent Rebuild RoadMap · 数据仅存本机',
  footerLink: ['查看 Pi 源码', 'https://github.com/earendil-works/pi'],
  exportFilePrefix: 'pi-agent-roadmap-progress',
  nextAllDone: '全部完成，可以开始写 v0.2 ADR',
  searchPlaceholder: '输入 loop、session、tool、评测或安全…',
  searchEmpty: '没有结果。试试 loop、session、tool、评测或安全。',
};

export const RoadmapDataSchema = z.object({
  meta: MetaSchema,
  display: DisplaySchema.default(piDisplay),
  resources: z.record(z.string(), ResourceSchema),
  concepts: z.array(ConceptSchema).min(1),
  roadmap: z.array(PhaseSchema).min(1),
}).superRefine((data, context) => {
  const resourceIds = new Set(Object.keys(data.resources));
  const references = [
    ...data.concepts.flatMap((concept) => concept.resources.map((entry) => entry[1])),
    ...data.roadmap.flatMap((phase) => [
      ...phase.resources,
      ...phase.tasks.flatMap((task) => task[3]),
    ]),
  ];

  for (const resourceId of references) {
    if (!resourceIds.has(resourceId)) {
      context.addIssue({
        code: 'custom',
        message: `Unknown resource reference: ${resourceId}`,
        path: ['resources', resourceId],
      });
    }
  }
});

export const ProgressStateSchema = z.object({
  version: z.literal(1).default(1),
  completed: z.record(z.string(), z.boolean()).default({}),
  conceptCompleted: z.record(z.string(), z.boolean()).default({}),
  notes: z.record(z.string(), z.string()).default({}),
  actualHours: z.record(z.string(), z.string()).default({}),
  updatedAt: z.string().nullable().default(null),
});

export const ProgressFileSchema = z.union([
  ProgressStateSchema,
  z.object({
    app: z.string().optional(),
    exportedAt: z.string().optional(),
    sourceCommit: z.string().optional(),
    state: ProgressStateSchema,
  }).transform((payload) => payload.state),
]);

export type Resource = z.infer<typeof ResourceSchema>;
export type Concept = z.infer<typeof ConceptSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
export type RoadmapData = z.infer<typeof RoadmapDataSchema>;
export type Display = z.infer<typeof DisplaySchema>;
export type ProgressState = z.infer<typeof ProgressStateSchema>;

export const roadmapData: RoadmapData = RoadmapDataSchema.parse(rawRoadmap);
export const dshRoadmapData: RoadmapData = RoadmapDataSchema.parse(rawDshRoadmap);

export const fillSourceNote = (template: string, meta: z.infer<typeof MetaSchema>) => template
  .replaceAll('{version}', meta.sourceVersion)
  .replaceAll('{commit}', meta.sourceCommit.slice(0, 8))
  .replaceAll('{date}', meta.updatedAt);
