// Mock action-plan data for MVP testing.
// Estimated costs and score increases are rule-based estimates, not official values.
// scoreIncrease is a legacy fallback; category-based recommendation logic should prefer affects.

export const ecoSolutions = [
  {
    id: "rainGarden",
    title: "Install a Rain Garden",
    category: "Flood & Stormwater",
    disasterTypes: ["Flood", "Stormwater"],
    description:
      "Capture runoff from roofs and driveways so water soaks into soil before reaching the foundation.",
    ecoBenefit:
      "Reduces stormwater runoff while supporting native plants and pollinators.",
    estimatedCost: "$200–800",
    costLevel: "Medium",
    impactLevel: "High",
    scoreIncrease: 8,
    affects: {
      homeVulnerability: 8,
      ecoMitigation: 6,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Water pooling near the home increases flood and foundation risk.",
      "High paved surface coverage can worsen stormwater runoff.",
      "Few existing eco-mitigation features were reported.",
    ],
  },
  {
    id: "bioswale",
    title: "Install a Bioswale",
    category: "Flood & Stormwater",
    disasterTypes: ["Flood", "Stormwater"],
    description:
      "Use a planted channel to slow and direct stormwater along property edges.",
    ecoBenefit:
      "Filters runoff, reduces erosion, and helps water infiltrate naturally.",
    estimatedCost: "$300–1,200",
    costLevel: "High",
    impactLevel: "High",
    scoreIncrease: 7,
    affects: {
      homeVulnerability: 7,
      ecoMitigation: 7,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Water pooling near the home increases flood and foundation risk.",
      "High paved surface coverage can worsen stormwater runoff.",
      "Few existing eco-mitigation features were reported.",
    ],
  },
  {
    id: "downspoutRedirection",
    title: "Redirect Downspouts",
    category: "Flood & Stormwater",
    disasterTypes: ["Flood", "Stormwater"],
    description:
      "Move roof drainage at least 6 feet away from the home to reduce basement seepage.",
    ecoBenefit:
      "Keeps rainwater out of vulnerable areas and directs it toward safer infiltration zones.",
    estimatedCost: "$10–30",
    costLevel: "Low",
    impactLevel: "Medium",
    scoreIncrease: 6,
    affects: {
      homeVulnerability: 6,
      ecoMitigation: 4,
    },
    priority: "now",
    relatedWeaknesses: [
      "Water pooling near the home increases flood and foundation risk.",
      "Basement or crawl space may increase flood vulnerability.",
      "Few existing eco-mitigation features were reported.",
    ],
  },
  {
    id: "downspoutExtensions",
    title: "Add Downspout Extensions",
    category: "Flood & Stormwater",
    disasterTypes: ["Flood", "Stormwater"],
    description:
      "Attach simple extenders that carry roof runoff farther from the foundation.",
    ecoBenefit:
      "Reduces localized pooling with a low-cost, low-waste drainage fix.",
    estimatedCost: "$5–15",
    costLevel: "Low",
    impactLevel: "Medium",
    scoreIncrease: 4,
    affects: {
      homeVulnerability: 5,
      ecoMitigation: 3,
    },
    priority: "now",
    relatedWeaknesses: [
      "Water pooling near the home increases flood and foundation risk.",
      "Basement or crawl space may increase flood vulnerability.",
    ],
  },
  {
    id: "rainBarrel",
    title: "Install a Rain Barrel",
    category: "Flood & Stormwater",
    disasterTypes: ["Flood", "Stormwater"],
    description:
      "Collect roof runoff for reuse in watering plants and small landscape areas.",
    ecoBenefit:
      "Cuts runoff volume and conserves potable water during dry periods.",
    estimatedCost: "$50–150",
    costLevel: "Low",
    impactLevel: "Medium",
    scoreIncrease: 4,
    affects: {
      homeVulnerability: 3,
      ecoMitigation: 5,
    },
    priority: "now",
    relatedWeaknesses: [
      "High paved surface coverage can worsen stormwater runoff.",
      "Few existing eco-mitigation features were reported.",
    ],
  },
  {
    id: "permeablePavers",
    title: "Replace Concrete with Permeable Pavers",
    category: "Flood & Stormwater",
    disasterTypes: ["Flood", "Stormwater"],
    description:
      "Swap impervious driveway surfaces for pavers that let rainfall pass through.",
    ecoBenefit:
      "Improves groundwater recharge and reduces hard-surface runoff.",
    estimatedCost: "$1,500–4,000",
    costLevel: "High",
    impactLevel: "High",
    scoreIncrease: 7,
    affects: {
      homeVulnerability: 7,
      ecoMitigation: 8,
    },
    priority: "later",
    relatedWeaknesses: [
      "High paved surface coverage can worsen stormwater runoff.",
      "Water pooling near the home increases flood and foundation risk.",
      "Few existing eco-mitigation features were reported.",
    ],
  },
  {
    id: "gravelPath",
    title: "Replace Asphalt Paths with Gravel",
    category: "Flood & Stormwater",
    disasterTypes: ["Flood", "Stormwater"],
    description:
      "Use gravel on walkways or side paths so rainwater can soak through the surface.",
    ecoBenefit:
      "Creates a more permeable landscape with lower material impact than asphalt.",
    estimatedCost: "$100–400",
    costLevel: "Medium",
    impactLevel: "Medium",
    scoreIncrease: 4,
    affects: {
      homeVulnerability: 4,
      ecoMitigation: 5,
    },
    priority: "soon",
    relatedWeaknesses: [
      "High paved surface coverage can worsen stormwater runoff.",
      "Few existing eco-mitigation features were reported.",
    ],
  },
  {
    id: "frenchDrain",
    title: "Install a French Drain",
    category: "Flood & Stormwater",
    disasterTypes: ["Flood", "Stormwater"],
    description:
      "Redirect subsurface water away from the foundation with a gravel trench and perforated pipe.",
    ecoBenefit:
      "Manages groundwater movement while reducing repeated water damage risk.",
    estimatedCost: "$500–2,000",
    costLevel: "High",
    impactLevel: "High",
    scoreIncrease: 7,
    affects: {
      homeVulnerability: 8,
      ecoMitigation: 4,
    },
    priority: "later",
    relatedWeaknesses: [
      "Water pooling near the home increases flood and foundation risk.",
      "Basement or crawl space may increase flood vulnerability.",
      "No recent home energy or drainage audit was reported.",
    ],
  },
  {
    id: "sumpPump",
    title: "Install a Sump Pump",
    category: "Flood & Stormwater",
    disasterTypes: ["Flood"],
    description:
      "Pump water out of a basement or low area before it causes major interior flooding.",
    ecoBenefit:
      "Limits damage from floodwater and reduces material waste after water events.",
    estimatedCost: "$300–700",
    costLevel: "Medium",
    impactLevel: "Medium",
    scoreIncrease: 6,
    affects: {
      homeVulnerability: 7,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Basement or crawl space may increase flood vulnerability.",
      "Water pooling near the home increases flood and foundation risk.",
    ],
  },
  {
    id: "basementSealing",
    title: "Seal Basement Walls and Floors",
    category: "Flood & Stormwater",
    disasterTypes: ["Flood", "Stormwater"],
    description:
      "Apply waterproof sealing to reduce seepage through concrete walls and floors.",
    ecoBenefit:
      "Protects indoor air quality and lowers the chance of mold-prone moisture damage.",
    estimatedCost: "$100–500",
    costLevel: "Medium",
    impactLevel: "Medium",
    scoreIncrease: 5,
    affects: {
      homeVulnerability: 6,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Basement or crawl space may increase flood vulnerability.",
      "Water pooling near the home increases flood and foundation risk.",
      "Older homes may need structural and efficiency upgrades.",
    ],
  },
  {
    id: "nativeGroundCover",
    title: "Plant Native Ground Cover",
    category: "Flood & Stormwater",
    disasterTypes: ["Flood", "Stormwater"],
    description:
      "Cover bare soil with native plants whose roots absorb water and reduce erosion.",
    ecoBenefit:
      "Builds healthier soil, supports habitat, and slows runoff naturally.",
    estimatedCost: "$100–400",
    costLevel: "Medium",
    impactLevel: "Medium",
    scoreIncrease: 5,
    affects: {
      homeVulnerability: 4,
      ecoMitigation: 6,
    },
    priority: "soon",
    relatedWeaknesses: [
      "High paved surface coverage can worsen stormwater runoff.",
      "Water pooling near the home increases flood and foundation risk.",
      "Few existing eco-mitigation features were reported.",
    ],
  },
  {
    id: "nativePlantLawnReplacement",
    title: "Replace Lawn with Native Plants",
    category: "Flood & Stormwater",
    disasterTypes: ["Flood", "Stormwater"],
    description:
      "Replace shallow-rooted lawn areas with native plantings that absorb more rainwater.",
    ecoBenefit:
      "Improves ecological resilience while reducing mowing, watering, and runoff.",
    estimatedCost: "$200–800",
    costLevel: "Medium",
    impactLevel: "Medium",
    scoreIncrease: 5,
    affects: {
      homeVulnerability: 4,
      ecoMitigation: 7,
    },
    priority: "soon",
    relatedWeaknesses: [
      "High paved surface coverage can worsen stormwater runoff.",
      "Dense surroundings can increase heat and drainage stress.",
      "Few existing eco-mitigation features were reported.",
    ],
  },
  {
    id: "clearDefensibleSpaceZone1",
    title: "Clear Defensible Space Zone 1",
    category: "Wildfire",
    disasterTypes: ["Wildfire"],
    description:
      "Remove dry brush, dead leaves, and debris within 0 to 30 feet of the home.",
    ecoBenefit:
      "Reduces ignition fuel while making the near-home landscape easier to maintain.",
    estimatedCost: "Free",
    costLevel: "Free",
    impactLevel: "High",
    scoreIncrease: 10,
    affects: {
      homeVulnerability: 8,
      ecoMitigation: 4,
    },
    priority: "now",
    relatedWeaknesses: [
      "Dry vegetation close to the home increases wildfire vulnerability.",
      "Few existing eco-mitigation features were reported.",
    ],
  },
  {
    id: "thinVegetationZone2",
    title: "Thin Vegetation in Zone 2",
    category: "Wildfire",
    disasterTypes: ["Wildfire"],
    description:
      "Thin and space vegetation 30 to 100 feet from the home to reduce fire intensity.",
    ecoBenefit:
      "Maintains healthier vegetation while slowing wildfire spread toward structures.",
    estimatedCost: "Free–$300",
    costLevel: "Medium",
    impactLevel: "High",
    scoreIncrease: 7,
    affects: {
      homeVulnerability: 7,
      ecoMitigation: 5,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Dry vegetation close to the home increases wildfire vulnerability.",
      "Large nearby trees or overhanging branches may increase storm damage risk.",
    ],
  },
  {
    id: "removeDeadBranches",
    title: "Remove Dead Branches Over Roof",
    category: "Wildfire",
    disasterTypes: ["Wildfire"],
    description:
      "Clear dead limbs that overhang the roof and could ignite from embers.",
    ecoBenefit:
      "Reduces direct fuel above the home and supports healthier trees.",
    estimatedCost: "Free",
    costLevel: "Free",
    impactLevel: "Medium",
    scoreIncrease: 5,
    affects: {
      homeVulnerability: 5,
      ecoMitigation: 3,
    },
    priority: "now",
    relatedWeaknesses: [
      "Large nearby trees or overhanging branches may increase storm damage risk.",
      "Dry vegetation close to the home increases wildfire vulnerability.",
    ],
  },
  {
    id: "trimTreeBranches",
    title: "Trim Low Tree Branches",
    category: "Wildfire",
    disasterTypes: ["Wildfire"],
    description:
      "Raise tree branches 6 to 10 feet from the ground to reduce ladder fuels.",
    ecoBenefit:
      "Keeps trees healthier while making fire less likely to climb into the canopy.",
    estimatedCost: "Free–$200",
    costLevel: "Medium",
    impactLevel: "Medium",
    scoreIncrease: 5,
    affects: {
      homeVulnerability: 5,
      ecoMitigation: 4,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Large nearby trees or overhanging branches may increase storm damage risk.",
      "Dry vegetation close to the home increases wildfire vulnerability.",
    ],
  },
  {
    id: "emberResistantVents",
    title: "Install Ember-Resistant Vents",
    category: "Wildfire",
    disasterTypes: ["Wildfire"],
    description:
      "Upgrade attic and crawl-space vents to reduce ember entry during wildfire conditions.",
    ecoBenefit:
      "Protects the building envelope without increasing resource-heavy reconstruction risk.",
    estimatedCost: "$200–600",
    costLevel: "Medium",
    impactLevel: "High",
    scoreIncrease: 7,
    affects: {
      homeVulnerability: 8,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Roof material may be vulnerable to wind, heat, or wildfire exposure.",
      "Basement or crawl space may increase flood vulnerability.",
      "Dry vegetation close to the home increases wildfire vulnerability.",
    ],
  },
  {
    id: "cleanGutters",
    title: "Clean Gutters of Debris",
    category: "Wildfire",
    disasterTypes: ["Wildfire"],
    description:
      "Remove leaves, pine needles, and other organic material that can ignite in gutters.",
    ecoBenefit:
      "Cuts ember fuel while improving roof drainage during storms.",
    estimatedCost: "Free",
    costLevel: "Free",
    impactLevel: "Medium",
    scoreIncrease: 4,
    affects: {
      homeVulnerability: 4,
      ecoMitigation: 3,
    },
    priority: "now",
    relatedWeaknesses: [
      "Roof material may be vulnerable to wind, heat, or wildfire exposure.",
      "Dry vegetation close to the home increases wildfire vulnerability.",
      "Water pooling near the home increases flood and foundation risk.",
    ],
  },
  {
    id: "fireResistantLandscaping",
    title: "Plant Fire-Resistant Landscaping",
    category: "Wildfire",
    disasterTypes: ["Wildfire"],
    description:
      "Use fire-resistant native plants that are less likely to ignite near the home.",
    ecoBenefit:
      "Supports local ecology while lowering landscape ignition risk.",
    estimatedCost: "$200–600",
    costLevel: "Medium",
    impactLevel: "Medium",
    scoreIncrease: 6,
    affects: {
      homeVulnerability: 5,
      ecoMitigation: 6,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Dry vegetation close to the home increases wildfire vulnerability.",
      "Few existing eco-mitigation features were reported.",
    ],
  },
  {
    id: "moveWoodpile",
    title: "Move Woodpile Away from Walls",
    category: "Wildfire",
    disasterTypes: ["Wildfire"],
    description:
      "Store stacked firewood away from exterior walls and decks to remove a fuel pathway.",
    ecoBenefit:
      "Reduces near-home ignition risk with no new materials or energy use.",
    estimatedCost: "Free",
    costLevel: "Free",
    impactLevel: "Low",
    scoreIncrease: 3,
    affects: {
      homeVulnerability: 3,
    },
    priority: "now",
    relatedWeaknesses: [
      "Dry vegetation close to the home increases wildfire vulnerability.",
    ],
  },
  {
    id: "hurricaneShutters",
    title: "Install Hurricane Shutters",
    category: "Wind & Hurricane",
    disasterTypes: ["Wind", "Hurricane"],
    description:
      "Protect windows from wind-borne debris during hurricanes and severe storms.",
    ecoBenefit:
      "Prevents broken-window damage and reduces post-storm replacement waste.",
    estimatedCost: "$800–2,500",
    costLevel: "High",
    impactLevel: "High",
    scoreIncrease: 8,
    affects: {
      homeVulnerability: 8,
    },
    priority: "later",
    relatedWeaknesses: [
      "Windows and doors may need stronger storm protection.",
    ],
  },
  {
    id: "impactResistantWindows",
    title: "Install Impact-Resistant Windows",
    category: "Wind & Hurricane",
    disasterTypes: ["Wind", "Hurricane"],
    description:
      "Replace standard windows with units designed to withstand wind-borne debris.",
    ecoBenefit:
      "Adds durable protection that can reduce storm damage and repeated repairs.",
    estimatedCost: "$3,000–10,000",
    costLevel: "High",
    impactLevel: "High",
    scoreIncrease: 8,
    affects: {
      homeVulnerability: 8,
      ecoMitigation: 3,
    },
    priority: "later",
    relatedWeaknesses: [
      "Windows and doors may need stronger storm protection.",
      "Older homes may need structural and efficiency upgrades.",
    ],
  },
  {
    id: "reinforceGarageDoor",
    title: "Reinforce the Garage Door",
    category: "Wind & Hurricane",
    disasterTypes: ["Wind", "Hurricane"],
    description:
      "Strengthen a common weak point so high winds are less likely to breach the home.",
    ecoBenefit:
      "Protects the structure and reduces material loss from wind-driven failure.",
    estimatedCost: "$300–1,500",
    costLevel: "High",
    impactLevel: "Medium",
    scoreIncrease: 6,
    affects: {
      homeVulnerability: 6,
    },
    priority: "later",
    relatedWeaknesses: [
      "Older homes may need structural and efficiency upgrades.",
    ],
  },
  {
    id: "roofToWallStraps",
    title: "Install Roof-to-Wall Straps",
    category: "Wind & Hurricane",
    disasterTypes: ["Wind", "Hurricane"],
    description:
      "Add metal connectors that help keep the roof attached during extreme winds.",
    ecoBenefit:
      "Improves structural resilience and reduces the chance of major storm rebuilds.",
    estimatedCost: "$500–1,500",
    costLevel: "High",
    impactLevel: "High",
    scoreIncrease: 7,
    affects: {
      homeVulnerability: 8,
    },
    priority: "later",
    relatedWeaknesses: [
      "Roof material may be vulnerable to wind, heat, or wildfire exposure.",
      "Older homes may need structural and efficiency upgrades.",
    ],
  },
  {
    id: "trimLargeTrees",
    title: "Trim Large Trees Near Home",
    category: "Wind & Hurricane",
    disasterTypes: ["Wind", "Hurricane"],
    description:
      "Trim or remove hazardous large trees that could fall on the home during high winds.",
    ecoBenefit:
      "Balances canopy care with reduced structural damage risk.",
    estimatedCost: "Free–$800",
    costLevel: "Medium",
    impactLevel: "Medium",
    scoreIncrease: 6,
    affects: {
      homeVulnerability: 6,
      ecoMitigation: 3,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Large nearby trees or overhanging branches may increase storm damage risk.",
    ],
  },
  {
    id: "nativeWindbreakTrees",
    title: "Plant Native Windbreak Trees",
    category: "Wind & Hurricane",
    disasterTypes: ["Wind", "Hurricane"],
    description:
      "Plant dense native trees or shrubs farther from the home to reduce wind speed.",
    ecoBenefit:
      "Adds habitat and shade while creating a natural wind-buffering landscape.",
    estimatedCost: "$200–800",
    costLevel: "Medium",
    impactLevel: "Medium",
    scoreIncrease: 5,
    affects: {
      homeVulnerability: 4,
      ecoMitigation: 6,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Dense surroundings can increase heat and drainage stress.",
      "Few existing eco-mitigation features were reported.",
      "Large nearby trees or overhanging branches may increase storm damage risk.",
    ],
  },
  {
    id: "anchorOutdoorObjects",
    title: "Anchor Outdoor Objects",
    category: "Wind & Hurricane",
    disasterTypes: ["Wind", "Hurricane"],
    description:
      "Secure patio furniture, grills, planters, and loose items before high winds arrive.",
    ecoBenefit:
      "Prevents debris hazards without requiring new construction.",
    estimatedCost: "Free",
    costLevel: "Free",
    impactLevel: "Low",
    scoreIncrease: 3,
    affects: {
      homeVulnerability: 3,
      recoveryPreparedness: 3,
    },
    priority: "now",
    relatedWeaknesses: [
      "Household emergency plan is missing or informal.",
      "Emergency kit readiness is incomplete.",
    ],
  },
  {
    id: "shadeTrees",
    title: "Plant Shade Trees",
    category: "Heat Wave",
    disasterTypes: ["Heat"],
    description:
      "Plant trees on south and west sides to reduce direct solar heat on the home.",
    ecoBenefit:
      "Lowers cooling demand, stores carbon, and improves local heat resilience.",
    estimatedCost: "$100–500",
    costLevel: "Medium",
    impactLevel: "Medium",
    scoreIncrease: 6,
    affects: {
      homeVulnerability: 5,
      ecoMitigation: 7,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Dense surroundings can increase heat and drainage stress.",
      "Few existing eco-mitigation features were reported.",
    ],
  },
  {
    id: "coolRoofCoating",
    title: "Install Cool Roof Coating",
    category: "Heat Wave",
    disasterTypes: ["Heat"],
    description:
      "Apply reflective roof coating to reduce heat absorption during extreme heat.",
    ecoBenefit:
      "Cuts indoor heat gain and helps reduce neighborhood heat-island effects.",
    estimatedCost: "$200–600",
    costLevel: "Medium",
    impactLevel: "Medium",
    scoreIncrease: 5,
    affects: {
      homeVulnerability: 6,
      ecoMitigation: 5,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Roof material may be vulnerable to wind, heat, or wildfire exposure.",
      "Dense surroundings can increase heat and drainage stress.",
      "No recent home energy or drainage audit was reported.",
    ],
  },
  {
    id: "atticInsulation",
    title: "Install Attic Insulation",
    category: "Heat Wave",
    disasterTypes: ["Heat"],
    description:
      "Add insulation to slow heat transfer from the roof into living spaces.",
    ecoBenefit:
      "Improves energy efficiency in hot weather and supports year-round resilience.",
    estimatedCost: "$500–2,000",
    costLevel: "High",
    impactLevel: "Medium",
    scoreIncrease: 5,
    affects: {
      homeVulnerability: 6,
      ecoMitigation: 5,
    },
    priority: "later",
    relatedWeaknesses: [
      "Older homes may need structural and efficiency upgrades.",
      "Roof material may be vulnerable to wind, heat, or wildfire exposure.",
      "No recent home energy or drainage audit was reported.",
    ],
  },
  {
    id: "atticVentilation",
    title: "Install Attic Ventilation",
    category: "Heat Wave",
    disasterTypes: ["Heat"],
    description:
      "Use ridge and soffit ventilation to release trapped hot air from the attic.",
    ecoBenefit:
      "Reduces cooling load and helps protect roof materials from excess heat.",
    estimatedCost: "$300–900",
    costLevel: "Medium",
    impactLevel: "Medium",
    scoreIncrease: 5,
    affects: {
      homeVulnerability: 5,
      ecoMitigation: 5,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Roof material may be vulnerable to wind, heat, or wildfire exposure.",
      "No recent home energy or drainage audit was reported.",
    ],
  },
  {
    id: "windowShading",
    title: "Add Exterior Window Shading",
    category: "Heat Wave",
    disasterTypes: ["Heat"],
    description:
      "Install exterior blinds, awnings, or shade features that block sun before it reaches glass.",
    ecoBenefit:
      "Reduces indoor heat gain and lowers air-conditioning demand.",
    estimatedCost: "$100–600",
    costLevel: "Medium",
    impactLevel: "Medium",
    scoreIncrease: 4,
    affects: {
      homeVulnerability: 4,
      ecoMitigation: 4,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Windows and doors may need stronger storm protection.",
      "Dense surroundings can increase heat and drainage stress.",
    ],
  },
  {
    id: "ceilingFans",
    title: "Install Ceiling Fans",
    category: "Heat Wave",
    disasterTypes: ["Heat"],
    description:
      "Add ceiling fans in key rooms to improve comfort and reduce reliance on air conditioning.",
    ecoBenefit:
      "Uses less energy than additional cooling while improving heat readiness.",
    estimatedCost: "$100–400",
    costLevel: "Medium",
    impactLevel: "Low",
    scoreIncrease: 3,
    affects: {
      homeVulnerability: 3,
      ecoMitigation: 3,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Dense surroundings can increase heat and drainage stress.",
      "No recent home energy or drainage audit was reported.",
    ],
  },
  {
    id: "identifyCoolSpaces",
    title: "Identify Nearby Cool Spaces",
    category: "Heat Wave",
    disasterTypes: ["Heat", "Emergency Preparedness"],
    description:
      "Know the nearest library, community center, or cooling site before a heat emergency.",
    ecoBenefit:
      "Strengthens preparedness through shared community cooling resources.",
    estimatedCost: "Free",
    costLevel: "Free",
    impactLevel: "Low",
    scoreIncrease: 2,
    affects: {
      recoveryPreparedness: 4,
    },
    priority: "now",
    relatedWeaknesses: [
      "Household emergency plan is missing or informal.",
      "Local emergency alert registration may be missing.",
    ],
  },
  {
    id: "insulatePipes",
    title: "Insulate Exposed Pipes",
    category: "Winter Storm & Ice",
    disasterTypes: ["Winter Storm"],
    description:
      "Wrap pipes in unheated spaces to reduce freezing and bursting during cold snaps.",
    ecoBenefit:
      "Prevents water damage and reduces waste from emergency repairs.",
    estimatedCost: "$30–150",
    costLevel: "Low",
    impactLevel: "Medium",
    scoreIncrease: 6,
    affects: {
      homeVulnerability: 6,
      ecoMitigation: 3,
    },
    priority: "now",
    relatedWeaknesses: [
      "Older homes may need structural and efficiency upgrades.",
      "No recent home energy or drainage audit was reported.",
    ],
  },
  {
    id: "knowWaterMainShutoff",
    title: "Know the Water Main Shutoff",
    category: "Winter Storm & Ice",
    disasterTypes: ["Winter Storm", "Emergency Preparedness"],
    description:
      "Locate and practice shutting off the water main before a pipe emergency.",
    ecoBenefit:
      "Limits water loss and damage when freezing causes a pipe failure.",
    estimatedCost: "Free",
    costLevel: "Free",
    impactLevel: "Low",
    scoreIncrease: 3,
    affects: {
      recoveryPreparedness: 5,
    },
    priority: "now",
    relatedWeaknesses: [
      "Household emergency plan is missing or informal.",
      "Emergency kit readiness is incomplete.",
    ],
  },
  {
    id: "serviceFurnace",
    title: "Service Furnace Annually",
    category: "Winter Storm & Ice",
    disasterTypes: ["Winter Storm"],
    description:
      "Schedule yearly furnace or HVAC service to reduce heating failure during extreme cold.",
    ecoBenefit:
      "Improves heating efficiency and lowers emergency outage risk.",
    estimatedCost: "$80–150/yr",
    costLevel: "Low",
    impactLevel: "Medium",
    scoreIncrease: 4,
    affects: {
      homeVulnerability: 4,
      ecoMitigation: 4,
    },
    priority: "now",
    relatedWeaknesses: [
      "Older homes may need structural and efficiency upgrades.",
      "No recent home energy or drainage audit was reported.",
    ],
  },
  {
    id: "emergencyHeatingBackup",
    title: "Stock Emergency Heating Backup",
    category: "Winter Storm & Ice",
    disasterTypes: ["Winter Storm", "Emergency Preparedness"],
    description:
      "Prepare backup heat supplies such as safe portable heat, blankets, or fuel where appropriate.",
    ecoBenefit:
      "Improves cold-weather readiness with targeted backup resources.",
    estimatedCost: "$50–300",
    costLevel: "Medium",
    impactLevel: "Medium",
    scoreIncrease: 4,
    affects: {
      recoveryPreparedness: 5,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Emergency kit readiness is incomplete.",
      "Household emergency plan is missing or informal.",
    ],
  },
  {
    id: "generatorOrSolarBackup",
    title: "Install Generator or Solar Battery Backup",
    category: "Winter Storm & Ice",
    disasterTypes: ["Winter Storm", "Emergency Preparedness"],
    description:
      "Provide backup power for heat, communications, and essentials during extended outages.",
    ecoBenefit:
      "Supports outage resilience, with solar battery options reducing fossil-fuel reliance.",
    estimatedCost: "$500–5,000",
    costLevel: "High",
    impactLevel: "Medium",
    scoreIncrease: 6,
    affects: {
      homeVulnerability: 5,
      ecoMitigation: 5,
      recoveryPreparedness: 4,
    },
    priority: "later",
    relatedWeaknesses: [
      "Emergency kit readiness is incomplete.",
      "No recent home energy or drainage audit was reported.",
      "Household emergency plan is missing or informal.",
    ],
  },
  {
    id: "preDisasterPhotos",
    title: "Take Pre-Disaster Home Photos",
    category: "Recovery Preparedness",
    disasterTypes: ["Recovery Preparedness", "Emergency Preparedness"],
    description:
      "Photograph every room before a disaster to document the home's condition and belongings.",
    ecoBenefit:
      "Supports faster recovery planning and reduces avoidable replacement disputes.",
    estimatedCost: "Free",
    costLevel: "Free",
    impactLevel: "High",
    scoreIncrease: 8,
    affects: {
      recoveryPreparedness: 8,
    },
    priority: "now",
    relatedWeaknesses: [
      "Pre-disaster home photos are missing or incomplete.",
      "Policy coverage details are not clearly understood.",
    ],
  },
  {
    id: "documentBackup",
    title: "Back Up Key Household Documents",
    category: "Recovery Preparedness",
    disasterTypes: ["Recovery Preparedness", "Emergency Preparedness"],
    description:
      "Store insurance policy, ID, proof of address, and deed or lease records in a secure digital vault.",
    ecoBenefit:
      "Keeps critical records accessible without relying on vulnerable paper copies.",
    estimatedCost: "Free",
    costLevel: "Free",
    impactLevel: "High",
    scoreIncrease: 7,
    affects: {
      recoveryPreparedness: 7,
    },
    priority: "now",
    relatedWeaknesses: [
      "Important documents may not be backed up digitally.",
      "Insurance readiness is unclear or incomplete.",
    ],
  },
  {
    id: "homeInventory",
    title: "Create a Home Inventory",
    category: "Recovery Preparedness",
    disasterTypes: ["Recovery Preparedness", "Emergency Preparedness"],
    description:
      "List valuable belongings with photos, purchase dates, and estimated values.",
    ecoBenefit:
      "Improves preparedness by documenting what can be repaired, reused, or replaced after damage.",
    estimatedCost: "Free",
    costLevel: "Free",
    impactLevel: "Medium",
    scoreIncrease: 5,
    affects: {
      recoveryPreparedness: 6,
    },
    priority: "now",
    relatedWeaknesses: [
      "Pre-disaster home photos are missing or incomplete.",
      "Policy coverage details are not clearly understood.",
      "Important documents may not be backed up digitally.",
    ],
  },
  {
    id: "householdEmergencyPlan",
    title: "Write a Household Emergency Plan",
    category: "Recovery Preparedness",
    disasterTypes: ["Recovery Preparedness", "Emergency Preparedness"],
    description:
      "Document meeting points, evacuation routes, contacts, pets, medications, and special needs.",
    ecoBenefit:
      "Strengthens household readiness and reduces rushed, resource-intensive decisions during emergencies.",
    estimatedCost: "Free",
    costLevel: "Free",
    impactLevel: "Medium",
    scoreIncrease: 6,
    affects: {
      recoveryPreparedness: 7,
    },
    priority: "now",
    relatedWeaknesses: [
      "Household emergency plan is missing or informal.",
      "Emergency kit readiness is incomplete.",
      "Local emergency alert registration may be missing.",
    ],
  },
  {
    id: "emergencyKit72Hour",
    title: "Build a 72-Hour Emergency Kit",
    category: "Recovery Preparedness",
    disasterTypes: ["Recovery Preparedness", "Emergency Preparedness"],
    description:
      "Prepare water, food, medications, first aid, flashlights, batteries, and document copies.",
    ecoBenefit:
      "Improves self-sufficiency during outages and reduces last-minute supply strain.",
    estimatedCost: "$50–150",
    costLevel: "Low",
    impactLevel: "Medium",
    scoreIncrease: 5,
    affects: {
      recoveryPreparedness: 6,
    },
    priority: "now",
    relatedWeaknesses: [
      "Emergency kit readiness is incomplete.",
      "Important documents may not be backed up digitally.",
    ],
  },
  {
    id: "localEmergencyRegistration",
    title: "Register with Local Emergency Management",
    category: "Recovery Preparedness",
    disasterTypes: ["Recovery Preparedness", "Emergency Preparedness"],
    description:
      "Register household medical, mobility, or access needs with local emergency management if available.",
    ecoBenefit:
      "Improves community preparedness and helps responders plan support more efficiently.",
    estimatedCost: "Free",
    costLevel: "Free",
    impactLevel: "Low",
    scoreIncrease: 3,
    affects: {
      recoveryPreparedness: 5,
    },
    priority: "now",
    relatedWeaknesses: [
      "Local emergency alert registration may be missing.",
      "Household emergency plan is missing or informal.",
    ],
  },
  {
    id: "rentersInsurance",
    title: "Purchase Renters Insurance",
    category: "Recovery Preparedness",
    disasterTypes: ["Recovery Preparedness"],
    description:
      "If renting, add coverage for personal belongings that a landlord policy does not cover.",
    ecoBenefit:
      "Supports faster household recovery and replacement planning after covered losses.",
    estimatedCost: "$150–300/yr",
    costLevel: "Medium",
    impactLevel: "High",
    scoreIncrease: 7,
    affects: {
      recoveryPreparedness: 7,
    },
    priority: "soon",
    relatedWeaknesses: [
      "Insurance readiness is unclear or incomplete.",
      "Policy coverage details are not clearly understood.",
    ],
  },
  {
    id: "insurancePolicyReview",
    title: "Review Insurance Policy Exclusions",
    category: "Recovery Preparedness",
    disasterTypes: ["Recovery Preparedness"],
    description:
      "Review what hazards are excluded so coverage gaps are understood before a disaster.",
    ecoBenefit:
      "Improves preparedness decisions and helps households prioritize mitigation where coverage is limited.",
    estimatedCost: "Free",
    costLevel: "Free",
    impactLevel: "Medium",
    scoreIncrease: 5,
    affects: {
      recoveryPreparedness: 6,
    },
    priority: "now",
    relatedWeaknesses: [
      "Policy coverage details are not clearly understood.",
      "Insurance readiness is unclear or incomplete.",
    ],
  },
  {
    id: "cloudDocumentBackup",
    title: "Set Up Cloud Document Backup",
    category: "Recovery Preparedness",
    disasterTypes: ["Recovery Preparedness", "Emergency Preparedness"],
    description:
      "Automatically back up important documents so records survive device damage or evacuation.",
    ecoBenefit:
      "Reduces reliance on paper records and keeps preparedness information accessible.",
    estimatedCost: "Free–$10/mo",
    costLevel: "Low",
    impactLevel: "Medium",
    scoreIncrease: 4,
    affects: {
      recoveryPreparedness: 6,
    },
    priority: "now",
    relatedWeaknesses: [
      "Important documents may not be backed up digitally.",
      "Insurance readiness is unclear or incomplete.",
    ],
  },
];
