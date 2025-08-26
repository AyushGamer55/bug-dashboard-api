const mongoose = require('mongoose')

const bugSchema = new mongoose.Schema({
  ScenarioID: { type: String, required: true },
  TestCaseID: { type: String, required: true },
  Description: { type: String, required: true },
  Status: { type: String, required: true },
  Priority: { type: String, required: true },
  Severity: { type: String, required: true },
  PreCondition: { type: String },
  StepsToExecute: { type: [String] }, 
  ExpectedResult: { type: String },
  ActualResult: { type: String },
  Comments: { type: String },
  SuggestionToFix: { type: String }
}, { timestamps: true })

module.exports = mongoose.model('Bug', bugSchema)
