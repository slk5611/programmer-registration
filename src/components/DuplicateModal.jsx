import React from 'react';

const DuplicateModal = ({ isOpen, onClose, info }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative glass-card p-8 max-w-md w-full animate-slide-up border-red-500/30">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 mx-auto mb-5">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h3 className="text-xl font-bold text-white text-center mb-2">Already Registered</h3>

                <p className="text-white/60 text-center text-sm mb-6 leading-relaxed">
                    A programmer with this <span className="text-red-400 font-semibold">{info?.field}</span> (<span className="text-white font-medium">{info?.value}</span>) is already registered in our system.
                </p>

                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-8">
                    <p className="text-xs text-red-300/70 text-center italic">
                        Please use a different email or mobile number to continue.
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-200"
                >
                    Close & Edit Info
                </button>
            </div>
        </div>
    );
};

export default DuplicateModal;
