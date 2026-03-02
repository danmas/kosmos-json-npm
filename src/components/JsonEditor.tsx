import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';

export const JsonEditor = React.forwardRef<any, any>(({ value, onChange }, ref) => {
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <CodeMirror
        ref={ref}
        value={value}
        height="100%"
        theme="dark"
        extensions={[
          json(),
          linter((view) => {
            try {
              JSON.parse(view.state.doc.toString());
              return [];
            } catch (e: any) {
              return [{
                from: 0,
                to: view.state.doc.length,
                message: e.message || 'JSON error',
                severity: 'error'
              }];
            }
          })
        ]}
        onChange={onChange}
        className="flex-1 overflow-auto"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
        }}
      />
    </div>
  );
});

JsonEditor.displayName = 'JsonEditor';
