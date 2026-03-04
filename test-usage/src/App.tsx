import { SuperJsonEditor } from '@roman.eremeev/kosmos-json-npm';
import '@roman.eremeev/kosmos-json-npm/style.css';

const initialMapping = {
    rootLabel: "Inventory",
    rootIcon: "Database",
    branches: [
        {
            key: "credentials",
            label: "Учетные данные",
            displayKey: "id",
            icon: "Lock",
            itemIcon: "Key"
        },
        {
            key: "servers",
            label: "Серверы",
            displayKey: "hostname",
            icon: "Server",
            itemIcon: "Terminal"
        }
    ]
};

const initialData = {
    credentials: [
        { id: "admin-pass", type: "password", value: "secret123" }
    ],
    servers: [
        { hostname: "web-01", ip: "192.168.1.10" },
        { hostname: "db-01", ip: "192.168.1.20" }
    ]
};

function App() {
    const handleSave = (json: string) => {
        console.log("Saving JSON data:", JSON.parse(json));
        alert("Данные сохранены! Проверьте консоль.");
    };

    const handleMappingSave = (mapping: any) => {
        console.log("Saving new mapping:", mapping);
        alert("Маппинг обновлен!");
    };

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <SuperJsonEditor
                defaultValue={JSON.stringify(initialData, null, 2)}
                mappingFile={initialMapping}
                onSave={handleSave}
                onMappingSave={handleMappingSave}
            />
        </div>
    );
}

export default App;
