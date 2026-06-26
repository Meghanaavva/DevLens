import React from 'react'

export default function Landing({ onLogin, onSignup }) {
  return (
    <div className="landing">
      <nav className="land-nav">
        <div className="land-logo">
          <div className="land-logo-icon">🔍</div>
          DevLens
        </div>
        <div className="land-links">
          <a>Features</a><a>Pricing</a><a>Docs</a><a>Blog</a>
        </div>
        <div className="land-ctas">
          <button className="btn-ghost" onClick={onLogin}>Sign in</button>
          <button className="btn-primary" onClick={onSignup} style={{padding:'9px 20px',fontSize:14}}>Get started free →</button>
        </div>
      </nav>

      <div className="land-hero">
        <div className="land-eyebrow"><span>📸</span> Upload any screenshot — get instant code</div>
        <h1>See the code behind <span>any website.</span></h1>
        <p>Upload a screenshot of any webpage. DevLens analyses the visual structure and generates clean HTML, CSS, React, and Tailwind code for every element.</p>
        <div className="land-hero-ctas">
          <button className="btn-primary" onClick={onLogin} style={{padding:'13px 26px',fontSize:15}}>Start inspecting free →</button>
          <button className="btn-secondary" onClick={onLogin} style={{padding:'13px 22px',fontSize:15}}>Sign in</button>
        </div>

        {/* Hero preview */}
        <div className="land-preview">
          <div className="land-preview-bar">
            <div className="land-preview-dot" style={{background:'#ef4444'}}/>
            <div className="land-preview-dot" style={{background:'#f59e0b'}}/>
            <div className="land-preview-dot" style={{background:'#10b981'}}/>
            <div className="land-preview-url">devlens.app/inspect</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'230px 1fr 290px',height:260}}>
            {/* Sidebar */}
            <div style={{background:'#fff',borderRight:'1px solid #e2e8f0',padding:14}}>
              <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:1,marginBottom:11}}>Inspected Elements</div>
              {[['🔵','Header / Nav',true],['🟢','Hero Section',false],['🟡','Feature Grid',false],['🔴','CTA Block',false]].map(([d,n,a])=>(
                <div key={n} style={{display:'flex',alignItems:'center',gap:7,padding:'7px 9px',borderRadius:7,marginBottom:3,background:a?'#eef2ff':'transparent',borderLeft:a?'3px solid #4f46e5':'3px solid transparent'}}>
                  <span style={{fontSize:11}}>{d}</span>
                  <span style={{fontSize:12,color:a?'#4f46e5':'#475569',fontWeight:a?600:400}}>{n}</span>
                </div>
              ))}
            </div>
            {/* Canvas */}
            <div style={{background:'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
              <div style={{background:'#fff',borderRadius:10,border:'2.5px solid #10b981',boxShadow:'0 4px 20px rgba(0,0,0,.08)',padding:'22px 28px',textAlign:'center',width:240}}>
                <div style={{display:'inline-block',background:'#ede9fe',color:'#5b21b6',fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:20,marginBottom:10}}>✦ Any screenshot</div>
                <div style={{fontSize:17,fontWeight:800,color:'#0f172a',marginBottom:6}}>Click anything.<br/>Get the code.</div>
                <div style={{fontSize:12,color:'#64748b'}}>Works on any design.</div>
              </div>
              <div style={{position:'absolute',top:7,right:7,background:'#10b981',color:'#fff',fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:4,fontFamily:'monospace'}}>SELECTED</div>
            </div>
            {/* Panel */}
            <div style={{background:'#fff',borderLeft:'1px solid #e2e8f0',padding:13,overflow:'hidden'}}>
              <div style={{display:'flex',gap:4,marginBottom:10}}>
                {['HTML','CSS','React','Tailwind'].map((l,i)=>(
                  <span key={l} style={{padding:'3px 8px',borderRadius:5,background:i===2?'#4f46e5':'#f1f5f9',color:i===2?'#fff':'#64748b',fontSize:10,fontWeight:600,fontFamily:'monospace'}}>{l}</span>
                ))}
              </div>
              <div style={{background:'#0f172a',borderRadius:7,padding:9,fontFamily:'monospace',fontSize:10,color:'#c3e88d',lineHeight:1.7}}>
                <span style={{color:'#c792ea'}}>const</span> <span style={{color:'#82aaff'}}>Hero</span> = () =&gt; (<br/>
                &nbsp;<span style={{color:'#f07178'}}>&lt;section</span><br/>
                &nbsp;&nbsp;<span style={{color:'#ffcb6b'}}>className</span>=<span style={{color:'#c3e88d'}}>"hero"</span><br/>
                &nbsp;<span style={{color:'#f07178'}}>&gt;</span>...<span style={{color:'#f07178'}}>&lt;/section&gt;</span><br/>
                )
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div style={{background:'#f8fafc',borderTop:'1px solid #e2e8f0',borderBottom:'1px solid #e2e8f0',padding:'16px 44px',display:'flex',alignItems:'center',gap:36,justifyContent:'center'}}>
        <span style={{fontSize:12,color:'#94a3b8',fontWeight:700,letterSpacing:.5}}>TRUSTED BY DEVELOPERS AT</span>
        {['Stripe','Vercel','Linear','Notion','Figma'].map(n=>(
          <span key={n} style={{fontSize:14,fontWeight:800,color:'#cbd5e1'}}>{n}</span>
        ))}
      </div>

      {/* Features */}
      <div className="land-features">
        <h2>Everything you need to understand any UI</h2>
        <div className="land-feat-grid">
          {[
            {icon:'📸',title:'Upload Any Screenshot',desc:'Drop a PNG, JPG or WebP screenshot of any webpage. DevLens detects visual regions and generates code instantly.'},
            {icon:'🤖',title:'AI Website Builder',desc:'Describe your vision in plain English. AI generates a complete, styled webpage with unique design every time.'},
            {icon:'⌨️',title:'Live Code Editor',desc:'Write any React component and see it render live in real-time. No setup required — works right in the browser.'},
          ].map(f=>(
            <div className="land-feat-card" key={f.title}>
              <div className="land-feat-icon">{f.icon}</div>
              <div className="land-feat-title">{f.title}</div>
              <div className="land-feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="land-stats">
        <div className="land-stats-grid">
          {[['50K+','Screenshots analysed'],['10K+','Developers'],['4 langs','Per element'],['< 3s','Analysis time']].map(([n,l],i)=>(
            <div className="land-stat" key={l} style={{borderRight:i<3?'1px solid var(--border)':'none'}}>
              <div className="land-stat-num">{n}</div>
              <div className="land-stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="land-cta">
        <h2>Ready to inspect the web?</h2>
        <p>Upload your first screenshot and get instant code — free, no signup required to try.</p>
        <button className="btn-primary" onClick={onSignup} style={{padding:'14px 32px',fontSize:15,background:'#fff',color:'var(--brand-d)',fontWeight:800}}>
          Start for free →
        </button>
      </div>

      <footer className="land-foot">
        <div className="land-foot-logo">DevLens</div>
        <div className="land-foot-copy">© 2025 DevLens Inc. Built for developers.</div>
        <div style={{display:'flex',gap:18}}>{['Privacy','Terms','Contact'].map(l=><span key={l} style={{fontSize:13,color:'var(--text3)',cursor:'pointer'}}>{l}</span>)}</div>
      </footer>
    </div>
  )
}
