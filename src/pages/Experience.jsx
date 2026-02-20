import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useForm } from '../context/FormContext';
import ProgressIndicator from '../components/ProgressIndicator';
import ConfirmModal from '../components/ConfirmModal';
import DuplicateModal from '../components/DuplicateModal';
import toast from 'react-hot-toast';

const PROFICIENCY_LEVELS = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert',
    'Specialists'
];

const Experience = () => {
    const navigate = useNavigate();
    const { basicInfo, selectedSkills, customSkills, experiences, setExperiences, projects, setProjects, clearForm } = useForm();
    const allSkills = [...selectedSkills, ...customSkills];
    const [errors, setErrors] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [duplicateInfo, setDuplicateInfo] = useState(null);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);

    // Initialize experiences for all selected skills if missing
    useEffect(() => {
        const missingSkills = selectedSkills.filter(skill => experiences[skill] === undefined);
        if (missingSkills.length > 0) {
            setExperiences(prev => ({
                ...Object.fromEntries(selectedSkills.map(s => [s, ''])),
                ...prev
            }));
        }
    }, [selectedSkills, setExperiences]);

    // Redirect if no skills selected
    if (selectedSkills.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card p-10 max-w-md w-full text-center">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-white mb-3">No Skills Selected</h2>
                    <p className="text-white/60 mb-6 text-sm">Please go back and select at least one skill.</p>
                    <button onClick={() => navigate('/')} className="btn-primary w-full">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const handleExpChange = (skill, value) => {
        setExperiences((prev) => ({ ...prev, [skill]: value }));
        if (errors[skill]) setErrors((prev) => ({ ...prev, [skill]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        selectedSkills.forEach((skill) => {
            const val = experiences[skill];
            if (!val || val === '' || val === null || val === undefined) {
                newErrors[skill] = 'Required';
            }
        });
        return newErrors;
    };

    const handleAddProject = () => {
        if (projects.length < 10) {
            setProjects((prev) => [...prev, '']);
        }
    };

    const handleProjectChange = (idx, value) => {
        const newProjects = [...projects];
        newProjects[idx] = value;
        setProjects(newProjects);
    };

    const handleRemoveProject = (idx) => {
        setProjects((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSubmitClick = () => {
        if (allSkills.length === 0) {
            toast.error('No skills selected.');
            navigate('/');
            return;
        }

        const newErrors = {};
        allSkills.forEach((skill) => {
            const val = experiences[skill];
            if (!val || val === '') {
                newErrors[skill] = 'Proficiency level is required';
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setShowModal(true);
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            const emailToSearch = basicInfo.email.trim().toLowerCase();
            const mobileToSearch = basicInfo.mobile.trim();
            const empIdToSearch = basicInfo.empId.trim();

            // Final safety check for duplicates
            const result = await apiService.checkDuplicate({
                email: emailToSearch,
                mobile: mobileToSearch,
                empId: empIdToSearch
            });

            if (result.exists) {
                setDuplicateInfo({ field: result.field, value: result.value });
                setShowModal(false);
                setLoading(false);
                setShowDuplicateModal(true);
                return;
            }

            const skillsArray = allSkills.map((name) => ({
                name,
                experience: experiences[name],
            }));

            await apiService.registerProgrammer({
                fullName: basicInfo.fullName,
                email: emailToSearch,
                mobile: mobileToSearch,
                empId: basicInfo.empId,
                joiningDate: basicInfo.joiningDate,
                communicationSkill: basicInfo.communicationSkill,
                nightMeeting: basicInfo.nightMeeting,
                meetingAvailableFrom: basicInfo.nightMeeting ? basicInfo.meetingAvailableFrom : '',
                meetingAvailableTo: basicInfo.nightMeeting ? basicInfo.meetingAvailableTo : '',
                workAvailableFrom: basicInfo.workAvailableFrom,
                workAvailableTo: basicInfo.workAvailableTo,
                skills: skillsArray,
                projects: projects.filter(p => p.trim() !== ''),
            });

            toast.success('Registration submitted successfully! 🎉', {
                duration: 4000,
                style: {
                    background: 'rgba(15,23,42,0.95)',
                    color: '#fff',
                    border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                },
                iconTheme: { primary: '#3b82f6', secondary: '#fff' },
            });

            clearForm();
            navigate('/');
        } catch (err) {
            console.error('Submission error:', err);
            toast.error(err.message || 'Failed to submit. Please try again.', {
                duration: 6000,
                style: {
                    background: 'rgba(15,23,42,0.95)',
                    color: '#fff',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '12px',
                },
            });
        } finally {
            setLoading(false);
            setShowModal(false);
        }
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-violet-400 text-sm font-medium mb-4">
                        <span>⚡</span> Step 2 of 2
                    </div>
                    <h1 className="text-3xl font-extrabold text-white mb-2">
                        Your{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                            Experience
                        </span>
                    </h1>
                    <p className="text-white/50 text-sm">Select proficiency level for each selected skill</p>
                </div>

                <ProgressIndicator currentStep={2} />

                <div className="glass-card p-6 animate-slide-up">
                    <div className="flex items-center justify-between mb-5">
                        <div className="section-header mb-0">
                            <span className="w-1 h-4 bg-violet-500 rounded-full" />
                            Skill Experience
                        </div>
                        <span className="text-white/40 text-xs">{allSkills.length} skills</span>
                    </div>

                    <div className="space-y-3">
                        {allSkills.map((skill, idx) => (
                            <div
                                key={skill}
                                className="flex items-center gap-4 glass-card-light p-4 group hover:bg-white/10 transition-colors duration-150"
                            >
                                <span className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
                                    {idx + 1}
                                </span>
                                <span className="flex-1 text-white font-medium text-sm">{skill}</span>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={experiences[skill]}
                                            onChange={(e) => handleExpChange(skill, e.target.value)}
                                            className={`w-40 bg-white/10 border rounded-lg px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${errors[skill]
                                                ? 'border-red-500/50 focus:ring-red-500/30'
                                                : 'border-white/20 focus:ring-blue-500/30 focus:border-blue-500/50'
                                                }`}
                                        >
                                            <option value="" className="bg-slate-900">Select Level</option>
                                            {PROFICIENCY_LEVELS.map(level => (
                                                <option key={level} value={level} className="bg-slate-900">
                                                    {level}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors[skill] && (
                                        <p className="text-red-400 text-xs">{errors[skill]}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Key Projects Section */}
                    <div className="mt-8 pt-8 border-t border-white/10">
                        <div className="flex items-center justify-between mb-5">
                            <div className="section-header mb-0">
                                <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                                Key Projects (Optional)
                            </div>
                            <span className="text-white/40 text-xs">{projects.length}/10</span>
                        </div>

                        <div className="space-y-4">
                            {projects.map((project, idx) => (
                                <div key={idx} className="animate-slide-up">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                                            Project {idx + 1}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveProject(idx)}
                                            className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <textarea
                                        value={project}
                                        onChange={(e) => handleProjectChange(idx, e.target.value)}
                                        placeholder="Describe the project objective, technologies used, and your role..."
                                        className="input-field min-h-[100px] py-3 text-sm resize-none"
                                    />
                                </div>
                            ))}

                            {projects.length < 10 && (
                                <button
                                    type="button"
                                    onClick={handleAddProject}
                                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-white/10 rounded-2xl text-white/40 hover:text-white/70 hover:border-white/20 hover:bg-white/5 transition-all duration-200 group"
                                >
                                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="text-sm font-medium">Add {projects.length === 0 ? 'a Project' : 'More Project'}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
                        <button
                            onClick={() => navigate('/')}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                        <button onClick={handleSubmitClick} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Submit Registration
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showModal}
                onConfirm={handleFinalSubmit}
                onCancel={() => setShowModal(false)}
                loading={loading}
            />

            <DuplicateModal
                isOpen={showDuplicateModal}
                onClose={() => setShowDuplicateModal(false)}
                info={duplicateInfo}
            />
        </div>
    );
};

export default Experience;
