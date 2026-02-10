import React from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language: string;
  filename: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code, language, filename }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Improved Syntax Highlighter with Tokenization Strategy
  const highlightSyntax = (line: string) => {
    // 1. Escape HTML entities first to handle generics (e.g. Uint<64>) and prevent XSS
    // This turns "Uint<64>" into "Uint&lt;64&gt;" so < and > are treated as text
    let result = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Token storage to prevent regex collisions
    const tokens: string[] = [];
    const saveToken = (cls: string, content: string) => {
        // We wrap the content in the span here, but store it in the array
        // The main string gets a placeholder that won't trigger other regexes
        tokens.push(`<span class="${cls}">${content}</span>`);
        return `###TOKEN_${tokens.length - 1}###`;
    };

    // 2. Extract Strings (Double Quotes)
    // Matches &quot;...&quot; (since we escaped quotes in step 1)
    result = result.replace(/(&quot;.*?&quot;)/g, (match) => saveToken('text-green-400', match));

    // 3. Extract Comments
    // Matches // until end of line
    result = result.replace(/(\/\/.*)/g, (match) => saveToken('text-slate-500 italic', match));

    // 4. Highlight Keywords
    // We use \b to ensure we only match whole words
    const keywords = "export|ledger|circuit|module|import|function|assert|return|witness|struct|pragma|language_version|if|const|let|async|await|interface|new|try|catch|finally|throw|typeof";
    result = result.replace(new RegExp(`\\b(${keywords})\\b`, 'g'), 
        (match) => `<span class="text-purple-400 font-bold">${match}</span>`);

    // 5. Highlight Types & Built-ins
    const types = "String|Uint|Bytes|Boolean|Map|Address|ZKProof|Vector|CompactStandardLibrary|PassportWitness|BigInt|Promise|void|any|WitnessContext|Ledger|PrivateState|number|string|boolean";
    result = result.replace(new RegExp(`\\b(${types})\\b`, 'g'), 
        (match) => `<span class="text-yellow-300">${match}</span>`);

    // 6. Restore Tokens
    // Swap placeholders back to the HTML-wrapped content
    tokens.forEach((token, index) => {
        result = result.replace(`###TOKEN_${index}###`, token);
    });

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 bg-[#0d1117] shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
           <div className="flex gap-1.5">
             <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
             <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
           </div>
           <span className="ml-3 text-xs font-mono text-slate-400">{filename}</span>
        </div>
        <button 
            onClick={handleCopy}
            className="text-slate-400 hover:text-white transition-colors"
        >
            {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed">
            <code className={`language-${language}`}>
                {code.split('\n').map((line, i) => (
                    <div key={i} className="table-row">
                        <span className="table-cell select-none text-slate-600 text-right pr-4 w-8">{i + 1}</span>
                        <span className="table-cell whitespace-pre text-slate-300">{highlightSyntax(line)}</span>
                    </div>
                ))}
            </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;