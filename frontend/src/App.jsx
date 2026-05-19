import { useState, useEffect } from 'react'
import UploadBox from './components/UploadBox'
import ActionItemList from './components/ActionItemList'
import EmailPreview from './components/EmailPreview'
import MeetingHistory from './components/MeetingHistory'
import SummaryCard from './components/SummaryCard'
import Toast from './components/Toast'

function App() {
  const [appState, setAppState] = useState('idle')
  const [meetingData, setMeetingData] = useState(null)
  const [actionItems, setActionItems] = useState([])
  const [emailDraft, setEmailDraft] = useState(null)
  const [meetings, setMeetings] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchMeetings()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const fetchMeetings = async () => {
    try {
      const res = await fetch('http://localhost:8000/meetings')
      const data = await res.json()
      setMeetings(data)
    } catch (err) {
      console.error('Failed to fetch meetings:', err)
    }
  }

  const handleTranscriptSubmit = async (transcript) => {
    setAppState('loading')
    setError(null)
    try {
      const res = await fetch('http://localhost:8000/meetings/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail)
      }
      const data = await res.json()
      setMeetingData(data.meeting)
      setActionItems(data.action_items)
      setEmailDraft(data.email_draft)
      setSummary(data.summary)
      setAppState('done')
      fetchMeetings()
      showToast('Meeting analysed successfully')
    } catch (err) {
      setError(err.message)
      setAppState('idle')
      showToast(err.message, 'error')
    }
  }

  const handleActionItemUpdate = async (id, updates) => {
    try {
      const params = new URLSearchParams(updates).toString()
      const res = await fetch(`http://localhost:8000/action-items/${id}?${params}`, {
        method: 'PATCH',
      })
      const updated = await res.json()
      setActionItems(prev =>
        prev.map(item => item.id === updated.id ? updated : item)
      )
      if (updates.status) {
        showToast(
          updates.status === 'done' ? 'Marked as done' : 'Marked as pending',
          'info'
        )
      }
    } catch (err) {
      showToast('Failed to update item', 'error')
    }
  }

  const handleMeetingSelect = (meeting) => {
    setMeetingData(meeting)
    setActionItems(meeting.action_items)
    setEmailDraft(null)
    setSummary(null)
    setAppState('done')
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800 tracking-tight">
            Meeting Summarizer
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            AI-powered action items and follow-ups
          </p>
        </div>
        {appState === 'done' && (
          <button
            onClick={() => setAppState('idle')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            + New meeting
          </button>
        )}
      </header>

      <div className="flex h-[calc(100vh-65px)]">

        <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
          <MeetingHistory
            meetings={meetings}
            onSelect={handleMeetingSelect}
            activeMeetingId={meetingData?.id}
          />
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {appState === 'idle' && (
            <UploadBox onSubmit={handleTranscriptSubmit} />
          )}

          {appState === 'loading' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
              <div className="h-5 w-48 bg-slate-200 rounded-lg animate-pulse" />
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                </div>
                {[1,2,3].map(i => (
                  <div key={i} className="px-4 py-3 flex items-center gap-3 border-b border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="h-3.5 bg-slate-200 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2">
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 bg-slate-100 rounded animate-pulse" />
              </div>
              <p className="text-center text-sm text-slate-400 animate-pulse">
                Analysing transcript with AI...
              </p>
            </div>
          )}

          {appState === 'done' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {meetingData?.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {meetingData?.created_at
                    ? new Date(meetingData.created_at).toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric'
                      })
                    : ''}
                </p>
              </div>
              
              {summary && <SummaryCard summary={summary} />}

              <ActionItemList
                items={actionItems}
                onUpdate={handleActionItemUpdate}
              />

              {emailDraft && (
                <EmailPreview
                  draft={emailDraft}
                  onCopy={() => showToast('Email copied to clipboard', 'success')}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default App