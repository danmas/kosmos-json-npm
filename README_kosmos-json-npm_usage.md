# Руководство по использованию `@roman.eremeev/kosmos-json-npm` (v1.0.5)

Это руководство поможет вам интегрировать **SuperJsonEditor** в ваш проект и настроить его под свои задачи.

## ⚙️ Изолированные стили (CSS Isolation)

Начиная с версии **1.0.5**, компонент использует уникальный класс-контейнер `sje-container` для изоляции стилей. Все внутренние Tailwind-классы скоупированы внутри компонента.

## ⚠️ Важные моменты

### Правильный путь к CSS
Стили лежат в файле **`kosmos-json-npm.css`**. Неверный путь даёт 404, и редактор отображается без оформления.

- **В проекте с bundler (Vite, webpack):**
  ```tsx
  import '@roman.eremeev/kosmos-json-npm/style.css';
  // или прямой путь:
  // import '@roman.eremeev/kosmos-json-npm/dist/kosmos-json-npm.css';
  ```
- **Через CDN (unpkg) в обычном HTML:**
  ```html
  <link rel="stylesheet" href="https://unpkg.com/@roman.eremeev/kosmos-json-npm@1.0.5/dist/kosmos-json-npm.css" />
  ```

### Конфликт CSS-классов

> **✅ Решено в v1.0.5!** Все внутренние стили изолированы в контейнере `sje-container`, поэтому конфликты с вашими `.btn`, `.flex` и другими классами исключены.

### Контейнер с высотой
Родительский контейнер должен иметь явную высоту (`height: 100%`, `100vh`, `flex: 1` с `minHeight: 0` у flex-родителя), иначе редактор может схлопнуться по высоте.

---

## 📦 Начало работы

Импортируйте компонент и обязательные CSS-стили:

```tsx
import { SuperJsonEditor } from '@roman.eremeev/kosmos-json-npm';
import '@roman.eremeev/kosmos-json-npm/style.css';  // рекомендуемый способ
```

## 🎨 Кастомизация темы (CSS Variables)

Компонент поддерживает CSS-переменные. Переопределите их в своём CSS для кастомизации:

```css
:root {
  --kpj-bg-primary: #09090b;      /* Основной фон */
  --kpj-bg-secondary: #18181b;    /* Вторичный фон */
  --kpj-bg-hover: #27272a;        /* Фон при наведении */
  --kpj-border-color: #27272a;    /* Цвет границ */
  --kpj-text-primary: #e4e4e7;    /* Основной текст */
  --kpj-text-secondary: #a1a1aa;  /* Вторичный текст */
  --kpj-text-muted: #71717a;      /* Приглушённый текст */
  --kpj-accent-green: #10b981;    /* Акцентный зелёный */
  --kpj-accent-blue: #3b82f6;     /* Акцентный синий */
  --kpj-accent-red: #f87171;      /* Акцентный красный */
}
```

## ⚙️ Пропсы (Props)

Компонент поддерживает как управляемый (controlled), так и неуправляемый (uncontrolled) режимы:

| Проп | Тип | Описание | По умолчанию |
| :--- | :--- | :--- | :--- |
| `value` | `string` | Текущее значение JSON (controlled mode). | - |
| `defaultValue` | `string` | Начальное значение JSON (uncontrolled mode). | '{"hello": "world"}' |
| `onChange` | `(json: string) => void` | Вызывается при каждом изменении текста в редакторе. | - |
| `mappingFile` | `string \| TreeMapping` | Путь к JSON-файлу маппинга или сам объект конфигурации. | './tree-mapping.json' |
| `onSave` | `(json: string) => void` | Если передан, кнопка "Сохранить" вызывает этот callback. Если нет — скачивает файл. | - |
| `className` | `string` | CSS-класс для внешнего контейнера. | '' |

### Особенности `mappingFile`
- **Если передана строка**: компонент выполнит `fetch(mappingFile)`. Это удобно для внешних конфигураций, лежащих в папке `public`.
- **Если передан объект**: используется мгновенно без сетевых запросов.

## 📐 Настройка TreeMapping

Вы можете полностью настроить иконки и заголовки дерева:

```tsx
const myMapping = {
  rootLabel: "Инфраструктура",
  rootIcon: "Database", // Опционально: Server, Database, Box и др.
  branches: [
    { 
      key: "clusters", 
      label: "Кластеры", 
      displayKey: "clusterName", 
      icon: "Layers",
      itemIcon: "Terminal" // Кастомная иконка для элементов внутри ветки
    }
  ]
};

<SuperJsonEditor mappingFile={myMapping} />
```

### Доступные иконки (Lucide)
`Server`, `Key`, `Lock`, `GitBranch`, `Terminal`, `Database`, `Box`, `Layers`, `Settings`, `FileJson`.

## 🛠️ Встроенные инструменты

### Режим саморедактирования (Edit Mapping)
Нажмите кнопку **"Edit Mapping"** в заголовке, чтобы войти в режим настройки самого дерева.
1. Отредактируйте JSON структуру маппинга.
2. Нажмите **"Сохранить маппинг"**, чтобы немедленно применить новые правила отображения к вашему основному контенту.

### Интеллектуальное сохранение
- Если вы передали проп `onSave`, кнопка сохранения в заголовке превращается в триггер для вашей логики (например, отправка на сервер).
- Если проп отсутствует, компонент автоматически сформирует и скачает файл `config.json`.

## 💾 Интеграция с файловой системой и бэкендом

Поскольку компонент работает в браузере, он не может напрямую обращаться к файлам на вашем диске. Для реализации полноценного редактирования файлов на сервере используйте пропсы `onSave` и `onMappingSave`.

### Пример реализации с API
```tsx
const handleSave = async (json: string) => {
  try {
    await fetch('/api/save-config', {
      method: 'POST',
      body: JSON.stringify({ data: json }),
      headers: { 'Content-Type': 'application/json' }
    });
    alert('Файл успешно сохранен!');
  } catch (e) {
    alert('Ошибка при сохранении');
  }
};

const handleMappingSave = async (mapping: TreeMapping) => {
  await fetch('/api/save-mapping', {
    method: 'POST',
    body: JSON.stringify(mapping),
  });
};

<SuperJsonEditor 
  onSave={handleSave} 
  onMappingSave={handleMappingSave}
/>
```

## 🪟 Запуск в отдельном окне

Если вам нужно открыть редактор в новом окне браузера, вы можете:
1. Создать в приложении отдельный роут (например, `/editor`).
2. Рендерить компонент на этой странице.
3. Открывать его через `window.open('/editor', '_blank', 'width=1200,height=800')`.

Компонент автоматически подстраивается под размер родительского контейнера, поэтому на отдельной странице он будет выглядеть как полноценное приложение.

## ⚠️ Рекомендации

- **Контейнер**: Убедитесь, что родитель компонента имеет заданную высоту (например, `h-screen` или `100%`), так как редактор занимает всё доступное пространство.
- **Стили**: Пакет использует Tailwind CSS с изолированным контейнером `sje-container`; файл стилей — **`dist/kosmos-json-npm.css`**. Подключайте через `import '@roman.eremeev/kosmos-json-npm/style.css'`. При использовании CDN см. раздел «Важные моменты».

---
[GitHub Репозиторий](https://github.com/danmas)  
Автор: **Roman Eremeev** (@roman.eremeev)
