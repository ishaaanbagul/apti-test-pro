import Editor from "@monaco-editor/react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  className?: string;
  readOnly?: boolean;
}

export function CodeEditor({ 
  value, 
  onChange, 
  language = "javascript", 
  height = "400px",
  className,
  readOnly = false,
}: CodeEditorProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border", className)}>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(v) => onChange(v || "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          readOnly,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        }}
      />
    </div>
  );
}
