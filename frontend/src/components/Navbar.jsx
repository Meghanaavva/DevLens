import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const TABS = [
  { id: 'inspect', icon: '🔍', label: 'Inspector',   shortcut: 'I' },
  { id: 'builder', icon: '🤖', label: 'AI Builder',  shortcut: 'B' },
  { id: 'editor',  icon: '</>', label: 'Code Editor', shortcut: 'E' },
]

function SettingsModal({ onClose, theme, onToggleTheme }) {
  const [prefs, setPrefs] = useState({ autoLang:true, lineNums:true, aiSuggest:true, history:false })
  const toggle = k => setPrefs(p => ({ ...p, [k]: !p[k] }))
  const { user } = useAuth()

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">Settings</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">

          {/* Account */}
          <div className="settings-sec">
            <div className="settings-sec-title">Account</div>
            <div style={{display:'flex',alignItems:'center',gap:14,padding:'12px',background:'var(--bg2)',borderRadius:10,border:'1px solid var(--border)',marginBottom:8}}>
              <div style={{width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-d),#7c3aed)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,fontWeight:700,flexShrink:0}}>{user?.avatar}</div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:'var(--text)'}}>{user?.name}</div>
                <div style={{fontSize:12,color:'var(--text3)'}}>{user?.email}</div>
                <div style={{fontSize:11,color:'var(--brand-d)',fontWeight:600,marginTop:2}}>Starter Plan · Free</div>
              </div>
              <button className="btn-primary" style={{marginLeft:'auto',padding:'6px 13px',fontSize:12}}>Upgrade</button>
            </div>
          </div>

          {/* Preferences */}
          <div className="settings-sec">
            <div className="settings-sec-title">Preferences</div>
            {[
              ['autoLang','Auto-detect language','Detect coding language from context automatically'],
              ['lineNums','Show line numbers','Display line numbers in the code editor'],
              ['aiSuggest','AI suggestions','Get AI-powered code modification suggestions'],
              ['history','Save history','Remember inspected elements across sessions'],
            ].map(([k,lbl,sub]) => (
              <div className="settings-row" key={k}>
                <div>
                  <div className="settings-row-lbl">{lbl}</div>
                  <div style={{fontSize:11.5,color:'var(--text3)',marginTop:2}}>{sub}</div>
                </div>
                <div className={`toggle ${prefs[k]?'on':'off'}`} onClick={()=>toggle(k)}>
                  <div className="toggle-knob"/>
                </div>
              </div>
            ))}
          </div>

          {/* Appearance — WIRED UP */}
          <div className="settings-sec">
            <div className="settings-sec-title">Appearance</div>
            <div style={{display:'flex',gap:8}}>
              {['Light','Dark','System'].map(t => {
                const val = t === 'System' ? null : t.toLowerCase()
                const active = t === 'System' ? false : theme === val
                return (
                  <button key={t}
                    onClick={() => {
                      if (t === 'System') {
                        const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                        onToggleTheme(sys)
                      } else {
                        onToggleTheme(val)
                      }
                    }}
                    style={{flex:1,padding:'9px',borderRadius:8,
                      border:`1.5px solid ${active?'var(--brand-d)':'var(--border)'}`,
                      background:active?'var(--brand-l)':'var(--bg2)',
                      color:active?'var(--brand-d)':'var(--text2)',
                      fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'Inter,sans-serif',transition:'.15s'}}>
                    {t==='Light'?'☀️':t==='Dark'?'🌙':'💻'} {t}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="settings-sec">
            <div className="settings-sec-title">Keyboard Shortcuts</div>
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              {[
                ['Switch to Inspector',    '⌘ I'],
                ['Switch to AI Builder',   '⌘ B'],
                ['Switch to Code Editor',  '⌘ E'],
                ['Toggle dark mode',       '⌘ D'],
                ['Open settings',          '⌘ ,'],
              ].map(([label, keys]) => (
                <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:13,color:'var(--text2)'}}>{label}</span>
                  <span style={{fontSize:11,fontWeight:700,fontFamily:'JetBrains Mono,monospace',background:'var(--bg3)',border:'1px solid var(--border2)',padding:'2px 8px',borderRadius:5,color:'var(--text2)',letterSpacing:.5}}>{keys}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="settings-sec">
            <div className="settings-sec-title" style={{color:'var(--red)'}}>Danger Zone</div>
            <div style={{border:'1px solid #fca5a5',borderRadius:9,padding:'13px 15px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>Clear all history</div>
                <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>Remove all inspection and generation history</div>
              </div>
              <button style={{padding:'6px 13px',borderRadius:7,border:'1px solid #fca5a5',background:'transparent',color:'var(--red)',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Clear</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function Navbar({ mode, setMode, showToast, theme, onToggleTheme }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // ⌘, to open settings
  useEffect(() => {
    const h = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') { e.preventDefault(); setSettingsOpen(true) }
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [])

  return (
    <>
      <header className="app-nav">
        <div className="nav-logo">
          <div className="nav-logo-icon">🔍</div>
          DevLens
        </div>
        <span className="nav-badge">Beta</span>

        <div className="nav-tabs">
          {TABS.map(t => (
            <button key={t.id}
              className={`nav-tab${mode===t.id?' active':''}`}
              onClick={() => setMode(t.id)}
              title={`${t.label} (⌘${t.shortcut})`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div className="nav-right">
          {/* Dark mode toggle */}
          <button
            onClick={() => { onToggleTheme(); showToast(theme==='dark'?'☀️':'🌙', theme==='dark'?'Light mode':'Dark mode') }}
            title="Toggle dark mode (⌘D)"
            style={{width:32,height:32,borderRadius:8,border:'1.5px solid var(--border)',background:'var(--bg2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,transition:'.15s',flexShrink:0}}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <div ref={menuRef} style={{position:'relative'}}>
            <div className="nav-avatar" onClick={() => setMenuOpen(v=>!v)}>{user?.avatar||'?'}</div>
            {menuOpen && (
              <div className="nav-menu">
                <div className="nav-menu-head">
                  <div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{user?.name}</div>
                  <div style={{fontSize:12,color:'var(--text3)',marginTop:1}}>{user?.email}</div>
                </div>
                <div style={{padding:'4px'}}>
                  <div className="nav-menu-item" onClick={()=>{setSettingsOpen(true);setMenuOpen(false)}}>
                    <span>⚙️</span>Settings
                    <span style={{marginLeft:'auto',fontSize:10,color:'var(--text3)',fontFamily:'monospace'}}>⌘,</span>
                  </div>
                  <div className="nav-menu-item" onClick={()=>{onToggleTheme();setMenuOpen(false)}}>
                    <span>{theme==='dark'?'☀️':'🌙'}</span>{theme==='dark'?'Light mode':'Dark mode'}
                    <span style={{marginLeft:'auto',fontSize:10,color:'var(--text3)',fontFamily:'monospace'}}>⌘D</span>
                  </div>
                  <div className="nav-menu-item" onClick={()=>{showToast('📤','Export history coming soon!');setMenuOpen(false)}}>
                    <span>📤</span>Export History
                  </div>
                  <div className="nav-menu-divider"/>
                  <div className="nav-menu-item danger" onClick={logout}><span>🚪</span>Sign out</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
      )}
    </>
  )
}