# @roman.eremeev/kosmos-json-npm (v1.0.5)

<div align="center">
<img width="1200" height="475" alt="Super JSON Editor Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

**SuperJsonEditor** — это современный и мощный React-компонент для редактирования JSON, обладающий интерактивным деревом навигации, поддержкой гибких схем (tree-mapping) и интеллектуальной синхронизацией прокрутки.

## ✨ Основные возможности

- 🚀 **CodeMirror 6**: Быстрый и отзывчивый редактор в правой панели.
- 🌳 **Динамическое дерево**: Левая панель отображает структуру JSON согласно вашему маппингу с поддержкой кастомных иконок.
- 🔗 **Синхронизация скролла**: Клик на узел в дереве мгновенно переносит фокус в соответствующую строку редактора.
- ✅ **Валидация**: Автоматическая проверка синтаксиса JSON и соответствия структуре маппинга.
- 🛠️ **Edit Mapping Mode**: Встроенный режим редактирования самого маппинга прямо внутри компонента.
- 🌓 **Премиальный UI**: Темная тема "из коробки" с плавными переходами и микро-анимациями.
- 🔒 **Изолированные стили**: Компонент использует уникальный контейнер `sje-container` для изоляции стилей и предотвращения конфликтов.

## 📦 Установка

```bash
npm install @roman.eremeev/kosmos-json-npm
```

## 🚀 Быстрый старт

```tsx
import { SuperJsonEditor } from '@roman.eremeev/kosmos-json-npm';
import '@roman.eremeev/kosmos-json-npm/style.css';

function App() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <SuperJsonEditor 
        defaultValue='{ "servers": [] }'
        onSave={(json) => console.log("Data saved:", json)}
      />
    </div>
  );
}
```

## 🎨 Кастомизация темы

Компонент поддерживает CSS-переменные для настройки цветовой схемы:

```css
:root {
  --kpj-bg-primary: #09090b;      /* Основной фон */
  --kpj-bg-secondary: #18181b;    /* Вторичный фон */
  --kpj-bg-hover: #27272a;        /* Фон при наведении */
  --kpj-border-color: #27272a;    /* Цвет границ */
  --kpj-text-primary: #e4e4e7;    /* Основной текст */
  --kpj-text-secondary: #a1a1aa;  /* Вторичный текст */
  --kpj-accent-green: #10b981;    /* Акцентный зелёный */
  --kpj-accent-blue: #3b82f6;     /* Акцентный синий */
}
```

## 📚 Документация

Подробную спецификацию пропсов и руководство по настройке маппинга читайте в [**README_kosmos-json-npm_usage.md**](./README_kosmos-json-npm_usage.md).

## 🛠️ Разработка (Локально)

1. Клонируйте репозиторий.
2. Установите зависимости: `npm install`.
3. Запустите dev-сервер: `npm run dev`.
4. Сборка пакета: `npm run build`.

---
[GitHub](https://github.com/danmas) • [NPM](https://www.npmjs.com/~roman.eremeev)  
Автор: **Roman Eremeev**
