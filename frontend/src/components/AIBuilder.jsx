import React, { useState, useRef, useMemo } from 'react'
import { callAI } from '../lib/ai.js'
const QUICK = [
  { icon: '🚀', title: 'SaaS Landing', prompt: 'Build a stunning SaaS landing page for "Flowly" — an AI-powered project management tool. Full site with: sticky glassmorphism navbar, animated hero with gradient headline + particle-like CSS dots, 6 feature cards with icons, pricing section (Free/Pro/Enterprise) with toggle monthly/yearly, testimonials carousel with avatars, FAQ accordion, and footer with newsletter signup. Brand: indigo #4f46e5 + violet #7c3aed. Dark/light sections alternating.' },
  { icon: '🛍️', title: 'E-commerce', prompt: 'Build a premium sneaker store "SoleX" — dark luxury aesthetic. Full site with: dark navbar with cart badge, full-screen hero with oversized text + CSS sneaker mockup, product grid (6 products) with hover zoom + quick-add, brand logos strip, featured collection section, size guide modal trigger, reviews section, newsletter section, and dark footer. Colors: orange #f97316, dark #0a0a0a, gold #fbbf24.' },
  { icon: '💼', title: 'Portfolio', prompt: 'Build a world-class developer portfolio for "Arjun Sharma" — senior full-stack engineer at Google. Sections: animated hero with typewriter effect for roles, about with timeline, projects grid (6 projects with tech stacks + live links), skills with animated progress bars, open source contributions section, blog previews (3 posts), contact form, footer. Dark theme: #020817 bg, #6366f1 accent. Very modern, unique layout.' },
  { icon: '🍕', title: 'Restaurant', prompt: 'Build a premium Italian restaurant "Bella Roma" full website. Sections: cinematic full-screen hero with parallax overlay, about section with chef story, interactive menu with tabs (Antipasti/Pasta/Secondi/Dolci) and dish cards, gallery grid (12 gradient food photos), reservation booking form with date picker, awards/press section, location + hours, footer. Warm palette: #dc2626 red, #fef3c7 cream, rich dark brown.' },
  { icon: '📊', title: 'Dashboard', prompt: 'Build a complete dark admin analytics dashboard SPA. Full layout: sidebar nav (240px) with logo + 8 menu items + user profile at bottom, topbar with search + notifications + avatar, 4 KPI cards with sparkline CSS charts + trend indicators, large area chart (CSS/SVG), data table with 10 rows + pagination + sort indicators, activity timeline, quick actions panel, notifications drawer. Dark: #0f172a bg, #6366f1 accent.' },
  { icon: '🏥', title: 'Healthcare', prompt: 'Build a modern healthcare clinic website "MediCare Plus". Sections: clean white hero with appointment CTA + trust badges, services grid (8 specialties with icons), doctor profiles (6 cards with photos as gradient avatars + credentials), patient testimonials with star ratings, insurance partners logos strip, appointment booking form (multi-step), health blog (3 articles), FAQ, footer. Colors: teal #0d9488, white, soft blues.' },
  { icon: '🎓', title: 'EdTech', prompt: 'Build a premium online learning platform "LearnX". Sections: gradient hero with course search bar + stats (50K students etc), featured courses grid (8 cards with rating/students/price), category pills filter bar, how it works (4 steps), instructor profiles (4), student success stories with before/after, pricing plans, app download section with phone mockup CSS, footer. Brand: purple #7c3aed + orange #f97316.' },
  { icon: '🏠', title: 'Real Estate', prompt: 'Build a luxury real estate agency website "Prestige Properties". Sections: full-screen video-style CSS hero with property search form (location/type/budget dropdowns), featured listings grid (6 properties with gradient photos + price + beds/baths), neighborhood guides (4 areas), agent profiles (3), market stats with CSS bar charts, testimonials, mortgage calculator (interactive JS), contact + map placeholder. Colors: gold #d97706, dark navy #0f172a.' },
]

const STEPS = [
  'Reading your brief…',
  'Planning site architecture…',
  'Designing color system…',
  'Laying out sections…',
  'Writing HTML structure…',
  'Styling components…',
  'Adding interactions…',
  'Polishing animations…',
  'Final quality check…',
]

const SYSTEM_PROMPT = `You are WebsiteOS — the world's best AI website generator. You produce complete, stunning, production-quality single-file HTML websites that rival Lovable, Framer, and Webflow in visual quality. Every output must be jaw-dropping.

ABSOLUTE RULES:
1. Return ONLY raw HTML starting with <!DOCTYPE html> — zero explanation, zero markdown fences
2. NEVER use <img> tags — use CSS gradients, emojis, SVG shapes, and text as visuals
3. ALL CSS inside one <style> tag, ALL JS inside one <script> tag at bottom
4. Import Google Fonts via @import at top of <style>
5. Must be fully responsive (mobile/tablet/desktop)
6. Must work with zero errors when opened in browser
7. Real content ONLY — real names, prices, copy — NO "Lorem ipsum" EVER
8. Minimum 8-10 distinct sections — NEVER just a hero + cards + footer

VISUAL QUALITY REQUIREMENTS (what makes it look like Lovable, not a template):

TYPOGRAPHY:
- Pick 2 distinctive Google Fonts (NOT Inter+Roboto — those are defaults)
- Use large, bold hero text (80-120px on desktop) with gradient fills using -webkit-background-clip:text
- Mix font weights dramatically: 900 for headlines, 400 for body, 700 for labels
- Letter-spacing: tight on headlines (-0.02em to -0.04em), wider on eyebrows (0.1em+)

COLORS & SURFACES:
- Use CSS variables for entire palette: --bg, --surface, --primary, --accent, --text, --muted
- Glass morphism cards: background:rgba(255,255,255,0.05); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.1)
- Gradient backgrounds for hero sections: use 3-4 color mesh gradients
- Subtle noise texture via SVG filter on backgrounds
- Dark AND light sections alternating for visual rhythm

LAYOUT & SPACING:
- Use CSS Grid and Flexbox — no tables
- Generous spacing: sections get 100-140px padding top/bottom
- Asymmetric layouts: offset grids, overlapping elements, bleeding images
- Max-width container: 1200px centered with padding
- At least ONE full-bleed section with edge-to-edge color/gradient

ANIMATIONS & INTERACTIONS:
- CSS @keyframes for: fadeInUp, slideInLeft, scaleIn, float, pulse
- IntersectionObserver scroll reveals with staggered delays on grid items
- Smooth hover transitions on ALL interactive elements (0.2-0.3s ease)
- Navbar: transparent → solid with backdrop-filter on scroll
- Hover cards: translateY(-8px) + shadow increase
- Buttons: subtle scale(1.02) + shadow on hover

COMPONENTS TO INCLUDE (pick what fits the brief):
- Sticky navbar with blur backdrop + mobile hamburger menu
- Hero with gradient mesh background + floating decorative shapes
- Social proof / trust strip with logos or stats
- Feature/service cards with hover effects
- Pricing tables with toggle (monthly/yearly) if relevant
- Testimonial cards with avatar initials + star ratings
- FAQ accordion with smooth open/close JS
- Contact/CTA form with validation feedback
- Animated counters for stats sections
- Footer with columns + newsletter input

SECTION STRUCTURE (MANDATORY for every output):
Every site MUST have ALL of:
1. <nav> — sticky, glassmorphism, real nav links, CTA button, mobile menu
2. <section id="hero"> — full viewport, gradient bg, big headline, subtext, 2 CTAs
3. At least 5 MORE content sections relevant to the site type
4. <footer> — multi-column, links, copyright, social icons as CSS shapes

NAVBAR RULES:
- Left: styled brand name/logo (not the word "Logo")
- Middle: 4-5 real nav links relevant to this specific business
- Right: CTA button (filled, branded color)
- On scroll: add class 'scrolled' → background:rgba(bg,0.9); backdrop-filter:blur(20px)
- Mobile: hamburger (☰) → slide-down menu

THE HERO MUST:
- Be full viewport height (100vh)
- Have a distinctive background (mesh gradient / diagonal / split / particle-like CSS dots)
- Have an eyebrow label above the headline
- Have a headline 80px+ with gradient text or strong contrast
- Have a subheadline (18-20px, muted color, max 2 lines)
- Have 2 CTA buttons (primary filled + secondary ghost/outline)
- Have a decorative visual element (CSS mockup / floating cards / abstract shapes)`

export default function AIBuilder({ showToast }) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [html, setHtml] = useState(null)
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('preview')
  const textRef = useRef(null)

  const sections = useMemo(() => {
    if (!html) return []
    const matches = [...html.matchAll(/<(section|header|footer|nav|main)[^>]*(?:id|class)="([^"]*)"/gi)]
    const seen = new Set(); const out = []
    for (const m of matches) {
      const raw = m[2].split(/\s+/)[0]
      const label = raw.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim()
      if (!label || seen.has(label)) continue
      seen.add(label); out.push({ tag: m[1], label })
      if (out.length >= 12) break
    }
    return out
  }, [html])

  const generate = async () => {
    if (!prompt.trim()) { showToast('⚠️', 'Describe the website you want to build'); return }
    setLoading(true); setHtml(null); setShowCode(false); setStep(0)
    const iv = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 900)

    try {
      const result = await callAI([{
        role: 'user',
        content: `${SYSTEM_PROMPT}

CLIENT REQUEST: "${prompt}"

DESIGN RULES FOR THIS SPECIFIC SITE:
- Choose a unique Google Font pair that fits the brand personality (NOT Inter/Roboto/Poppins)
- Pick a cohesive color palette with CSS variables: --bg, --surface, --primary, --accent, --text, --muted
- Hero must be full viewport with gradient mesh background, large headline (80px+), subtext, 2 CTAs
- Every section must look visually DIFFERENT from the others — vary bg color, layout direction, card style
- Alternate between dark and light sections for visual rhythm

MANDATORY SECTIONS (all 8 must be present):
1. Sticky navbar — logo left, 4-5 nav links center, CTA button right, blur on scroll
2. Hero — full viewport, gradient bg, eyebrow label, huge headline, subtext, 2 buttons, decorative element
3. Social proof / stats strip — numbers with labels, alternating bg
4. Features / Services — grid of 6 cards with icons, titles, descriptions, hover effects
5. How it works / Process — 3-4 steps with numbers and icons
6. Testimonials — 3 cards with avatar initials, name, role, star rating, quote
7. Pricing / CTA section — plans or big CTA block with button
8. Footer — 4 columns, links, copyright, social icons

WORKING JAVASCRIPT (must include all):
- Mobile hamburger menu toggle
- Navbar background change on scroll (transparent → blur backdrop)
- FAQ accordion if included
- Smooth scroll for nav links
- Scroll reveal animation using IntersectionObserver with staggered delays
- Animated stat counters

Return ONLY the complete HTML. Start immediately with <!DOCTYPE html> — no explanation, no markdown.`
      }], 16000)

      let clean = result
        .replace(/^```html\s*/im, '').replace(/^```\s*/im, '').replace(/```\s*$/m, '')
        .replace(/^(Here|This|Below|Sure|Certainly|I'll|Let me)[^\n]*\n/i, '')
        .trim()

      let tries = 0
      while (!/<\/html>\s*$/i.test(clean) && tries < 3) {
        tries++
        setStep(STEPS.length - 1)
        const tail = clean.slice(-2000)
        try {
          const more = await callAI([{
            role: 'user',
            content: `This HTML was cut off. Continue EXACTLY from where it stopped — do NOT repeat anything already written. Just continue from this point:

...${tail}

Continue until </html>. Return ONLY the continuation HTML, nothing else.`
          }], 8000)
          const moreClean = more
            .replace(/^```html\s*/im, '').replace(/^```\s*/im, '').replace(/```\s*$/m, '')
            .trim()
          if (!moreClean) break
          clean += '\n' + moreClean
        } catch { break }
      }

      if (!clean.includes('<!DOCTYPE') || clean.length < 2000) {
        throw new Error('Generation failed — output too short. Try a Quick Start template.')
      }

      setHtml(clean)
      setHistory(prev => [
        { prompt, time: new Date().toLocaleTimeString(), size: (clean.length / 1024).toFixed(1) },
        ...prev.slice(0, 9)
      ])
      showToast('✅', `Website ready! (${(clean.length / 1024).toFixed(0)}KB)`)
    } catch (e) {
      showToast('⚠️', e.message.length < 120 ? e.message : 'Generation failed — try again or use a Quick Start')
    }

    clearInterval(iv)
    setLoading(false)
  }

  const copy = () => {
    if (!html) return
    navigator.clipboard.writeText(html).catch(() => {})
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    showToast('✓', 'HTML copied to clipboard!')
  }

  const download = () => {
    if (!html) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
    a.download = `website-${Date.now()}.html`; a.click()
    showToast('⬇️', 'Downloaded!')
  }

  const openNewTab = () => {
    if (!html) return
    const blob = new Blob([html], { type: 'text/html' })
    window.open(URL.createObjectURL(blob), '_blank')
  }

  return (
    <div className="builder-shell">
      {/* Sidebar */}
      <aside className="builder-sidebar">
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 3 }}>AI Website Builder</div>
          <div style={{ fontSize: 11.5, color: 'var(--text3)', marginBottom: 14, lineHeight: 1.5 }}>AI-powered · Professional quality output</div>

          <textarea
            ref={textRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && generate()}
            placeholder={'e.g. "Build a premium SaaS landing page for an AI writing tool with hero, features, pricing, testimonials and footer. Dark theme, purple accent."'}
            style={{
              width: '100%', height: 140, padding: 12, background: 'var(--bg2)',
              border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 12,
              color: 'var(--text)', resize: 'none', outline: 'none', lineHeight: 1.65,
              fontFamily: 'Inter,sans-serif', boxSizing: 'border-box'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--brand-d)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="btn-primary"
            style={{ width: '100%', marginTop: 8, padding: '11px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (!prompt.trim() || loading) ? 0.6 : 1 }}
          >
            {loading
              ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />{STEPS[step]}</>
              : '✨ Generate Full Website'}
          </button>
          <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 5 }}>⌘ Enter to generate</div>
        </div>

        {/* Quick starts */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .7, marginBottom: 8 }}>Quick Start</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {QUICK.map(q => (
              <div
                key={q.title}
                onClick={() => { setPrompt(q.prompt); textRef.current?.focus() }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg2)', transition: '.12s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-d)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ fontSize: 16 }}>{q.icon}</span>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{q.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ padding: '14px 16px 16px', flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .7, marginBottom: 8 }}>Recent</div>
            {history.map((h, i) => (
              <div
                key={i}
                onClick={() => setPrompt(h.prompt)}
                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 5, cursor: 'pointer', background: 'var(--bg2)' }}
              >
                <div style={{ fontSize: 11, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.prompt.slice(0, 60)}…</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, display: 'flex', gap: 8 }}>
                  <span>{h.time}</span>
                  <span>{h.size}KB</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main canvas */}
      <div className="builder-main">
        {/* Toolbar */}
        <div className="builder-bar">
          <span className="builder-bar-title">
            {loading ? `⚡ ${STEPS[step]}` : html ? '✅ Website ready — full production quality' : '🎨 Canvas'}
          </span>
          {html && !loading && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn-secondary"
                style={{ fontSize: 12, padding: '6px 12px', color: activeTab === 'code' ? 'var(--brand-d)' : 'var(--text2)', borderColor: activeTab === 'code' ? 'var(--brand-d)' : 'var(--border)' }}
                onClick={() => setActiveTab(t => t === 'code' ? 'preview' : 'code')}
              >
                {activeTab === 'code' ? '👁 Preview' : '</> Code'}
              </button>
              <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={openNewTab}>↗ New Tab</button>
              <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', color: copied ? 'var(--green)' : 'var(--text2)' }} onClick={copy}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
              <button className="btn-primary" style={{ fontSize: 12, padding: '6px 13px' }} onClick={download}>⬇ Download</button>
              <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => { setHtml(null); setPrompt('') }}>🔄 New</button>
            </div>
          )}
        </div>

        {/* Section pills */}
        {html && !loading && sections.length > 0 && (
          <div style={{ display: 'flex', gap: 5, padding: '7px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .5, marginRight: 2 }}>Sections:</span>
            {sections.map((s, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text2)' }}>
                {s.tag === 'nav' || s.tag === 'header' ? '🧭' : s.tag === 'footer' ? '🏷️' : '🔷'} {s.label}
              </span>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Empty state */}
          {!html && !loading && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🤖</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: "'Bricolage Grotesque',sans-serif" }}>Build any website with AI</div>
              <div style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 460, lineHeight: 1.75, marginBottom: 10 }}>
                Generates complete, multi-section websites with real content, animations, and professional design.
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 28 }}>8-10 full sections · Real content · Working JS · Fully responsive</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {QUICK.map(q => (
                  <button
                    key={q.title}
                    onClick={() => { setPrompt(q.prompt); textRef.current?.focus() }}
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: '8px 15px' }}
                  >
                    {q.icon} {q.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
              <div style={{ position: 'relative', width: 64, height: 64 }}>
                <div style={{ width: 64, height: 64, border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                <div style={{ position: 'absolute', inset: 10, border: '2px solid var(--border)', borderBottomColor: 'var(--brand-d)', borderRadius: '50%', animation: 'spin 1.2s linear infinite reverse' }} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', fontFamily: "'Bricolage Grotesque',sans-serif" }}>Building your website…</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>{STEPS[step]}</div>
              <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                {STEPS.map((_, i) => (
                  <div key={i} style={{ width: i <= step ? 20 : 6, height: 4, borderRadius: 2, background: i <= step ? 'var(--brand)' : 'var(--border)', transition: '.3s' }} />
                ))}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text3)', maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
                Building your website — this may take up to 60 seconds for best quality.
              </div>
            </div>
          )}

          {/* Preview / Code */}
          {html && !loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                <div style={{ flex: 1, background: 'var(--bg2)', borderRadius: 5, padding: '3px 12px', fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace', textAlign: 'center', border: '1px solid var(--border)' }}>
                  devlens-preview.app · {(html.length / 1024).toFixed(1)}KB · {html.split('\n').length} lines
                </div>
              </div>
              {activeTab === 'code'
                ? <pre style={{ flex: 1, margin: 0, padding: 16, background: '#0f172a', color: '#c3e88d', fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, lineHeight: 1.75, overflowY: 'auto', overflowX: 'auto', whiteSpace: 'pre' }}>{html}</pre>
                : <iframe srcDoc={html} style={{ flex: 1, border: 'none', width: '100%' }} title="preview" sandbox="allow-scripts allow-same-origin" />
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}