/**
 * Reusable stat card used on Faculty Dashboard
 * Props:
 *   value  — big number or text shown in center
 *   label  — small text below the value
 *   color  — blue | green | purple | red | yellow
 *   icon   — emoji shown above the value
 */
export default function StatCard({ value, label, color = 'blue', icon = '📊' }) {

  const colorMap = {
    blue:   'text-blue-600   bg-blue-50   border-blue-200',
    green:  'text-green-600  bg-green-50  border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    red:    'text-red-600    bg-red-50    border-red-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  }

  const colors = colorMap[color] || colorMap.blue

  return (
    <div className={`rounded-xl border p-6 text-center ${colors}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`text-3xl font-bold mb-1 ${colors.split(' ')[0]}`}>
        {value}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}