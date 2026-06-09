export const homeQuestions = [
  {
    id: "homeType",
    section: "Home Structure & Environment",
    category: "Structure",
    question: "What type of home do you live in?",
    type: "single",
    options: ["Single-family", "Condo/apartment", "Townhouse", "Mobile home", "Dorm"],
    whyItMatters: "Determines the structural vulnerability profile.",
  },
  {
    id: "ownershipStatus",
    section: "Home Structure & Environment",
    category: "Ownership",
    question: "Do you own or rent?",
    type: "single",
    options: ["Own", "Rent"],
    whyItMatters:
      "Affects which documents and aid types apply. Renters need renter's insurance and lease documentation rather than homeowner's insurance or property ownership documents.",
  },
  {
    id: "basementOrCrawlSpace",
    section: "Home Structure & Environment",
    category: "Flood",
    question: "Does your home have a basement or crawl space?",
    type: "single",
    options: ["Yes – finished", "Yes – unfinished", "No"],
    whyItMatters:
      "Basements and crawl spaces are highly vulnerable to flood damage and can strongly affect flood preparedness needs.",
  },
  {
    id: "homeAge",
    section: "Home Structure & Environment",
    category: "Structure",
    question: "How old is your home?",
    type: "single",
    options: ["Before 1980", "1980–2000", "2000–2015", "After 2015"],
    whyItMatters:
      "Older homes may lack modern wind, flood, seismic, or energy-efficiency standards. Pre-1980 homes may also have lead or asbestos concerns after damage.",
  },
  {
    id: "roofMaterial",
    section: "Home Structure & Environment",
    category: "Storm/Wildfire",
    question: "What is your roof material?",
    type: "single",
    options: ["Asphalt shingle", "Metal", "Tile", "Flat/membrane", "Unknown"],
    whyItMatters:
      "Roof material affects vulnerability to wind uplift, storm damage, and wildfire embers. Metal and tile generally resist embers better than asphalt shingles.",
  },
  {
    id: "windowDoorProtection",
    section: "Home Structure & Environment",
    category: "Storm",
    question: "Are your windows/doors reinforced?",
    type: "single",
    options: ["Hurricane shutters", "Impact-resistant glass", "Standard", "Unsure"],
    whyItMatters:
      "Window and door reinforcement is a direct factor in storm and wind damage risk.",
  },
  {
    id: "pavedSurfaceLevel",
    section: "Home Structure & Environment",
    category: "Flood",
    question: "How much of your yard/driveway is paved with concrete or asphalt?",
    type: "single",
    options: ["Most of it", "About half", "Mostly grass or gravel", "None"],
    whyItMatters:
      "High impervious surface coverage increases stormwater runoff and can increase flood risk around the home.",
  },
  {
    id: "waterPooling",
    section: "Home Structure & Environment",
    category: "Flood",
    question: "Does water pool around your home during heavy rain?",
    type: "single",
    options: ["Yes, significantly", "A little", "No"],
    whyItMatters:
      "Water pooling is a direct indicator of drainage problems and is one of the strongest signals of flood vulnerability.",
  },
  {
    id: "dryBrushDistance",
    section: "Home Structure & Environment",
    category: "Wildfire",
    question: "How close is dry brush, tall grass, or dense shrubs to your home?",
    type: "single",
    options: ["Within 0–30 ft", "30–100 ft", "More than 100 ft", "Not applicable"],
    whyItMatters:
      "Dry vegetation close to the home increases wildfire ignition risk. Within 0–30 ft is the most urgent defensible-space zone.",
  },
  {
    id: "areaDensity",
    section: "Home Structure & Environment",
    category: "Environment",
    question: "Is your home in a dense urban area or more isolated/suburban?",
    type: "single",
    options: ["Dense urban", "Suburban", "Rural", "Wildland-urban interface (WUI)"],
    whyItMatters:
      "Wildland-urban interface areas have elevated wildfire risk, while dense urban areas may have greater urban heat island and flood exposure.",
  },
  {
    id: "ecoFeatures",
    section: "Eco-Mitigation Status",
    category: "Eco-Mitigation",
    question: "Does your property have any of the following?",
    type: "multi",
    options: [
      "Rain garden",
      "Rain barrel",
      "Permeable driveway",
      "Native plants",
      "Green/cool roof",
      "None of these",
    ],
    whyItMatters:
      "These features directly map to green infrastructure and eco-mitigation strategies. Each existing feature can give readiness score credit.",
  },
  {
    id: "largeTreesNearby",
    section: "Eco-Mitigation Status",
    category: "Storm/Heat",
    question: "Are there large trees near your home?",
    type: "single",
    options: ["Yes, within 15 ft", "Yes, farther away", "No"],
    whyItMatters:
      "Large trees very close to a home may increase storm or wind damage risk. Trees farther away can provide shade, cooling, and windbreak benefits.",
  },
  {
    id: "energyOrDrainageAudit",
    section: "Eco-Mitigation Status",
    category: "Preparedness",
    question: "Have you had a home energy or drainage audit?",
    type: "single",
    options: ["Yes", "No", "Not sure"],
    whyItMatters:
      "A home energy or drainage audit indicates stronger preparedness awareness and can reveal practical mitigation opportunities.",
  },
  {
    id: "insurancePolicy",
    section: "Recovery Preparedness & Documents",
    category: "Insurance",
    question: "Do you have a current homeowner's or renter's insurance policy?",
    type: "single",
    options: ["Yes, homeowner's", "Yes, renter's", "No", "Unsure"],
    whyItMatters:
      "Insurance status affects disaster recovery options and determines whether the user may need homeowner, renter, or alternative documentation guidance.",
  },
  {
    id: "knowsPolicyCoverage",
    section: "Recovery Preparedness & Documents",
    category: "Insurance",
    question: "Do you know what your policy covers?",
    type: "single",
    options: ["Yes", "Partially", "No"],
    whyItMatters:
      "Many people discover after a disaster that standard homeowner's insurance may not cover flood damage. This question flags that preparedness gap.",
  },
  {
    id: "digitalDocuments",
    section: "Recovery Preparedness & Documents",
    category: "Documents",
    question: "Do you have digital copies of these documents?",
    type: "multi",
    options: [
      "Insurance policy",
      "Government-issued ID",
      "Proof of address",
      "Property deed or lease",
      "Medical records",
      "None",
    ],
    whyItMatters:
      "These documents are commonly needed after disasters for insurance, aid, identity verification, proof of occupancy, and household recovery.",
  },
  {
    id: "preDisasterPhotos",
    section: "Recovery Preparedness & Documents",
    category: "Documentation",
    question: "Do you have pre-disaster photos or video of your home's interior and exterior?",
    type: "single",
    options: ["Yes", "No"],
    whyItMatters:
      "Pre-disaster photos or videos help document the previous condition of the home and can support damage claims or recovery applications.",
  },
  {
    id: "emergencyKit",
    section: "Recovery Preparedness & Documents",
    category: "Emergency Preparedness",
    question: "Do you have a household emergency kit?",
    type: "single",
    options: ["Yes, fully stocked", "Partial", "No"],
    whyItMatters:
      "A household emergency kit is a core preparedness measure for disasters, evacuations, outages, and delayed emergency response.",
  },
  {
    id: "familyEmergencyPlan",
    section: "Recovery Preparedness & Documents",
    category: "Emergency Preparedness",
    question:
      "Do you have a family emergency plan, including a meeting point, out-of-state contact, and evacuation route?",
    type: "single",
    options: ["Yes", "No"],
    whyItMatters:
      "A family emergency plan improves household readiness and helps people respond more quickly during evacuation or communication disruptions.",
  },
  {
    id: "localEmergencyRegistration",
    section: "Recovery Preparedness & Documents",
    category: "Emergency Preparedness",
    question: "Have you registered with your local emergency management office?",
    type: "single",
    options: ["Yes", "No", "Didn't know this was possible"],
    whyItMatters:
      "Local emergency registration can help emergency responders identify households with special needs or priority support requirements.",
  },
];
