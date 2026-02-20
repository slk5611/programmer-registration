import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { generateCSV } from '../utils/generateCSV';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import UserDetailModal from '../components/UserDetailModal';
import toast from 'react-hot-toast';

const ROWS_PER_PAGE = 10;

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [programmers, setProgrammers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProgrammers, setSelectedProgrammers] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [csvLoading, setCsvLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        // Simple auth check
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin');
            return;
        }
        fetchProgrammers();
    }, [startDate, endDate]);

    const fetchProgrammers = async () => {
        setLoading(true);
        try {
            const data = await apiService.getProgrammers({ startDate, endDate });
            setProgrammers(data);
        } catch (err) {
            console.error('Fetch error:', err);
            toast.error('Failed to fetch data.', {
                style: { background: 'rgba(15,23,42,0.95)', color: '#fff', borderRadius: '12px' },
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin');
    };

    const handleDownloadCSV = () => {
        setCsvLoading(true);
        try {
            generateCSV(filtered);
            toast.success('CSV downloaded!', {
                style: { background: 'rgba(15,23,42,0.95)', color: '#fff', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.3)' },
                iconTheme: { primary: '#3b82f6', secondary: '#fff' },
            });
        } catch (err) {
            toast.error('Failed to generate CSV.');
        } finally {
            setCsvLoading(false);
        }
    };

    const handleDeleteAll = async (password) => {
        setDeleteLoading(true);
        try {
            // 1. Verify password via admin login API (re-authentication)
            const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
            try {
                await apiService.login(adminUser.email, password);
            } catch (authError) {
                toast.error('Invalid password. Deletion cancelled.', {
                    style: { background: 'rgba(15,23,42,0.95)', color: '#fff', borderRadius: '12px' },
                });
                return;
            }

            // 2. Perform Delete
            const itemsToDelete = selectedProgrammers.length > 0
                ? selectedProgrammers
                : filtered.map(p => p._id || p.id);

            if (itemsToDelete.length === 0) {
                toast.error('No records to delete.');
                return;
            }

            if (itemsToDelete.length === 1 && selectedProgrammers.length === 0 && !isFiltered) {
                // If it's a single item (though unlikely in this flow without selection)
                await apiService.deleteProgrammer(itemsToDelete[0]);
            } else {
                await apiService.bulkDelete(itemsToDelete);
            }

            toast.success(`${itemsToDelete.length} records deleted successfully!`, {
                style: { background: 'rgba(15,23,42,0.95)', color: '#fff', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)' },
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
            });

            setShowDeleteModal(false);
            setSelectedProgrammers([]);
            fetchProgrammers();
        } catch (err) {
            console.error('Delete error:', err);
            toast.error(`Deletion failed: ${err.message}`, {
                duration: 6000,
                style: { background: 'rgba(15,23,42,0.95)', color: '#fff', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)' },
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleRowClick = (programmer, e) => {
        if (e.metaKey || e.ctrlKey) {
            // If Ctrl/Cmd is pressed, toggle selection
            setSelectedProgrammers((prev) =>
                prev.includes(programmer.id)
                    ? prev.filter((id) => id !== programmer.id)
                    : [...prev, programmer.id]
            );
        } else {
            // Otherwise, show detail modal
            setSelectedUser(programmer);
            setShowDetailModal(true);
        }
    };

    const isFiltered = !!(search.trim() || startDate || endDate);

    const filtered = useMemo(() => {
        if (!search.trim()) return programmers;
        const q = search.toLowerCase();
        return programmers.filter(
            (p) =>
                p.fullName?.toLowerCase().includes(q) ||
                p.email?.toLowerCase().includes(q) ||
                p.mobile?.includes(q) ||
                p.empId?.toLowerCase().includes(q)
        );
    }, [programmers, search]);

    const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

    const formatDate = (ts) => {
        if (!ts) return '—';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">
                        Admin{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                            Dashboard
                        </span>
                    </h1>
                    <p className="text-white/50 text-sm mt-1">
                        {programmers.length} programmer{programmers.length !== 1 ? 's' : ''} registered
                    </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={fetchProgrammers}
                        className="btn-secondary flex items-center gap-2 text-sm px-4 py-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                    <button
                        onClick={handleDownloadCSV}
                        disabled={csvLoading || programmers.length === 0}
                        className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
                    >
                        {csvLoading ? (
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        )}
                        Download CSV
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        disabled={programmers.length === 0 || loading}
                        className="btn-danger flex items-center gap-2 text-sm px-4 py-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {selectedProgrammers.length > 0 ? `Delete ${selectedProgrammers.length} Selected` : (isFiltered ? 'Delete Filtered' : 'Delete All')}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="btn-secondary flex items-center gap-2 text-sm px-4 py-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="glass-card p-6 mb-6 animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <label className="label mb-1.5 opacity-60">Search</label>
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Name, email, or mobile..."
                                className="input-field pl-10"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="label mb-1.5 opacity-60">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                            className="input-field py-2"
                        />
                    </div>

                    <div>
                        <label className="label mb-1.5 opacity-60">End Date</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                className="input-field py-2"
                            />
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white/80 transition-colors"
                                    title="Reset Filter"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {search && (
                    <p className="text-white/40 text-xs mt-3 ml-1">
                        {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
                    </p>
                )}
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden animate-slide-up">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-white/40 text-sm">Loading data...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="text-5xl">📭</div>
                        <p className="text-white/50 text-sm">
                            {search ? 'No results found.' : 'No programmers registered yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    {['#', 'Company Emp ID', 'Full Name', 'Email', 'Mobile', 'Joining', 'Comm. Skill', 'Night Mtg', 'Available', 'Skills', 'Registered'].map((h) => (
                                        <th key={h} className="text-left px-4 py-3 text-white/50 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((p, idx) => (
                                    <tr
                                        key={p.id}
                                        onClick={(e) => handleRowClick(p, e)}
                                        className={`group border-b border-white/5 bg-white/[0.02] hover:bg-white/[0.08] transition-all duration-200 cursor-pointer ${selectedProgrammers.includes(p.id) ? 'bg-blue-500/10' : ''
                                            }`}>
                                        <td className="px-4 py-3 text-white/30 text-xs">
                                            {(page - 1) * ROWS_PER_PAGE + idx + 1}
                                        </td>
                                        <td className="px-4 py-3 text-blue-400 font-mono text-xs font-bold">{p.empId || '—'}</td>
                                        <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{p.fullName}</td>
                                        <td className="px-4 py-3 text-white/70 whitespace-nowrap">{p.email}</td>
                                        <td className="px-4 py-3 text-white/70 whitespace-nowrap">{p.mobile}</td>
                                        <td className="px-4 py-3 text-white/60 text-xs whitespace-nowrap">{p.joiningDate ? new Date(p.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.communicationSkill === 'Excellent' ? 'bg-emerald-500/20 text-emerald-400' :
                                                p.communicationSkill === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                                                    p.communicationSkill === 'Average' ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-red-500/20 text-red-400'
                                                }`}>
                                                {p.communicationSkill}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.nightMeeting ? 'bg-violet-500/20 text-violet-400' : 'bg-white/10 text-white/40'
                                                }`}>
                                                {p.nightMeeting ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-white/60 text-xs whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] uppercase font-bold text-violet-400 w-8">Mtg:</span>
                                                    {p.nightMeeting
                                                        ? `${p.meetingAvailableFrom || '-'} – ${p.meetingAvailableTo || '-'}`
                                                        : 'No Night Mtg'}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] uppercase font-bold text-emerald-400 w-8">Wrk:</span>
                                                    {p.workAvailableFrom || '-'} – {p.workAvailableTo || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 max-w-xs">
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(p.skills) && p.skills.slice(0, 3).map((s) => (
                                                    <span key={s.name} className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                                                        {s.name} · {s.experience}
                                                    </span>
                                                ))}
                                                {Array.isArray(p.skills) && p.skills.length > 3 && (
                                                    <span className="text-white/30 text-xs px-1">+{p.skills.length - 3} more</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                                            {formatDate(p.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                        <p className="text-white/40 text-xs">
                            Page {page} of {totalPages} · {filtered.length} total
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                ← Prev
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === pageNum
                                            ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white'
                                            : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            <UserDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                user={selectedUser}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onConfirm={handleDeleteAll}
                onCancel={() => setShowDeleteModal(false)}
                loading={deleteLoading}
                count={selectedProgrammers.length > 0 ? selectedProgrammers.length : filtered.length}
                isFiltered={selectedProgrammers.length > 0 || isFiltered}
            />
        </div>
    );
};

export default AdminDashboard;
