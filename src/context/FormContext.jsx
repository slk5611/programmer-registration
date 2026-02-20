import { createContext, useContext, useState } from 'react';

const FormContext = createContext(null);

export const useForm = () => {
    const ctx = useContext(FormContext);
    if (!ctx) throw new Error('useForm must be used within FormProvider');
    return ctx;
};

export const FormProvider = ({ children }) => {
    const [basicInfo, setBasicInfo] = useState({
        fullName: '',
        email: '',
        mobile: '',
        empId: '',
        joiningDate: '',
        communicationSkill: 'Good',
        nightMeeting: false,
        meetingAvailableFrom: '09:00',
        meetingAvailableTo: '18:00',
        workAvailableFrom: '09:00',
        workAvailableTo: '18:00',
    });

    const [selectedSkills, setSelectedSkills] = useState([]);
    const [customSkills, setCustomSkills] = useState([]);
    const [experiences, setExperiences] = useState({});
    const [projects, setProjects] = useState([]);

    const clearForm = () => {
        setBasicInfo({
            fullName: '',
            email: '',
            mobile: '',
            empId: '',
            joiningDate: '',
            communicationSkill: 'Good',
            nightMeeting: false,
            meetingAvailableFrom: '09:00',
            meetingAvailableTo: '18:00',
            workAvailableFrom: '09:00',
            workAvailableTo: '18:00',
        });
        setSelectedSkills([]);
        setCustomSkills([]);
        setExperiences({});
        setProjects(['']);
    };

    return (
        <FormContext.Provider value={{
            basicInfo, setBasicInfo,
            selectedSkills,
            setSelectedSkills,
            customSkills,
            setCustomSkills,
            experiences,
            setExperiences,
            projects,
            setProjects,
            clearForm
        }}>
            {children}
        </FormContext.Provider>
    );
};
