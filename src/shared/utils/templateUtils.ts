/**
 * テンプレート変数の処理に関するユーティリティ関数
 * プロンプト内の変数を検出し、置換するための機能を提供する
 */

/**
 * プロンプト内の変数を検出する
 * 変数フォーマット: {{ 変数名 }}
 * @param text プロンプトテキスト
 * @returns 検出された変数名の配列
 */
export const extractVariables = (text: string): string[] => {
  // 正規表現で {{ 変数名 }} 形式の変数を検出
  const regex = /\{\{\s*([^{}]+?)\s*\}\}/g;
  const variables: string[] = [];
  let match;

  // 重複を避けるためのセット
  const uniqueVars = new Set<string>();

  // 全ての変数を検出
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim();
    if (!uniqueVars.has(varName)) {
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
  let result = template;

  // 各変数を対応する値で置換
  Object.entries(variables).forEach(([name, value]) => {
    // 変数パターンを作成 ({{ 変数名 }})
    const pattern = new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`, 'g');
    result = result.replace(pattern, value);
  });

  return result;
};

/**
 * プロンプトに変数が含まれているかチェック
 * @param text プロンプトテキスト
 * @returns 変数が含まれている場合はtrue
 */
export const hasVariables = (text: string): boolean => {
  // 入力テキストのデバッグ出力
  console.log('hasVariablesの入力テキスト:', text);
  
  // 正規表現で変数パターンをチェック
  const regex = /\{\{\s*([^{}]+?)\s*\}\}/;
  const result = regex.test(text);
  
  // 結果をデバッグ出力
  console.log('hasVariablesの結果:', result);
  
  return result;
};
