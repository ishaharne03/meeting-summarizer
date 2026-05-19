import { useState } from 'react'

function ActionItemList({ items, onUpdate }) {
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const handleStatusToggle = (item) => {
    const newStatus = item.status === 'pending' ? 'done' : 'pending'
    onUpdate(item.id, { status: newStatus })
  }

  const handleEditStart = (item) => {
    setEditingId(item.id)
    setEditText(item.text)
  }

  const handleEditSave = (item) => {
    if (editText.trim() === '') return
    onUpdate(item.id, { text: editText.trim() })
    setEditingId(null)
    setEditText('')
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleKeyDown = (e, item) => {
    if (e.key === 'Enter') handleEditSave(item)
    if (e.key === 'Escape') handleEditCancel()
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-400 text-sm">No action items found in this transcript</p>
      </div>
    )
  }

  const doneCount = items.filter(i => i.status === 'done').length

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Action Items</h3>
        <span className="text-xs text-gray-400">
          {doneCount}/{items.length} done
        </span>
      </div>

      <ul className="divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item.id} className="px-4 py-3 flex items-start gap-3">
            <button
              onClick={() => handleStatusToggle(item)}
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                item.status === 'done'
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {item.status === 'done' && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              {editingId === item.id ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, item)}
                    className="flex-1 text-sm border border-blue-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleEditSave(item)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p
                  onClick={() => handleEditStart(item)}
                  className={`text-sm cursor-pointer hover:text-blue-600 transition-colors ${
                    item.status === 'done'
                      ? 'line-through text-gray-400'
                      : 'text-gray-700'
                  }`}
                >
                  {item.text}
                </p>
              )}

              {item.assignee && editingId !== item.id && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Assigned to {item.assignee}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ActionItemList