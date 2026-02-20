const SkillChip = ({ skill, selected, onToggle }) => (
    <button
        type="button"
        onClick={() => onToggle(skill)}
        className={`skill-chip ${selected ? 'skill-chip-selected' : 'skill-chip-unselected'}`}
    >
        {selected && (
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
        )}
        {skill}
    </button>
);

export default SkillChip;
