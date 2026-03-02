import React, { useState, useEffect, useRef } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { FileJson, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { JsonEditor } from './components/JsonEditor';
import { JsonTree } from './components/JsonTree';
import treeMapping from './tree-mapping.json';
import { parseTree } from 'jsonc-parser';
import type { TreeMapping } from './types';

const App: React.FC = () => {
  const [jsonText, setJsonText] = useState(`{
  "credentials": [
    { "id": "1", "key": "secret-1" }
  ],
  "servers": [
    {
      "name": "Production",
      "services": [
        { "name": "API Gateway" },
        { "name": "Database" }
      ]
    },
    {
      "name": "Staging",
      "services": [
        { "name": "Debug Proxy" }
      ]
    }
  ]
}`);
  const [errors, setErrors] = useState<string[]>([]);
  const [treeMappingState] = useState<TreeMapping>(treeMapping);

  const editorRef = useRef<any>(null);

  // Валидация + проверка соответствия маппингу
  const validateJson = (text: string) => {
    const newErrors: string[] = [];
    let parsed: any;

    try {
      parsed = JSON.parse(text);
    } catch (e: any) {
      newErrors.push(`Невалидный JSON: ${e.message}`);
      setErrors(newErrors);
      return;
    }

    // Проверка маппинга
    treeMappingState.branches.forEach(branch => {
      if (!parsed.hasOwnProperty(branch.key)) {
        newErrors.push(`Отсутствует ключ "${branch.key}" (обязателен по tree-mapping.json)`);
      } else if (!Array.isArray(parsed[branch.key]) && branch.key !== 'credentials') {
        newErrors.push(`"${branch.key}" должен быть массивом`);
      }
    });

    setErrors(newErrors);
  };

  // Скролл к узлу
  const handleNodeClick = (pathStr: string) => {
    if (!editorRef.current || !editorRef.current.view) return;

    const tree = parseTree(jsonText, [], { allowTrailingComma: true });
    if (!tree) return;

    const path = pathStr.split('.');

    // Находим нужную ноду по пути
    let currentNode = tree;
    for (const segment of path) {
      if (currentNode.children) {
        if (Array.isArray(currentNode.value) || currentNode.type === 'array') {
          const index = parseInt(segment, 10);
          currentNode = currentNode.children[index];
        } else {
          const prop = currentNode.children.find(
            (c: any) => c.type === 'property' && c.children && c.children[0].value === segment
          );
          if (prop) {
            currentNode = prop.children[1];
          }
        }
      }
    }

    if (currentNode) {
      const offset = currentNode.offset;
      const view = editorRef.current.view;
      const line = view.state.doc.lineAt(offset);

      view.dispatch({
        selection: { anchor: line.from, head: line.to },
        scrollIntoView: true,
      });
      view.focus();
    }
  };

  useEffect(() => {
    validateJson(jsonText);
  }, [jsonText]);

  const saveFile = () => {
    if (errors.length) return alert('Исправьте ошибки перед сохранением');
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    a.click();
  };

  const loadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setJsonText(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-zinc-800 flex items-center px-4 justify-between bg-zinc-900 shrink-0">
        <div className="flex items-center gap-3">
          <FileJson className="text-emerald-400" />
          <span className="font-semibold text-sm">Super JSON Editor</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs">
            <input type="file" accept=".json" onChange={loadFile} className="hidden" />
            Загрузить
          </label>
          <button
            onClick={saveFile}
            className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-medium transition-colors"
          >
            <Save size={14} /> Сохранить .json
          </button>
          <button
            onClick={() => navigator.clipboard.readText().then(text => text && setJsonText(text))}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs transition-colors"
          >
            Вставить из буфера
          </button>
        </div>
      </div>

      {/* Основной сплиттер */}
      <div className="flex-1 overflow-hidden">
        <Group direction="horizontal">
          {/* Левая панель — дерево */}
          <Panel defaultSize={25} minSize={15} className="bg-zinc-950 flex flex-col">
            <div className="flex-1 overflow-auto">
              <JsonTree
                jsonText={jsonText}
                mapping={treeMappingState}
                onNodeClick={handleNodeClick}
              />
            </div>
          </Panel>

          <Separator className="w-1 bg-zinc-900 hover:bg-emerald-500/50 transition-colors cursor-col-resize" />

          {/* Правая панель — CodeMirror */}
          <Panel defaultSize={75} minSize={30} className="bg-zinc-950">
            <JsonEditor
              ref={editorRef}
              value={jsonText}
              onChange={setJsonText}
            />
          </Panel>
        </Group>
      </div>

      {/* Статус-бар ошибок */}
      <div className="h-7 border-t border-zinc-800 bg-zinc-900 px-4 text-xs flex items-center gap-2 shrink-0">
        {errors.length === 0 ? (
          <CheckCircle2 size={14} className="text-emerald-400" />
        ) : (
          <AlertCircle size={14} className="text-red-400" />
        )}
        <div className="flex-1 truncate">
          {errors.length ? errors.join(' • ') : 'JSON валиден и соответствует маппингу'}
        </div>
        <div className="text-zinc-500 font-mono">
          {jsonText.length} chars
        </div>
      </div>
    </div>
  );
};

export default App;
