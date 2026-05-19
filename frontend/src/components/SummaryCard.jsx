import { useState } from 'react'

function SummaryCard({ summary }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="bg-blue-50 rounded-xl border border-blue-100 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-500 text-sm">✦</span>
          <span className="text-sm font-semibold text-blue-800">
            Meeting Summary
          </span>
        </div>
        <span className="text-blue-400 text-xs">
          {expanded ? 'Collapse' : 'Expand'}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          <p className="text-sm text-blue-900 leading-relaxed">
            {summary.overview}
          </p>

          {summary.key_points?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                Key points
              </p>
              <ul className="flex flex-col gap-1.5">
                {summary.key_points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.decisions && (
            <div className="bg-white rounded-lg p-3 border border-blue-100 mt-1">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                Decisions made
              </p>
                <p className="text-sm text-blue-800 leading-relaxed mt-1">                {summary.decisions}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SummaryCard