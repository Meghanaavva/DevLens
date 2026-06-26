import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Signup({ onSwitch, onSuccess, onBack }) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(name, email, password)
      onSuccess()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const sLabel = ['','Weak','Good','Strong'][strength]
  const sColor = ['','#ef4444','#f59e0b','#10b981'][strength]

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-logo"><div className="auth-logo-dot" />DevLens</div>
        <div className="auth-hero">
          <h2>Start inspecting the web today</h2>
          <p>Upload any screenshot, click any element, and instantly get the code behind it.</p>
        </div>
        <div className="auth-feats">
          {['Free forever on the Starter plan','No credit card required','AI-powered code generation','Works on any website screenshot'].map(f => (
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
            <h1>Create your account</h1>
            <p>Get started with DevLens free — no credit card needed</p>
          </div>
          <form className="auth-form" onSubmit={submit}>
            {error && <div className="form-err">⚠️ {error}</div>}
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input className="form-input" type="text" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{position:'relative'}}>
                <input className="form-input" type={showPw?'text':'password'} placeholder="Min. 6 characters" value={password} onChange={e=>setPassword(e.target.value)} required style={{paddingRight:42}} />
                <span onClick={()=>setShowPw(v=>!v)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',cursor:'pointer',fontSize:15,color:'var(--text3)',userSelect:'none'}}>{showPw?'🙈':'👁'}</span>
              </div>
              {password.length > 0 && (
                <div style={{marginTop:7}}>
                  <div style={{display:'flex',gap:3,marginBottom:3}}>
                    {[1,2,3].map(i=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=strength?sColor:'var(--bg4)',transition:'.2s'}}/>)}
                  </div>
                  <div style={{fontSize:11,color:sColor,fontWeight:600}}>{sLabel}</div>
                </div>
              )}
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{marginTop:4}}>
              {loading ? <><span style={{width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block'}}/> Creating account...</> : 'Create account →'}
            </button>
            <p style={{fontSize:12,color:'var(--text3)',textAlign:'center',lineHeight:1.6}}>
              By signing up you agree to our <span style={{color:'var(--brand-d)',cursor:'pointer'}}>Terms</span> and <span style={{color:'var(--brand-d)',cursor:'pointer'}}>Privacy Policy</span>.
            </p>
          </form>
          <div className="auth-switch">Already have an account? <a onClick={onSwitch}>Sign in</a></div>
        </div>
      </div>
    </div>
  )
}
