const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    ScenarioID: { type: String, index: true },
    Category: String,
    Description: String,
    Status: String,
    Priority: String,
    Severity: String,
    PreCondition: String,
    StepsToExecute: { type: [String], default: [] },
    ExpectedResult: String,
    ActualResult: String,
    Comments: String,
    SuggestionToFix: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

bugSchema.set('autoIndex', true);

bugSchema.index(
  { deviceId: 1, ScenarioID: 1, createdBy: 1 },
  {
    unique: true,
    partialFilterExpression: { ScenarioID: { $exists: true, $type: 'string' } }
  }
);

module.exports = mongoose.model('Bug', bugSchema);
