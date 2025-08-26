const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema(
  {
    ScenarioID: { type: String },
    TestCaseID: { type: String },
    Description: { type: String },
    Status: { type: String },             
    Priority: { type: String },           
    Severity: { type: String },           
    PreCondition: { type: String },       
    StepsToExecute: { type: String },     
    ExpectedResult: { type: String },     
    ActualResult: { type: String },       
    Comments: { type: String },          
    SuggestionToFix: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bug', bugSchema);
