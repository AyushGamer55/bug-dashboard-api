const mongoose = require('mongoose')

const bugSchema = new mongoose.Schema({
  ScenarioID: String,
  TestCaseID: String,
  Description: String,
  Status: String,
  Priority: String,
  Severity: String,
  PreCondition: String,
  StepsToExecute: String,
  ExpectedResult: String,
  ActualResult: String,
  Comments: String,
  SuggestionToFix: String
}, { timestamps: true })

module.exports = mongoose.model('Bug', bugSchema)
