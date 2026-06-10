// FEMA IHP estimator questionnaire metadata.
// This file defines the question structure only and does not perform estimation itself.

export const femaEstimatorQuestions = [
  {
    id: "zipCode",
    label: "What is the ZIP code of the damaged home?",
    helperText: "Use the ZIP code where the damaged home is located.",
    type: "text",
  },
  {
    id: "state",
    label: "What state is the damaged home in?",
    helperText: "Use the two-letter state abbreviation if you know it.",
    type: "text",
  },
  {
    id: "county",
    label: "What county is the damaged home in?",
    helperText: "Enter the county for the damaged property.",
    type: "text",
  },
  {
    id: "ownRent",
    label: "Do you own or rent the damaged home?",
    helperText: "This helps match the FEMA housing estimate to the damaged residence.",
    type: "single",
    options: [
      { value: "O", label: "Own" },
      { value: "R", label: "Rent" },
    ],
  },
  {
    id: "grossIncome",
    label: "What is the gross annual household income for the damaged home?",
    helperText: "Choose the income range that best fits the household living there before the disaster.",
    type: "single",
    options: [
      { value: "<$15,000", label: "Less than $15,000" },
      { value: "$15,000-$30,000", label: "$15,000 to $30,000" },
      { value: "$30,001-$60,000", label: "$30,001 to $60,000" },
      { value: "$60,001-$120,000", label: "$60,001 to $120,000" },
      { value: "$120,001-$175,000", label: "$120,001 to $175,000" },
      { value: ">$175,000", label: "More than $175,000" },
    ],
  },
  {
    id: "householdComposition",
    label: "How many people lived in the damaged home?",
    helperText: "Use the household size for the damaged residence before the disaster.",
    type: "single",
    options: [
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5" },
      { value: ">5", label: "More than 5" },
    ],
  },
  {
    id: "homeDamage",
    label: "Was the damaged home itself damaged?",
    helperText: "Select yes if the structure or living space of the home was damaged by the disaster.",
    type: "single",
    options: [
      { value: true, label: "Yes" },
      { value: false, label: "No" },
    ],
  },
  {
    id: "floodDamage",
    label: "Was the damaged home damaged by flooding?",
    helperText: "Select yes if floodwater caused damage to the home.",
    type: "single",
    options: [
      { value: true, label: "Yes" },
      { value: false, label: "No" },
    ],
  },
]

export default femaEstimatorQuestions
