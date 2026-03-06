import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { STATE_LABELS } from '@/config'

const COLORS = {
    pending: 'hsl(38, 92%, 50%)',
    assigned: 'hsl(217, 91%, 60%)',
    in_route: 'hsl(263, 70%, 58%)',
    completed: 'hsl(142, 71%, 45%)',
    cancelled: 'hsl(0, 72%, 51%)',
}

export function RequestsDonut({ requests }) {
    const data = Object.keys(STATE_LABELS).map((state) => ({
        name: STATE_LABELS[state],
        value: requests.filter((r) => r.state === state).length,
        state,
    })).filter((d) => d.value > 0)

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Distribución por Estado</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3} strokeWidth={0}>
                            {data.map((entry) => (
                                <Cell key={entry.state} fill={COLORS[entry.state]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Solicitudes']} />
                        <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
