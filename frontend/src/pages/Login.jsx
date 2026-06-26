import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login({ onSwitch, onSuccess, onBack }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      onSuccess()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-logo"><div className="auth-logo-dot" />DevLens</div>
        <div className="auth-hero">
          <h2>Welcome back to your workspace</h2>
          <p>Inspect any webpage, build with AI, and understand the code behind every design.</p>
        </div>
        <div className="auth-feats">
          {['Upload any screenshot — get instant code','Generate pages with AI in seconds','Code in HTML, CSS, React & Tailwind','Live editor with real-time preview'].map(f => (
            <div className="auth-feat" key={f}><div className="auth-feat-check">✓</div>{f}</div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <button onClick={onBack} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',cursor:'pointer',fontSize:13,color:'var(--text3)',marginBottom:20,fontFamily:'Inter,sans-serif',padding:0}}>
            ← Back to home
          </button>
          <div className="auth-card-head">
            <h1>Sign in to DevLens</h1>
            <p>Enter your credentials to access your workspace</p>
          </div>
          <form className="auth-form" onSubmit={submit}>
            {error && <div className="form-err">⚠️ {error}</div>}
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                <label className="form-label" style={{marginBottom:0}}>Password</label>
                <span style={{fontSize:13,color:'var(--brand-d)',cursor:'pointer',fontWeight:500}}>Forgot password?</span>
              </div>
              <div style={{position:'relative'}}>
                <input className="form-input" type={showPw?'text':'password'} placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} required style={{paddingRight:42}} />
                <span onClick={()=>setShowPw(v=>!v)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',cursor:'pointer',fontSize:15,color:'var(--text3)',userSelect:'none'}}>{showPw?'🙈':'👁'}</span>
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{marginTop:4}}>
              {loading ? <><span style={{width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block'}}/> Signing in...</> : 'Sign in →'}
            </button>
          </form>
          <div className="auth-switch">Don't have an account? <a onClick={onSwitch}>Sign up free</a></div>
        </div>
      </div>
    </div>
  )
}