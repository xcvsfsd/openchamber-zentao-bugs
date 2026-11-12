// 共享类型：panel / status / service 三端共用，保持轻量可 JSON 序列化。
export type BugItem = {
  id: number;
  title: string;
  status: string;
  severity: number;
  pri: number;
  productId: number;
  productName: string;
  projectId: number;
  executionId: number;
  openedBy: string;
  openedDate: string;
  assignedDate: string;
  openedBuild: string;
  resolvedBuild: string;
  statusName: string;
};

export type BugListAnswer = {
  ok: boolean;
  total: number;
  items: BugItem[];
  error?: string;
};

export type BugFile = {
  id: number;
  name: string;
  ext: string;
  size: number;
  isImage: boolean;
  dataUrl?: string;
  tooLarge?: boolean;
};

// 有序步骤块：按原文顺序交替文本/图片，面板行内渲染用
export type StepsBlock =
  | { kind: 'text'; text: string }
  | { kind: 'image'; fileId: number; name: string; dataUrl: string };

export type BugDetail = {
  id: number;
  title: string;
  status: string;
  severity: number;
  pri: number;
  type: string;
  productName: string;
  projectName: string;
  executionId: number;
  openedBy: string;
  openedDate: string;
  assignedTo: string;
  stepsPlain: string;
  stepsBlocks?: StepsBlock[];
  bugUrl: string;
  files: BugFile[];
};

export type BugDetailAnswer = {
  ok: boolean;
  bug?: BugDetail;
  error?: string;
};

export type UserEntry = {
  account: string;
  realname: string;
};

export type UsersAnswer = {
  ok: boolean;
  users: UserEntry[];
  error?: string;
};

export type AssignAnswer = {
  ok: boolean;
  error?: string;
};

export type CountAnswer = {
  ok: boolean;
  total: number;
  error?: string;
};

export type BuildEntry = {
  id: number;
  name: string;
};

export type BuildsAnswer = {
  ok: boolean;
  builds: BuildEntry[];
  error?: string;
};

export type ResolutionEntry = {
  id: string;
  name: string;
};

export type ResolutionsAnswer = {
  ok: boolean;
  resolutions: ResolutionEntry[];
  error?: string;
};

export type ResolveAnswer = {
  ok: boolean;
  error?: string;
};
