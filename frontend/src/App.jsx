import { useState, useEffect } from 'react'
import UploadBox from './components/UploadBox'
import ActionItemList from './components/ActionItemList'
import EmailPreview from './components/EmailPreview'
import MeetingHistory from './components/MeetingHistory'

function App() {
  const [appState, setAppState] = useState('idle')
  const [meetingData, setMeetingData] = useState(null)
  const [actionItems, setActionItems] = useState([])
  const [emailDraft, setEmailDraft] = useState(null)
  const [meetings, setMeetings] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMeetings()
  }, [])

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
      setAppState('done')
      fetchMeetings()
    } catch (err) {
      setError(err.message)
      setAppState('idle')
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
    } catch (err) {
      console.error('Failed to update action item:', err)
    }
  }

  const handleMeetingSelect = async (meeting) => {
    setMeetingData(meeting)
    setActionItems(meeting.action_items)
    setEmailDraft(null)
    setAppState('done')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">Meeting Summarizer</h1>
        <p className="text-sm text-gray-500">Upload a transcript to extract action items</p>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <MeetingHistory
            meetings={meetings}
            onSelect={handleMeetingSelect}
            activeMeetingId={meetingData?.id}
          />
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {appState === 'idle' && (
            <UploadBox onSubmit={handleTranscriptSubmit} />
          )}

          {appState === 'loading' && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Analyzing transcript...</p>
            </div>
          )}

          {appState === 'done' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  {meetingData?.title}
                </h2>
                <button
                  onClick={() => setAppState('idle')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + New meeting
                </button>
              </div>

              <ActionItemList
                items={actionItems}
                onUpdate={handleActionItemUpdate}
              />

              {emailDraft && (
                <EmailPreview draft={emailDraft} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App