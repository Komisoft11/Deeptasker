export enum CodeLanguage {
  C = 'c',
  Cpp = 'cpp',
  CSharp = 'csharp',
  CSS = 'css',
  Go = 'go',
  Java = 'java',
  JSON = 'json',
  JavaScript = 'javascript',
  Markdown = 'markdown',
  PHP = 'php',
  PlainText = 'plaintext',
  Python = 'python',
  TypeScript = 'typescript'
}

interface ICodeLanguage {
  name: CodeLanguage
  label: string
}

export const codeLanguages: ICodeLanguage[] = [
  { name: CodeLanguage.C, label: 'C' },
  { name: CodeLanguage.Cpp, label: 'C++' },
  { name: CodeLanguage.CSharp, label: 'C#' },
  { name: CodeLanguage.CSS, label: 'CSS' },
  { name: CodeLanguage.Go, label: 'Go' },
  { name: CodeLanguage.Java, label: 'Java' },
  { name: CodeLanguage.JSON, label: 'JSON' },
  { name: CodeLanguage.JavaScript, label: 'JavaScript' },
  { name: CodeLanguage.Markdown, label: 'Markdown' },
  { name: CodeLanguage.PHP, label: 'PHP' },
  { name: CodeLanguage.PlainText, label: 'Plain Text' },
  { name: CodeLanguage.Python, label: 'Python' },
  { name: CodeLanguage.TypeScript, label: 'TypeScript' }
]
