import Papa from 'papaparse';

export const generateCSV = (programmers) => {
    // 1. Find max projects count
    const maxProjects = programmers.reduce((max, p) => {
        return Math.max(max, Array.isArray(p.projects) ? p.projects.length : 0);
    }, 0);

    const rows = programmers.map((p) => {
        const row = {
            'Company Emp ID': p.empId || '',
            'Full Name': p.fullName || '',
            'Email': p.email || '',
            'Mobile': p.mobile || '',
            'Joining Date': p.joiningDate || '',
            'Communication Skill': p.communicationSkill || '',
            'Night Meeting': p.nightMeeting ? 'Yes' : 'No',
            'Meeting Available From': p.meetingAvailableFrom || '',
            'Meeting Available To': p.meetingAvailableTo || '',
            'Work Available From': p.workAvailableFrom || '',
            'Work Available To': p.workAvailableTo || '',
            'Skills': Array.isArray(p.skills)
                ? p.skills.map((s) => `${s.name} - ${s.experience}`).join(' | ')
                : '',
        };

        // 2. Add dynamic project columns
        for (let i = 0; i < maxProjects; i++) {
            row[`Project ${i + 1}`] = (p.projects && p.projects[i]) || '';
        }

        // 3. Add registration date at the end
        row['Registration Date'] = p.createdAt
            ? (p.createdAt.toDate ? p.createdAt.toDate().toLocaleString() : new Date(p.createdAt).toLocaleString())
            : '—';

        return row;
    });

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'programmers_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
