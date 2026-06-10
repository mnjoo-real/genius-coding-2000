# AGENT_GUIDE.md

## 1. Project Overview

This project is a React + Vite frontend MVP for a **location-based eco-disaster preparedness platform**.

The web platform name is **Canopy**.

The platform catchphrase is:

```txt
Canopy protects your home before disaster strikes.
```

The app helps users:

1. Enter a ZIP code or location.
2. View regional disaster risks.
3. Answer home vulnerability questions.
4. Receive a **DisasterReady Score**.
5. Get eco-friendly mitigation recommendations.
6. Simulate how recommended actions improve the projected score.
7. Use a secondary **Recovery Center** to prepare recovery documents, organize home photo records, and track mock aid application steps.

The current MVP focuses primarily on **preparedness**, but now includes a dedicated secondary **Recovery Center** page.

The main preparedness flow must stay centered on:

```txt
Landing
→ LocationInput
→ RiskOverview
→ HomeQuestionnaire
→ ScoreDashboard
```

The secondary recovery flow is:

```txt
ScoreDashboard
→ Recovery
```

Recovery should not replace the main DisasterReady Score flow. It should support the product by helping users prepare documents, organize pre-disaster home photo records, view mock aid program matches, track estimated deadlines, and monitor mock application statuses.

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
* Recovery Center
* Recovery Document Checklist
* Pre-Disaster Home Photo Gallery
* Aid Program Matching
* Application Deadline
* Application Status

Avoid making the entire product sound like only a document organizer.

The correct framing is:

```txt
Canopy helps users prepare their home before disaster and organize recovery steps after disaster.
```

Do not frame Canopy as only:

```txt
a FEMA form generator
an insurance claim app
a document vault
a legal/financial recovery advisor
```

Recovery-related language is allowed inside the dedicated `/recovery` page, but the main landing, risk, questionnaire, and dashboard flow should remain focused on home resilience and preparedness.

---

## 3. Current Folder Structure

Follow this structure:

```txt
src/
├── App.jsx
├── main.jsx
├── index.css
├── assets/
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
├── components/
│   ├── layout/
│   │   ├── Footbar.jsx
│   │   ├── Navbar.jsx
│   │   └── ProgressStepper.jsx
│   ├── questionnaire/
│   │   └── QuestionCard.jsx
│   ├── recommendations/
│   │   └── RecommendationCard.jsx
│   ├── recovery/
│   │   ├── AidApplicationStatusList.jsx
│   │   ├── AidEligibilityForm.jsx
│   │   ├── AidProgramCard.jsx
│   │   ├── DeadlineTracker.jsx
│   │   ├── HomePhotoGallery.jsx
│   │   ├── PhotoCategoryCard.jsx
│   │   ├── RecoveryChecklist.jsx
│   │   └── RecoveryPreviewCard.jsx
│   ├── risk/
│   │   ├── RiskBarChart.jsx
│   │   └── RiskCard.jsx
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
│   ├── aidApplications.js
│   ├── aidPrograms.js
│   ├── ecoSolutions.js
│   ├── homePhotoCategories.js
│   ├── homeQuestions.js
│   ├── recoveryDocuments.js
│   └── regionalRiskData.js
├── lib/
│   └── supabaseClient.js
├── pages/
│   ├── HomeQuestionnaire.jsx
│   ├── Landing.jsx
│   ├── LocationInput.jsx
│   ├── Login.jsx
│   ├── Recovery.jsx
│   ├── RiskOverview.jsx
│   └── ScoreDashboard.jsx
├── services/
│   ├── assessmentService.js
│   ├── riskLookupService.js
│   └── zipLookupService.js
└── utils/
    ├── calculateAidDeadlines.js
    ├── calculateProjectedScore.js
    ├── calculateScore.js
    ├── generateRecommendations.js
    ├── getAidStatusStyle.js
    ├── getRiskLevel.js
    ├── getTopRisks.js
    └── matchAidPrograms.js
```

Do not create unrelated new folders unless explicitly requested.

If a file already exists, modify it carefully rather than replacing unrelated work.

If a file is empty, add a minimal working implementation with the correct export.

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
/recovery      → Recovery
```

`main.jsx` should remain close to the default Vite structure.

`App.jsx` should only manage routing, not business logic.

Expected `App.jsx` responsibility:

```txt
Import pages
Define routes
Export App
```

Do not put score calculation, localStorage parsing, aid matching, or page-level state inside `App.jsx`.

---

## 5. State and Data Flow

This MVP should be frontend-only unless explicitly requested otherwise.

Use `localStorage` for cross-page state.

Preparedness flow keys:

```txt
selectedZipCode
regionalRisk
homeProfile
```

Recovery flow keys:

```txt
recoveryDocumentChecklist
homePhotoChecklist
aidEligibilityAnswers
aidApplicationStatuses
```

Expected preparedness flow:

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

Expected recovery flow:

```txt
ScoreDashboard
→ links to /recovery

Recovery
→ reads and writes recoveryDocumentChecklist
→ reads and writes homePhotoChecklist
→ reads and writes aidEligibilityAnswers
→ displays mock aid matches, estimated deadlines, and mock application statuses
```

The app must not crash if `localStorage` is empty.

If required preparedness data is missing, show a clear message and a button back to `/location`.

If recovery localStorage data is missing, initialize safe defaults such as `{}` or `[]`.

---

## 6. LocalStorage Rules

Use these exact keys:

```txt
selectedZipCode
regionalRisk
homeProfile
recoveryDocumentChecklist
homePhotoChecklist
aidEligibilityAnswers
aidApplicationStatuses
```

When restarting the assessment from the dashboard, remove only:

```txt
selectedZipCode
regionalRisk
homeProfile
```

Do not clear the entire browser localStorage.

Do not clear recovery-related keys when restarting the preparedness assessment unless explicitly requested.

Recovery data is conceptually separate from the score assessment.

---

## 7. Data Files

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

---

### `homeQuestions.js`

Should export:

```js
homeQuestions
```

The expanded questionnaire includes questions across home structure, eco-mitigation status, and preparedness/recovery readiness.

Question IDs may include:

```txt
homeType
ownershipStatus
basementOrCrawlSpace
homeAge
roofMaterial
windowDoorProtection
pavedSurfaceLevel
waterPooling
dryBrushDistance
areaDensity
ecoFeatures
largeTreesNearby
energyOrDrainageAudit
insurancePolicy
knowsPolicyCoverage
digitalDocuments
preDisasterPhotos
emergencyKit
familyEmergencyPlan
localEmergencyRegistration
```

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

Supported question types:

```txt
single → one selected answer
multi  → multiple selected answers
```

`options` should be an array of user-facing answer labels.

Keep answer labels stable where possible because score calculation and recommendation generation may depend on exact values.

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

The questionnaire may contain recovery preparedness questions, but they should support the broader Home Readiness score. Do not reframe the main MVP as a document organizer or claims workflow.

---

### `ecoSolutions.js`

Should export:

```js
ecoSolutions
```

The action catalog includes flood/stormwater, wildfire, wind/hurricane, heat, winter storm, and preparedness/recovery actions.

Include actions such as:

```txt
rain garden
bioswale
permeable pavement
downspout redirection
rain barrel
sump pump
basement sealing
defensible space
gutter cleaning
ember-resistant vents
hurricane shutters
impact-resistant windows
large tree trimming
native shade or windbreak trees
cool roof coating
attic insulation or ventilation
pipe insulation
emergency heating or backup power
document backup
home inventory
household emergency plan
emergency kit
local emergency registration
insurance review
```

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

`disasterTypes` should be an array, not a single string.

Common values include:

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

`costLevel` may use:

```txt
Free
Low
Medium
High
```

`scoreIncrease` is a rule-based estimate used by projected score simulation. It is not an official engineering, insurance, or FEMA-certified value.

---

### `recoveryDocuments.js`

Should export:

```js
recoveryDocuments
```

Each item should include:

```js
{
  id,
  title,
  category,
  description,
  priority
}
```

Priority values:

```txt
High
Medium
Low
```

Example document categories:

```txt
Identity
Insurance
Housing
Property
Health
Financial
Emergency Contacts
```

This data powers `RecoveryChecklist.jsx`.

---

### `homePhotoCategories.js`

Should export:

```js
homePhotoCategories
```

Each item should include:

```js
{
  id,
  label,
  description
}
```

Recommended categories:

```txt
Front Door
Front View
Back View
Basement / Crawl Space
Roof & Gutters
Major Appliances
Valuable Items
```

For the MVP, these are documentation checklist categories, not real uploaded image records.

Do not implement real image upload unless explicitly requested.

---

### `aidPrograms.js`

Should export:

```js
aidPrograms
```

Each item should include:

```js
{
  id,
  agency,
  name,
  disasterTypes,
  eligibilityTags,
  estimatedAmount,
  applicationWindowDays,
  description
}
```

`disasterTypes` should be an array.

`eligibilityTags` should be an array.

Example eligibility tags:

```txt
home-damage
temporary-housing
uninsured-loss
repair-needed
property-owner
urgent-need
low-income
primary-residence
```

`estimatedAmount` is mock data.

`applicationWindowDays` is mock data.

Do not present aid program matching as official government guidance.

---

### `aidApplications.js`

Should export:

```js
mockAidApplications
```

Each item should include:

```js
{
  id,
  programId,
  programName,
  agency,
  status,
  submittedDate,
  deadlineDate
}
```

Status values may include:

```txt
Preparing
Submitted
Approved
Denied
```

This data powers `AidApplicationStatusList.jsx`.

---

## 8. Utility Function Rules

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

---

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

---

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

---

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
missing documents → document backup
no pre-disaster photos → home inventory
```

---

### `calculateProjectedScore.js`

Function:

```js
calculateProjectedScore(currentScore, selectedRecommendations)
```

Add selected recommendations’ `scoreIncrease` values.

Cap at `100`.

---

### `matchAidPrograms.js`

Function:

```js
matchAidPrograms(answers)
```

Use mock data from:

```txt
src/data/aidPrograms.js
```

Expected input shape:

```js
{
  disasterDate,
  disasterType,
  ownershipStatus,
  insuranceStatus,
  recoveryNeeds
}
```

`recoveryNeeds` should be an array of tags such as:

```txt
home-damage
temporary-housing
uninsured-loss
repair-needed
urgent-need
primary-residence
```

Return aid programs whose disaster type and eligibility tags match the user’s answers.

For renters, avoid returning programs that require `property-owner`.

This is mock matching logic only.

---

### `calculateAidDeadlines.js`

Functions:

```js
calculateAidDeadline(disasterDate, applicationWindowDays)
getDaysUntilDeadline(deadlineDate)
```

`calculateAidDeadline` should:

* Return `null` if `disasterDate` or `applicationWindowDays` is missing.
* Add `applicationWindowDays` to `disasterDate`.
* Return a date string in `YYYY-MM-DD` format.

`getDaysUntilDeadline` should:

* Return `null` if `deadlineDate` is missing.
* Compare the deadline to today.
* Return a positive number if days remain.
* Return `0` if the deadline is today.
* Return a negative number if the deadline has passed.

---

### `getAidStatusStyle.js`

Function:

```js
getAidStatusStyle(status)
```

Return Tailwind class strings for application status badges.

Suggested mapping:

```txt
Preparing → amber
Submitted → blue
Approved  → emerald
Denied    → red
Default   → slate
```

---

## 9. Component Responsibilities

### `components/ui/`

Reusable visual primitives only.

Do not put business logic here.

Components:

```txt
Button
Card
Input
Select
Textarea
Badge
ProgressBar
```

Each component should:

* Export a default React component.
* Accept `className`.
* Spread remaining props.
* Use Tailwind classes.
* Follow the design system defined in `index.css`.

---

### `components/layout/`

Shared layout components.

Components:

```txt
Navbar
Footbar
ProgressStepper
```

`Navbar.jsx` should include:

* App name
* Route links where useful
* Link to `/recovery` if navigation is already being shown

`Footbar.jsx` should include a small disclaimer.

`ProgressStepper.jsx` should show current assessment step.

Steps:

```txt
Location
Risk
Home Check
Score
```

Recovery is not part of the primary stepper because it is a secondary workspace.

---

### `components/risk/`

Regional risk visualization.

Components:

```txt
RiskCard
RiskBarChart
```

Do not require external chart libraries unless already installed.

Tailwind horizontal bars are preferred for stability.

---

### `components/questionnaire/`

Home vulnerability input.

Component:

```txt
QuestionCard
```

`QuestionCard.jsx` should support:

```txt
single
multi
```

The component should render options clearly and allow users to select answers.

---

### `components/score/`

Score display.

Components:

```txt
ScoreGauge
WeaknessList
```

`ScoreGauge.jsx` should show the DisasterReady Score clearly.

`WeaknessList.jsx` should show detected vulnerabilities and handle empty arrays gracefully.

---

### `components/recommendations/`

Eco-action recommendation cards.

Component:

```txt
RecommendationCard
```

Should display:

* title
* disaster type/category
* description
* eco benefit
* estimated cost
* impact level
* score increase
* selected state

---

### `components/simulation/`

Projected score simulation.

Component:

```txt
ScoreSimulationPanel
```

Should show:

* current score
* projected score
* improvement amount
* selected action list

---

### `components/recovery/`

Recovery Center components.

These are secondary-page components, not the main product flow.

Components:

```txt
RecoveryPreviewCard
RecoveryChecklist
HomePhotoGallery
PhotoCategoryCard
AidEligibilityForm
AidProgramCard
DeadlineTracker
AidApplicationStatusList
```

#### `RecoveryPreviewCard.jsx`

Used on `ScoreDashboard.jsx`.

Purpose:

* Show a small CTA to `/recovery`.
* Do not contain the full recovery workflow.
* Keep dashboard clean.

Suggested CTA:

```txt
Prepare your recovery documents and aid application plan.
Go to Recovery Center
```

#### `RecoveryChecklist.jsx`

Used on `Recovery.jsx`.

Purpose:

* Render `recoveryDocuments`.
* Allow users to mark documents as ready.
* Persist checklist state to `recoveryDocumentChecklist`.

#### `HomePhotoGallery.jsx`

Used on `Recovery.jsx`.

Purpose:

* Render home photo documentation categories.
* For MVP, use checklist-style placeholders.
* Persist state to `homePhotoChecklist`.
* Do not implement real file uploads yet.

#### `PhotoCategoryCard.jsx`

Used inside `HomePhotoGallery.jsx`.

Purpose:

* Display one home photo documentation category.
* Show documented/needed state.
* Toggle state when selected.

#### `AidEligibilityForm.jsx`

Used on `Recovery.jsx`.

Purpose:

* Collect basic post-disaster information.
* Update `aidEligibilityAnswers`.
* Trigger mock aid matching.

Fields may include:

```txt
disasterDate
disasterType
ownershipStatus
insuranceStatus
recoveryNeeds
```

#### `AidProgramCard.jsx`

Used inside `DeadlineTracker.jsx`.

Purpose:

* Display one matched aid program.
* Show agency, name, description, estimated amount, application window, estimated deadline, and days remaining.

#### `DeadlineTracker.jsx`

Used on `Recovery.jsx`.

Purpose:

* Display matched aid programs and their estimated deadlines.
* Use `calculateAidDeadlines.js`.
* Show empty state if no aid programs have been matched yet.

#### `AidApplicationStatusList.jsx`

Used on `Recovery.jsx`.

Purpose:

* Display mock application status records.
* Use `mockAidApplications`.
* Use `getAidStatusStyle`.

---

## 10. Page Responsibilities

### `Landing.jsx`

Purpose:

* Explain the product.
* Send users to `/location`.

Must include:

* Strong hero headline.
* Short subheadline.
* CTA button: “Check My Home”.
* Three feature cards:

```txt
Regional Risk
Home Vulnerability
Eco-Mitigation Actions
```

Recovery may be mentioned briefly as a secondary feature, but it should not dominate the landing page.

---

### `Login.jsx`

Purpose:

* Placeholder or basic login page.

Current MVP does not require real authentication unless explicitly requested.

Do not add Supabase auth logic unless requested.

---

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

---

### `RiskOverview.jsx`

Purpose:

* Show regional disaster risks.
* Show top 3 risks.
* Continue to questionnaire.

If regional data is missing:

* Show fallback message.
* Button back to `/location`.

---

### `HomeQuestionnaire.jsx`

Purpose:

* Render all questions.
* Save answers to `localStorage`.

Requirements:

* Require all questions before continuing.
* Show progress count, such as `8 of 20 answered`.
* Navigate to `/dashboard` after saving.
* Do not crash if a question has no answer yet.

---

### `ScoreDashboard.jsx`

Purpose:

* Show final preparedness result.

Must include:

* DisasterReady Score
* Top regional risks
* Weakness list
* Eco-mitigation recommendations
* Projected score simulation
* Small Recovery Center CTA
* Restart button that clears only assessment-related localStorage

Do not include the full recovery workflow in `ScoreDashboard.jsx`.

Correct dashboard/recovery relationship:

```txt
ScoreDashboard.jsx
= score, risk, weakness, recommendations, projected score, small recovery CTA

Recovery.jsx
= documents, home photos, aid matching, deadlines, application status
```

The dashboard may import:

```js
import RecoveryPreviewCard from "../components/recovery/RecoveryPreviewCard";
```

and render:

```jsx
<RecoveryPreviewCard />
```

---

### `Recovery.jsx`

Purpose:

* Dedicated secondary Recovery Center page.

Must include four main sections:

```txt
1. Recovery Document Checklist
2. Pre-Disaster Home Photo Gallery
3. Aid Eligibility & Program Matching
4. Deadline and Application Status Tracking
```

Expected page components:

```jsx
<RecoveryChecklist />
<HomePhotoGallery />
<AidEligibilityForm />
<DeadlineTracker />
<AidApplicationStatusList />
```

`Recovery.jsx` should manage aid eligibility answers and matched aid programs.

It should use:

```js
matchAidPrograms
```

It should persist aid eligibility answers to:

```txt
aidEligibilityAnswers
```

It should include a link back to `/dashboard`.

It must include the recovery disclaimer:

```txt
Aid matches, estimated amounts, and deadlines shown here are mock educational estimates for MVP demonstration. They are not official FEMA, SBA, insurance, state, or local government determinations.
```

---

## 11. Recovery Page Scope

Build now:

* `/recovery` route
* Recovery page layout
* Recovery document checklist
* Home photo category gallery placeholders
* Aid eligibility form using mock data
* Matched aid program cards
* Deadline tracker
* Mock application status list
* LocalStorage persistence for recovery checklist and answers

Do not build yet unless explicitly requested:

* Real file uploads
* Image storage
* Supabase persistence
* User authentication gates
* PDF export
* FEMA/SBA/state API integration
* Insurance claim form generation
* Legal or financial advice logic
* Official eligibility determination
* Real application submission

---

## 12. Design Rules

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

## 13. Coding Style

Use:

* React functional components.
* JavaScript, not TypeScript.
* Tailwind CSS classes.
* Named exports for data and utility functions.
* Default exports for React components.

Avoid:

* Backend code unless explicitly requested.
* Supabase/Firebase/Auth logic unless explicitly requested.
* Complex global state libraries.
* Unnecessary dependencies.
* Over-engineered abstractions.
* Long hardcoded logic inside page components.

Keep business logic in:

```txt
utils/
services/
```

Keep static content/data in:

```txt
data/
```

Keep visual primitives in:

```txt
components/ui/
```

Keep page composition in:

```txt
pages/
```

---

## 14. Dependency Rules

Required:

```txt
react-router-dom
```

Optional if already installed:

```txt
lucide-react
recharts
```

Do not add new dependencies without checking whether the feature can be implemented with plain React and Tailwind first.

For MVP stability, prefer simple Tailwind UI over complex libraries.

---

## 15. Supabase Rules

The project currently includes:

```txt
src/lib/supabaseClient.js
```

Do not remove this file.

However, do not add Supabase database logic, auth logic, file storage, or row-level security assumptions unless explicitly requested.

For the current Recovery Center MVP:

```txt
Use mock data + localStorage.
Do not connect recovery documents, photos, or aid applications to Supabase yet.
```

---

## 16. Error Handling Rules

The app should not crash when:

* localStorage is empty.
* unknown ZIP code is entered.
* a regional risk object is missing.
* a home profile is missing.
* no recommendations are generated.
* weaknesses array is empty.
* recovery checklist localStorage is missing.
* photo checklist localStorage is missing.
* aid eligibility answers are missing.
* no aid programs match the current answers.
* mock application list is empty.

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

```txt
No matched aid programs yet. Complete the aid eligibility check first.
```

---

## 17. Disclaimers

### Dashboard Disclaimer

Where appropriate, include:

```txt
DisasterReady Score is a rule-based educational estimate, not an official engineering inspection, insurance assessment, or government determination.
```

Use this especially on the dashboard or footer.

---

### Recovery Disclaimer

The Recovery page must include:

```txt
Aid matches, estimated amounts, and deadlines shown here are mock educational estimates for MVP demonstration. They are not official FEMA, SBA, insurance, state, or local government determinations.
```

This should appear near the aid matching and deadline tracking sections.

Do not imply that Canopy officially determines FEMA, SBA, state, local, or insurance eligibility.

---

## 18. Collaboration Rules for Agents

When making changes:

1. Check the existing file before editing.
2. Do not overwrite unrelated work.
3. Keep imports accurate.
4. Keep component names consistent with file names.
5. Run or mentally verify route flow after changes.
6. Avoid changing folder structure unless requested.
7. Follow `index.css` design rules.
8. Keep the main MVP flow clean and working before adding polish.
9. Keep Recovery as a secondary page, not a replacement for the dashboard.
10. If a file is empty, create a minimal working version first.
11. If a file already has code, modify it carefully rather than replacing it blindly.
12. Do not add new dependencies unless clearly necessary.

---

## 19. Implementation Priority

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
16. Recovery data files
17. Recovery utils
18. Recovery components
19. Recovery page
20. Dashboard → Recovery CTA
21. Full route test
```

For the current Recovery update, prioritize:

```txt
1. Fill empty recovery data files
2. Fill empty recovery utility files
3. Fill empty recovery component files
4. Implement Recovery.jsx
5. Add /recovery route
6. Keep only RecoveryPreviewCard CTA on ScoreDashboard.jsx
7. Run npm run build
```

Do not start with advanced styling before the end-to-end flow works.

---

## 20. Final Manual Test Checklist

Before considering the frontend done, test:

```txt
[ ] / renders Landing
[ ] /location renders ZIP input
[ ] sample ZIP 33101 loads Miami risk profile
[ ] sample ZIP 14623 loads Rochester risk profile
[ ] unknown ZIP uses fallback profile
[ ] /risk shows regional risks
[ ] /questionnaire shows all questions
[ ] unanswered questions block submit
[ ] answers save to localStorage
[ ] /dashboard shows score
[ ] weaknesses render correctly
[ ] recommendations render correctly
[ ] selecting recommendations changes projected score
[ ] dashboard shows small Recovery Center CTA
[ ] clicking Recovery Center CTA navigates to /recovery
[ ] /recovery renders Recovery page
[ ] recovery document checklist renders
[ ] recovery document checklist saves to localStorage
[ ] home photo gallery placeholders render
[ ] home photo checklist saves to localStorage
[ ] aid eligibility form renders
[ ] aid matching works with mock data
[ ] deadline tracker renders matched programs
[ ] disaster date calculates estimated deadlines
[ ] application status tracker renders mock applications
[ ] restart clears selectedZipCode, regionalRisk, and homeProfile only
[ ] restart does not clear recoveryDocumentChecklist, homePhotoChecklist, or aidEligibilityAnswers
[ ] app does not crash when localStorage is empty
[ ] design follows index.css
[ ] npm run build passes
```

---

## 21. Summary

This is a frontend-only MVP for a location-based eco-disaster preparedness app.

The highest priority is a complete and stable primary user flow:

```txt
ZIP code
→ regional disaster risk
→ home vulnerability questionnaire
→ DisasterReady Score
→ eco-friendly action recommendations
→ projected score improvement
```

The secondary Recovery Center supports the product by helping users organize:

```txt
recovery documents
pre-disaster home photo records
mock aid program matches
estimated application deadlines
mock application statuses
```

Keep the implementation simple, credible, and consistent with the existing design system in `index.css`.

Do not turn the app into only a recovery-document or aid-application product. The core product remains eco-disaster preparedness, with recovery support as a dedicated secondary workspace.
