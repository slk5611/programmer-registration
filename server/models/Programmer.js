import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    experience: { type: String, required: true }
});

const ProgrammerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String, required: true, unique: true },
    empId: { type: String, required: true, unique: true },
    joiningDate: { type: Date, required: true },
    communicationSkill: { type: String, required: true },
    nightMeeting: { type: Boolean, default: false },
    meetingAvailableFrom: { type: String },
    meetingAvailableTo: { type: String },
    workAvailableFrom: { type: String, required: true },
    workAvailableTo: { type: String, required: true },
    skills: [SkillSchema],
    projects: [String],
    createdAt: { type: Date, default: Date.now }
});

const Programmer = mongoose.model('Programmer', ProgrammerSchema);

export default Programmer;
