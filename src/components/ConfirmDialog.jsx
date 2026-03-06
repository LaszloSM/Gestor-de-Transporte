import React from 'react'

export default function ConfirmDialog({ isOpen, title, message, variant = 'primary', onConfirm, onCancel, loading }) {
    if (!isOpen) return null

    const variantStyles = {
        primary: 'btn-primary',
        success: 'btn-success',
        danger: 'btn-danger',
    }

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                        <button onClick={onCancel} className="btn-icon">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 pb-4">
                    <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 btn-secondary"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 ${variantStyles[variant] || variantStyles.primary}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                                Procesando...
                            </span>
                        ) : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
