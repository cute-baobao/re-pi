'use client';

import Fuse from 'fuse.js';
import {
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  fillSourceNote,
  ProgressFileSchema,
  type Concept,
  type Phase,
  type Resource,
  type RoadmapData,
} from '@/lib/roadmap-schema';
import type { ProgressStore } from '@/lib/progress-store';

interface SearchEntry {
  kind: '概念' | '循环' | '阶段' | '任务' | '资料';
  label: string;
  target: string;
  text: string;
}

export type RoadmapMode = 'all' | 'concepts' | 'implementation';

const taskKey = (phaseIndex: number, taskIndex: number) => `p${phaseIndex}-t${taskIndex}`;

function ResourceLink({ resource }: { resource: Resource }) {
  return <a href={resource[1]} target="_blank" rel="noreferrer">{resource[0]}</a>;
}

function buildSearchIndex(data: RoadmapData): SearchEntry[] {
  const entries: SearchEntry[] = [
    { kind: '概念', label: data.display.conceptHeadTitle, target: 'core-concepts', text: '目标 状态 策略 推理 工具 反馈 记忆 harness 协议' },
    { kind: '循环', label: data.display.loopTitle, target: 'loop-title', text: 'receive transform stream decide validate execute observe continue' },
  ];

  data.concepts.forEach((concept) => {
    entries.push({
      kind: '概念',
      label: concept.title,
      target: `concept-${concept.id}`,
      text: `${concept.pi} ${concept.summary} ${concept.learn.join(' ')} ${concept.experiment}`,
    });
    concept.resources.forEach(([role, resourceId, note]) => {
      const resource = data.resources[resourceId];
      entries.push({ kind: '资料', label: resource[0], target: `concept-${concept.id}`, text: `${role} ${resource[2]} ${note} ${concept.title}` });
    });
  });

  data.roadmap.forEach((phase, phaseIndex) => {
    entries.push({ kind: '阶段', label: `${String(phaseIndex).padStart(2, '0')} · ${phase.title}`, target: `phase-${phase.id}`, text: `${phase.title} ${phase.why} ${phase.output}` });
    phase.tasks.forEach((task, taskIndex) => {
      entries.push({ kind: '任务', label: `${String(phaseIndex).padStart(2, '0')}.${taskIndex + 1} · ${task[0]}`, target: `task-${taskKey(phaseIndex, taskIndex)}`, text: task.join(' ') });
    });
    phase.resources.forEach((resourceId) => {
      const resource = data.resources[resourceId];
      entries.push({ kind: '资料', label: resource[0], target: `phase-${phase.id}`, text: `${resource[0]} ${resource[2]} ${phase.title}` });
    });
  });
  return entries;
}

function ConceptLibrary({ data, store }: { data: RoadmapData; store: ProgressStore }) {
  const completed = store((state) => state.conceptCompleted);
  const toggleConcept = store((state) => state.toggleConcept);
  const completeCount = data.concepts.filter((concept) => completed[concept.id]).length;
  const percent = Math.round((completeCount / data.concepts.length) * 100);

  return (
    <>
      <div className="concept-library-head" id="concept-resources">
        <div>
          <h3>{data.display.conceptHeadTitle}</h3>
          <p>{data.display.conceptHeadText}</p>
        </div>
        <div className="concept-meter" aria-label="核心概念掌握进度">
          <strong>{completeCount} / {data.concepts.length}</strong>
          <progress max="100" value={percent} />
        </div>
      </div>
      <div className="source-boundary">
        <b>{data.display.sourceBoundaryTitle}</b>
        <p>
          {data.display.sourceBoundaryText}{' '}
          {data.display.sourceBoundaryLinks.map(([label, url]) => (
            <a href={url} target="_blank" rel="noreferrer" key={url}>{label}</a>
          ))}
        </p>
      </div>
      <div className="concept-library">
        {data.concepts.map((concept, index) => (
          <ConceptDetail
            concept={concept}
            complete={Boolean(completed[concept.id])}
            data={data}
            defaultOpen={index === 0}
            key={concept.id}
            onToggle={toggleConcept}
            store={store}
          />
        ))}
      </div>
    </>
  );
}

function ConceptDetail({
  concept,
  complete,
  data,
  defaultOpen,
  onToggle,
  store,
}: {
  concept: Concept;
  complete: boolean;
  data: RoadmapData;
  defaultOpen: boolean;
  onToggle: (id: string, complete: boolean) => void;
  store: ProgressStore;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      className={`concept-detail${complete ? ' is-complete' : ''}`}
      id={`concept-${concept.id}`}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="concept-summary">
        <span className="concept-step">{String(data.concepts.indexOf(concept) + 1).padStart(2, '0')}</span>
        <span className="concept-name">{concept.title}</span>
        <span className="concept-code">{concept.pi}</span>
        <span className="concept-state">{complete ? '已掌握' : '待学习'}</span>
      </summary>
      <div className="concept-body">
        <div>
          <p className="concept-intro">{concept.summary}</p>
          <ul className="concept-points">{concept.learn.map((point) => <li key={point}>{point}</li>)}</ul>
          <div className="concept-experiment"><b>动手检验：</b>{concept.experiment}</div>
          <div className="concept-mastery">
            <input id={`master-${concept.id}`} type="checkbox" checked={complete} onChange={(event) => onToggle(concept.id, event.target.checked)} />
            <label htmlFor={`master-${concept.id}`}>完成标准：{concept.mastery}</label>
          </div>
        </div>
        <div className="concept-reading">
          <h4>建议阅读顺序</h4>
          <ol className="concept-reading-list">
            {concept.resources.map(([role, resourceId, note]) => {
              const resource = data.resources[resourceId];
              return (
                <li key={`${concept.id}-${role}-${resourceId}`}>
                  <span className="reading-role">{role}</span>
                  <div className="reading-copy"><ResourceLink resource={resource} /><span>{note}</span></div>
                  <span className="reading-meta">{resource[2]}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </details>
  );
}

function PhaseDetails({ data, phase, phaseIndex, store }: { data: RoadmapData; phase: Phase; phaseIndex: number; store: ProgressStore }) {
  const completed = store((state) => state.completed);
  const notes = store((state) => state.notes[phase.id] ?? '');
  const actualHours = store((state) => state.actualHours[phase.id] ?? '');
  const toggleTask = store((state) => state.toggleTask);
  const setNotes = store((state) => state.setNotes);
  const setActualHours = store((state) => state.setActualHours);
  const done = phase.tasks.filter((_, taskIndex) => completed[taskKey(phaseIndex, taskIndex)]).length;
  const [open, setOpen] = useState(phaseIndex === 0);

  return (
    <details
      className="phase"
      id={`phase-${phase.id}`}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="phase-summary">
        <span className="phase-title">阶段 {String(phaseIndex).padStart(2, '0')} · {phase.title}</span>
        <span className="phase-meta"><progress max={phase.tasks.length} value={done} /><span className="phase-count">{done}/{phase.tasks.length}</span><span className="chevron" aria-hidden="true">+</span></span>
      </summary>
      <div className="phase-body">
        <aside className="phase-aside">
          <p>{phase.why}</p>
          <dl><dt>建议周期</dt><dd>{phase.weeks}</dd><dt>预计投入</dt><dd>{phase.hours}</dd><dt>阶段产物</dt><dd>{phase.output}</dd></dl>
        </aside>
        <div className="phase-content">
          <div className="task-list">
            {phase.tasks.map((task, taskIndex) => {
              const key = taskKey(phaseIndex, taskIndex);
              const checked = Boolean(completed[key]);
              return (
                <article className={`task${checked ? ' done' : ''}`} id={`task-${key}`} key={key}>
                  <input id={`check-${key}`} type="checkbox" checked={checked} onChange={(event) => toggleTask(key, event.target.checked)} aria-describedby={`proof-${key}`} />
                  <div className="task-main">
                    <div className="task-title"><span className="task-id">{String(phaseIndex).padStart(2, '0')}.{taskIndex + 1}</span><label htmlFor={`check-${key}`}>{task[0]}</label></div>
                    <p>{task[1]}</p>
                    <div className="task-proof" id={`proof-${key}`}><b>完成证据：</b>{task[2]}</div>
                    <div className="task-refs">{task[3].map((resourceId) => <ResourceLink resource={data.resources[resourceId]} key={`${key}-${resourceId}`} />)}</div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="resource-block">
            <h4>本阶段资料包</h4>
            <ul className="resource-list">
              {phase.resources.map((resourceId) => {
                const resource = data.resources[resourceId];
                return <li key={`${phase.id}-${resourceId}`}><ResourceLink resource={resource} /><small>{resource[2]}</small></li>;
              })}
            </ul>
          </div>
          <div className="phase-log">
            <div className="field">
              <label htmlFor={`notes-${phase.id}`}>阶段笔记 · 自动保存在本机</label>
              <textarea id={`notes-${phase.id}`} value={notes} onChange={(event) => setNotes(phase.id, event.target.value)} placeholder="记录：我理解了什么？哪里仍模糊？下一次实验是什么？" />
            </div>
            <div className="field">
              <label htmlFor={`hours-${phase.id}`}>实际投入 / 小时</label>
              <input id={`hours-${phase.id}`} value={actualHours} onChange={(event) => setActualHours(phase.id, event.target.value)} type="number" min="0" max="999" step="0.5" inputMode="decimal" />
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}

export function RoadmapApp({ data, store, mode = 'all' }: { data: RoadmapData; store: ProgressStore; mode?: RoadmapMode }) {
  const completed = store((state) => state.completed);
  const hydrated = store((state) => state.hydrated);
  const conceptCompleted = store((state) => state.conceptCompleted);
  const notes = store((state) => state.notes);
  const actualHours = store((state) => state.actualHours);
  const updatedAt = store((state) => state.updatedAt);
  const replaceProgress = store((state) => state.replaceProgress);
  const resetProgress = store((state) => state.resetProgress);
  const [searchOpen, setSearchOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeResult, setActiveResult] = useState(0);
  const [toast, setToast] = useState('');
  const searchDialog = useRef<HTMLDialogElement>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const display = data.display;
  const meta = data.meta;
  const showConcepts = mode !== 'implementation';
  const showImplementation = mode !== 'concepts';
  const conceptComplete = data.concepts.filter((concept) => conceptCompleted[concept.id]).length;
  const conceptPercent = data.concepts.length ? Math.round((conceptComplete / data.concepts.length) * 100) : 0;
  const heroTitle = mode === 'concepts' ? '先理解 Agent，再拆开 Pi' : mode === 'implementation' ? '把实现路线拆成可运行的阶段' : display.heroTitle;

  useEffect(() => {
    void store.persist.rehydrate();
  }, [store]);

  useEffect(() => {
    const dialog = searchDialog.current;
    if (!dialog) return;
    if (searchOpen && !dialog.open) dialog.showModal();
    if (!searchOpen && dialog.open) dialog.close();
    document.body.classList.toggle('dialog-open', searchOpen || resetOpen);
  }, [searchOpen, resetOpen]);

  useEffect(() => {
    const dialog = resetDialog.current;
    if (!dialog) return;
    if (resetOpen && !dialog.open) dialog.showModal();
    if (!resetOpen && dialog.open) dialog.close();
  }, [resetOpen]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
        setQuery('');
        setActiveResult(0);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const searchIndex = useMemo(() => buildSearchIndex(data), [data]);
  const fuse = useMemo(() => new Fuse(searchIndex, { keys: ['label', 'text'], threshold: 0.34, ignoreLocation: true }), [searchIndex]);
  const searchResults = useMemo(() => {
    if (!query.trim()) return searchIndex.slice(0, 18);
    return fuse.search(query.trim(), { limit: 18 }).map((result) => result.item);
  }, [fuse, query, searchIndex]);

  const totals = useMemo(() => {
    const total = data.roadmap.reduce((sum, phase) => sum + phase.tasks.length, 0);
    const complete = data.roadmap.reduce(
      (sum, phase, phaseIndex) => sum + phase.tasks.filter((_, taskIndex) => completed[taskKey(phaseIndex, taskIndex)]).length,
      0,
    );
    let nextTask = display.nextAllDone;
    outer: for (let phaseIndex = 0; phaseIndex < data.roadmap.length; phaseIndex += 1) {
      const phase = data.roadmap[phaseIndex];
      for (let taskIndex = 0; taskIndex < phase.tasks.length; taskIndex += 1) {
        if (!completed[taskKey(phaseIndex, taskIndex)]) {
          nextTask = `${String(phaseIndex).padStart(2, '0')}.${taskIndex + 1} ${phase.tasks[taskIndex][0]}`;
          break outer;
        }
      }
    }
    return { total, complete, percent: total ? Math.round((complete / total) * 100) : 0, nextTask };
  }, [completed, data.roadmap, display.nextAllDone]);

  const trackerPercent = mode === 'concepts' ? conceptPercent : totals.percent;
  const trackerSummary = mode === 'concepts'
    ? `${conceptComplete} / ${data.concepts.length} 个概念 · 下一步：${conceptComplete === data.concepts.length ? '开始实现路线' : '按顺序阅读并完成概念实验'}`
    : `${totals.complete} / ${totals.total} 个任务 · 下一步：${totals.nextTask}`;

  const jumpTo = useCallback((targetId: string) => {
    setSearchOpen(false);
    window.setTimeout(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      if (target instanceof HTMLDetailsElement) target.open = true;
      const parent = target.closest('details');
      if (parent instanceof HTMLDetailsElement) parent.open = true;
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }, 40);
  }, []);

  const exportProgress = () => {
    const payload = {
      app: meta.title,
      exportedAt: new Date().toISOString(),
      sourceCommit: meta.sourceCommit,
      state: { version: 1 as const, completed, conceptCompleted, notes, actualHours, updatedAt },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${display.exportFilePrefix}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast('进度 JSON 已导出');
  };

  const importProgress = async (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const progress = ProgressFileSchema.parse(parsed);
      replaceProgress(progress);
      setToast('进度已导入');
    } catch (error) {
      setToast(error instanceof Error ? `导入失败：${error.message}` : '导入失败：文件格式不受支持');
    }
  };

  const onSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveResult((current) => event.key === 'ArrowDown' ? Math.min(current + 1, searchResults.length - 1) : Math.max(current - 1, 0));
    }
    if (event.key === 'Enter' && searchResults[activeResult]) {
      event.preventDefault();
      jumpTo(searchResults[activeResult].target);
    }
  };

  return (
    <>
      <a className="skip-link" href="#main">跳到正文</a>
      <header className="site-header">
        <div className="wrap nav-row">
          <a className="wordmark" href="/concepts#top"><strong>{display.wordmark}</strong><span>{display.wordmarkNote}</span></a>
          <div className="nav-tools">
            <nav className="nav-route-links" aria-label="RoadMap 页面">
              <a className={mode === 'concepts' ? 'is-active' : ''} href="/concepts#top">概念</a>
              <a className={mode === 'implementation' ? 'is-active' : ''} href="/implementation#top">实现</a>
            </nav>
            <div className="nav-progress" aria-label={mode === 'concepts' ? '概念进度' : '实现任务进度'}><progress max="100" value={trackerPercent} /><span>{hydrated ? `${trackerPercent}%` : '…'}</span></div>
            <button className="search-trigger" type="button" aria-haspopup="dialog" onClick={() => { setSearchOpen(true); setQuery(''); setActiveResult(0); }}>
              <span aria-hidden="true">⌕</span><span className="search-label">搜索阶段、任务、资料</span><kbd>⌘ K</kbd>
            </button>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="wrap hero-grid">
            <div>
              <p className="eyebrow">{display.eyebrow}</p>
              <h1>{heroTitle}</h1>
              <p className="hero-lead">{display.heroLeadBefore}<strong>{display.heroLeadStrong}</strong>{display.heroLeadAfter}</p>
              <div className="hero-actions">
                {showConcepts && <><a className="button" href="#core-concepts">先学核心概念</a><a className="button secondary" href="#concept-resources">按概念看资料</a></>}
                {showImplementation && <a className="button secondary" href={mode === 'all' ? '#roadmap-section' : '/implementation#roadmap-section'}>查看实现路线</a>}
                {mode === 'concepts' && <a className="button secondary" href="/implementation#top">进入实现页面</a>}
                {mode === 'implementation' && <a className="button secondary" href="/concepts#top">回到概念页面</a>}
              </div>
            </div>
            <aside className="snapshot" aria-label="源码快照">
              <dl>
                <dt>{display.repoLabel}</dt><dd><a href={display.repoUrl} target="_blank" rel="noreferrer">{display.repoName}</a></dd><dt>路线依据版本</dt><dd>{meta.sourceVersion}</dd><dt>源码提交</dt><dd>{meta.sourceCommit.slice(0, 8)}</dd><dt>运行时</dt><dd>Node ≥ {meta.nodeVersion}</dd><dt>主要语言</dt><dd>{display.language}</dd><dt>许可证</dt><dd>{display.license}</dd>
              </dl>
              <div className="warning"><strong>{display.safetyTitle}</strong>{display.safetyNote}</div>
            </aside>
          </div>
        </section>

        <section className="tracker-band" aria-labelledby="tracker-title">
          <div className="wrap tracker-grid">
            <div className="progress-copy"><div className="progress-number">{hydrated ? `${trackerPercent}%` : '…'}</div><div><p id="tracker-title"><strong>{trackerSummary}</strong></p><progress className="main-progress" max="100" value={trackerPercent} /></div></div>
            <div className="tracker-actions" aria-label="进度数据操作"><button className="button secondary" type="button" onClick={exportProgress}>导出进度</button><button className="button secondary" type="button" onClick={() => importInput.current?.click()}>导入进度</button><button className="button danger" type="button" onClick={() => setResetOpen(true)}>重置</button><input className="visually-hidden" ref={importInput} type="file" accept="application/json,.json" onChange={importProgress} /></div>
          </div>
        </section>

        {showConcepts && <section className="section" id="core-concepts">
          <div className="wrap">
            <div className="section-heading"><h2>{display.mindModelTitle}</h2><p>{display.mindModelLead}</p></div>
            <div className="concept-map" aria-label="Agent 核心概念与实现映射">
              {display.conceptMap.map((row) => (
                <div className="concept-row" key={row.agent}>
                  <div className="concept-agent">{row.agent}</div>
                  <div className="concept-pi">{row.impl}</div>
                  <p>{row.note}</p>
                </div>
              ))}
            </div>
            <ConceptLibrary data={data} store={store} />
          </div>
        </section>}

        {showConcepts && <section className="loop-band" aria-labelledby="loop-title"><div className="wrap"><div className="loop-head"><h2 id="loop-title">{display.loopTitle}</h2><p>{display.loopLead}</p></div><ol className="loop-flow">{display.loopSteps.map(([label, text]) => <li key={label}><b>{label}</b><span>{text}</span></li>)}</ol><p className="loop-note">{display.loopNote}</p></div></section>}

        {showImplementation && <section className="section" id="route-design"><div className="wrap"><div className="section-heading"><h2>{display.routeTitle}</h2><p>{display.routeLead}</p></div><div className="route-thesis"><article className="thesis-column"><span className="role">{display.routeRole}</span><h3>{display.routeHeading}</h3><p>{display.routeThesis}</p></article></div>
          <ol className="stage-rail" aria-label="复刻阶段总览">{data.roadmap.map((phase, phaseIndex) => { const done = phase.tasks.filter((_, taskIndex) => completed[taskKey(phaseIndex, taskIndex)]).length; return <li key={phase.id}><button className="stage-jump" type="button" onClick={() => jumpTo(`phase-${phase.id}`)} title={phase.title}><span className="num">{String(phaseIndex).padStart(2, '0')}</span><span className="title">{phase.title}</span><span className="rail-status">{done === phase.tasks.length ? '完成' : `${done}/${phase.tasks.length}`}</span></button></li>; })}</ol>
        </div></section>}

        {showImplementation && <section className="section" id="roadmap-section"><div className="wrap"><div className="section-heading"><h2>分阶段复刻 RoadMap</h2><p>建议节奏是每周 6–8 小时、每阶段 1–2 周。完成定义不是“看过源码”，而是有能运行的最小实现、自动化验证和一份你自己的设计解释。</p></div><div className="roadmap">{data.roadmap.map((phase, phaseIndex) => <PhaseDetails data={data} phase={phase} phaseIndex={phaseIndex} key={phase.id} store={store} />)}</div></div></section>}

        {showImplementation && <section className="section capstone-band" id="capstone"><div className="wrap capstone-grid"><div><h2>{display.capstoneTitle}</h2><p>{display.capstoneLead}</p><p><strong>{display.capstonePoint}</strong></p></div><ul className="architecture-list">{display.architecture.map(([name, desc]) => <li key={name}><b>{name}</b><span>{desc}</span></li>)}</ul></div><div className="wrap source-note"><strong>路线快照：</strong>{fillSourceNote(display.sourceNote, meta)}</div></section>}
      </main>

      <footer className="site-footer"><div className="wrap footer-line"><span>{display.footerText}</span><a href={display.footerLink[1]}>{display.footerLink[0]}</a><span>{meta.updatedAt}</span></div></footer>

      <dialog className="command-dialog" ref={searchDialog} onClose={() => setSearchOpen(false)} aria-labelledby="command-title"><div className="dialog-panel"><h2 className="visually-hidden" id="command-title">搜索 RoadMap</h2><div className="search-row"><input className="search-input" type="search" autoComplete="off" value={query} onChange={(event) => { setQuery(event.target.value); setActiveResult(0); }} onKeyDown={onSearchKeyDown} placeholder={display.searchPlaceholder} autoFocus /><button className="icon-button" type="button" aria-label="关闭搜索" onClick={() => setSearchOpen(false)}>×</button></div><div className="search-results" role="listbox" aria-label="搜索结果">{searchResults.length ? searchResults.map((entry, index) => <button className={`search-result${index === activeResult ? ' active' : ''}`} type="button" role="option" aria-selected={index === activeResult} onClick={() => jumpTo(entry.target)} key={`${entry.kind}-${entry.target}-${index}`}><span className="kind">{entry.kind}</span><span className="label">{entry.label}</span></button>) : <div className="search-empty">{display.searchEmpty}</div>}</div><div className="dialog-help"><span>↑↓ 选择 · Enter 跳转</span><span>Esc 关闭</span></div></div></dialog>

      <dialog className="confirm-dialog" ref={resetDialog} onClose={() => setResetOpen(false)} aria-labelledby="reset-title"><div className="confirm-content"><h3 id="reset-title">重置所有本地学习记录？</h3><p>将清除任务勾选、概念掌握、阶段笔记和实际耗时。你可以先导出 JSON 备份；此操作完成后无法在页面内撤销。</p><div className="confirm-actions"><button className="button secondary" type="button" onClick={() => setResetOpen(false)}>取消</button><button className="button danger" type="button" onClick={() => { resetProgress(); setResetOpen(false); setToast('本地学习记录已重置'); }}>确认重置</button></div></div></dialog>
      <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
