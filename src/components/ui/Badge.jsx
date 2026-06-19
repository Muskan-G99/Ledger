import { CATEGORY_COLORS } from '../../lib/constants'

export default function Badge({ category }) {
  const color = CATEGORY_COLORS[category] ?? '#64748b'
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {category}
    </span>
  )
}
