function MeetingHistory({ meetings, onSelect, activeMeetingId }) {
  if (meetings.length === 0) {
    return (
      <div className="p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          History
        </p>
        <p className="text-xs text-gray-400 text-center mt-8">
          No meetings yet. Upload your first transcript to get started.
        </p>
      </div>
    )
  }

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getCompletionCount = (meeting) => {
    const items = meeting.action_items || []
    const done = items.filter(i => i.status === 'done').length
    return { done, total: items.length }
  }

  return (
    <div className="p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        History
      </p>

      <ul className="flex flex-col gap-1">
        {meetings.map((meeting) => {
          const { done, total } = getCompletionCount(meeting)
          const isActive = meeting.id === activeMeetingId

          return (
            <li key={meeting.id}>
              <button
                onClick={() => onSelect(meeting)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <p className="text-sm font-medium truncate">
                  {meeting.title}
                </p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-gray-400">
                    {formatDate(meeting.created_at)}
                  </p>
                  {total > 0 && (
                    <span className={`text-xs font-medium ${
                      done === total ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      {done}/{total}
                    </span>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default MeetingHistory