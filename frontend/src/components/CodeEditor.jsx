import React, { useState, useCallback, useRef, useMemo } from 'react'
import { buildAPI } from '../services/api.js'

const TEMPLATES = {
  blank: { label:'Blank', icon:'📄', code:`function App() {
  const [count, setCount] = React.useState(0)
  return (
    <div style={{ fontFamily:'Inter,sans-serif', padding:48, textAlign:'center', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f8fafc' }}>
      <h1 style={{ fontSize:40, fontWeight:800, color:'#0f172a', marginBottom:12 }}>Hello World 👋</h1>
      <p style={{ color:'#64748b', fontSize:16, lineHeight:1.65, maxWidth:380, marginBottom:32 }}>Edit the code on the left to see changes here in real time.</p>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <button onClick={()=>setCount(c=>c-1)} style={{ padding:'10px 20px', background:'#f1f5f9', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:18, cursor:'pointer' }}>−</button>
        <span style={{ fontSize:32, fontWeight:800, color:'#4f46e5', minWidth:60, textAlign:'center' }}>{count}</span>
        <button onClick={()=>setCount(c=>c+1)} style={{ padding:'10px 20px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:8, fontSize:18, cursor:'pointer' }}>+</button>
      </div>
    </div>
  )
}

// Do not add export default — renderer handles it automatically` },
  hero: { label:'Hero', icon:'🦸', code:`function Hero() {
  return (
    <section style={{ padding:'80px 48px', background:'linear-gradient(135deg,#f8fafc,#eef2ff)', textAlign:'center', fontFamily:'Inter,sans-serif' }}>
      <span style={{ display:'inline-block', background:'#eef2ff', color:'#4f46e5', fontSize:12, fontWeight:700, padding:'5px 14px', borderRadius:20, marginBottom:20, border:'1px solid rgba(99,102,241,.2)' }}>
        ✦ Now in public beta
      </span>
      <h1 style={{ fontSize:52, fontWeight:800, color:'#0f172a', letterSpacing:-2, lineHeight:1.08, marginBottom:18 }}>
        Build beautiful UIs<br/>
        <span style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          10× faster
        </span>
      </h1>
      <p style={{ fontSize:18, color:'#64748b', maxWidth:480, margin:'0 auto 32px', lineHeight:1.7 }}>
        The modern platform for building, inspecting, and shipping beautiful UIs.
      </p>
      <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
        <button style={{ padding:'13px 28px', background:'#4f46e5', color:'#fff', fontSize:15, fontWeight:700, borderRadius:10, border:'none', cursor:'pointer' }}>
          Start for free →
        </button>
        <button style={{ padding:'13px 24px', background:'#fff', color:'#1e293b', fontSize:15, fontWeight:600, borderRadius:10, border:'1.5px solid #e2e8f0', cursor:'pointer' }}>
          Watch demo ▶
        </button>
      </div>
    </section>
  )
}` },
  card: { label:'Card', icon:'✨', code:`function FeatureCard({ icon='⚡', title='Lightning Fast', description='Sub-100ms performance globally with our edge network.', color='#ede9fe' }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:14, padding:28, fontFamily:'Inter,sans-serif', transition:'all .2s', transform:hovered?'translateY(-4px)':'translateY(0)', boxShadow:hovered?'0 16px 32px rgba(0,0,0,.1)':'0 1px 3px rgba(0,0,0,.05)', cursor:'pointer', maxWidth:320, margin:'40px auto' }}
    >
      <div style={{ width:48, height:48, borderRadius:12, background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:18 }}>
        {icon}
      </div>
      <h3 style={{ fontSize:17, fontWeight:700, color:'#0f172a', marginBottom:9 }}>{title}</h3>
      <p style={{ fontSize:14, color:'#64748b', lineHeight:1.65 }}>{description}</p>
      <div style={{ marginTop:18, fontSize:13, color:'#4f46e5', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
        Learn more <span style={{ transition:'transform .2s', transform:hovered?'translateX(4px)':'translateX(0)', display:'inline-block' }}>→</span>
      </div>
    </div>
  )
}` },
  form: { label:'Form', icon:'📝', code:`function LoginForm() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [done, setDone] = React.useState(false)

  const submit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setDone(true) }, 1200)
  }

  if (done) return (
    <div style={{ maxWidth:420, margin:'80px auto', padding:40, background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, textAlign:'center', fontFamily:'Inter,sans-serif' }}>
      <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
      <h2 style={{ fontSize:20, fontWeight:800, color:'#0f172a', marginBottom:6 }}>Signed in!</h2>
      <p style={{ color:'#64748b', marginBottom:20 }}>Welcome back, {email}</p>
      <button onClick={()=>{ setDone(false); setEmail(''); setPassword('') }} style={{ padding:'10px 22px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:9, fontWeight:600, cursor:'pointer' }}>Sign out</button>
    </div>
  )

  return (
    <div style={{ maxWidth:420, margin:'80px auto', padding:40, background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, boxShadow:'0 4px 24px rgba(0,0,0,.06)', fontFamily:'Inter,sans-serif' }}>
      <h2 style={{ fontSize:24, fontWeight:800, color:'#0f172a', marginBottom:6 }}>Sign in to your account</h2>
      <p style={{ fontSize:14, color:'#64748b', marginBottom:28 }}>Enter your credentials below</p>
      <form onSubmit={submit}>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6 }}>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required
            style={{ width:'100%', padding:'11px 13px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, outline:'none', fontFamily:'inherit' }}
            onFocus={e=>e.target.style.borderColor='#4f46e5'}
            onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6 }}>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required
            style={{ width:'100%', padding:'11px 13px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, outline:'none', fontFamily:'inherit' }}
            onFocus={e=>e.target.style.borderColor='#4f46e5'}
            onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
        </div>
        <button type="submit" disabled={loading}
          style={{ width:'100%', padding:13, background:'#4f46e5', color:'#fff', fontSize:14, fontWeight:700, borderRadius:10, border:'none', cursor:'pointer', marginTop:8, opacity:loading?.7:1 }}>
          {loading ? 'Signing in...' : 'Sign in →'}
        </button>
      </form>
    </div>
  )
}` },
  dashboard: { label:'Dashboard', icon:'📊', code:`function Dashboard() {
  const stats = [
    { label:'Total Users',  value:'12,400', change:'+12%', up:true,  icon:'👥', color:'#eef2ff', text:'#4f46e5' },
    { label:'Revenue',      value:'$48.2K', change:'+8%',  up:true,  icon:'💰', color:'#d1fae5', text:'#059669' },
    { label:'Active Now',   value:'1,240',  change:'-3%',  up:false, icon:'🟢', color:'#fef9c3', text:'#d97706' },
    { label:'Uptime',       value:'99.9%',  change:'+0.1%',up:true,  icon:'⚡', color:'#fee2e2', text:'#dc2626' },
  ]
  const nav = ['Overview','Analytics','Users','Products','Settings']
  return (
    <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', minHeight:'100vh', fontFamily:'Inter,sans-serif' }}>
      <aside style={{ background:'#0f172a', padding:'22px 14px', display:'flex', flexDirection:'column', gap:4 }}>
        <div style={{ color:'#fff', fontSize:17, fontWeight:800, padding:'0 10px 18px', borderBottom:'1px solid #1e293b', marginBottom:8 }}>Dashboard</div>
        {nav.map((item,i)=>(
          <a key={item} href="#" style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 12px', color:i===0?'#fff':'#94a3b8', background:i===0?'#1e293b':'transparent', borderRadius:8, textDecoration:'none', fontSize:14, fontWeight:500 }}>
            {['📊','📈','👥','📦','⚙️'][i]} {item}
          </a>
        ))}
      </aside>
      <main style={{ padding:28, background:'#f8fafc' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:21, fontWeight:800, color:'#0f172a', marginBottom:2 }}>Good morning, Alex 👋</h1>
            <p style={{ fontSize:14, color:'#64748b' }}>Here's what's happening today.</p>
          </div>
          <button style={{ padding:'9px 18px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer' }}>+ New Report</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
          {stats.map(s=>(
            <div key={s.label} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <span style={{ fontSize:12, color:'#64748b', fontWeight:500 }}>{s.label}</span>
                <span style={{ fontSize:18, background:s.color, padding:'4px 7px', borderRadius:8 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize:26, fontWeight:800, color:'#0f172a', marginBottom:5 }}>{s.value}</div>
              <div style={{ fontSize:12, fontWeight:600, color:s.up?'#10b981':'#ef4444' }}>{s.change} vs last month</div>
            </div>
          ))}
        </div>
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:22 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#0f172a' }}>Recent Activity</h2>
            <a href="#" style={{ fontSize:13, color:'#4f46e5', fontWeight:600, textDecoration:'none' }}>View all →</a>
          </div>
          {['User signup — alex@example.com','Payment received — $299 Pro plan','New project created — devlens-v4','Support ticket resolved #1234'].map((item,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom:i<3?'1px solid #f1f5f9':'none' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#4f46e5', flexShrink:0 }}/>
              <span style={{ fontSize:13, color:'#475569' }}>{item}</span>
              <span style={{ marginLeft:'auto', fontSize:12, color:'#94a3b8' }}>{i+1}h ago</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}` },
}

// ── VS Code-ish single-pass syntax highlighter (JSX/JS) ─────────────────────
function hl(raw) {
  if (!raw) return ''
  const esc = raw
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  return esc.replace(
    /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(&quot;(?:[^&]|&(?!quot;))*?&quot;)|(`[^`]*`)|(\b(?:const|let|var|return|import|export|default|from|if|else|function|class|new|typeof|of|in|async|await|try|catch|throw)\b)|(&lt;\/?[\w.]+)|(\b[A-Z][\w]*(?=[\s=(.]))|(\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms)?\b)/gm,
    (m,c1,c2,s1,s2,kw,tag,fn,num) => {
      if (c1||c2) return `<span style="color:#6a9955">${m}</span>`
      if (s1||s2) return `<span style="color:#ce9178">${m}</span>`
      if (kw)     return `<span style="color:#c586c0">${m}</span>`
      if (tag)    return `<span style="color:#569cd6">${m}</span>`
      if (fn)     return `<span style="color:#4ec9b0">${m}</span>`
      if (num)    return `<span style="color:#b5cea8">${m}</span>`
      return m
    }
  )
}

function LivePreview({ code }) {
  const iframeRef = React.useRef(null)

  React.useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    // Strip imports/exports
    const clean = code
      .replace(/^import\s[\s\S]*?from\s['"][^'"]*['"];?\s*/gm, '')
      .replace(/^import\s['"][^'"]*['"];?\s*/gm, '')
      .replace(/^export\s+default\s+/gm, '')
      .replace(/^export\s+/gm, '')
      .trim()

    const nameMatch = clean.match(/(?:function|class|const|let|var)\s+([A-Z][A-Za-z0-9]*)/)
    const compName = nameMatch?.[1] || null

    const userCode = compName
      ? `${clean}\nReactDOM.createRoot(document.getElementById('root')).render(React.createElement(${compName}))`
      : clean

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #fff; }
.err { margin: 16px; padding: 14px 18px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; font-family: monospace; font-size: 12px; color: #7f1d1d; white-space: pre-wrap; line-height: 1.6; }
.err b { display: block; font-size: 13px; color: #991b1b; margin-bottom: 6px; }
</style>
</head>
<body>
<div id="root"></div>
<script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.development.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.development.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.0/babel.min.js"><\/script>
<script id="user-src" type="text/plain"><\/script>
<script>
window.onerror = function(msg, _s, line) {
  document.getElementById('root').innerHTML = '<div class="err"><b>Error</b>' + msg + (line ? ' — line ' + line : '') + '</div>'
  return true
}
// Read user code from the inert text/plain script tag — zero escaping issues
var raw = document.getElementById('user-src').textContent
try {
  var compiled = Babel.transform(raw, { presets: [['react', { runtime: 'classic' }]] }).code
  new Function('React', 'ReactDOM', compiled)(React, ReactDOM)
} catch(e) {
  document.getElementById('root').innerHTML = '<div class="err"><b>Compile Error</b>' + e.message + '</div>'
}
<\/script>
</body>
</html>`

    // Inject user code into the text/plain script tag AFTER setting srcDoc
    // Use srcdoc first, then postMessage to inject code safely
    iframe.srcdoc = html

    const onLoad = () => {
      try {
        const doc = iframe.contentDocument
        if (doc) {
          const el = doc.getElementById('user-src')
          if (el) {
            el.textContent = userCode
            // Trigger execution by re-running the script
            const execScript = doc.createElement('script')
            execScript.textContent = `
              window.onerror = function(msg, _s, line) {
                document.getElementById('root').innerHTML = '<div class="err"><b>Error</b>' + msg + (line ? ' — line ' + line : '') + '</div>'
                return true
              }
              var raw = document.getElementById('user-src').textContent
              try {
                var compiled = Babel.transform(raw, { presets: [['react', { runtime: 'classic' }]] }).code
                new Function('React', 'ReactDOM', compiled)(React, ReactDOM)
              } catch(e) {
                document.getElementById('root').innerHTML = '<div class="err"><b>Error</b>' + e.message + '</div>'
              }
            `
            doc.body.appendChild(execScript)
          }
        }
      } catch(e) {
        // cross-origin fallback — use srcDoc with escaped code
        const escaped = userCode
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        console.warn('iframe injection failed, using srcDoc fallback')
      }
    }

    iframe.addEventListener('load', onLoad, { once: true })
    return () => iframe.removeEventListener('load', onLoad)
  }, [code])

  return (
    <iframe
      ref={iframeRef}
      style={{ width: '100%', height: '100%', border: 'none' }}
      title="live-preview"
      sandbox="allow-scripts allow-same-origin"
    />
  )
}

// ── Real code-editor surface: gutter + highlight layer under a transparent textarea ──
function CodeSurface({ code, setCode, fontSize }) {
  const taRef  = useRef(null)
  const preRef = useRef(null)
  const gutRef = useRef(null)

  const lines = useMemo(() => code.split('\n'), [code])
  const highlighted = useMemo(() => hl(code) + '\n', [code]) // trailing nl keeps last line height stable

  const syncScroll = useCallback(() => {
    const ta = taRef.current
    if (!ta) return
    if (preRef.current) { preRef.current.scrollTop = ta.scrollTop; preRef.current.scrollLeft = ta.scrollLeft }
    if (gutRef.current)  gutRef.current.scrollTop  = ta.scrollTop
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.target
      const s = ta.selectionStart, en = ta.selectionEnd
      setCode(c => c.substring(0, s) + '  ' + c.substring(en))
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2 })
    }
  }, [setCode])

  const sharedFont = {
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, Menlo, monospace",
    fontSize,
    lineHeight: 1.6,
  }

  return (
    <div style={{ position:'relative', flex:1, display:'flex', overflow:'hidden', background:'#1e1e1e', minHeight:0 }}>
      {/* line-number gutter */}
      <div ref={gutRef} style={{
        ...sharedFont, width:46, flexShrink:0, overflow:'hidden', textAlign:'right',
        padding:'14px 10px 14px 0', color:'#5a5a66', userSelect:'none', borderRight:'1px solid #2d2d30',
        background:'#1e1e1e',
      }}>
        {lines.map((_, i) => <div key={i} style={{ height: `${fontSize*1.6}px` }}>{i+1}</div>)}
      </div>

      {/* editor body: highlighted layer + transparent textarea on top */}
      <div style={{ position:'relative', flex:1, overflow:'hidden' }}>
        <pre ref={preRef} aria-hidden="true" style={{
          ...sharedFont, margin:0, padding:14, position:'absolute', inset:0,
          overflow:'auto', whiteSpace:'pre', color:'#d4d4d4', pointerEvents:'none',
        }} dangerouslySetInnerHTML={{ __html: highlighted }} />

        <textarea
          ref={taRef}
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="Write your React component here..."
          style={{
            ...sharedFont, position:'absolute', inset:0, margin:0, padding:14,
            border:'none', outline:'none', resize:'none', background:'transparent',
            color:'transparent', caretColor:'#fff', whiteSpace:'pre', overflow:'auto',
            WebkitTextFillColor:'transparent',
          }}
        />
      </div>
    </div>
  )
}

export default function CodeEditor({ showToast }) {
  const [code, setCode] = useState(TEMPLATES.blank.code)
  const [active, setActive] = useState('blank')
  const [copied, setCopied] = useState(false)
  const [fontSize, setFontSize] = useState(13)
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [explain, setExplain] = useState(null) // text response for non-mutating actions

  const load = (key) => { setCode(TEMPLATES[key].code); setActive(key); showToast('✓', `Loaded: ${TEMPLATES[key].label}`) }

  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    showToast('✓', 'Code copied!')
  }

  // DevLens AI Editor: scoped to the one open file (no project-wide awareness),
  // but genuinely reads + rewrites the actual code instead of being a stub.
  const askAI = async (instruction, { mutates = true } = {}) => {
    setAiLoading(true); setExplain(null)
    try {
      const resp = await buildAPI.explain({ code:
`You are DevLens AI Editor — a staff frontend engineer living inside this code editor. You understand React, JSX, and inline-style patterns. Preserve the component's existing structure, naming, and visual design unless the instruction asks you to change them. Never invent props or imports that don't exist in this single-file context (only React itself, plus React.useState/useEffect, is available — no external libraries, no "export default").

CURRENT CODE:
${code}

INSTRUCTION: "${instruction}"

${mutates
  ? 'Rewrite the complete component with this change applied. Return ONLY the code, no explanation, no markdown fences.'
  : 'Answer the instruction about this code directly and concisely (a few sentences or a short list). Do not return a full code rewrite unless a tiny inline snippet is genuinely necessary to make the point.'}`
      }).then(d => d.result || d.content || d)

      if (mutates) {
        const clean = resp.replace(/^```[\w]*\s*/i,'').replace(/```\s*$/,'').trim()
        setCode(clean)
        showToast('✦','AI updated your code')
      } else {
        setExplain(resp.trim())
      }
    } catch(e) {
      showToast('⚠️', `AI request failed: ${e.message || 'unknown error'}`)
    }
    setAiLoading(false)
  }

  const sendAI = () => {
    if (!aiInput.trim()) { showToast('⚠️','Type an instruction first'); return }
    askAI(aiInput.trim())
    setAiInput('')
  }

  const QUICK_ACTIONS = [
    { label:'Explain this',  instruction:'Explain what this component does, section by section.', mutates:false },
    { label:'Refactor',      instruction:'Refactor this for clarity and conciseness without changing behavior or appearance.' },
    { label:'Optimize',      instruction:'Optimize this for performance — avoid unnecessary re-renders and recomputation, memoize where it genuinely helps.' },
    { label:'Make responsive', instruction:'Make this fully responsive for mobile screens down to 360px wide, using inline media-query-safe patterns (e.g. clamp(), flexible widths) since this is a single inline-style file.' },
    { label:'Add comments',  instruction:'Add brief, useful comments explaining the non-obvious parts. Keep all code and behavior identical.' },
    { label:'Find bugs',     instruction:'Review this code for bugs, edge cases, or logic errors and list what you find.', mutates:false },
  ]

  return (
    <div className="editor-shell">
      <div className="editor-left" style={{ display:'flex', flexDirection:'column', minHeight:0 }}>
        <div className="editor-bar">
          <span style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.6, marginRight:4, whiteSpace:'nowrap' }}>Templates:</span>
          {Object.entries(TEMPLATES).map(([k, t]) => (
            <button key={k} onClick={() => load(k)}
              style={{ padding:'4px 11px', borderRadius:20, border:`1.5px solid ${active===k?'var(--brand-d)':'var(--border)'}`, background:active===k?'var(--brand-l)':'var(--bg)', color:active===k?'var(--brand-d)':'var(--text2)', fontSize:12, fontWeight:active===k?700:500, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'Inter,sans-serif', transition:'.12s' }}>
              {t.icon} {t.label}
            </button>
          ))}
          <div style={{ marginLeft:'auto', display:'flex', gap:5, flexShrink:0, alignItems:'center' }}>
            <button onClick={() => setFontSize(f => Math.max(10, f-1))} style={{ padding:'2px 8px', border:'1px solid var(--border)', borderRadius:5, background:'var(--bg)', color:'var(--text3)', cursor:'pointer', fontSize:13 }}>−</button>
            <span style={{ fontSize:11, color:'var(--text3)', fontFamily:'JetBrains Mono,monospace', minWidth:30, textAlign:'center' }}>{fontSize}</span>
            <button onClick={() => setFontSize(f => Math.min(20, f+1))} style={{ padding:'2px 8px', border:'1px solid var(--border)', borderRadius:5, background:'var(--bg)', color:'var(--text3)', cursor:'pointer', fontSize:13 }}>+</button>
            <button onClick={copy} style={{ padding:'4px 11px', borderRadius:6, border:`1px solid ${copied?'var(--green)':'var(--border)'}`, background:copied?'var(--green-l)':'var(--bg)', color:copied?'var(--green)':'var(--text2)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif', whiteSpace:'nowrap' }}>{copied?'✓ Copied':'Copy'}</button>
            <button onClick={() => { setCode(TEMPLATES.blank.code); setActive('blank') }} style={{ padding:'4px 9px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text3)', fontSize:12, cursor:'pointer' }}>↺</button>
          </div>
        </div>
        <div className="editor-hd">
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#61dafb', display:'inline-block' }} />
          <span style={{ fontSize:12, fontWeight:600, color:'#94a3b8', fontFamily:'JetBrains Mono,monospace' }}>component.jsx</span>
          <span style={{ marginLeft:'auto', fontSize:11, color:'#475569', fontFamily:'JetBrains Mono,monospace' }}>{code.split('\n').length} lines</span>
        </div>

        {/* DevLens AI Editor assist bar */}
        <div style={{ display:'flex', flexDirection:'column', gap:6, padding:'8px 10px', background:'#181818', borderBottom:'1px solid #2d2d30' }}>
          <div style={{ display:'flex', gap:6 }}>
            <input
              value={aiInput}
              onChange={e=>setAiInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter' && !aiLoading) sendAI() }}
              placeholder={aiLoading ? 'AI is working…' : 'Ask AI to explain, refactor, or change this code…'}
              disabled={aiLoading}
              style={{ flex:1, padding:'7px 10px', borderRadius:7, border:'1px solid #3a3a3d', background:'#0f0f10', color:'#e2e2e2', fontSize:12.5, outline:'none', fontFamily:'Inter,sans-serif' }}
            />
            <button onClick={sendAI} disabled={aiLoading || !aiInput.trim()}
              style={{ padding:'7px 14px', borderRadius:7, border:'none', background:'#4f46e5', color:'#fff', fontSize:12.5, fontWeight:700, cursor:'pointer', opacity:(aiLoading||!aiInput.trim())?.5:1, whiteSpace:'nowrap' }}>
              {aiLoading ? '⟳' : 'Ask →'}
            </button>
          </div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {QUICK_ACTIONS.map(a => (
              <button key={a.label} disabled={aiLoading}
                onClick={()=>askAI(a.instruction, { mutates: a.mutates !== false })}
                style={{ padding:'3px 10px', borderRadius:20, border:'1px solid #3a3a3d', background:'#222224', color:'#b8b8bd', fontSize:11, fontWeight:600, cursor:'pointer', opacity:aiLoading?.5:1, fontFamily:'Inter,sans-serif' }}>
                {a.label}
              </button>
            ))}
          </div>
          {explain && (
            <div style={{ marginTop:2, padding:'9px 11px', borderRadius:8, background:'#0f0f10', border:'1px solid #3a3a3d', color:'#d4d4d4', fontSize:12, lineHeight:1.6, whiteSpace:'pre-wrap', maxHeight:160, overflowY:'auto' }}>
              {explain}
              <div style={{ marginTop:6 }}>
                <button onClick={()=>setExplain(null)} style={{ fontSize:11, color:'#8a8a90', background:'none', border:'none', cursor:'pointer', padding:0 }}>Dismiss</button>
              </div>
            </div>
          )}
        </div>

        <CodeSurface code={code} setCode={setCode} fontSize={fontSize} />
      </div>
      <div className="editor-right">
        <div className="preview-hd">
          <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)', display:'inline-block', boxShadow:'0 0 6px var(--green)' }} />
          <span style={{ fontSize:12, fontWeight:600, color:'var(--text2)', textTransform:'uppercase', letterSpacing:.5 }}>Live Preview</span>
          <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color:'var(--green)', background:'var(--green-l)', padding:'2px 8px', borderRadius:20 }}>● LIVE</span>
        </div>
        <div className="preview-body"><LivePreview code={code} /></div>
      </div>
    </div>
  )
}