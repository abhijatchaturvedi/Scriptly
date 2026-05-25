const x=["textarea","input[type='text']","input[type='search']","body[contenteditable='true']","[contenteditable='true']","[role='textbox']","[g_editable='true']","[aria-label='Message Body']",".Am.Al.editable"].join(",");let d=null,c=null,r=null,h=new WeakMap,T=new WeakMap;W();I();document.addEventListener("focusin",t=>{const e=v(t);e&&(d=e,g(e),k(e),b(e,100))});document.addEventListener("click",t=>{const e=v(t);e&&(d=e,g(e),k(e),b(e,100))});document.addEventListener("selectionchange",()=>{d&&(L(d),A(d))});function g(t){t.dataset.scriptlyAttached!=="true"&&(t.dataset.scriptlyAttached="true",t.classList.add("scriptly-editor"),t.addEventListener("input",()=>b(t,650)),t.addEventListener("keydown",async e=>{e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==="s"&&(e.preventDefault(),await S(t,"rewrite","polite_indian_corporate"))}))}function v(t){const e=t.target;return e instanceof HTMLElement?e.matches(x)?e:e.closest(x):null}function I(){document.querySelectorAll(x).forEach(t=>{g(t)})}function k(t){c==null||c.remove(),c=document.createElement("div"),c.className="scriptly-toolbar",c.innerHTML=`
    <button data-task="grammar_correction" title="Fix grammar">Fix</button>
    <button data-task="rewrite" data-mode="polite_indian_corporate" title="Rewrite professionally">Rewrite</button>
    <button data-task="hinglish_transform" title="Hinglish intelligence">Hinglish</button>
    <button data-task="tone_analysis" title="Analyze tone">Tone</button>
    <button data-task="humanize" title="Humanize AI text">Humanize</button>
    <button data-task="smart_reply" title="Generate smart reply">Reply</button>
    <button data-task="prompt_enhance" title="Improve prompt">Prompt</button>
  `,c.addEventListener("mousedown",e=>e.preventDefault()),c.addEventListener("click",async e=>{const n=e.target.closest("button");!n||!d||await S(d,n.dataset.task,n.dataset.mode)}),document.documentElement.append(c),L(t)}function L(t){if(!c)return;const e=t.getBoundingClientRect();c.style.top=`${Math.max(8,e.top+window.scrollY-42)}px`,c.style.left=`${Math.max(8,e.left+window.scrollX)}px`}async function S(t,e,n){const o=M(t);if(!o.trim())return;E(!0);const i=await C({id:crypto.randomUUID(),taskType:e,text:o,mode:n,outputLanguage:e==="hinglish_transform"?"english":"auto",context:H(t)});E(!1),_(t,i.suggestions[0],i.output,i.explanation)}function C(t){return chrome.runtime.sendMessage({type:"SCRIPTLY_AI_TASK",payload:t})}function b(t,e){const n=h.get(t);n&&window.clearTimeout(n);const o=window.setTimeout(()=>{N(t)},e);h.set(t,o)}async function N(t){const e=$(t);if(U(t),e.trim().length<4){w(t,[]);return}const o=(await C({id:crypto.randomUUID(),taskType:"grammar_correction",text:e,outputLanguage:"auto",context:H(t)})).suggestions.filter(i=>i.original&&i.replacement&&i.original!==i.replacement);w(t,o)}function M(t){var n;const e=(n=window.getSelection())==null?void 0:n.toString();return e!=null&&e.trim()?e:t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement?t.value:t.innerText}function $(t){return t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement?t.value:t.innerText}function z(t,e){var o;if(((o=window.getSelection())==null?void 0:o.toString())&&!t.matches("input, textarea")){document.execCommand("insertText",!1,e.replacement);return}if(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement){const i=t.value,a=t.selectionStart??0,s=t.selectionEnd??i.length,l=a!==s;t.value=l?`${i.slice(0,a)}${e.replacement}${i.slice(s)}`:y(i,e),t.dispatchEvent(new Event("input",{bubbles:!0}));return}t.innerText=y(t.innerText,e),t.dispatchEvent(new InputEvent("input",{bubbles:!0,inputType:"insertText"}))}function y(t,e){return t.includes(e.original)?t.replace(e.original,e.replacement):e.original===t?e.replacement:t}function _(t,e,n,o){var u;if((u=document.querySelector(".scriptly-card"))==null||u.remove(),!e&&!n)return;const i=e??{id:crypto.randomUUID(),original:M(t),replacement:n??"",explanation:o},a=document.createElement("div");a.className="scriptly-card",a.innerHTML=`
    <div class="scriptly-card-title">Scriptly suggestion</div>
    <div class="scriptly-card-output"></div>
    ${i.explanation?'<div class="scriptly-card-note"></div>':""}
    <div class="scriptly-card-actions">
      <button data-action="accept">Accept</button>
      <button data-action="dismiss">Dismiss</button>
    </div>
  `,a.querySelector(".scriptly-card-output").textContent=i.replacement;const s=a.querySelector(".scriptly-card-note");s&&(s.textContent=i.explanation??""),a.addEventListener("click",f=>{var m;const p=(m=f.target.closest("button"))==null?void 0:m.dataset.action;p==="accept"&&(z(t,i),a.remove()),p==="dismiss"&&a.remove()});const l=t.getBoundingClientRect();a.style.top=`${l.bottom+window.scrollY+8}px`,a.style.left=`${Math.max(8,l.left+window.scrollX)}px`,document.documentElement.append(a)}function w(t,e){T.set(t,e),t.classList.toggle("scriptly-editor-has-issue",e.length>0),t.isContentEditable&&e.length>0&&q(t,e),e.length>0?R(t,e):d===t&&D()}function R(t,e){r==null||r.remove(),r=document.createElement("button"),r.className="scriptly-marker",r.type="button",r.textContent=String(e.length),r.title="Scriptly suggestions",r.addEventListener("mousedown",n=>n.preventDefault()),r.addEventListener("click",()=>{const n=T.get(t)??[];n[0]&&_(t,n[0])}),document.documentElement.append(r),A(t)}function D(){r==null||r.remove(),r=null}function A(t){if(!r)return;const e=t.getBoundingClientRect();r.style.top=`${e.bottom+window.scrollY-28}px`,r.style.left=`${e.right+window.scrollX-28}px`}function U(t){var e;(e=t.querySelectorAll)==null||e.call(t,".scriptly-inline-highlight").forEach(n=>{const o=n.parentNode;o&&(o.replaceChild(document.createTextNode(n.textContent??""),n),o.normalize())})}function q(t,e){var n,o;for(const i of e.slice(0,3)){const a=document.createTreeWalker(t,NodeFilter.SHOW_TEXT);let s=a.nextNode();for(;s;){const l=s.textContent??"",u=l.toLowerCase().indexOf(i.original.toLowerCase());if(u>=0&&((n=s.parentElement)==null?void 0:n.closest(".scriptly-inline-highlight"))==null){const f=document.createTextNode(l.slice(0,u)),p=document.createElement("span");p.className="scriptly-inline-highlight",p.textContent=l.slice(u,u+i.original.length),p.title=i.replacement;const m=document.createTextNode(l.slice(u+i.original.length));(o=s.parentNode)==null||o.replaceChild(m,s),m.before(f,p);break}s=a.nextNode()}}}function E(t){c&&(c.dataset.busy=String(t))}function H(t){return{platform:B(),editorKind:t.isContentEditable?"contenteditable":"textarea",audience:O(),relationship:"unknown",pageTitle:document.title,url:location.origin+location.pathname,surroundingText:document.title}}function B(){const t=window.location.hostname;return t.includes("mail.google.com")?"gmail":t.includes("linkedin.com")?"linkedin":t.includes("web.whatsapp.com")?"whatsapp":t.includes("slack.com")?"slack":t.includes("docs.google.com")?"google_docs":t.includes("notion.so")?"notion":t.includes("x.com")||t.includes("twitter.com")?"twitter":t.includes("chatgpt.com")?"chatgpt":"generic"}function O(){const t=window.location.hostname;return t.includes("linkedin.com")?"recruiter":t.includes("web.whatsapp.com")?"friend":"unknown"}function W(){const t=document.createElement("style");t.textContent=`
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
    .scriptly-editor-has-issue {
      box-shadow: inset 0 -2px 0 #ef4444 !important;
    }
    .scriptly-marker {
      position: absolute;
      z-index: 2147483647;
      width: 24px;
      height: 24px;
      border: 0;
      border-radius: 999px;
      background: #ef4444;
      color: #ffffff;
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.24);
      cursor: pointer;
      font: 700 12px system-ui, sans-serif;
    }
    .scriptly-inline-highlight {
      text-decoration: underline;
      text-decoration-color: #ef4444;
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
      background: rgba(239, 68, 68, 0.08);
      border-radius: 3px;
    }
  `,document.documentElement.append(t)}
