// entrypoints/content.ts
import { defineContentScript } from '#imports';
import { PasteMessage, PasteResponse, MESSAGE_TYPES } from "../../core/types/messaging";
import { INPUT_SELECTORS } from "../../core/constants/selectors";
import { getInputElement, setInputValue } from "../../shared/utils/dom";

export default defineContentScript({
  // manifest.jsonにあったmatches情報をここに記述します。
  // グロブパターンはURLのスキーマ(http, httpsなど)も含むようにします。
  matches: ["*://chatgpt.com/*", "*://gemini.google.com/*"],
  // manifest.jsonにあったrun_at情報をここに記述します。
  runAt: 'document_idle',

  main() {
    // このconsole.logはWXTによってスクリプトがロードされたことを確認するためのものです。
    console.log('[PromptPocket CS by WXT] Content script loaded and main function executed.');

    chrome.runtime.onMessage.addListener((msg: any, _sender, sendResponse) => {
      if (msg?.type === MESSAGE_TYPES.PASTE_PROMPT && typeof msg.text === "string") {
        console.log('[PromptPocket CS] Received PASTE_PROMPT message:', msg);
        
        const response: PasteResponse = { success: false };
        try {
          const inputElement = getInputElement(INPUT_SELECTORS.CHATGPT);
          console.log('[PromptPocket CS] Input element found?:', inputElement);

          if (!inputElement) {
            response.error = `入力欄が見つかりません (セレクタ: ${INPUT_SELECTORS.CHATGPT})`;
            console.error('[PromptPocket CS] Error:', response.error);
            sendResponse(response);
            return true;
          }

          console.log('[PromptPocket CS] Text to paste:', msg.text);
          response.success = setInputValue(inputElement, msg.text);
          
          if (!response.success) {
            response.error = "入力要素にテキストを設定できませんでした。";
          }
          
          sendResponse(response);
        } catch (e: any) {
          response.error = e?.message || String(e);
          console.error('[PromptPocket CS] Exception:', e);
          sendResponse(response);
        }
        return true;
      }
      return false;
    });
  }
});

