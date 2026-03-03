export interface BranchConfig {
    key: string;
    label?: string;
    displayKey?: string;
    icon?: string;
    itemIcon?: string;
    children?: BranchConfig[];
}

export interface TreeMapping {
    rootLabel?: string;
    rootIcon?: string;
    branches: BranchConfig[];
}
