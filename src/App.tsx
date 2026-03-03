import React from 'react';
import { SuperJsonEditor } from './SuperJsonEditor';

const App: React.FC = () => {
  return (
    <div className="h-screen w-screen">
      <SuperJsonEditor
        mappingFile="./tree-mapping.json"
        defaultValue={`{
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
    }
  ]
}`}
      />
    </div>
  );
};

export default App;
