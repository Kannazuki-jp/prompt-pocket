// scripts/generate-ai-docs.ts
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESモジュールの __dirname を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトのルートディレクトリ
const PROJECT_ROOT = path.join(__dirname, '..');
const AI_DOCS_DIR = path.join(PROJECT_ROOT, 'scripts', 'ai-docs');

// JSONファイルを安全に読み込む関数
function readJsonFile(filePath: string): any {
  try {
    // BOMを削除してからJSONをパース
    const content = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading or parsing JSON file: ${filePath}`);
    console.error(error);
    process.exit(1);
  }
}

// マークダウン生成関数
function generateMarkdown(
  projectStructure: any,
  dependencyGraph: any
): string {
  const now = new Date().toISOString();
  let markdown = `# プロジェクト構造レポート\n\n`;
  markdown += `生成日時: ${now}\n\n`;

  // プロジェクトの概要
  markdown += `## プロジェクト概要\n\n`;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8'));
    markdown += `- プロジェクト名: ${pkg.name || 'N/A'}\n`;
    markdown += `- バージョン: ${pkg.version || 'N/A'}\n`;
    markdown += `- 説明: ${pkg.description || 'N/A'}\n\n`;
  } catch (error) {
    console.error('Error reading package.json:', error);
    markdown += `- プロジェクト情報の読み込みに失敗しました\n\n`;
  }

  // ディレクトリ構造
  markdown += `## ディレクトリ構造\n\n`;
  markdown += '```\n';
  markdown += generateDirectoryTree(projectStructure);
  markdown += '```\n\n';

  // 主要な依存関係
  markdown += `## 主要な依存関係\n\n`;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8'));
    const deps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {})
    };
    
    if (Object.keys(deps).length > 0) {
      markdown += Object.entries(deps)
        .map(([name, version]) => `- ${name}: ${version}`)
        .join('\n');
    } else {
      markdown += '依存関係が見つかりませんでした\n';
    }
  } catch (error) {
    console.error('Error reading dependencies:', error);
    markdown += '依存関係の読み込みに失敗しました\n';
  }
  markdown += '\n\n';

  // モジュール間の依存関係
  markdown += `## モジュール間の依存関係\n\n`;
  if (dependencyGraph?.modules?.length > 0) {
    markdown += '```mermaid\ngraph TD;\n';
    const addedEdges = new Set<string>();

    // 各モジュールの依存関係を追加
    dependencyGraph.modules.forEach((module: any) => {
      const source = module.source;
      (module.dependencies || []).forEach((dep: any) => {
        if (dep.resolved) {
          const edge = `    ${source} --> ${dep.resolved}`;
          if (!addedEdges.has(edge)) {
            markdown += `${edge}\n`;
            addedEdges.add(edge);
          }
        }
      });
    });
    markdown += '```\n\n';
  } else {
    markdown += '依存関係グラフのデータが空です\n\n';
  }

  // ファイルの統計情報
  markdown += `## ファイル統計\n\n`;
  const stats = calculateStats(projectStructure);
  markdown += `- 総ファイル数: ${stats.fileCount} ファイル\n`;
  markdown += `- 総ディレクトリ数: ${stats.dirCount} ディレクトリ\n`;
  markdown += `- 合計サイズ: ${formatFileSize(stats.totalSize)}\n\n`;

  return markdown;
}

// ディレクトリツリーを生成するヘルパー関数
function generateDirectoryTree(structure: any, prefix = ''): string {
  if (!structure || typeof structure !== 'object') {
    return 'ディレクトリ構造を読み込めませんでした\n';
  }

  let result = '';
  const entries = Object.entries(structure).sort(([a], [b]) => a.localeCompare(b));
  
  entries.forEach(([name, data]: [string, any], index, array) => {
    const isLast = index === array.length - 1;
    const newPrefix = prefix + (isLast ? '    ' : '│   ');
    
    result += prefix + (isLast ? '└── ' : '├── ') + name;
    
    if (data?.type === 'file') {
      result += ` (${formatFileSize(data.size || 0)})\n`;
    } else if (data?.type === 'directory') {
      result += '/\n';
      if (data.children) {
        result += generateDirectoryTree(data.children, newPrefix);
      }
    }
  });
  
  return result || 'ディレクトリが空です\n';
}

// ファイル統計を計算するヘルパー関数
function calculateStats(structure: any) {
  let fileCount = 0;
  let dirCount = 0;
  let totalSize = 0;

  function traverse(node: any) {
    if (!node) return;

    if (node.type === 'file') {
      fileCount++;
      totalSize += node.size || 0;
    } else if (node.type === 'directory') {
      dirCount++;
      if (node.children) {
        Object.values(node.children).forEach(traverse);
      }
    } else if (typeof node === 'object') {
      // ルートノードの場合
      Object.values(node).forEach(traverse);
    }
  }

  traverse(structure);
  return { fileCount, dirCount, totalSize };
}

// ファイルサイズをフォーマットするヘルパー関数
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// メイン処理
async function main() {
  try {
    console.log('AI向けドキュメントを生成中...');
    
    // プロジェクト構造と依存関係グラフを読み込む
    const projectStructure = readJsonFile(
      path.join(AI_DOCS_DIR, 'project-structure.json')
    );
    
    const dependencyGraph = readJsonFile(
      path.join(AI_DOCS_DIR, 'dependency-graph.json')
    );

    // マークダウンドキュメントを生成
    const markdown = generateMarkdown(projectStructure, dependencyGraph);
    
    // ドキュメントを保存
    const outputPath = path.join(AI_DOCS_DIR, 'PROJECT_OVERVIEW.md');
    fs.writeFileSync(outputPath, markdown);
    
    console.log(`AI向けドキュメントの生成が完了しました: ${outputPath}`);
  } catch (error) {
    console.error('エラーが発生しました:');
    console.error(error);
    process.exit(1);
  }
}

// スクリプトを実行
main().catch(error => {
  console.error('予期しないエラーが発生しました:');
  console.error(error);
  process.exit(1);
});