import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  zoomLink: { type: String, required: true },
  spreadsheetLink: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'in-progress', 'completed'], default: 'scheduled' },
  participants: [{ type: String }],
  customPrompt: { type: String },
  columnMappings: [{ type: String }],
}, { timestamps: true });

export const Meeting = mongoose.models.Meeting || mongoose.model('Meeting', MeetingSchema);