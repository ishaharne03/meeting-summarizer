import { useState } from 'react'

function EmailPreview({ draft, onCopy }) {
  const [subject, setSubject] = useState(draft.subject)
  const [body, setBody] = useState(draft.body)
  const [copied, setCopied] = useState(false)
  const [sendState, setSendState] = useState('idle')

  const handleSend = () => {
    setSendState('sending')
    setTimeout(() => {
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      setSendState('sent')
      setTimeout(() => setSendState('idle'), 2500)
    }, 600)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
    setCopied(true)
    onCopy?.()
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-slide-up">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Follow-up Draft</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>

          {sendState === 'idle' && (
            <button
              onClick={handleSend}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Open in mail
            </button>
          )}

          {sendState === 'sending' && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 px-3 py-1.5 rounded-lg bg-indigo-50">
              <span className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
              Opening...
            </div>
          )}

          {sendState === 'sent' && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium px-3 py-1.5 rounded-lg bg-green-50 animate-pop-in">
              ✓ Email opened!
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
            className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  )
}

export default EmailPreview