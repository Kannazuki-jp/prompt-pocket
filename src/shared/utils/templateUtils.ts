/**
 * テンプレート変数の処理に関するユーティリティ関数
 * プロンプト内の変数を検出し、置換するための機能を提供する
 */

// 変数の正規表現パターン
export const VARIABLE_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g;

/**
 * プロンプト内の変数を検出する
 * 変数フォーマット: {{ 変数名 }}
 * @param text プロンプトテキスト
 * @returns 検出された変数名の配列
 */
export const extractVariables = (text: string): string[] => {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // 正規表現で {{ 変数名 }} 形式の変数を検出
  const variables: string[] = [];
  let match;

  // 重複を避けるためのセット
  const uniqueVars = new Set<string>();

  // 全ての変数を検出
  const regex = new RegExp(VARIABLE_PATTERN);
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim();
    if (varName && !uniqueVars.has(varName)) {
      uniqueVars.add(varName);
      variables.push(varName);
    }
  }

  return variables;
};

/**
 * 変数を値で置換する
 * @param template プロンプトテンプレート
 * @param variables 変数と値のマップ
 * @returns 置換後のテキスト
 */
export const replaceVariables = (template: string, variables: Record<string, string>): string => {
  if (!template || typeof template !== 'string') {
    return '';
  }
  
  if (!variables || typeof variables !== 'object') {
    return template;
  }

  let result = template;

  // 各変数を対応する値で置換
  Object.entries(variables).forEach(([name, value]) => {
    if (name && typeof value === 'string') {
      // 変数パターンを作成 ({{ 変数名 }})
      const pattern = new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`, 'g');
      result = result.replace(pattern, value);
    }
  });

  return result;
};

/**
 * プロンプトに変数が含まれているかチェック
 * @param text プロンプトテキスト
 * @returns 変数が含まれている場合はtrue
 */
export const hasVariables = (text: string): boolean => {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  return VARIABLE_PATTERN.test(text);
};

/**
 * 未置換の変数を検出する
 * @param text 置換後のテキスト
 * @returns 未置換の変数がある場合はtrue
 */
export const hasUnreplacedVariables = (text: string): boolean => {
  return hasVariables(text);
};

/**
 * 変数名から表示用のラベルを生成する
 * @param variableName 変数名
 * @returns 表示用ラベル
 */
export const getVariableLabel = (variableName: string): string => {
  if (!variableName) return '';
  
  // スネークケースやケバブケースをスペース区切りに変換し、最初の文字を大文字に
  return variableName
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};
