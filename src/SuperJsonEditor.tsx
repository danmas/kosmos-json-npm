import React, { useState, useEffect, useRef } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { FileJson, Save, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { JsonEditor } from './components/JsonEditor';
import { JsonTree } from './components/JsonTree';
import { parseTree } from 'jsonc-parser';
import type { TreeMapping } from './types';
import './index.css';

export interface SuperJsonEditorProps {
    mappingFile?: string | TreeMapping;
    value?: string;
    defaultValue?: string;
    onChange?: (json: string) => void;
    onSave?: (json: string) => void;
    className?: string;
}

const DEFAULT_MAPPING: TreeMapping = {
    branches: [
        { key: "credentials", icon: "Lock" }
    ]
};

const SELF_MAPPING: TreeMapping = {
    branches: [
        { key: "branches", icon: "GitBranch" },
        { key: "icon", icon: "Image" }
    ]
};

export const SuperJsonEditor: React.FC<SuperJsonEditorProps> = ({
    mappingFile = './tree-mapping.json',
    value,
    defaultValue = '{\n  "hello": "world"\n}',
    onChange,
    onSave,
    className = ''
}) => {
    const [internalJsonText, setInternalJsonText] = useState(defaultValue);
    const jsonText = value !== undefined ? value : internalJsonText;

    const [errors, setErrors] = useState<string[]>([]);
    const [mapping, setMapping] = useState<TreeMapping>(
        typeof mappingFile === 'object' ? mappingFile : DEFAULT_MAPPING
    );

    // Режим редактирования маппинга
    const [isEditingMapping, setIsEditingMapping] = useState(false);
    const [mappingText, setMappingText] = useState(JSON.stringify(mapping, null, 2));

    const editorRef = useRef<any>(null);

    // Загрузка mappingFile если это путь
    useEffect(() => {
        if (typeof mappingFile === 'string') {
            fetch(mappingFile)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to load');
                    return res.json();
                })
                .then(data => {
                    setMapping(data);
                    setMappingText(JSON.stringify(data, null, 2));
                })
                .catch(err => {
                    console.warn('Could not load mapping file:', err);
                    // Oстается DEFAULT_MAPPING
                });
        } else {
            setMapping(mappingFile);
            setMappingText(JSON.stringify(mappingFile, null, 2));
        }
    }, [mappingFile]);

    // Валидация
    const validateJson = (text: string, currentMapping: TreeMapping) => {
        const newErrors: string[] = [];
        let parsed: any;

        try {
            parsed = JSON.parse(text);
        } catch (e: any) {
            newErrors.push(`Невалидный JSON: ${e.message}`);
            setErrors(newErrors);
            return;
        }

        if (!currentMapping?.branches) {
            setErrors([]);
            return;
        }

        currentMapping.branches.forEach(branch => {
            if (!parsed.hasOwnProperty(branch.key)) {
                newErrors.push(`Отсутствует ключ "${branch.key}" (по маппингу)`);
            } else if (!Array.isArray(parsed[branch.key]) && branch.key !== 'credentials') {
                newErrors.push(`"${branch.key}" должен быть массивом`);
            }
        });

        setErrors(newErrors);
    };

    useEffect(() => {
        if (isEditingMapping) {
            validateJson(mappingText, SELF_MAPPING);
        } else {
            validateJson(jsonText, mapping);
        }
    }, [jsonText, mappingText, mapping, isEditingMapping]);

    const handleNodeClick = (pathStr: string) => {
        if (!editorRef.current || !editorRef.current.view) return;

        const tree = parseTree(isEditingMapping ? mappingText : jsonText, [], { allowTrailingComma: true });
        if (!tree) return;

        const path = pathStr.split('.');
        let currentNode = tree;
        for (const segment of path) {
            if (currentNode.children) {
                if (Array.isArray(currentNode.value) || currentNode.type === 'array') {
                    const index = parseInt(segment, 10);
                    currentNode = currentNode.children[index] || currentNode;
                } else {
                    const prop = currentNode.children.find(
                        (c: any) => c.type === 'property' && c.children && c.children[0].value === segment
                    );
                    if (prop && prop.children) {
                        currentNode = prop.children[1];
                    }
                }
            }
        }

        if (currentNode && currentNode.offset !== undefined) {
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

    const currentText = isEditingMapping ? mappingText : jsonText;
    const currentMapping = isEditingMapping ? SELF_MAPPING : mapping;

    const saveFile = () => {
        if (errors.length) return alert('Исправьте ошибки перед сохранением');

        if (isEditingMapping) {
            // Сохраняем маппинг
            try {
                const parsed = JSON.parse(mappingText);
                setMapping(parsed);
                setIsEditingMapping(false);
            } catch (e) {
                alert('Невозможно сохранить: невалидный JSON маппинга');
            }
        } else {
            if (onSave) {
                onSave(currentText);
            } else {
                const blob = new Blob([currentText], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'config.json';
                a.click();
            }
        }
    };

    const loadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result as string;
            if (isEditingMapping) {
                setMappingText(result);
            } else {
                if (onChange) {
                    onChange(result);
                } else {
                    setInternalJsonText(result);
                }
            }
        };
        reader.readAsText(file);
    };

    const handleEditorChange = (val: string) => {
        if (isEditingMapping) {
            setMappingText(val);
        } else {
            if (onChange) {
                onChange(val);
            } else {
                setInternalJsonText(val);
            }
        }
    };

    let validJsonForTree = true;
    try {
        JSON.parse(currentText);
    } catch (e) {
        validJsonForTree = false;
    }

    return (
        <div className={`h-full w-full bg-zinc-950 text-zinc-200 flex flex-col overflow-hidden ${className}`}>
            {/* Header */}
            <div className="h-12 border-b border-zinc-800 flex items-center px-4 justify-between bg-zinc-900 shrink-0">
                <div className="flex items-center gap-3">
                    <FileJson className={isEditingMapping ? "text-blue-400" : "text-emerald-400"} />
                    <span className="font-semibold text-sm">
                        {isEditingMapping ? 'Super JSON Editor (Mapping)' : 'Super JSON Editor'}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsEditingMapping(!isEditingMapping)}
                        className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-colors ${isEditingMapping ? 'bg-blue-600 font-bold hover:bg-blue-500' : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700'
                            }`}
                        title="Настроить маппинг"
                    >
                        <Settings size={14} /> Edit Mapping
                    </button>

                    <label className="cursor-pointer flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs transition-colors">
                        <input type="file" accept=".json" onChange={loadFile} className="hidden" />
                        Загрузить
                    </label>
                    <button
                        onClick={saveFile}
                        className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-colors ${isEditingMapping ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'
                            }`}
                    >
                        <Save size={14} /> {isEditingMapping ? 'Сохранить маппинг' : 'Сохранить .json'}
                    </button>
                </div>
            </div>

            {/* Основной сплиттер */}
            <div className="flex-1 overflow-hidden">
                <Group orientation="horizontal">
                    {/* Левая панель — дерево */}
                    <Panel defaultSize={25} minSize={15} className="bg-zinc-950 flex flex-col">
                        <div className="flex-1 overflow-auto">
                            {validJsonForTree ? (
                                <JsonTree
                                    jsonText={currentText}
                                    mapping={currentMapping}
                                    onNodeClick={handleNodeClick}
                                />
                            ) : (
                                <div className="p-4 text-xs text-zinc-500 text-center">
                                    Invalid or empty JSON to show tree
                                </div>
                            )}
                        </div>
                    </Panel>

                    <Separator className={`w-1 bg-zinc-900 transition-colors cursor-col-resize ${isEditingMapping ? 'hover:bg-blue-500/50' : 'hover:bg-emerald-500/50'}`} />

                    {/* Правая панель — CodeMirror */}
                    <Panel defaultSize={75} minSize={30} className="bg-zinc-950">
                        <JsonEditor
                            ref={editorRef}
                            value={currentText}
                            onChange={handleEditorChange}
                        />
                    </Panel>
                </Group>
            </div>

            {/* Статус-бар ошибок */}
            <div className="h-7 border-t border-zinc-800 bg-zinc-900 px-4 text-xs flex items-center gap-2 shrink-0">
                {errors.length === 0 ? (
                    <CheckCircle2 size={14} className={isEditingMapping ? "text-blue-400" : "text-emerald-400"} />
                ) : (
                    <AlertCircle size={14} className="text-red-400" />
                )}
                <div className="flex-1 truncate">
                    {errors.length ? errors.join(' • ') : (isEditingMapping ? 'Маппинг валиден' : 'JSON валиден и соответствует маппингу')}
                </div>
                <div className="text-zinc-500 font-mono">
                    {currentText.length} chars
                </div>
            </div>
        </div>
    );
};
