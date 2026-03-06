import { Badge } from '@/components/ui/badge'
import { STATE_LABELS } from '@/config'

const stateStyles = {
    pending: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    assigned: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    in_route: 'bg-violet-100 text-violet-800 hover:bg-violet-100',
    completed: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    cancelled: 'bg-red-100 text-red-800 hover:bg-red-100',
}

export function StatusBadge({ state }) {
    return (
        <Badge variant="secondary" className={`text-xs font-medium ${stateStyles[state] || ''}`}>
            {STATE_LABELS[state] || state}
        </Badge>
    )
}
