// DOM操作関連のユーティリティ関数

/**
 * 入力要素にテキストを設定し、必要なイベントを発火させる
 * @param element 入力要素
 * @param text 設定するテキスト
 * @returns 成功したかどうか
 */
export function setInputValue(
  element: HTMLTextAreaElement | HTMLInputElement | HTMLElement,
  text: string
): boolean {
  try {
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      element.value = text;
    } else if (element.isContentEditable) {
      element.innerText = text;
    } else {
      return false;
    }

    // イベントの発火
    element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    
    return true;
  } catch (error) {
    console.error('Error setting input value:', error);
    return false;
  }
}

/**
 * 指定されたセレクタで入力要素を取得する
 * @param selector セレクタ
 * @returns 入力要素またはnull
 */
export function getInputElement(selector: string): HTMLTextAreaElement | HTMLInputElement | HTMLElement | null {
  return document.querySelector<HTMLTextAreaElement | HTMLInputElement | HTMLElement>(selector);
} 