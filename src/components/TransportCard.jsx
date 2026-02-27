import React, { useRef } from 'react'
import QRCode from 'qrcode.react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'

export default function TransportCard({ request, onClose }) {
  const cardRef = useRef()

  const downloadPDF = async () => {
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      })
      pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight())
      pdf.save(`tarjeta-${request.id.substring(0, 8)}.pdf`)
      toast.success('Tarjeta descargada')
      onClose()
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Error al descargar la tarjeta')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full my-8">
        {/* Card Preview */}
        <div ref={cardRef} className="p-6 bg-gradient-to-br from-blue-50 to-slate-50">
          {/* Header */}
          <div className="text-center mb-4 pb-3 border-b-2 border-blue-300">
            <h2 className="text-lg font-bold text-blue-600">TARJETA DE TRANSPORTE</h2>
            <p className="text-xs text-slate-600">Electoral</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <div className="p-2 bg-white rounded border-2 border-blue-300">
              <QRCode value={request.id} size={100} level="H" />
            </div>
          </div>

          {/* Request ID */}
          <div className="text-center mb-3 pb-3 border-b border-slate-300">
            <p className="text-xs text-slate-600 font-semibold">ID</p>
            <p className="font-mono font-bold text-xs text-slate-800 break-all">{request.id.substring(0, 12)}</p>
          </div>

          {/* Passenger Info */}
          <div className="space-y-2 mb-3 text-sm">
            <div>
              <p className="text-xs text-slate-600 font-semibold">PASAJERO</p>
              <p className="font-semibold text-slate-900">{request.passenger_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold">TELÉFONO</p>
              <p className="text-slate-900 text-sm">{request.passenger_phone}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-600 font-semibold">CANT.</p>
                <p className="text-lg font-bold text-blue-600">{request.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-semibold">VEHÍCULO</p>
                <p className="capitalize text-slate-900 text-sm">{request.vehicle_type}</p>
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="space-y-2 mb-3 pb-3 border-b border-slate-300 text-sm">
            <div>
              <p className="text-xs text-slate-600 font-semibold">ORIGEN</p>
              <p className="text-slate-900 line-clamp-2">{request.origin}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold">DESTINO</p>
              <p className="text-slate-900 line-clamp-2">{request.destination}</p>
            </div>
          </div>

          {/* Time & Status */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div>
              <p className="text-xs text-slate-600 font-semibold">HORA</p>
              <p className="font-semibold text-slate-900">{request.time}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold">ESTADO</p>
              <p className="capitalize font-semibold">
                <span className={`px-2 py-0.5 rounded text-xs font-bold inline-block ${
                  request.state === 'pending' ? 'bg-yellow-200 text-yellow-900' :
                  request.state === 'assigned' ? 'bg-blue-200 text-blue-900' :
                  request.state === 'completed' ? 'bg-green-200 text-green-900' :
                  'bg-orange-200 text-orange-900'
                }`}>
                  {request.state.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-600 pt-3 border-t border-slate-300">
            <p>Emitida: {formatDate(request.created_at)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 bg-slate-100">
          <button
            onClick={downloadPDF}
            className="flex-1 btn bg-blue-600 text-white hover:bg-blue-700 text-sm"
          >
            📥 Descargar
          </button>
          <button
            onClick={onClose}
            className="flex-1 btn bg-slate-300 text-slate-900 hover:bg-slate-400 text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

