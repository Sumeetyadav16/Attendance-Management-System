/**
 * Reusable progress bar with percentage label
 * Props:
 *   value     — number 0 to 100
 *   showLabel — show percentage text (default true)
 *   height    — bar height in px (default 8)
 *   colorAuto — auto green if >=75, red if <75 (default true)
 *   color     — override color: green | red | blue | yellow
 */
export default function ProgressBar({
  value       = 0,
  showLabel   = true,
  height      = 8,
  colorAuto   = true,
  color       = null,
}) {

  const pct = Math.min(100, Math.max(0, value))

  // Determine bar color
  let barColor = 'bg-blue-500'
  if (colorAuto) {
    barColor = pct >= 75 ? 'bg-green-500' : 'bg-red-400'
  } else if (color) {
    const map = {
      green:  'bg-green-500',
      red:    'bg-red-400',
      blue:   'bg-blue-500',
      yellow: 'bg-yellow-400',
    }
    barColor = map[color] || 'bg-blue-500'
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{pct}%</span>
          <span>{pct >= 75 ? '✅ Safe' : '⚠️ Low'}</span>
        </div>
      )}
      <div
        className="w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div
          className={`${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%`, height: '100%' }}
        />
      </div>
    </div>
  )
}