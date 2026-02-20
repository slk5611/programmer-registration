import { useState } from 'react';

const DeleteConfirmModal = ({ isOpen, onConfirm, onCancel, loading, count, isFiltered }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!password) {
            setError('Password is required');
            return;
        }
        onConfirm(password);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative glass-card p-8 max-w-md w-full animate-slide-up">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 mx-auto mb-5">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>

                <h3 className="text-xl font-bold text-white text-center mb-2">
                    Delete {isFiltered ? 'Filtered' : 'All'} Data?
                </h3>
                <p className="text-white/60 text-center text-sm mb-6">
                    You are about to delete <span className="text-white font-bold">{count}</span> record{count !== 1 ? 's' : ''}.
                    This action is permanent and cannot be undone.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label mb-1.5 opacity-60">Enter Admin Password to Confirm</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="••••••••"
                            className={`input-field ${error ? 'border-red-500/50 focus:border-red-500' : ''}`}
                            autoFocus
                        />
                        {error && <p className="text-red-400 text-xs mt-1.5 ml-1">{error}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="btn-danger flex-1 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Deleting...
                                </>
                            ) : (
                                'Confirm Delete'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
