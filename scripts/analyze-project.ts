// scripts/analyze-project.ts
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESモジュールの __dirname を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProjectStructure {
  [key: string]: {
    type: 'file' | 'directory';
    size?: number;
    mtime?: Date;
    children?: ProjectStructure;
  };
}

// 無視するディレクトリ/ファイル
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.DS_Store',
  '*.d.ts',
  '*.d.mts',
  '*.d.cts'
];

async function analyzeDirectory(dir: string, relativePath: string = ''): Promise<ProjectStructure> {
  const result: ProjectStructure = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const entryRelativePath = path.join(relativePath, entry.name);

    // 無視するパターンに一致するかチェック
    const shouldIgnore = IGNORE_PATTERNS.some(pattern => {
      if (pattern.includes('*')) {
        // ワイルドカードパターンの場合
        const regex = new RegExp(`^${pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);
        return regex.test(entry.name);
      }
      return entry.name === pattern;
    });

    if (shouldIgnore) {
      continue;
    }

    try {
      if (entry.isDirectory()) {
        result[entry.name] = {
          type: 'directory',
          children: await analyzeDirectory(fullPath, entryRelativePath)
        };
      } else if (entry.isFile()) {
        const stats = fs.statSync(fullPath);
        result[entry.name] = {
          type: 'file',
          size: stats.size,
          mtime: stats.mtime
        };
      }
    } catch (error) {
      console.error(`Error processing ${fullPath}:`, error);
    }
  }

  return result;
}

// メイン処理
async function main() {
  try {
    const projectRoot = path.join(__dirname, '..');
    const outputDir = path.join(projectRoot, 'scripts', 'ai-docs');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('プロジェクト構造を解析中...');
    const structure = await analyzeDirectory(path.join(projectRoot, 'src'));
    
    const outputPath = path.join(outputDir, 'project-structure.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(structure, (key, value) => 
        value instanceof Date ? value.toISOString() : value, 2)
    );
    
    console.log(`プロジェクト構造の解析が完了しました: ${outputPath}`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

main();