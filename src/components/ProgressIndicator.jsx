const ProgressIndicator = ({ currentStep }) => {
    const steps = [
        { num: 1, label: 'Basic Info & Skills' },
        { num: 2, label: 'Experience' },
    ];

    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {steps.map((step, idx) => (
                <div key={step.num} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${currentStep >= step.num
                                    ? 'bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-white/10 text-white/40 border border-white/20'
                                }`}
                        >
                            {currentStep > step.num ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                step.num
                            )}
                        </div>
                        <span
                            className={`text-xs mt-1.5 font-medium whitespace-nowrap transition-colors duration-300 ${currentStep >= step.num ? 'text-blue-400' : 'text-white/30'
                                }`}
                        >
                            {step.label}
                        </span>
                    </div>
                    {idx < steps.length - 1 && (
                        <div
                            className={`w-24 h-0.5 mx-2 mb-5 transition-all duration-500 ${currentStep > step.num
                                    ? 'bg-gradient-to-r from-blue-500 to-violet-600'
                                    : 'bg-white/10'
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default ProgressIndicator;
