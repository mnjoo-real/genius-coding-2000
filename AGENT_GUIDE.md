# AGENT_GUIDE.md

## 1. Project Overview

This project is a React + Vite frontend MVP for a **location-based eco-disaster preparedness platform**.

The app helps users:

1. Enter a ZIP code or location.
2. View regional disaster risks.
3. Answer home vulnerability questions.
4. Receive a **DisasterReady Score**.
5. Get eco-friendly mitigation recommendations.
6. Simulate how recommended actions improve the projected score.

The current MVP focuses on **preparedness**, not disaster recovery paperwork.

Future recovery-related features may exist as secondary preview components, but the main user flow must stay centered on:

```txt
Landing
→ LocationInput
→ RiskOverview
→ HomeQuestionnaire
→ ScoreDashboard
```

---

## 2. Core Product Concept

The app should feel like a practical, credible, eco-focused home resilience tool.

Main terms to use:

* DisasterReady Score
* Regional Risk
* Home Vulnerability
* Eco-Mitigation Actions
* Projected Score
* Home Readiness
* Preparedness

Avoid making the product sound like only a document organizer.

Avoid using old recovery-document language as the main product framing:

* case
* incident case
* aid match
* claim package
* deadline tracker
* damage report

These can appear only in the future recovery preview section if needed.

---

## 3. Current Folder Structure

Follow this structure:

```txt
src/
├── App.jsx
├── index.css
├── main.jsx
├── assets/
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── LocationInput.jsx
│   ├── HomeQuestionnaire.jsx
│   ├── RiskOverview.jsx
│   └── ScoreDashboard.jsx
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footbar.jsx
│   │   └── ProgressStepper.jsx
│   ├── questionnaire/
│   │   └── QuestionCard.jsx
│   ├── recommendations/
│   │   └── RecommendationCard.jsx
│   ├── recovery/
│   │   └── RecoveryPreviewCard.jsx
│   ├── risk/
│   │   ├── RiskCard.jsx
│   │   └── RiskBarChart.jsx
│   ├── score/
│   │   ├── ScoreGauge.jsx
│   │   └── WeaknessList.jsx
│   ├── simulation/
│   │   └── ScoreSimulationPanel.jsx
│   └── ui/
│       ├── Badge.jsx
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Input.jsx
│       ├── ProgressBar.jsx
│       ├── Select.jsx
│       └── Textarea.jsx
├── data/
│   ├── ecoSolutions.js
│   ├── homeQuestions.js
│   └── regionalRiskData.js
└── utils/
    ├── calculateProjectedScore.js
    ├── calculateScore.js
    ├── generateRecommendations.js
    ├── getRiskLevel.js
    └── getTopRisks.js
```

Do not create a new unrelated folder structure unless there is a strong reason.

---

## 4. Routing Rules

Use `react-router-dom`.

Routes should be:

```txt
/              → Landing
/login         → Login
/location      → LocationInput
/risk          → RiskOverview
/questionnaire → HomeQuestionnaire
/dashboard     → ScoreDashboard
```

`main.jsx` should remain close to the default Vite structure.

`App.jsx` should only manage routing, not business logic.

---

## 5. State and Data Flow

This MVP should be frontend-only.

Use `localStorage` for cross-page state.

Store:

```txt
selectedZipCode
regionalRisk
homeProfile
```

Expected flow:

```txt
LocationInput
→ saves selectedZipCode and regionalRisk
→ navigates to /risk

RiskOverview
→ reads regionalRisk
→ displays risk profile
→ navigates to /questionnaire

HomeQuestionnaire
→ saves homeProfile
→ navigates to /dashboard

ScoreDashboard
→ reads regionalRisk and homeProfile
→ calculates score, weaknesses, recommendations, and projected score
```

The app must not crash if `localStorage` is empty.

If required data is missing, show a clear message and a button back to `/location`.

---

## 6. Data Files

### `regionalRiskData.js`

Should export:

```js
regionalRiskData
fallbackRiskData
```

Use sample ZIP codes:

```txt
33101 → Miami, FL
14623 → Rochester, NY
90001 → Los Angeles, CA
77001 → Houston, TX
80202 → Denver, CO
```

Each regional risk profile should include:

```js
{
  zipCode,
  city,
  state,
  floodRisk,
  wildfireRisk,
  heatRisk,
  stormRisk,
  winterStormRisk
}
```

Risk scores are from `0` to `100`.

### `homeQuestions.js`

Should export `homeQuestions`.

The current expanded questionnaire includes 20 questions across home structure,
eco-mitigation status, and preparedness/recovery readiness:

Home Structure & Environment:

* `homeType`
* `ownershipStatus`
* `basementOrCrawlSpace`
* `homeAge`
* `roofMaterial`
* `windowDoorProtection`
* `pavedSurfaceLevel`
* `waterPooling`
* `dryBrushDistance`
* `areaDensity`

Eco-Mitigation Status:

* `ecoFeatures`
* `largeTreesNearby`
* `energyOrDrainageAudit`

Recovery Preparedness & Documents:

* `insurancePolicy`
* `knowsPolicyCoverage`
* `digitalDocuments`
* `preDisasterPhotos`
* `emergencyKit`
* `familyEmergencyPlan`
* `localEmergencyRegistration`

Each question should include:

```js
{
  id,
  section,
  category,
  question,
  type,
  options,
  whyItMatters
}
```

Supported question types are:

```txt
single → one selected answer
multi  → multiple selected answers
```

`options` should be an array of user-facing answer labels. Keep the answer
labels stable where possible because score calculation and recommendation
generation can depend on exact values.

Question categories may include:

```txt
Structure
Ownership
Flood
Storm
Wildfire
Storm/Wildfire
Storm/Heat
Environment
Eco-Mitigation
Preparedness
Insurance
Documents
Documentation
Emergency Preparedness
```

The questionnaire may contain recovery preparedness questions, but they should
support the broader Home Readiness score. Do not reframe the main MVP as a
document organizer or claims workflow.

### `ecoSolutions.js`

Should export `ecoSolutions`.

The current expanded action catalog includes flood/stormwater, wildfire,
wind/hurricane, heat, winter storm, and preparedness/recovery actions.

Include actions such as:

* rain garden
* bioswale
* permeable pavement
* downspout redirection
* rain barrel
* sump pump
* basement sealing
* defensible space
* gutter cleaning
* ember-resistant vents
* hurricane shutters
* impact-resistant windows
* large tree trimming
* native shade or windbreak trees
* cool roof coating
* attic insulation or ventilation
* pipe insulation
* emergency heating or backup power
* document backup
* home inventory
* household emergency plan
* emergency kit
* local emergency registration
* insurance review

Each solution should include:

```js
{
  id,
  title,
  category,
  disasterTypes,
  description,
  ecoBenefit,
  estimatedCost,
  costLevel,
  impactLevel,
  scoreIncrease
}
```

`disasterTypes` should be an array, not a single string. Common values include:

```txt
Flood
Stormwater
Wildfire
Wind
Hurricane
Heat
Winter Storm
Emergency Preparedness
Recovery Preparedness
```

`costLevel` may use values such as `Free`, `Low`, `Medium`, or `High`.
`scoreIncrease` is a rule-based estimate used by projected score simulation,
not an official engineering, insurance, or FEMA-certified value.

---

## 7. Utility Function Rules

### `getRiskLevel.js`

Function:

```js
getRiskLevel(value)
```

Return:

```txt
High   → value >= 75
Medium → value >= 45
Low    → otherwise
```

### `getTopRisks.js`

Function:

```js
getTopRisks(regionalRisk)
```

Return the top 3 risks from:

```txt
Flood
Wildfire
Heat Wave
Storm
Winter Storm
```

Sort descending by score.

### `calculateScore.js`

Function:

```js
calculateScore(regionalRisk, homeProfile)
```

Return:

```js
{
  totalScore,
  weaknesses
}
```

Rules:

* Start from 100.
* Subtract regional exposure penalty based on average regional risk.
* Subtract penalties for home vulnerabilities.
* Clamp score between 0 and 100.
* Return readable weakness strings.

The score is a **rule-based readiness estimate**, not an official engineering or FEMA-certified assessment.

### `generateRecommendations.js`

Function:

```js
generateRecommendations(regionalRisk, homeProfile)
```

Return relevant eco-mitigation actions based on user vulnerabilities.

Examples:

```txt
water pooling → rain garden
high paved surface → permeable pavement
unmaintained gutters → downspout redirection
dry vegetation / roof debris → defensible space
no shade → native shade trees
overheating → cool roof
large branches → branch trimming
no emergency plan → emergency plan
```

### `calculateProjectedScore.js`

Function:

```js
calculateProjectedScore(currentScore, selectedRecommendations)
```

Add selected recommendations’ `scoreIncrease` values.

Cap at `100`.

---

## 8. Component Responsibilities

### `components/ui/`

Reusable visual primitives only.

Do not put business logic here.

Components:

* Button
* Card
* Input
* Select
* Textarea
* Badge
* ProgressBar

Each component should:

* Export a default React component.
* Accept `className`.
* Spread remaining props.
* Use Tailwind classes.
* Follow the design system defined in `index.css`.

### `components/layout/`

Shared layout components.

* `Navbar.jsx`: app name, route links.
* `Footbar.jsx`: small disclaimer.
* `ProgressStepper.jsx`: shows current assessment step.

Steps:

```txt
Location
Risk
Home Check
Score
```

### `components/risk/`

Regional risk visualization.

* `RiskCard.jsx`: one risk item.
* `RiskBarChart.jsx`: all disaster risks as horizontal bars.

Do not require external chart libraries unless already installed. Tailwind bars are preferred for stability.

### `components/questionnaire/`

Home vulnerability input.

* `QuestionCard.jsx`: supports boolean and scale questions.

Boolean questions should show Yes/No options.

Scale questions should show Low/Medium/High options.

### `components/score/`

Score display.

* `ScoreGauge.jsx`: large score card.
* `WeaknessList.jsx`: list of detected vulnerabilities.

### `components/recommendations/`

Eco-action recommendation cards.

* `RecommendationCard.jsx`: title, disaster type, description, eco benefit, cost, impact, score increase, selected state.

### `components/simulation/`

Projected score simulation.

* `ScoreSimulationPanel.jsx`: current score, projected score, improvement amount, selected action list.

### `components/recovery/`

Secondary/future feature preview only.

* `RecoveryPreviewCard.jsx`: briefly explains future recovery document support.

Do not make recovery the main product experience in the MVP.

---

## 9. Page Responsibilities

### `Landing.jsx`

Purpose:

* Explain the product.
* Send users to `/location`.

Must include:

* Strong hero headline.
* Short subheadline.
* CTA button: “Check My Home”.
* Three feature cards:

  1. Regional Risk
  2. Home Vulnerability
  3. Eco-Mitigation Actions

### `LocationInput.jsx`

Purpose:

* ZIP code input.
* Select matching regional risk profile.
* Save to `localStorage`.

Must include sample ZIP chips:

```txt
33101 Miami
14623 Rochester
90001 Los Angeles
77001 Houston
80202 Denver
```

If unknown ZIP:

* Use `fallbackRiskData`.
* Preserve the entered ZIP code.

### `RiskOverview.jsx`

Purpose:

* Show regional disaster risks.
* Show top 3 risks.
* Continue to questionnaire.

If regional data is missing:

* Show fallback message.
* Button back to `/location`.

### `HomeQuestionnaire.jsx`

Purpose:

* Render all questions.
* Save answers to `localStorage`.

Requirements:

* Require all questions before continuing.
* Show progress count, such as `8 of 12 answered`.
* Navigate to `/dashboard` after saving.

### `ScoreDashboard.jsx`

Purpose:

* Show final result.

Must include:

* DisasterReady Score.
* Top regional risks.
* Weakness list.
* Eco-mitigation recommendations.
* Projected score simulation.
* Recovery preview card.
* Restart button that clears assessment-related localStorage.

---

## 10. Design Rules

The project must follow the visual system already defined in `src/index.css`.

Before editing UI, agents should inspect `index.css` and reuse its design rules.

Do not introduce a conflicting design system.

Important design constraints:

* Use the existing Tailwind setup.
* Follow the color palette and global styles from `index.css`.
* Prefer the existing visual tone over generic template styles.
* Keep UI consistent across all pages.
* Use rounded cards, soft borders, readable spacing, and restrained shadows.
* Keep the app clean, modern, eco-tech, and credible.
* Avoid random new colors that conflict with `index.css`.
* Avoid mixing unrelated themes like purple Vite demo styling, dark cyberpunk styling, or overly playful UI.

Recommended visual direction:

```txt
Background: light, clean, subtle gradients if already supported
Cards: white or near-white
Text: slate / neutral tones
Accent: emerald, green, teal, or existing project accent from index.css
Borders: subtle
Buttons: clear primary/secondary hierarchy
```

If `index.css` defines custom classes, CSS variables, typography rules, gradients, button styles, or layout patterns, reuse them rather than replacing them.

Do not overwrite `index.css` unless explicitly instructed.

---

## 11. Coding Style

Use:

* React functional components.
* JavaScript, not TypeScript.
* Tailwind CSS classes.
* Named exports for data and utility functions.
* Default exports for React components.

Avoid:

* Backend code.
* Supabase/Firebase/Auth logic unless explicitly requested.
* Complex global state libraries.
* Unnecessary dependencies.
* Over-engineered abstractions.
* Long hardcoded logic inside page components.

Keep business logic in `utils/`.

Keep static content/data in `data/`.

Keep visual primitives in `components/ui/`.

---

## 12. Dependency Rules

Required:

```txt
react-router-dom
```

Optional:

```txt
lucide-react
recharts
```

Do not add new dependencies without checking whether the feature can be implemented with plain React and Tailwind first.

For MVP stability, prefer simple Tailwind horizontal bars over complex chart libraries.

---

## 13. Error Handling Rules

The app should not crash when:

* localStorage is empty.
* unknown ZIP code is entered.
* a regional risk object is missing.
* a home profile is missing.
* no recommendations are generated.
* weaknesses array is empty.

Use graceful fallback messages and clear navigation buttons.

Examples:

```txt
We need your location first.
Go to Location Input
```

```txt
No major vulnerabilities detected from your answers.
```

```txt
No recommended actions found for this profile yet.
```

---

## 14. LocalStorage Keys

Use these exact keys:

```txt
selectedZipCode
regionalRisk
homeProfile
```

When restarting the assessment, remove these keys.

Do not clear the entire browser localStorage unless explicitly requested.

---

## 15. MVP Scope Boundaries

Build now:

* Routing
* ZIP input
* Regional risk display
* Questionnaire
* Score calculation
* Recommendations
* Projected score simulation
* Recovery preview card

Do not build yet:

* User accounts
* Database persistence
* File uploads
* FEMA form generation
* PDF export
* Insurance document vault
* Real API integration
* Map-based property analysis
* Satellite image analysis

These are future extensions.

---

## 16. Presentation/Scientific Disclaimer

Where appropriate, include a small disclaimer:

```txt
DisasterReady Score is a rule-based educational estimate, not an official engineering inspection, insurance assessment, or government determination.
```

Use this especially on the dashboard or footer.

---

## 17. Collaboration Rules for Agents

When making changes:

1. Check the existing file before editing.
2. Do not overwrite unrelated work.
3. Keep imports accurate.
4. Keep component names consistent with file names.
5. Run or mentally verify route flow after changes.
6. Avoid changing folder structure unless requested.
7. Follow `index.css` design rules.
8. Keep the main MVP flow clean and working before adding polish.

If a file is empty, create a minimal working version first.

If a file already has code, modify it carefully rather than replacing it blindly.

---

## 18. First Implementation Priority

The correct build order is:

```txt
1. App.jsx routing
2. Placeholder pages
3. data files
4. utils functions
5. ui components
6. layout components
7. risk components
8. questionnaire component
9. score components
10. recommendation/simulation components
11. Landing page
12. LocationInput page
13. RiskOverview page
14. HomeQuestionnaire page
15. ScoreDashboard page
16. Full route test
```

Do not start with advanced styling before the end-to-end flow works.

---

## 19. Final Manual Test Checklist

Before considering the frontend done, test:

```txt
[ ] / renders Landing
[ ] /location renders ZIP input
[ ] sample ZIP 33101 loads Miami risk profile
[ ] sample ZIP 14623 loads Rochester risk profile
[ ] unknown ZIP uses fallback profile
[ ] /risk shows regional risks
[ ] /questionnaire shows all 12 questions
[ ] unanswered questions block submit
[ ] answers save to localStorage
[ ] /dashboard shows score
[ ] weaknesses render correctly
[ ] recommendations render correctly
[ ] selecting recommendations changes projected score
[ ] restart clears selectedZipCode, regionalRisk, and homeProfile
[ ] app does not crash when localStorage is empty
[ ] design follows index.css
```

---

## 20. Summary

This is a frontend-only MVP for a location-based eco-disaster preparedness app.

The highest priority is a complete and stable user flow:

```txt
ZIP code
→ regional disaster risk
→ home vulnerability questionnaire
→ DisasterReady Score
→ eco-friendly action recommendations
→ projected score improvement
```

Keep the implementation simple, credible, and consistent with the existing design system in `index.css`.
