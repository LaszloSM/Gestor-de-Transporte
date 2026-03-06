import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { db } from '@/services/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function NewRequestPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    passenger_name: '',
    passenger_phone: '',
    quantity: '1',
    origin: '',
    destination: '',
    vehicle_type: '',
    time: '',
    notes: '',
  })

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.passenger_name || !form.origin || !form.destination || !form.vehicle_type) {
      toast.error('Por favor completa los campos requeridos')
      return
    }
    setLoading(true)
    try {
      await db.createRequest({
        passenger_name: form.passenger_name,
        passenger_phone: form.passenger_phone || null,
        quantity: Number(form.quantity) || 1,
        origin: form.origin,
        destination: form.destination,
        vehicle_type: form.vehicle_type,
        time: form.time || null,
        notes: form.notes || null,
      }, user.id)
      toast.success('Solicitud creada exitosamente')
      navigate('/requests')
    } catch (err) {
      toast.error(err.message || 'Error al crear solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Nueva Solicitud</h1>
          <p className="text-sm text-muted-foreground">Registrar una nueva solicitud de transporte</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del pasajero *</Label>
                <Input value={form.passenger_name} onChange={(e) => update('passenger_name', e.target.value)} placeholder="Nombre completo" />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={form.passenger_phone} onChange={(e) => update('passenger_phone', e.target.value)} placeholder="+57300..." />
              </div>
              <div className="space-y-2">
                <Label>Número de personas</Label>
                <Input type="number" min="1" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tipo de vehículo *</Label>
                <Select value={form.vehicle_type} onValueChange={(v) => update('vehicle_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Automóvil</SelectItem>
                    <SelectItem value="motorcycle">Motocicleta</SelectItem>
                    <SelectItem value="van">Camioneta</SelectItem>
                    <SelectItem value="bus">Autobús</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Origen (recogida) *</Label>
              <Input value={form.origin} onChange={(e) => update('origin', e.target.value)} placeholder="Dirección de recogida" />
            </div>
            <div className="space-y-2">
              <Label>Destino (punto de votación) *</Label>
              <Input value={form.destination} onChange={(e) => update('destination', e.target.value)} placeholder="Punto de votación" />
            </div>
            <div className="space-y-2">
              <Label>Hora sugerida</Label>
              <Input type="time" value={form.time} onChange={(e) => update('time', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Observaciones adicionales..." rows={3} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {loading ? 'Creando...' : 'Crear Solicitud'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
