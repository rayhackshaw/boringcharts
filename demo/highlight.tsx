type Language = 'json' | 'tsx' | 'shell';
type TokenKind = 'key' | 'string' | 'number' | 'boolean' | 'keyword' | 'type' | 'tag' | 'comment' | 'command';

interface Token { text: string; kind?: TokenKind }

const patterns: Record<Language, RegExp> = {
  json: /("(?:\\.|[^"\\])*"(?=\s*:))|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?\b)/g,
  tsx: /(\/\/[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(<\/?[A-Za-z][^>]*\/?>)|\b(import|from|const|export|function|return|type|interface|new)\b|\b([A-Z][A-Za-z0-9_]*)\b|\b(\d+(?:\.\d+)?)\b/g,
  shell: /(^\s*#.*$)|\b(npm|npx)\b/gm,
};

function tokenize(code: string, language: Language): Token[] {
  const tokens: Token[] = [];
  const pattern = new RegExp(patterns[language].source, patterns[language].flags);
  let cursor = 0;
  for (const match of code.matchAll(pattern)) {
    const start = match.index;
    if (start > cursor) tokens.push({ text: code.slice(cursor, start) });
    const kind: TokenKind = language === 'json'
      ? match[1] ? 'key' : match[2] ? 'string' : match[3] ? 'boolean' : 'number'
      : language === 'tsx'
        ? match[1] ? 'comment' : match[2] ? 'string' : match[3] ? 'tag' : match[4] ? 'keyword' : match[5] ? 'type' : 'number'
        : match[1] ? 'comment' : 'command';
    tokens.push({ text: match[0], kind });
    cursor = start + match[0].length;
  }
  if (cursor < code.length) tokens.push({ text: code.slice(cursor) });
  return tokens;
}

export function HighlightedCode({ code, language }: { code: string; language: Language }) {
  return <code className={`language-${language}`}>{tokenize(code, language).map((token, index) =>
    token.kind ? <span key={index} className={`code-token ${token.kind}`}>{token.text}</span> : token.text,
  )}</code>;
}
