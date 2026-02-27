# 🚀 Características Futuras y Componentes Avanzados

## Componentes por Implementar

### 1. TransportCard Component
```jsx
// Generador de tarjeta de transporte (PDF/PNG)
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import QRCode from 'qrcode.react'

export function TransportCard({ request }) {
  const handleDownloadPDF = async () => {
    const element = document.getElementById('transport-card')
    const canvas = await html2canvas(element)
    const pdf = new jsPDF('p', 'mm', 'a5')
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0)
    pdf.save(`transporte-${request.id}.pdf`)
  }

  return (
    <div id="transport-card" className="bg-white p-8 rounded-lg shadow-lg max-w-sm">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-primary-600">
          🚗 Transporte Electoral
        </h2>
      </div>
      
      <div className="space-y-4 mb-6 border-b-2 pb-4">
        <div>
          <p className="text-xs text-slate-500">PASAJERO</p>
          <p className="text-lg font-bold">{request.passenger_name}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">CANTIDAD</p>
            <p className="text-lg font-bold">{request.quantity}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">HORA</p>
            <p className="text-lg font-bold">{request.time}</p>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-slate-500">RUTA</p>
          <p className="font-semibold">
            {request.origin} → {request.destination}
          </p>
        </div>
      </div>
      
      <div className="flex justify-center mb-4">
        <QRCode 
          value={`electoral-${request.id}`}
          size={128}
          level="H"
          includeMargin
        />
      </div>
      
      <div className="text-center text-xs text-slate-600">
        <p>ID: {request.id.slice(0, 8)}</p>
        <p>{new Date().toLocaleDateString()}</p>
      </div>
      
      <button
        onClick={handleDownloadPDF}
        className="btn-primary w-full mt-4"
      >
        ⬇️ Descargar
      </button>
    </div>
  )
}
```

### 2. ConflictResolution Component
```jsx
export function ConflictResolution({ conflict, onResolve }) {
  const [resolution, setResolution] = useState(null)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          ⚠️ Conflicto Detectado
        </h2>
        
        <p className="text-slate-600 mb-4">
          Este registro fue modificado por otro usuario. 
          ¿Cómo deseas proceder?
        </p>
        
        <div className="space-y-2 mb-6">
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm font-medium text-blue-900">
              Tu cambio:
            </p>
            <p className="text-sm text-blue-700">
              {JSON.stringify(conflict.localChanges)}
            </p>
          </div>
          
          <div className="p-3 bg-green-50 rounded">
            <p className="text-sm font-medium text-green-900">
              Cambio remoto:
            </p>
            <p className="text-sm text-green-700">
              {JSON.stringify(conflict.remoteChanges)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onResolve('local')}
            className="btn-primary flex-1"
          >
            Mantener mi cambio
          </button>
          <button
            onClick={() => onResolve('remote')}
            className="btn-secondary flex-1"
          >
            Usar cambio remoto
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 3. OfflineIndicator Component
```jsx
export function OfflineIndicator() {
  const { isOnline, lastSync } = useSyncStore()

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">📡</span>
        <p className="font-semibold text-yellow-900">Modo Offline</p>
      </div>
      <p className="text-sm text-yellow-800">
        {lastSync ? (
          <>
            Última sincronización: {new Date(lastSync).toLocaleTimeString()}
          </>
        ) : (
          'Sin conexión. Los cambios se sincronizarán cuando se restaure la conexión.'
        )}
      </p>
    </div>
  )
}
```

### 4. ReportExporter Component
```jsx
export function ReportExporter() {
  const { requests } = useRequestsStore()

  const exportToExcel = async () => {
    // Usar papa parse o xlsx
    const csv = convertToCSV(requests)
    downloadCSV(csv, 'reporte-transporte.csv')
  }

  const exportToPDF = async () => {
    // Usar jsPDF
    const pdf = new jsPDF()
    addRequestsTable(pdf, requests)
    pdf.save('reporte-transporte.pdf')
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Exportar Reporte</h3>
      
      <div className="space-y-2">
        <button onClick={exportToExcel} className="btn-primary w-full">
          📊 Exportar Excel
        </button>
        <button onClick={exportToPDF} className="btn-secondary w-full">
          📄 Exportar PDF
        </button>
      </div>
    </div>
  )
}
```

### 5. NotificationCenter Component
```jsx
export function NotificationCenter() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Suscribirse a cambios de solicitudes
    const subscription = realtime.subscribeToRequests((payload) => {
      const notification = {
        id: Date.now(),
        title: 'Nueva solicitud',
        message: `${payload.new.passenger_name} requiere transporte`,
        type: 'info',
        timestamp: new Date()
      }
      setNotifications(prev => [notification, ...prev].slice(0, 10))
    })

    return () => realtime.unsubscribe(subscription)
  }, [])

  return (
    <div className="max-w-md">
      {notifications.map(notif => (
        <Toast key={notif.id} {...notif} />
      ))}
    </div>
  )
}
```

## Funcionalidades Avanzadas

### 1. Mapas Interactivos
```jsx
import GoogleMapReact from 'google-map-react'

export function RequestMap({ requests }) {
  return (
    <GoogleMapReact
      defaultCenter={{ lat: 4.7110, lng: -74.0075 }} // Bogotá
      defaultZoom={11}
    >
      {requests.map(request => (
        <MapMarker
          key={request.id}
          lat={request.destination_lat}
          lng={request.destination_lng}
          request={request}
        />
      ))}
    </GoogleMapReact>
  )
}
```

### 2. Analytics Dashboard
```jsx
export function AnalyticsDashboard() {
  const { requests } = useRequestsStore()

  const stats = {
    avgTime: calculateAverageTime(requests),
    peakHours: calculatePeakHours(requests),
    vehicleDistribution: calculateVehicleDistribution(requests),
    completionRate: calculateCompletionRate(requests),
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Chart type="line" data={stats.peakHours} title="Picos de Demanda" />
      <Chart type="pie" data={stats.vehicleDistribution} title="Tipos de Vehículos" />
      <KPI label="Tiempo Promedio" value={stats.avgTime + ' min'} />
      <KPI label="Tasa de Finalización" value={stats.completionRate + '%'} />
    </div>
  )
}
```

### 3. Scheduler Integration
```jsx
import { Calendar } from '@react-big-calendar'

export function RequestScheduler() {
  const { requests } = useRequestsStore()

  const events = requests.map(r => ({
    id: r.id,
    title: `${r.passenger_name} - ${r.vehicle_type}`,
    start: new Date(`${new Date().toDateString()} ${r.time}`),
    end: new Date(`${new Date().toDateString()} ${addMinutes(r.time, 30)}`),
    resource: r
  }))

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
    />
  )
}
```

## Integraciones por Implementar

### 1. Twilio SMS
```javascript
// services/twilio.js
import twilio from 'twilio'

export const sendSMS = async (phone, message) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )

  const msg = await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  })

  return msg.sid
}
```

### 2. WhatsApp Business API
```javascript
// services/whatsapp-business.js
export const sendWhatsAppMessage = async (phone, templateId, params) => {
  const response = await fetch(
    `https://graph.instagram.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: templateId,
          language: { code: 'es' },
          parameters: { body: { parameters: params } }
        }
      })
    }
  )

  return response.json()
}
```

### 3. Firebase Cloud Messaging
```javascript
// services/push-notifications.js
export const sendPushNotification = async (deviceToken, title, body) => {
  const message = {
    token: deviceToken,
    notification: { title, body },
    data: { type: 'transport_request' }
  }

  return admin.messaging().send(message)
}
```

## State Management Avanzado

### Middleware para Logging
```javascript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const requestStoreWithMiddleware = create(
  devtools(
    persist(
      (set, get) => ({...}),
      { name: 'requests-storage' }
    )
  )
)
```

### LocalStorage Sync
```javascript
const usePersistedStore = create(
  persist(
    (set) => ({...}),
    {
      name: 'app-storage',
      storage: localStorage,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState
      })
    }
  )
)
```

## Testing

### Unit Tests
```javascript
// __tests__/stores/requests.test.js
import { renderHook, act } from '@testing-library/react'
import { useRequestsStore } from '../../stores'

describe('useRequestsStore', () => {
  it('should add request to store', () => {
    const { result } = renderHook(() => useRequestsStore())

    act(() => {
      result.current.addRequest({
        id: '1',
        passenger_name: 'Test User',
        state: 'pending'
      })
    })

    expect(result.current.requests).toHaveLength(1)
    expect(result.current.requests[0].passenger_name).toBe('Test User')
  })
})
```

### Integration Tests
```javascript
// __tests__/integration/request-flow.test.js
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewRequestPage from '../../pages/NewRequestPage'

describe('Request Creation Flow', () => {
  it('should create a new request', async () => {
    const user = userEvent.setup()
    render(<NewRequestPage />)

    await user.type(screen.getByLabelText(/nombre/i), 'Juan')
    await user.type(screen.getByLabelText(/teléfono/i), '3001234567')
    await user.click(screen.getByRole('button', { name: /crear/i }))

    await waitFor(() => {
      expect(screen.getByText(/solicitud creada/i)).toBeInTheDocument()
    })
  })
})
```

## Performance Monitoring

```javascript
// utils/performance.js
export const logMetrics = () => {
  if (window.performance) {
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    
    console.log('Page Load Time:', pageLoadTime + 'ms')
    
    // Enviar a analytics service
    sendToAnalytics({
      metric: 'page_load_time',
      value: pageLoadTime
    })
  }
}

useEffect(() => {
  window.addEventListener('load', logMetrics)
  return () => window.removeEventListener('load', logMetrics)
}, [])
```

## Próximas Prioridades

1. **Fase 1 (MVP)**: Lo actual
2. **Fase 2**: Mapas + Exportación
3. **Fase 3**: SMS + Push notifications
4. **Fase 4**: Analytics + BI
5. **Fase 5**: Mobile app nativa

---

**Nota**: Implementar estas características gradualmente, priorizando según feedback de usuarios.
