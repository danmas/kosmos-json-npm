import React from 'react';
import { ChevronRight, ChevronDown, Server, Key, Lock, GitBranch, Terminal, Database, Box, Layers, Settings, FileJson, LucideIcon } from 'lucide-react';
import type { TreeMapping, BranchConfig } from '../types';

const ICON_MAP: Record<string, LucideIcon> = {
  Server, Key, Lock, GitBranch, Terminal, Database, Box, Layers, Settings, FileJson
};

interface JsonTreeProps {
  jsonText: string;
  mapping: TreeMapping;
  onNodeClick: (path: string) => void;
}

interface TreeNodeProps {
  data: any;
  config: BranchConfig;
  path: string[];
  onNodeClick: (path: string) => void;
  depth?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ data, config, path, onNodeClick, depth = 0 }) => {
  const [expanded, setExpanded] = React.useState(false);

  if (!data || typeof data !== 'object') return null;

  const items = Array.isArray(data) ? data : [data];
  const label = config.label;
  const displayKey = config.displayKey;

  const Icon = (config.icon && ICON_MAP[config.icon]) || Server;

  return (
    <div className="pl-4">
      <div
        className="flex items-center gap-1.5 py-0.5 px-2 hover:bg-zinc-800 rounded cursor-pointer text-sm"
        style={{ paddingLeft: `${depth * 12}px` }}
        onClick={() => {
          if (items.length > 0) setExpanded(!expanded);
        }}
      >
        {items.length > 0 && (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        <Icon size={14} className="text-blue-400" />
        <span className="font-medium text-zinc-300">{label}</span>
        <span className="text-xs text-zinc-500">({items.length})</span>
      </div>

      {expanded && (
        <div>
          {items.map((item: any, idx: number) => {
            const nodeLabel = displayKey && item[displayKey] ? item[displayKey] : `Item ${idx}`;
            const currentPath = [...path, idx.toString()];

            return (
              <div key={idx} className="pl-6">
                <div
                  className="flex items-center gap-1.5 py-0.5 px-2 hover:bg-zinc-800 rounded cursor-pointer text-sm"
                  onClick={() => {
                    onNodeClick(currentPath.join('.'));
                  }}
                >
                  {(() => {
                    const ItemIcon = (config.itemIcon && ICON_MAP[config.itemIcon]) || Key;
                    return <ItemIcon size={13} className="text-emerald-400" />;
                  })()}
                  <span className="text-zinc-400">{nodeLabel}</span>
                </div>

                {/* Рекурсия для детей */}
                {config.children?.map((childConfig) => {
                  const childData = item[childConfig.key];
                  if (!childData) return null;
                  return (
                    <TreeNode
                      key={childConfig.key}
                      data={childData}
                      config={childConfig}
                      path={[...currentPath, childConfig.key]}
                      onNodeClick={onNodeClick}
                      depth={depth + 1}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const JsonTree: React.FC<JsonTreeProps> = ({ jsonText, mapping, onNodeClick }) => {
  let parsed: any = {};
  try {
    parsed = JSON.parse(jsonText);
  } catch { }

  const RootIcon = (mapping.rootIcon && ICON_MAP[mapping.rootIcon]) || Server;

  return (
    <div className="h-full overflow-auto text-sm bg-zinc-950 p-2 font-mono select-none">
      <div className="flex items-center gap-2 py-1 px-2 text-zinc-400 border-b border-zinc-800 mb-2">
        <RootIcon size={16} />
        {mapping.rootLabel || 'Root'}
      </div>

      {mapping.branches.map((branch) => {
        const data = parsed[branch.key];
        if (!data) return null;

        return (
          <TreeNode
            key={branch.key}
            data={data}
            config={branch}
            path={[branch.key]}
            onNodeClick={onNodeClick}
          />
        );
      })}
    </div>
  );
};
