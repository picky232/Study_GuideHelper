function DonutChart({ done, total }) {
  const rate = total === 0 ? 0 : Math.round((done / total) * 100)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (rate / 100) * circumference

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex items-center justify-center">
        <svg width="130" height="130" className="-rotate-90">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="#f3f0ff" strokeWidth="14" />
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke="url(#grad)"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-extrabold text-purple-700">{rate}%</span>
          <span className="text-xs text-gray-400">달성</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs text-gray-400">완료</p>
          <p className="text-xl font-bold text-purple-700">{done}<span className="text-sm font-normal text-gray-400">/{total}개</span></p>
        </div>
        <div className="h-px w-20 bg-gray-100" />
        <div>
          <p className="text-xs text-gray-400">남은 태스크</p>
          <p className="text-xl font-bold text-gray-700">{total - done}<span className="text-sm font-normal text-gray-400">개</span></p>
        </div>
      </div>
    </div>
  )
}

export default DonutChart
