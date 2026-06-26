import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'

import { callAI, callAIVision } from '../lib/ai.js'

// ── safe single-pass syntax highlighter ───────────────────────────────────────
// IMPORTANT: uses inline colors, not CSS classes. The previous version emitted
// <span class="cm/str/kw/tg/fn/num"> and relied on global.css to color them —
// any token that fell through unmatched (attribute names like lang=, charset=,
// name=) got the <pre>'s default/inherited color, which on a dark background
// could render invisible. Inline colors remove that dependency entirely: every
// character is guaranteed a visible color regardless of what's defined (or
// missing) elsewhere in the stylesheet.
function hl(raw) {
  if (!raw) return ''
  const e = raw
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  const body = e.replace(
    /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(&quot;(?:[^&]|&(?!quot;))*?&quot;)|(`[^`]*`)|(\b(?:const|let|var|return|import|export|default|from|if|else|function|class|new|typeof|of|in|async|await|try|catch|throw)\b)|(&lt;\/?[\w.-]+)|(\b[A-Z][\w]*(?=[\s=(.]))|(\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms)?\b)/gm,
    (m,c1,c2,s1,s2,kw,tag,fn,num) => {
      if (c1||c2) return `<span style="color:#6a9955">${m}</span>`
      if (s1||s2) return `<span style="color:#ce9178">${m}</span>`
      if (kw)     return `<span style="color:#c586c0">${m}</span>`
      if (tag)    return `<span style="color:#569cd6">${m}</span>`
      if (fn)     return `<span style="color:#4ec9b0">${m}</span>`
      if (num)    return `<span style="color:#b5cea8">${m}</span>`
      // unmatched characters (attribute names, punctuation, plain text) are
      // left as-is here, but they're never invisible — the <pre> that renders
      // this HTML now sets an explicit inline color (see CodeBlock below),
      // which every unwrapped text node inherits directly
      return m
    }
  )
  return body
}

const LANGS = ['HTML','CSS','React','Tailwind','Vue']
const LANG_COLORS = { HTML:'#f97316', CSS:'#264de4', React:'#61dafb', Tailwind:'#38bdf8', Vue:'#42d392' }

// parse base64 from dataURL
function parseDataUrl(dataUrl) {
  const m = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/.exec(dataUrl)
  return m ? { mediaType: m[1], base64: m[2] } : null
}

// ── resize image if too large for Groq ────────────────────────────────────────
async function resizeIfNeeded(dataUrl) {
  const parsed = parseDataUrl(dataUrl)
  if (!parsed) return null
  const allowed = ['image/jpeg','image/png','image/gif','image/webp']
  const mimeType = allowed.includes(parsed.mediaType) ? parsed.mediaType : 'image/jpeg'
  let b64 = parsed.base64
  if (b64.length > 1400000) {
    try {
      const img = new Image()
      await new Promise(res => { img.onload = res; img.src = dataUrl })
      const scale = Math.sqrt(1400000 / b64.length)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.floor(img.width  * scale)
      canvas.height = Math.floor(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      b64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1]
    } catch {}
  }
  return { b64, mimeType }
}

// ── Step 1: detect components in the image ────────────────────────────────────
async function detectComponents(dataUrl) {
  const r = await resizeIfNeeded(dataUrl)
  if (!r) return null

  const prompt = `You are Inspectra — a senior UI engineer and design-system architect who reverse-engineers screenshots into structured component data. Look at this webpage screenshot carefully and methodically, top to bottom.

Identify EVERY distinct UI component you can see — not just big sections. Think small: logo, nav links, search bar, hero heading, hero subtext, CTA button, product card, price tag, rating stars, form input, tab bar, footer links, icons, badges, etc. When a component lives inside a bigger section, say so in the label so the hierarchy is clear, e.g. "Hero → Primary CTA Button" or "Pricing Card → Upgrade Button".

For each component return:
- label: short name, prefixed with its parent section if nested, like "Hero → Primary CTA Button" or "Navbar → Logo"
- tag: the most appropriate HTML tag — <nav>, <button>, <input>, <img>, <h1>, <p>, <div>, <section>, <footer>, etc.
- top/left/width/height: position as % of the FULL image (0-100), measured as precisely as you can — double-check each box actually surrounds the element before finalizing it
- desc: one sentence on its purpose, and note any visible state (hovered/active/disabled) if apparent

Return ONLY valid JSON:
{
  "components": [
    { "label": "...", "tag": "...", "desc": "...", "top": 0, "left": 0, "width": 100, "height": 8 }
  ]
}

Detect 5 to 15 components. Order top to bottom, left to right. Accuracy of the bounding box matters more than quantity — a tight, correct box beats a loose guess.`

  try {
    const text = await callAIVision(r.b64, r.mimeType, prompt)
    const clean = text
      .replace(/^```json\s*/i,'')
      .replace(/^```\s*/i,'')
      .replace(/```\s*$/,'')
      .replace(/^[^{]*/,'')
      .replace(/[^}]*$/,'')
      .trim()
    const json = JSON.parse(clean)
    if (!Array.isArray(json.components) || json.components.length === 0) return null
    return json.components
  } catch(e) {
    console.error('Parse error:', e.message)
    return null
  }
}

// ── Step 2: generate code for ONE component in ONE language ───────────────────
async function generateComponentCode(dataUrl, component, lang) {
  const r = await resizeIfNeeded(dataUrl)
  if (!r) return '/* Could not process image */'

  const langInstructions = {
    HTML: 'Return only clean semantic HTML for this component. Include inline style attribute for colors/spacing.',
    CSS: 'Return the CSS class definitions for this component. Use BEM naming. Include all styles needed.',
    React: 'Return a complete React functional component with inline styles. No imports needed. Export default.',
    Tailwind: 'Return HTML using Tailwind CSS utility classes only. No custom CSS.',
    Vue: 'Return a complete Vue 3 SFC with <template>, <script setup>, and <style scoped>.',
  }

  const prompt = `You are Inspectra, a senior frontend engineer reverse-engineering one exact component from a webpage screenshot.

I am focusing on this specific component: "${component.label}"
Description: ${component.desc}
HTML tag to use: ${component.tag}

Generate ${lang} code that recreates this EXACT component as seen in the screenshot.
Match the colors, typography, spacing, and style as closely as possible to what you see. If the component looks interactive (button, link, input), include a sensible :hover/:focus state even though only the default state is visible.

${langInstructions[lang]}

Rules:
- Code for THIS component only — not the whole page
- Use the actual colors visible in the screenshot
- Use real content/text visible in the image
- Make it look exactly like the screenshot
- Add an aria-label or semantic attribute where it meaningfully improves accessibility (don't force it where not needed)
- Return ONLY the code, no explanation, no markdown fences`

  try {
    const text = await callAIVision(r.b64, r.mimeType, prompt)
    return text.replace(/^```[\w]*\s*/i,'').replace(/```\s*$/,'').trim()
  } catch(e) {
    return `/* Error generating code: ${e.message} */`
  }
}

// Generates ONE coherent file for the entire screenshot — not a concatenation
// of separately-generated component fragments (which produced broken code,
// e.g. multiple "export default" statements when lang === React).
async function generateWholePageCode(dataUrl, components, lang) {
  const r = await resizeIfNeeded(dataUrl)
  if (!r) return '/* Could not process image */'

  const outline = components.slice(0, 20).map(c => `- ${c.label} (${c.tag}): ${c.desc}`).join('\n')

  const langInstructions = {
    HTML: 'Return one complete, valid HTML document: <!DOCTYPE html> through </html>, with all CSS in a single <style> block in <head>. No external file references.',
    CSS: 'Return the full HTML structure for the page PLUS all of its CSS in a single <style> block — a complete, self-contained document, not just a CSS file. Use BEM naming for classes.',
    React: 'Return ONE complete React functional component (e.g. `function Page() { ... }`) that renders the entire page, using inline styles. Compose smaller pieces as local functions inside the same file if helpful, but export exactly ONE default at the end.',
    Tailwind: 'Return one complete HTML document using Tailwind CSS utility classes only (assume the Tailwind CDN script is already included) — no custom <style> block needed.',
    Vue: 'Return ONE complete Vue 3 SFC (<template>, <script setup>, <style scoped>) that renders the entire page.',
  }

  const prompt = `You are Inspectra, a senior frontend engineer reproducing an entire webpage screenshot as one cohesive, production-quality file.

Here is the full inventory of components already detected on this page, top to bottom:
${outline}

Reproduce the ENTIRE page shown in the screenshot — every section, in the same order, with the same layout, colors, typography, spacing, and real visible text/content. This must be ONE complete, internally consistent file, not separate disconnected snippets.

${langInstructions[lang]}

Rules:
- Match colors, spacing, and proportions as closely as possible to the screenshot
- Use the real text/content visible in the image — no lorem ipsum, no placeholder names
- The result must be syntactically complete and runnable on its own (all tags closed, all braces balanced, exactly one root/export)
- Return ONLY the code — no explanation, no markdown fences`

  try {
    const text = await callAIVision(r.b64, r.mimeType, prompt)
    return text.replace(/^```[\w]*\s*/i,'').replace(/```\s*$/,'').trim()
  } catch(e) {
    return `/* Error generating whole-page code: ${e.message} */`
  }
}


function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code||'').catch(()=>{})
    setCopied(true); setTimeout(()=>setCopied(false),2000)
  }
  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">
          <span className="lang-dot" style={{background: LANG_COLORS[lang] || '#999'}}/>
          {lang}
        </span>
        <button className={`copy-btn${copied?' copied':''}`} onClick={copy}>
          {copied?'✓ Copied!':'Copy'}
        </button>
      </div>
      <div className="code-scroll" style={{background:'#0f172a', borderRadius:8}}>
        <pre style={{
            margin:0, padding:14, color:'#d4d4d4', background:'transparent',
            fontFamily:"'JetBrains Mono','Fira Code',ui-monospace,Menlo,monospace",
            fontSize:12.5, lineHeight:1.7, whiteSpace:'pre', overflow:'auto',
          }}
          dangerouslySetInnerHTML={{__html: hl(code || '// Select a component to see code')}}/>
      </div>
    </div>
  )
}

// ── Right Panel ────────────────────────────────────────────────────────────────
function RightPanel({ selected, imageDataUrl, showToast, allComponents }) {
  const [lang, setLang]           = useState('HTML')
  const [code, setCode]           = useState('')
  const [codeLoading, setCodeLoading] = useState(false)
  const [tab, setTab]             = useState('code')
  const [aiInput, setAiInput]     = useState('')
  const [aiResp, setAiResp]       = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [viewMode, setViewMode]   = useState('single') // single | whole
  const [wholeCode, setWholeCode] = useState('')
  const [wholeLoading, setWholeLoading] = useState(false)
  const cacheRef = useRef({}) // cache[componentLabel+lang] = code

  // When selected component or language changes → generate code
  useEffect(() => {
    if (!selected || !imageDataUrl) return
    const cacheKey = `${selected.label}::${lang}`
    if (cacheRef.current[cacheKey]) {
      setCode(cacheRef.current[cacheKey])
      return
    }
    setCodeLoading(true)
    setCode('')
    generateComponentCode(imageDataUrl, selected, lang).then(result => {
      cacheRef.current[cacheKey] = result
      setCode(result)
      setCodeLoading(false)
    })
  }, [selected?.label, lang, imageDataUrl])

  // Reset on new component selected
  useEffect(() => {
    setAiResp(null)
    setAiInput('')
    setViewMode('single')
    setWholeCode('')
  }, [selected?.label])

  const wholeCacheRef = useRef({}) // cache[lang] = whole-page code

  const generateWholePage = async () => {
    if (!imageDataUrl || !allComponents || allComponents.length === 0) return
    setViewMode('whole')
    if (wholeCacheRef.current[lang]) { setWholeCode(wholeCacheRef.current[lang]); return }
    setWholeLoading(true)
    const result = await generateWholePageCode(imageDataUrl, allComponents, lang)
    wholeCacheRef.current[lang] = result
    setWholeCode(result)
    setWholeLoading(false)
  }

  // Whole-page code is per-language — re-fetch (or pull from cache) when the
  // language changes while viewing the whole page
  useEffect(() => {
    if (viewMode !== 'whole') return
    if (wholeCacheRef.current[lang]) { setWholeCode(wholeCacheRef.current[lang]); return }
    setWholeLoading(true)
    generateWholePageCode(imageDataUrl, allComponents, lang).then(result => {
      wholeCacheRef.current[lang] = result
      setWholeCode(result)
      setWholeLoading(false)
    })
  }, [lang])

  const sendAI = async () => {
    if (!aiInput.trim() || !selected) { showToast('⚠️','Type what you want to modify'); return }
    setAiLoading(true); setAiResp(null)
    try {
      const resp = await callAI([{ role:'user', content:
        `You are Inspectra, a senior frontend engineer. Here is ${lang} code for a "${selected.label}" component:\n\n${code}\n\nUser wants: "${aiInput}"\n\nRewrite the complete modified ${lang} code, keeping it production-quality and visually consistent with the original. Return ONLY the code, no explanation.`
      }], 2000)
      const clean = resp.replace(/^```[\w]*\s*/i,'').replace(/```\s*$/,'').trim()
      setCode(clean)
      const cacheKey = `${selected.label}::${lang}`
      cacheRef.current[cacheKey] = clean
      setAiResp('✅ Code updated above!')
      showToast('✦','AI updated the code!')
    } catch(e) {
      setAiResp('Error: ' + e.message)
    }
    setAiLoading(false)
  }

  const CHIPS = ['Dark mode','Change color to blue','Add hover effect','Make it responsive','Add border radius','Add shadow']

  if (!selected) return (
    <aside className="right-panel">
      <div className="panel-tabs">
        <button className="panel-tab active">⌨️ Code</button>
        <button className="panel-tab">💡 Explain</button>
        <button className="panel-tab">🎨 Styles</button>
      </div>
      <div className="panel-body">
        <div className="welcome-state">
          <div className="welcome-icon">👆</div>
          <div className="welcome-title">Click any component</div>
          <div className="welcome-sub">Upload a screenshot → AI detects every UI component → Enable Inspect → click any component → AI generates its code in your chosen language.</div>
          {['Upload your screenshot','AI detects all UI components','Enable Inspect Mode','Click any component','Get code in HTML / CSS / React / Tailwind / Vue'].map((s,i)=>(
            <div className="ws-item" key={i}><div className="ws-num">{i+1}</div>{s}</div>
          ))}
        </div>
      </div>
      <div className="ai-area">
        <div className="ai-label"><div className="ai-dot"/>AI Modifier</div>
        <div className="ai-row">
          <input className="ai-input" placeholder="Click a component first…" disabled/>
          <button className="ai-send" disabled style={{opacity:.4}}>→</button>
        </div>
      </div>
    </aside>
  )

  const displayCode = viewMode === 'whole' ? wholeCode : code

  return (
    <aside className="right-panel">
      <div className="panel-tabs">
        {['code','explain','styles'].map(t=>(
          <button key={t} className={`panel-tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>
            {t==='code'?'⌨️ Code':t==='explain'?'💡 Explain':'🎨 Styles'}
          </button>
        ))}
      </div>

      <div className="panel-body">
        <div className="comp-name">{selected.label}</div>
        <div className="comp-meta">{selected.tag} · {selected.desc}</div>

        {/* View toggle */}
        <div style={{display:'flex',gap:6,marginBottom:12}}>
          <button onClick={()=>setViewMode('single')} style={{flex:1,padding:'6px 10px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer',border:`1.5px solid ${viewMode==='single'?'var(--brand-d)':'var(--border)'}`,background:viewMode==='single'?'var(--brand-l)':'var(--bg)',color:viewMode==='single'?'var(--brand-d)':'var(--text2)'}}>
            This component
          </button>
          <button onClick={generateWholePage} style={{flex:1,padding:'6px 10px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer',border:`1.5px solid ${viewMode==='whole'?'var(--brand-d)':'var(--border)'}`,background:viewMode==='whole'?'var(--brand-l)':'var(--bg)',color:viewMode==='whole'?'var(--brand-d)':'var(--text2)'}}>
            {wholeLoading ? '⟳ Generating…' : 'Whole page'}
          </button>
        </div>

        {tab==='code' && (
          <>
            {/* Language switcher */}
            <div className="lang-switcher" style={{marginBottom:10}}>
              {LANGS.map(l=>(
                <button key={l} className={`lang-btn${lang===l?' active':''}`} onClick={()=>setLang(l)}>
                  {l}
                </button>
              ))}
            </div>

            {codeLoading || wholeLoading ? (
              <div style={{padding:'32px 0',textAlign:'center'}}>
                <div style={{width:28,height:28,border:'3px solid var(--border)',borderTopColor:'var(--brand)',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 12px'}}/>
                <div style={{fontSize:12,color:'var(--text3)'}}>AI is generating {lang} code…</div>
              </div>
            ) : (
              <CodeBlock lang={lang} code={displayCode}/>
            )}
          </>
        )}

        {tab==='explain' && (
          <>
            <div className="exp-box">
              <div className="exp-box-title" style={{color:'var(--green)'}}>🎯 Purpose</div>
              <div className="exp-box-text">{selected.desc}</div>
            </div>
            <div className="exp-box">
              <div className="exp-box-title" style={{color:'var(--brand)'}}>🏷️ Element</div>
              <div className="exp-box-text">
                <code style={{background:'var(--bg3)',padding:'2px 7px',borderRadius:5,fontSize:12}}>{selected.tag}</code>
                {' '}— {selected.label}
              </div>
            </div>
          </>
        )}

        {tab==='styles' && (
          <>
            <div className="panel-sec">
              <div className="panel-sec-lbl">Common CSS Properties</div>
              {[
                ['display','flex / grid / block'],
                ['position','relative / absolute'],
                ['padding','12px 16px'],
                ['border-radius','8px'],
                ['font-weight','600 / 700'],
                ['transition','all 0.2s ease'],
              ].map(([prop, val])=>(
                <div key={prop} className="style-prop" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:12,color:'var(--text3)',fontFamily:'monospace'}}>{prop}</span>
                  <span style={{fontSize:12,color:'var(--brand-d)',fontFamily:'monospace'}}>{val}</span>
                </div>
              ))}
            </div>
            <div className="panel-sec" style={{marginTop:14}}>
              <div className="panel-sec-lbl">Convert to another language</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {['Svelte','Angular','TypeScript','SCSS'].map(l=>(
                  <button key={l}
                    style={{padding:'5px 11px',borderRadius:6,border:'1.5px solid var(--border)',background:'var(--bg2)',color:'var(--text2)',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'Inter,sans-serif'}}
                    onClick={async ()=>{
                      showToast('⟳',`Converting to ${l}…`)
                      try {
                        const resp = await callAI([{role:'user',content:`Convert this ${lang} code to ${l}. Return ONLY the code:

${code}`}],2000)
                        navigator.clipboard.writeText(resp.replace(/^```[\w]*\s*/i,'').replace(/```\s*$/,'').trim()).catch(()=>{})
                        showToast('✓',`${l} code copied!`)
                      } catch(e) { showToast('⚠️', `Conversion failed: ${e.message || 'unknown error'}`) }
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* AI Modifier */}
      <div className="ai-area">
        <div className="ai-label"><div className="ai-dot"/>AI Modifier</div>
        <div className="ai-row">
          <input className="ai-input" value={aiInput} onChange={e=>setAiInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&sendAI()}
            placeholder={`Modify ${selected.label} in ${lang}…`}/>
          <button className="ai-send" onClick={sendAI} disabled={aiLoading}>
            {aiLoading?'…':'→'}
          </button>
        </div>
        <div className="chip-row">
          {CHIPS.map(c=><span key={c} className="chip" onClick={()=>setAiInput(c)}>{c}</span>)}
        </div>
        {aiResp && (
          <div className="ai-resp">
            <div className="ai-resp-head">✦ AI</div>
            <div className="ai-resp-text">{aiResp}</div>
          </div>
        )}
      </div>
    </aside>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ history, activeIdx, onSelect }) {
  const [search, setSearch] = useState('')
  const filtered = history.filter(h=>h.label.toLowerCase().includes(search.toLowerCase()))
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="sidebar-title">Inspected Elements</div>
        <div className="search-wrap">
          <span style={{fontSize:13,color:'var(--text3)'}}>🔎</span>
          <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
          {search&&<span style={{cursor:'pointer',color:'var(--text3)',fontSize:12}} onClick={()=>setSearch('')}>✕</span>}
        </div>
      </div>
      <div className="sidebar-list">
        {history.length===0 ? (
          <div className="sidebar-empty">
            <div className="sidebar-empty-icon">🔍</div>
            <div className="sidebar-empty-title">Nothing inspected yet</div>
            <div className="sidebar-empty-sub">Upload a screenshot, let AI detect components, then click any one.</div>
          </div>
        ) : filtered.map((h,i)=>(
          <div key={i} className={`sl-item${activeIdx===i?' active':''}`} onClick={()=>onSelect(i)}>
            <div className="sl-icon">🔷</div>
            <div style={{flex:1,minWidth:0}}>
              <div className="sl-name">{h.label}</div>
              <div style={{fontSize:10,color:'var(--text3)',marginTop:1}}>{h.tag} · {h.time}</div>
            </div>
            {activeIdx===i&&<div style={{width:7,height:7,borderRadius:'50%',background:'var(--brand)',flexShrink:0}}/>}
          </div>
        ))}
      </div>
      <div className="sidebar-foot">
        <div className="prog-label">
          <span>{history.length} component{history.length!==1?'s':''} inspected</span>
          {history.length>0&&<span style={{color:'var(--green)',fontWeight:700}}>✓</span>}
        </div>
        <div className="prog-track"><div className="prog-fill" style={{width:history.length>0?'100%':'0%'}}/></div>
      </div>
    </aside>
  )
}

// ── Upload Zone ────────────────────────────────────────────────────────────────
function UploadZone({ onUpload }) {
  const [drag, setDrag] = useState(false)
  const [err,  setErr]  = useState('')
  const fileRef = useRef(null)
  const handleFile = (file) => {
    if (!file) return
    setErr('')
    if (!file.type.startsWith('image/')) { setErr('Please upload an image file.'); return }
    const reader = new FileReader()
    reader.onload  = e => onUpload({ name:file.name, src:e.target.result, type:file.type })
    reader.onerror = () => setErr('Could not read file.')
    reader.readAsDataURL(file)
  }
  return (
    <div className={`upload-zone${drag?' over':''}`}
      onDragOver={e=>{e.preventDefault();setDrag(true)}}
      onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0])}}
      onClick={()=>fileRef.current?.click()}>
      <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
      <div className="upload-zone-icon">{drag?'📂':'📸'}</div>
      <div className="upload-zone-title">{drag?'Drop it!':'Upload any webpage screenshot'}</div>
      <div className="upload-zone-sub">
        Drop or click — <strong>any image format</strong>.<br/>
        AI detects every UI component — buttons, cards, inputs, headings, everything.<br/>
        Click any component → get its code in your chosen language.
      </div>
      {err&&<div style={{color:'var(--red)',fontSize:13,fontWeight:600,marginBottom:14}}>⚠️ {err}</div>}
      <button className="btn-primary" style={{margin:'0 auto',padding:'11px 24px',fontSize:14,display:'flex',alignItems:'center',gap:8}}
        onClick={e=>{e.stopPropagation();fileRef.current?.click()}}>
        <span>📁</span> Choose file
      </button>
      <div className="upload-formats">
        {['PNG','JPG','JPEG','WebP','GIF','BMP','AVIF'].map(f=><span key={f} className="upload-fmt">{f}</span>)}
      </div>
    </div>
  )
}

// ── Image Canvas ───────────────────────────────────────────────────────────────
// IMPORTANT: the <img> uses objectFit:'contain' with a capped maxHeight. Whenever
// the image's natural aspect ratio doesn't match the box it's rendered into, the
// browser letterboxes it (empty strips on top/bottom OR left/right). The AI's
// top/left/width/height percentages are relative to the IMAGE ITSELF, not the
// outer box — so overlays must be positioned against the actual letterboxed
// image rect, not the full container, or every box drifts off its target.
function useImageRect(imgRef, containerRef) {
  const [rect, setRect] = useState(null)

  const compute = useCallback(() => {
    const img = imgRef.current
    const container = containerRef.current
    if (!img || !container || !img.naturalWidth || !img.naturalHeight) return
    const cw = container.clientWidth
    const ch = container.clientHeight
    if (!cw || !ch) return
    const containerRatio = cw / ch
    const imgRatio = img.naturalWidth / img.naturalHeight
    let width, height, left, top
    if (imgRatio > containerRatio) {
      // image is relatively wider than the box → letterboxed top & bottom
      width  = cw
      height = cw / imgRatio
      left   = 0
      top    = (ch - height) / 2
    } else {
      // image is relatively taller than the box → letterboxed left & right
      height = ch
      width  = ch * imgRatio
      top    = 0
      left   = (cw - width) / 2
    }
    setRect({ left, top, width, height })
  }, [imgRef, containerRef])

  useLayoutEffect(() => {
    compute()
    const ro = new ResizeObserver(compute)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', compute)
    return () => { ro.disconnect(); window.removeEventListener('resize', compute) }
  }, [compute])

  return { rect, compute }
}

function ImageCanvas({ image, inspecting, activeKey, onComponentClick }) {
  const [status,     setStatus]     = useState('analysing')
  const [components, setComponents] = useState([])
  const [hovered,    setHovered]    = useState(null)
  const onAnalysed = useRef(null)
  const imgRef = useRef(null)
  const containerRef = useRef(null)
  const { rect, compute } = useImageRect(imgRef, containerRef)

  useEffect(()=>{
    let cancelled = false
    setStatus('analysing'); setComponents([])
    detectComponents(image.src).then(result=>{
      if (cancelled) return
      if (result && result.length > 0) {
        setComponents(result)
        setStatus('done')
        onAnalysed.current?.(result)
      } else {
        setStatus('error')
      }
    })
    return ()=>{ cancelled=true }
  }, [image.src])

  // expose components to parent
  image._onAnalysed = (cb) => { onAnalysed.current = cb }

  // helper: convert a component's % (relative to the IMAGE) into px relative
  // to the container, accounting for letterbox offset
  const boxStyle = (c) => {
    if (!rect) return { display: 'none' }
    return {
      top:    rect.top  + (c.top    / 100) * rect.height,
      left:   rect.left + (c.left   / 100) * rect.width,
      width:  (c.width  / 100) * rect.width,
      height: (c.height / 100) * rect.height,
    }
  }

  return (
    <div className="img-container" ref={containerRef} style={{ position:'relative' }}>
      <img ref={imgRef} src={image.src} alt="Screenshot" onLoad={compute}
        style={{width:'100%',display:'block',maxHeight:580,objectFit:'contain',background:'#f8fafc'}}/>

      {status==='analysing' && (
        <div className="analyse-overlay">
          <div className="scan-line"/>
          <div className="analyse-spinner"/>
          <div style={{color:'#fff',fontSize:16,fontWeight:700,fontFamily:"'Bricolage Grotesque',sans-serif"}}>
            AI is detecting UI components…
          </div>
          <div style={{color:'rgba(255,255,255,.6)',fontSize:13}}>
            Finding every button, card, input, heading…
          </div>
        </div>
      )}

      {status==='error' && (
        <div className="analyse-overlay">
          <div style={{fontSize:40}}>⚠️</div>
          <div style={{color:'#fff',fontSize:16,fontWeight:700}}>Could not detect components</div>
          <div style={{color:'rgba(255,255,255,.6)',fontSize:13,maxWidth:280,textAlign:'center'}}>
            Check your Groq API key in .env and try again.
          </div>
        </div>
      )}

      {status==='done' && rect && components.map((c,i)=>{
        const isActive = activeKey===i
        const isHover  = hovered===i
        return (
          <div key={i} className="region-box"
            style={{
              position: 'absolute',
              ...boxStyle(c),
              background: isActive?'rgba(0,0,0,.5)':isHover?'rgba(79,70,229,.15)':'transparent',
              border: isActive?'2.5px solid #4f46e5':isHover?'2px solid #4f46e5':'1px dashed rgba(99,102,241,.4)',
              cursor: inspecting?'crosshair':'default',
              borderRadius: 4,
              boxSizing: 'border-box',
            }}
            onClick={()=>{ if(inspecting) onComponentClick(i, c) }}
            onMouseEnter={()=>setHovered(i)}
            onMouseLeave={()=>setHovered(null)}>
            <div className="region-label" style={{background:isActive?'#4f46e5':isHover?'#4f46e5':'rgba(15,23,42,.7)',borderRadius:'3px 3px 3px 0'}}>
              {c.label}
            </div>
          </div>
        )
      })}

      {status==='done' && !inspecting && (
        <div className="region-hint">👆 Press "Start Inspecting" then click any component</div>
      )}
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function InspectMode({ showToast }) {
  const [mode,        setMode]        = useState('upload')
  const [image,       setImage]       = useState(null)
  const [inspecting,  setInspecting]  = useState(false)
  const [history,     setHistory]     = useState([])
  const [activeIdx,   setActiveIdx]   = useState(null)
  const [activeKey,   setActiveKey]   = useState(null)
  const [allComponents, setAllComponents] = useState([])

  const handleUpload = (file) => {
    setImage(file); setMode('image')
    setHistory([]); setActiveIdx(null); setActiveKey(null)
    setAllComponents([]); setInspecting(false)
  }

  const handleComponentClick = useCallback((idx, compData) => {
    const entry = { ...compData, time: new Date().toLocaleTimeString() }
    setHistory(prev => {
      const next = [entry, ...prev.filter(h=>h.label!==entry.label)]
      setActiveIdx(0)
      return next
    })
    setActiveKey(idx)
    showToast('✓', `${compData.label} — generating code in panel →`)
  }, [showToast])

  const toggleInspect = () => {
    setInspecting(v => {
      const next = !v
      showToast(next?'🔍':'⏹', next?'Click any highlighted component':'Inspect mode off')
      return next
    })
  }

  const handleBack = () => {
    setMode('upload'); setImage(null)
    setHistory([]); setActiveIdx(null); setActiveKey(null)
    setAllComponents([]); setInspecting(false)
  }

  const selected = activeIdx !== null ? history[activeIdx] : null

  return (
    <div className="inspect-shell">
      <Sidebar history={history} activeIdx={activeIdx} onSelect={setActiveIdx}/>

      <div className="canvas-area">
        <div className="canvas-bar">
          <div className="canvas-bar-title">
            {mode==='image'?`📸 ${image?.name}`:'Upload a screenshot to begin'}
          </div>
          {mode==='image' && (
            <>
              <div className={`insp-status${inspecting?' on':' off'}`}>
                <div className="insp-dot"/>
                {inspecting?'Inspect ON — click a component':'Inspect OFF'}
              </div>
              <button className={`insp-btn${inspecting?' on':' off'}`} onClick={toggleInspect}>
                {inspecting?'⏹ Stop Inspecting':'🔍 Start Inspecting'}
              </button>
              <button className="btn-secondary" style={{fontSize:12,padding:'6px 12px'}} onClick={handleBack}>
                ← Back
              </button>
            </>
          )}
        </div>
        <div className="canvas-inner">
          {mode==='upload' && <UploadZone onUpload={handleUpload}/>}
          {mode==='image' && image && (
            <ImageCanvas
              image={image}
              inspecting={inspecting}
              activeKey={activeKey}
              onComponentClick={handleComponentClick}
            />
          )}
        </div>
      </div>

      <RightPanel
        selected={selected}
        imageDataUrl={image?.src}
        showToast={showToast}
        allComponents={allComponents.length>0 ? allComponents : history}
      />
    </div>
  )
}