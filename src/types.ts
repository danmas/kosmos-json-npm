import treeMapping from './tree-mapping.json';

export type TreeMapping = typeof treeMapping;
export type BranchConfig = TreeMapping['branches'][number];
