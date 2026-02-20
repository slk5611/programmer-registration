import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../context/FormContext';
import ProgressIndicator from '../components/ProgressIndicator';
import SkillChip from '../components/SkillChip';
import { SKILL_CATEGORIES } from '../utils/skillsData';
import { apiService } from '../services/api';
import DuplicateModal from '../components/DuplicateModal';
import toast from 'react-hot-toast';

const COMM_SKILLS = ['Excellent', 'Good', 'Average', 'Poor'];

const Home = () => {
    const navigate = useNavigate();
    const { basicInfo, setBasicInfo, selectedSkills, setSelectedSkills, customSkills, setCustomSkills } = useForm();
    const [errors, setErrors] = useState({});
    const [inputValue, setInputValue] = useState('');
    const [checkingDuplicate, setCheckingDuplicate] = useState(false);
    const [duplicateInfo, setDuplicateInfo] = useState(null);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setBasicInfo((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const toggleSkill = (skill) => {
        setSelectedSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = inputValue.trim().replace(/,$/, '');
            if (tag && !customSkills.includes(tag) && !selectedSkills.includes(tag)) {
                setCustomSkills(prev => [...prev, tag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove) => {
        setCustomSkills(prev => prev.filter(tag => tag !== tagToRemove));
    };

    const validate = () => {
        const newErrors = {};
        if (!basicInfo.fullName.trim()) newErrors.fullName = 'Full Name is required';
        if (!basicInfo.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfo.email)) newErrors.email = 'Enter a valid email address';
        if (!basicInfo.mobile.trim()) newErrors.mobile = 'Mobile number is required';
        else if (!/^\+?[\d\s\-()]{7,15}$/.test(basicInfo.mobile)) newErrors.mobile = 'Enter a valid mobile number';
        if (!basicInfo.empId.trim()) newErrors.empId = 'Employee ID is required';
        if (!basicInfo.joiningDate) {
            newErrors.joiningDate = 'Joining Date is required';
        } else {
            const selectedDate = new Date(basicInfo.joiningDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                newErrors.joiningDate = 'Joining Date cannot be in the future';
            }
        }
        if (selectedSkills.length === 0) newErrors.skills = 'Please select at least one skill';

        // Meeting Availability Validation (if toggle is on)
        if (basicInfo.nightMeeting) {
            if (!basicInfo.meetingAvailableFrom || !basicInfo.meetingAvailableTo) {
                newErrors.meetingAvailability = 'Meeting availability times are required';
            }
        }

        // Work Availability Validation (6-hour gap)
        const from = basicInfo.workAvailableFrom;
        const to = basicInfo.workAvailableTo;
        if (from && to) {
            const [h1, m1] = from.split(':').map(Number);
            const [h2, m2] = to.split(':').map(Number);
            const startMinutes = h1 * 60 + m1;
            const endMinutes = h2 * 60 + m2;

            if (endMinutes <= startMinutes) {
                newErrors.workAvailability = 'End time must be after start time';
            } else if (endMinutes - startMinutes < 360) { // 360 minutes = 6 hours
                newErrors.workAvailability = 'Work availability must be at least 6 hours';
            }
        }

        return newErrors;
    };

    const handleNext = async () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const firstError = document.querySelector('.error-field');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setCheckingDuplicate(true);
        try {
            const emailToSearch = basicInfo.email.trim().toLowerCase();
            const mobileToSearch = basicInfo.mobile.trim();
            const empIdToSearch = basicInfo.empId.trim();

            const result = await apiService.checkDuplicate({
                email: emailToSearch,
                mobile: mobileToSearch,
                empId: empIdToSearch
            });

            if (result.exists) {
                setDuplicateInfo({ field: result.field, value: result.value });
                setShowDuplicateModal(true);
                return;
            }

            // If no duplicates found, navigate
            navigate('/experience');
        } catch (error) {
            console.error('Error checking duplicates:', error);
            toast.error(`Verification failed: ${error.message || 'Please check your connection.'}`, {
                style: { background: 'rgba(15,23,42,0.95)', color: '#fff', borderRadius: '12px' },
                duration: 5000
            });
        } finally {
            setCheckingDuplicate(false);
        }
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <p className="text-white/50 text-base">Tell us about yourself and your technical expertise</p>
                </div>

                <ProgressIndicator currentStep={1} />

                <div className="space-y-6 animate-slide-up">
                    {/* Basic Information */}
                    <div className="glass-card p-6">
                        <div className="section-header">
                            <span className="w-1 h-4 bg-blue-500 rounded-full" />
                            Basic Information
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Full Name */}
                                <div className={errors.fullName ? 'error-field' : ''}>
                                    <label className="label">Full Name <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={basicInfo.fullName}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className={`input-field ${errors.fullName ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                                    />
                                    {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                                </div>

                                {/* Email */}
                                <div className={errors.email ? 'error-field' : ''}>
                                    <label className="label">Email Address <span className="text-red-400">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={basicInfo.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        className={`input-field ${errors.email ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                                    />
                                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Mobile */}
                                <div className={errors.mobile ? 'error-field' : ''}>
                                    <label className="label">Mobile Number <span className="text-red-400">*</span></label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={basicInfo.mobile}
                                        onChange={handleChange}
                                        placeholder="+1 234 567 8900"
                                        className={`input-field ${errors.mobile ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                                    />
                                    {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>}
                                </div>

                                {/* Company Emp Id */}
                                <div className={errors.empId ? 'error-field' : ''}>
                                    <label className="label">Company Emp ID <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        name="empId"
                                        value={basicInfo.empId}
                                        onChange={handleChange}
                                        placeholder="001"
                                        className={`input-field ${errors.empId ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                                    />
                                    {errors.empId && <p className="text-red-400 text-xs mt-1">{errors.empId}</p>}
                                </div>

                                {/* Joining Date */}
                                <div className={errors.joiningDate ? 'error-field' : ''}>
                                    <label className="label">Joining Date <span className="text-red-400">*</span></label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={basicInfo.joiningDate}
                                        onChange={handleChange}
                                        max={new Date().toISOString().split('T')[0]}
                                        className={`input-field ${errors.joiningDate ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                                    />
                                    {errors.joiningDate && <p className="text-red-400 text-xs mt-1">{errors.joiningDate}</p>}
                                </div>
                            </div>

                            {/* Communication Skill */}
                            <div>
                                <label className="label">Communication Skill</label>
                                <div className="flex gap-2 flex-wrap">
                                    {COMM_SKILLS.map((skill) => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => setBasicInfo((prev) => ({ ...prev, communicationSkill: skill }))}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${basicInfo.communicationSkill === skill
                                                ? 'bg-gradient-to-r from-blue-600 to-violet-600 border-transparent text-white shadow-md'
                                                : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Preferences & Availability for meeting */}
                        <div className="mt-5 pt-5 border-t border-white/10">
                            <div className="section-header">
                                <span className="w-1 h-4 bg-violet-500 rounded-full" />
                                Preferences & Availability for meeting
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Night Meeting Toggle */}
                                <div>
                                    <label className="label">Available for Night Meeting</label>
                                    <button
                                        type="button"
                                        onClick={() => setBasicInfo((prev) => ({ ...prev, nightMeeting: !prev.nightMeeting }))}
                                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none ${basicInfo.nightMeeting ? 'bg-gradient-to-r from-blue-600 to-violet-600' : 'bg-white/10'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${basicInfo.nightMeeting ? 'translate-x-8' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                    <span className="ml-3 text-sm text-white/60">
                                        {basicInfo.nightMeeting ? 'Yes' : 'No'}
                                    </span>
                                </div>

                                {/* Available From */}
                                <div className={errors.meetingAvailability ? 'error-field' : ''}>
                                    <label className="label">Available From</label>
                                    <input
                                        type="time"
                                        name="meetingAvailableFrom"
                                        value={basicInfo.meetingAvailableFrom}
                                        onChange={handleChange}
                                        disabled={!basicInfo.nightMeeting}
                                        className={`input-field ${!basicInfo.nightMeeting ? 'opacity-50 cursor-not-allowed' : ''} ${errors.meetingAvailability ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                                    />
                                </div>

                                {/* Available To */}
                                <div className={errors.meetingAvailability ? 'error-field' : ''}>
                                    <label className="label">Available To</label>
                                    <input
                                        type="time"
                                        name="meetingAvailableTo"
                                        value={basicInfo.meetingAvailableTo}
                                        onChange={handleChange}
                                        disabled={!basicInfo.nightMeeting}
                                        className={`input-field ${!basicInfo.nightMeeting ? 'opacity-50 cursor-not-allowed' : ''} ${errors.meetingAvailability ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                                    />
                                </div>
                            </div>
                            {errors.meetingAvailability && (
                                <p className="text-red-400 text-xs mt-2 flex items-center gap-1 animate-fade-in">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {errors.meetingAvailability}
                                </p>
                            )}
                        </div>

                        {/* Preferences & Availability for work */}
                        <div className="mt-5 pt-5 border-t border-white/10">
                            <div className="section-header">
                                <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                                Preferences & Availability for work
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Work Available From */}
                                <div className={errors.workAvailability ? 'error-field' : ''}>
                                    <label className="label">Available From</label>
                                    <input
                                        type="time"
                                        name="workAvailableFrom"
                                        value={basicInfo.workAvailableFrom}
                                        onChange={handleChange}
                                        className={`input-field ${errors.workAvailability ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                                    />
                                </div>

                                {/* Work Available To */}
                                <div className={errors.workAvailability ? 'error-field' : ''}>
                                    <label className="label">Available To</label>
                                    <input
                                        type="time"
                                        name="workAvailableTo"
                                        value={basicInfo.workAvailableTo}
                                        onChange={handleChange}
                                        className={`input-field ${errors.workAvailability ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                                    />
                                </div>
                            </div>
                            {errors.workAvailability && (
                                <p className="text-red-400 text-xs mt-2 flex items-center gap-1 animate-fade-in">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {errors.workAvailability}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Technical Skills */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="section-header mb-0">
                                <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                                Technical Skills
                            </div>
                            {selectedSkills.length > 0 && (
                                <span className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/30">
                                    {selectedSkills.length} selected
                                </span>
                            )}
                        </div>

                        {errors.skills && (
                            <div className="mb-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {errors.skills}
                            </div>
                        )}

                        <div className="space-y-5">
                            {SKILL_CATEGORIES.map((category) => (
                                <div key={category.name} className="glass-card-light p-4">
                                    <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                                        <span>{category.emoji}</span>
                                        {category.name}
                                        <span className="text-white/30 text-xs font-normal">
                                            ({category.skills.filter((s) => selectedSkills.includes(s)).length}/{category.skills.length})
                                        </span>
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {category.skills.map((skill) => (
                                            <SkillChip
                                                key={skill}
                                                skill={skill}
                                                selected={selectedSkills.includes(skill)}
                                                onToggle={toggleSkill}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Custom Skills Section */}
                            <div className="glass-card-light p-4 mt-4 border-t border-white/5">
                                <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-3 bg-blue-500 rounded-full" />
                                    Other Skills (Tags)
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {customSkills.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/30 flex items-center gap-2 animate-fade-in"
                                            >
                                                {tag}
                                                <button
                                                    onClick={() => removeTag(tag)}
                                                    className="hover:text-red-400 transition-colors text-lg line-height-1"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        placeholder="Type a skill and press Enter or comma..."
                                        className="input-field w-full text-sm py-2"
                                    />
                                    <p className="text-white/30 text-[10px] italic">
                                        (e.g., GraphQL, Redis, AWS Lambda, etc.)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next Button */}
                    <div className="flex justify-end pb-8">
                        <button
                            onClick={handleNext}
                            disabled={checkingDuplicate}
                            className={`btn-primary flex items-center gap-2 px-8 ${checkingDuplicate ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {checkingDuplicate ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Checking...
                                </>
                            ) : (
                                <>
                                    Next Step
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <DuplicateModal
                isOpen={showDuplicateModal}
                onClose={() => setShowDuplicateModal(false)}
                info={duplicateInfo}
            />
        </div>
    );
};

export default Home;
