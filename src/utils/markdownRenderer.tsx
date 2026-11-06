import React from 'react';

interface MarkdownRendererProps {
  content: string;
  onSuggestionClick?: (suggestion: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onSuggestionClick,
}) => {
  // Extract suggestions section if present
  let mainContent = content;
  let suggestions: string[] = [];

  const suggestionsIndex = content.indexOf('[Suggestions]');
  if (suggestionsIndex !== -1) {
    mainContent = content.slice(0, suggestionsIndex).trim();
    const suggestionsBlock = content.slice(suggestionsIndex + '[Suggestions]'.length).trim();
    suggestions = suggestionsBlock
      .split('\n')
      .map((line) => line.replace(/^[\s•\-\*\d\.]+\s*/, '').trim())
      .filter((line) => line.length > 0);
  }

  // Parse lines into structured blocks
  const lines = mainContent.split('\n');
  const elements: React.ReactNode[] = [];

  let tableLines: string[] = [];
  let inTable = false;

  const flushTable = () => {
    if (tableLines.length === 0) return;
    const rows = tableLines.map((line) =>
      line
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell, idx, arr) => (idx > 0 && idx < arr.length - 1) || arr.length <= 2)
    );

    if (rows.length >= 2) {
      const headerRow = rows[0];
      // Skip separator row (e.g. |---|---|)
      const dataRows = rows.slice(1).filter((r) => !r.every((c) => /^[-:\s]+$/.test(c)));

      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-3 border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-100 font-semibold text-slate-800">
              <tr>
                {headerRow.map((head, i) => (
                  <th key={i} className="px-3 py-2 whitespace-nowrap">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {dataRows.map((row, ri) => (
                <tr key={ri} className="hover:bg-slate-50/80">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 font-mono tabular-nums text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableLines = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect markdown tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableLines.push(line);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-sm font-bold text-slate-900 mt-3 mb-1">
          {formatInline(line.slice(4))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-base font-bold text-slate-900 mt-4 mb-1.5">
          {formatInline(line.slice(3))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} className="text-lg font-bold text-slate-900 mt-4 mb-2">
          {formatInline(line.slice(2))}
        </h2>
      );
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={i} className="my-3 border-slate-200" />);
      continue;
    }

    // Unordered lists
    if (/^[\s]*[•\-\*]\s+/.test(line)) {
      const cleanLine = line.replace(/^[\s]*[•\-\*]\s+/, '');
      elements.push(
        <li key={i} className="text-sm text-slate-700 ml-4 list-disc mb-1 leading-relaxed">
          {formatInline(cleanLine)}
        </li>
      );
      continue;
    }

    // Numbered lists
    if (/^\d+\.\s+/.test(line)) {
      const cleanLine = line.replace(/^\d+\.\s+/, '');
      elements.push(
        <li key={i} className="text-sm text-slate-700 ml-5 list-decimal mb-1 leading-relaxed">
          {formatInline(cleanLine)}
        </li>
      );
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />);
      continue;
    }

    // Regular paragraphs
    elements.push(
      <p key={i} className="text-sm text-slate-800 leading-relaxed mb-1.5">
        {formatInline(line)}
      </p>
    );
  }

  // Flush any lingering table
  if (inTable) {
    flushTable();
  }

  return (
    <div className="space-y-1">
      {elements}

      {/* Suggested Follow-Up Prompts */}
      {suggestions.length > 0 && onSuggestionClick && (
        <div className="mt-4 pt-3 border-t border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Suggested Follow-up Inquiries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion, sIdx) => (
              <button
                key={sIdx}
                onClick={() => onSuggestionClick(suggestion)}
                className="text-left text-xs text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/80 rounded-lg px-2.5 py-1.5 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <span>→</span>
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Formats inline bold, italic, code tags
function formatInline(text: string): React.ReactNode {
  // Split on bold **text**
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  return boldParts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold text-slate-900">
          {formatCode(boldText)}
        </strong>
      );
    }
    return <span key={index}>{formatCode(part)}</span>;
  });
}

function formatCode(text: string): React.ReactNode {
  const codeParts = text.split(/(`[^`]+`)/g);
  return codeParts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="font-mono text-xs bg-slate-100 text-slate-800 px-1 py-0.5 rounded border border-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
