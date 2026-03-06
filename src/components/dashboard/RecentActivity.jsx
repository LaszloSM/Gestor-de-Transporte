import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/requests/StatusBadge'

export function RecentActivity({ requests }) {
    const recent = [...requests]
        .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
        .slice(0, 5)

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {recent.map((req) => (
                    <div key={req.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{req.passenger_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{req.origin} → {req.destination}</p>
                        </div>
                        <StatusBadge state={req.state} />
                    </div>
                ))}
                {recent.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Sin actividad reciente</p>
                )}
            </CardContent>
        </Card>
    )
}
