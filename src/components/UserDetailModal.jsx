import React from 'react';

const UserDetailModal = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;

    const formatDate = (timestamp) => {
        if (!timestamp) return '—';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return '—';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

            <div className="relative glass-card max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up shadow-2xl border-white/20">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">{user.fullName}</h3>
                        <p className="text-white/40 text-xs flex items-center gap-2">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Registered on {formatDate(user.createdAt)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="section-header text-sm">
                                <span className="w-1 h-3 bg-blue-500 rounded-full" />
                                Contact Details
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Company Emp ID</label>
                                        <p className="text-blue-400 font-mono text-sm font-bold mt-0.5">{user.empId || '—'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-white/30 tracking-wider text-right block">Joining Date</label>
                                        <p className="text-white text-sm mt-0.5 text-right">{user.joiningDate ? new Date(user.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-white/5">
                                    <label className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Email Address</label>
                                    <p className="text-white text-sm mt-0.5">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Mobile Number</label>
                                    <p className="text-white text-sm mt-0.5">{user.mobile}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Communication Skill</label>
                                    <span className="ml-3 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs border border-blue-500/30">
                                        {user.communicationSkill}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="space-y-4">
                            <div className="section-header text-sm">
                                <span className="w-1 h-3 bg-violet-500 rounded-full" />
                                Availability & Preferences
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold text-violet-400 uppercase">Meeting</span>
                                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase ${user.nightMeeting ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                            {user.nightMeeting ? 'Night OK' : 'No Night'}
                                        </span>
                                    </div>
                                    <p className="text-white font-mono text-sm">
                                        {user.nightMeeting ? `${user.meetingAvailableFrom} – ${user.meetingAvailableTo}` : '—'}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold text-emerald-400 uppercase">Work</span>
                                    </div>
                                    <p className="text-white font-mono text-sm">
                                        {user.workAvailableFrom || '—'} – {user.workAvailableTo || '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technical Skills */}
                    <div className="space-y-4">
                        <div className="section-header text-sm">
                            <span className="w-1 h-3 bg-blue-500 rounded-full" />
                            Technical Skills
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {user.skills?.map((skill, index) => (
                                <div key={index} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors duration-200">
                                    <p className="text-white text-xs font-semibold mb-1 truncate">{skill.name}</p>
                                    <p className="text-white/40 text-[10px]">
                                        {skill.experience}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Projects */}
                    <div className="space-y-4">
                        <div className="section-header text-sm">
                            <span className="w-1 h-3 bg-amber-500 rounded-full" />
                            Projects & Portfolio
                        </div>
                        <div className="space-y-3">
                            {user.projects?.filter(p => p.trim() !== '').length > 0 ? (
                                user.projects.filter(p => p.trim() !== '').map((project, index) => (
                                    <div key={index} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-white/80 text-sm leading-relaxed whitespace-pre-wrap italic">
                                        "{project}"
                                    </div>
                                ))
                            ) : (
                                <p className="text-white/30 text-xs italic">No projects listed.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-white/5">
                    <button
                        onClick={onClose}
                        className="w-full btn-secondary font-bold"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
