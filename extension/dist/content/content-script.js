import{s as g}from"../assets/messages-6SxV35c-.js";const w=["textarea","input[type='text']","input[type='search']","[contenteditable='true']","[role='textbox']"].join(",");let s=null,n=null;_();document.addEventListener("focusin",t=>{const e=t.target;!(e instanceof HTMLElement)||!e.matches(w)||(s=e,h(e),v(e))});document.addEventListener("selectionchange",()=>{s&&f(s)});function h(t){t.dataset.scriptlyAttached!=="true"&&(t.dataset.scriptlyAttached="true",t.addEventListener("keydown",async e=>{e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==="s"&&(e.preventDefault(),await x(t,"rewrite","polite_indian_corporate"))}))}function v(t){n==null||n.remove(),n=document.createElement("div"),n.className="scriptly-toolbar",n.innerHTML=`
    <button data-task="grammar_correction" title="Fix grammar">Fix</button>
    <button data-task="rewrite" data-mode="polite_indian_corporate" title="Rewrite professionally">Rewrite</button>
    <button data-task="hinglish_transform" title="Hinglish intelligence">Hinglish</button>
    <button data-task="tone_analysis" title="Analyze tone">Tone</button>
    <button data-task="humanize" title="Humanize AI text">Humanize</button>
    <button data-task="smart_reply" title="Generate smart reply">Reply</button>
    <button data-task="prompt_enhance" title="Improve prompt">Prompt</button>
  `,n.addEventListener("mousedown",e=>e.preventDefault()),n.addEventListener("click",async e=>{const i=e.target.closest("button");!i||!s||await x(s,i.dataset.task,i.dataset.mode)}),document.documentElement.append(n),f(t)}function f(t){if(!n)return;const e=t.getBoundingClientRect();n.style.top=`${Math.max(8,e.top+window.scrollY-42)}px`,n.style.left=`${Math.max(8,e.left+window.scrollX)}px`}async function x(t,e,i){const r=b(t);if(!r.trim())return;m(!0);const a=await g({id:crypto.randomUUID(),taskType:e,text:r,mode:i,outputLanguage:e==="hinglish_transform"?"english":"auto",context:k(t)});m(!1),T(t,a.suggestions[0],a.output,a.explanation)}function b(t){var i;const e=(i=window.getSelection())==null?void 0:i.toString();return e!=null&&e.trim()?e:t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement?t.value:t.innerText}function E(t,e){var r;if(((r=window.getSelection())==null?void 0:r.toString())&&!t.matches("input, textarea")){document.execCommand("insertText",!1,e.replacement);return}if(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement){const a=t.value,o=t.selectionStart??0,c=t.selectionEnd??a.length,l=o!==c;t.value=l?`${a.slice(0,o)}${e.replacement}${a.slice(c)}`:e.replacement,t.dispatchEvent(new Event("input",{bubbles:!0}));return}t.innerText=e.replacement,t.dispatchEvent(new InputEvent("input",{bubbles:!0,inputType:"insertText"}))}function T(t,e,i,r){var u;if((u=document.querySelector(".scriptly-card"))==null||u.remove(),!e&&!i)return;const a=e??{id:crypto.randomUUID(),original:b(t),replacement:i??"",explanation:r},o=document.createElement("div");o.className="scriptly-card",o.innerHTML=`
    <div class="scriptly-card-title">Scriptly suggestion</div>
    <div class="scriptly-card-output"></div>
    ${a.explanation?'<div class="scriptly-card-note"></div>':""}
    <div class="scriptly-card-actions">
      <button data-action="accept">Accept</button>
      <button data-action="dismiss">Dismiss</button>
    </div>
  `,o.querySelector(".scriptly-card-output").textContent=a.replacement;const c=o.querySelector(".scriptly-card-note");c&&(c.textContent=a.explanation??""),o.addEventListener("click",y=>{var p;const d=(p=y.target.closest("button"))==null?void 0:p.dataset.action;d==="accept"&&(E(t,a),o.remove()),d==="dismiss"&&o.remove()});const l=t.getBoundingClientRect();o.style.top=`${l.bottom+window.scrollY+8}px`,o.style.left=`${Math.max(8,l.left+window.scrollX)}px`,document.documentElement.append(o)}function m(t){n&&(n.dataset.busy=String(t))}function k(t){return{platform:S(),editorKind:t.isContentEditable?"contenteditable":"textarea",audience:L(),relationship:"unknown",pageTitle:document.title,url:location.origin+location.pathname,surroundingText:document.title}}function S(){const t=window.location.hostname;return t.includes("mail.google.com")?"gmail":t.includes("linkedin.com")?"linkedin":t.includes("web.whatsapp.com")?"whatsapp":t.includes("slack.com")?"slack":t.includes("docs.google.com")?"google_docs":t.includes("notion.so")?"notion":t.includes("x.com")||t.includes("twitter.com")?"twitter":t.includes("chatgpt.com")?"chatgpt":"generic"}function L(){const t=window.location.hostname;return t.includes("linkedin.com")?"recruiter":t.includes("web.whatsapp.com")?"friend":"unknown"}function _(){const t=document.createElement("style");t.textContent=`
    .scriptly-toolbar {
      position: absolute;
      z-index: 2147483647;
      display: flex;
      gap: 4px;
      padding: 6px;
      background: #101827;
      border: 1px solid #263244;
      border-radius: 8px;
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.22);
      font: 12px system-ui, sans-serif;
    }
    .scriptly-toolbar[data-busy="true"] { opacity: 0.7; pointer-events: none; }
    .scriptly-toolbar button,
    .scriptly-card button {
      border: 0;
      border-radius: 6px;
      padding: 6px 8px;
      background: #eef2ff;
      color: #111827;
      cursor: pointer;
      font: 12px system-ui, sans-serif;
    }
    .scriptly-card {
      position: absolute;
      z-index: 2147483647;
      width: min(420px, calc(100vw - 24px));
      padding: 12px;
      background: #ffffff;
      color: #111827;
      border: 1px solid #d8dee9;
      border-radius: 8px;
      box-shadow: 0 16px 38px rgba(15, 23, 42, 0.18);
      font: 13px/1.45 system-ui, sans-serif;
    }
    .scriptly-card-title { font-weight: 700; margin-bottom: 8px; }
    .scriptly-card-output { white-space: pre-wrap; }
    .scriptly-card-note { color: #475569; margin-top: 8px; font-size: 12px; }
    .scriptly-card-actions { display: flex; gap: 8px; margin-top: 12px; }
  `,document.documentElement.append(t)}
