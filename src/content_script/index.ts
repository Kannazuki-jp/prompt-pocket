// サイドパネルからの貼り付けメッセージを受け、ChatGPT/Geminiの入力欄にテキストを挿入する
// なぜ型安全なメッセージ処理にするか→予期せぬバグ防止・保守性向上のため
import { PasteMessage, PasteResponse } from "../types/messaging";

// ChatGPT/Geminiの入力欄セレクタ（2025年5月時点）
// なぜ #prompt-textarea か→ChatGPTの入力欄の最新セレクタに合わせるため
const INPUT_SELECTOR = "#prompt-textarea";

chrome.runtime.onMessage.addListener((msg: any, _sender, sendResponse) => {
  // 型ガード：PasteMessage型かどうか
  if (msg && msg.type === "PASTE_PROMPT" && typeof msg.text === "string") {
    console.log('[PromptPocket CS] Received PASTE_PROMPT message:', msg);
    console.log('[PromptPocket CS] Using selector:', INPUT_SELECTOR);
    const response: PasteResponse = { success: false };
    try {
      // 入力欄を取得
      const inputElement = document.querySelector<HTMLTextAreaElement | HTMLInputElement | HTMLElement>(INPUT_SELECTOR);
      console.log('[PromptPocket CS] Input element found?:', inputElement);
      if (!inputElement) {
        response.error = `入力欄が見つかりません (セレクタ: ${INPUT_SELECTOR})`;
        console.error('[PromptPocket CS] Error:', response.error);
        sendResponse(response);
        return;
      }
      console.log('[PromptPocket CS] Text to paste:', msg.text);

      // テキストをセット
      // HTMLTextAreaElementまたはHTMLInputElementの場合、 .value を使用
      if (inputElement instanceof HTMLTextAreaElement || inputElement instanceof HTMLInputElement) {
        console.log('[PromptPocket CS] Input value BEFORE:', inputElement.value);
        inputElement.value = msg.text;
        console.log('[PromptPocket CS] Input value AFTER (using .value):', inputElement.value);
      } 
      // contenteditable div の場合は innerText や textContent を試す
      else if (inputElement.isContentEditable) {
        console.log('[PromptPocket CS] ContentEditable value BEFORE:', inputElement.innerText);
        inputElement.innerText = msg.text; // または inputElement.textContent = msg.text;
        console.log('[PromptPocket CS] ContentEditable value AFTER (using .innerText):', inputElement.innerText);
      } else {
        response.error = "入力要素がテキストエリア、インプット、または編集可能要素ではありません。";
        console.error('[PromptPocket CS] Error:', response.error, inputElement);
        sendResponse(response);
        return;
      }

      // inputイベントとchangeイベントを発火（React等の仮想DOM検知用）
      // dispatchEventは同期的であるため、awaitは不要
      inputElement.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
      inputElement.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      console.log('[PromptPocket CS] Dispatched input and change events.');
      response.success = true;
      sendResponse(response);
    } catch (e: any) {
      response.error = e?.message || String(e);
      console.error('[PromptPocket CS] Exception:', e);
      sendResponse(response);
    }
    // 非同期応答のためtrueを返す
    return true;
  }
});
