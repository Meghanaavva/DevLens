import React from 'react'
export default function Toast({ icon, message, visible }) {
  return (
    <div className={`toast${visible ? ' visible' : ''}`}>
      <span className="toast-icon">{icon}</span>
      <span>{message}</span>
    </div>
  )
}