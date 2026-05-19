import { useState } from 'react'

function UploadBox({ onSubmit }) {
  const [transcript, setTranscript] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleSubmit = () => {
    if (transcript.trim().length < 50) {
      alert('Please enter at least 50 characters')
      return
    }
    onSubmit(transcript)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setTranscript(event.target.result)
    }
    reader.readAsText(file)
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setTranscript(event.target.result)
    }
    reader.readAsText(file)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        <div className="text-4xl mb-3">📄</div>
        <p className="text-gray-600 font-medium mb-1">
          Drop a transcript file here
        </p>
        <p className="text-gray-400 text-sm mb-4">
          Supports .txt and .vtt files
        </p>
        <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 underline">
          or browse to upload
          <input
            type="file"
            accept=".txt,.vtt"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-2">
          Or paste your transcript directly:
        </p>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste meeting transcript here..."
          rows={8}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">
            {transcript.length} characters
            {transcript.length > 0 && transcript.length < 50 && (
              <span className="text-red-400 ml-1">
                (need at least 50)
              </span>
            )}
          </span>
          <button
            onClick={handleSubmit}
            disabled={transcript.trim().length < 50}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Analyze transcript
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadBox