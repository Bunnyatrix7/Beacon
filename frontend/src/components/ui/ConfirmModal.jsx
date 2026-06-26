import { FiAlertTriangle } from 'react-icons/fi';

export function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) {
    return (
        <div>
            <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/10 text-red-400">
                    <FiAlertTriangle size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold">{title}</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{message}</p>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <button onClick={onCancel} className="rounded-xl bg-white/10 px-4 py-2 font-semibold">
                    {cancelText}
                </button>
                <button onClick={onConfirm} className="rounded-xl bg-red-500 px-4 py-2 font-bold text-white">
                    {confirmText}
                </button>
            </div>
        </div>
    );
}
