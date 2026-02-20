const LoadingSpinner = ({ message = 'Loading...' }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="glass-card p-8 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-white/70 text-sm font-medium">{message}</p>
        </div>
    </div>
);

export default LoadingSpinner;
