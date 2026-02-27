import React from 'react'

export default function ConfirmDialog({ isOpen, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', variant = 'danger', onConfirm, onCancel, loading }) {
    if (!isOpen) return null

    const btnClass = variant === 'danger' ? 'btn-danger' : variant === 'success' ? 'btn-success' : 'btn-primary'

    return (
        <div className="modal-overlay animate-fade-in" onClick={onCancel}>
            <div
                className="modal-content max-w-sm p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-5">
                    {variant === 'danger' ? (
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    )}
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-600 mt-1.5">{message}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={loading} className="flex-1 btn-secondary">
                        {cancelLabel}
                    </button>
                    <button onClick={onConfirm} disabled={loading} className={`flex-1 ${btnClass}`}>
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="spinner-sm" />
                                Procesando...
                            </span>
                        ) : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
