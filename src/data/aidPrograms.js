export const aidPrograms = [
  {
    id: "fema-individual-assistance",
    agency: "FEMA",
    name: "FEMA Individual Assistance Program",
    disasterTypes: ["Flood", "Storm", "Wildfire", "Earthquake"],
    eligibilityTags: [
      "home-damage",
      "temporary-housing",
      "uninsured-loss",
      "urgent-need",
      "primary-residence",
    ],
    estimatedAmount: "Varies by verified need",
    applicationWindowDays: 60,
    description:
      "Mock program entry for MVP demonstration. Represents potential support for essential needs, temporary housing, and uninsured disaster-related losses.",
  },
  {
    id: "sba-home-disaster-loan",
    agency: "SBA",
    name: "SBA Home Disaster Loan",
    disasterTypes: ["Flood", "Storm", "Wildfire", "Earthquake"],
    eligibilityTags: [
      "home-damage",
      "repair-needed",
      "property-owner",
      "primary-residence",
    ],
    estimatedAmount: "Loan amount varies",
    applicationWindowDays: 90,
    description:
      "Mock program entry for MVP demonstration. Represents a loan-style recovery option for eligible homeowners repairing or replacing damaged property.",
  },
  {
    id: "state-emergency-relief-grant",
    agency: "State Emergency Management Office",
    name: "State Emergency Relief Grant",
    disasterTypes: ["Flood", "Storm", "Extreme Heat", "Wildfire"],
    eligibilityTags: [
      "temporary-housing",
      "urgent-need",
      "low-income",
      "uninsured-loss",
    ],
    estimatedAmount: "$500-$5,000",
    applicationWindowDays: 45,
    description:
      "Mock program entry for MVP demonstration. Represents short-term state relief for urgent household needs after a declared emergency.",
  },
  {
    id: "local-housing-repair-support",
    agency: "Local Housing Department",
    name: "Local Housing Repair Support",
    disasterTypes: ["Flood", "Storm", "Winter Storm", "Wildfire"],
    eligibilityTags: [
      "home-damage",
      "repair-needed",
      "low-income",
      "primary-residence",
    ],
    estimatedAmount: "$1,000-$10,000",
    applicationWindowDays: 120,
    description:
      "Mock program entry for MVP demonstration. Represents local repair support for households needing basic habitability repairs.",
  },
  {
    id: "temporary-housing-stabilization",
    agency: "Community Recovery Partnership",
    name: "Temporary Housing Stabilization",
    disasterTypes: ["Flood", "Storm", "Wildfire"],
    eligibilityTags: [
      "temporary-housing",
      "urgent-need",
      "uninsured-loss",
      "low-income",
    ],
    estimatedAmount: "$250-$2,500",
    applicationWindowDays: 30,
    description:
      "Mock program entry for MVP demonstration. Represents bridge support for short-term lodging, deposits, or essential relocation costs.",
  },
];
