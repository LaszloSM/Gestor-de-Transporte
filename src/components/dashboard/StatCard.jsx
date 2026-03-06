import { Card, CardContent } from '@/components/ui/card'

const colorMap = {
    pending: 'text-status-pending',
    completed: 'text-status-completed',
    cancelled: 'text-status-cancelled',
}

export function StatCard({ title, value, icon: Icon, color }) {
    const iconColor = color ? colorMap[color] : 'text-muted-foreground'

    return (
        <Card className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-semibold">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}
