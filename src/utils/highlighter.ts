export function highlightJson(code: string) {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            // It's a key
            const key = match.replace(/:$/, '');
            return `<span class="text-cyan-400">${key}</span><span class="text-zinc-500">:</span>`;
          } else {
            // It's a string
            return `<span class="text-green-400">${match}</span>`;
          }
        } else if (/true|false/.test(match)) {
          return `<span class="text-orange-400">${match}</span>`;
        } else if (/null/.test(match)) {
          return `<span class="text-red-400">${match}</span>`;
        }
        // It's a number
        return `<span class="text-blue-400">${match}</span>`;
      }
    );
}
