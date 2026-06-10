# AGENT_GUIDE.md Recovery Update

## Product Scope Update

Canopy is still a location-based eco-disaster preparedness platform, but the MVP now includes a dedicated **Recovery Center** page.

The main platform flow remains:

```txt
Landing
→ LocationInput
→ RiskOverview
→ HomeQuestionnaire
→ ScoreDashboard
```

The recovery flow is now:

```txt
ScoreDashboard
→ Recovery
```

The Recovery page is not the main scoring flow, but it is no longer only a future preview. It should be implemented as a real secondary page that helps users prepare recovery documentation before a disaster and organize aid application steps after a disaster.

Use this product framing:

```txt
Canopy helps users prepare their home before disaster and organize recovery steps after disaster.
```

Avoid making the entire app sound like only a document organizer. The core identity remains eco-disaster preparedness and home resilience.

---

## Updated Routes

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

`App.jsx` should only manage routing.

---

## Updated Folder Structure

Follow the existing structure and extend it only where needed.

```txt
src/
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── LocationInput.jsx
│   ├── HomeQuestionnaire.jsx
│   ├── RiskOverview.jsx
│   ├── ScoreDashboard.jsx
│   └── Recovery.jsx
├── components/
│   ├── recovery/
│   │   ├── RecoveryChecklist.jsx
│   │   ├── HomePhotoGallery.jsx
│   │   ├── PhotoCategoryCard.jsx
│   │   ├── AidEligibilityForm.jsx
│   │   ├── AidProgramCard.jsx
│   │   ├── DeadlineTracker.jsx
│   │   └── AidApplicationStatusList.jsx
├── data/
│   ├── recoveryDocuments.js
│   ├── homePhotoCategories.js
│   ├── aidPrograms.js
│   └── aidApplications.js
└── utils/
    ├── matchAidPrograms.js
    ├── calculateAidDeadlines.js
    └── getAidStatusStyle.js
```

Do not create unrelated new folders.

---

## Recovery Page Responsibilities

`Recovery.jsx` should include four sections:

1. **Recovery Document Checklist**

   * Helps users prepare important documents before disaster.
   * Uses `recoveryDocuments.js`.
   * Allows users to mark documents as ready.
   * Stores checklist state in `localStorage`.

2. **Pre-Disaster Home Photo Gallery**

   * Helps users document home condition before disaster.
   * Uses `homePhotoCategories.js`.
   * Categories may include front door, front view, back view, basement, roof/gutters, major appliances, and valuable items.
   * For the MVP, do not implement real file upload unless explicitly requested.
   * Use mock gallery cards or checklist-style placeholders first.

3. **Aid Eligibility & Program Matching**

   * Collects basic user information after disaster.
   * Collects answers about disaster type, damage type, ownership status, insurance coverage, temporary housing need, and repair need.
   * Uses `aidPrograms.js` as mock public-aid data.
   * Uses `matchAidPrograms.js` to show possible aid programs.
   * Estimated support amounts are mock estimates, not official government determinations.

4. **Deadline and Application Status Tracking**

   * Shows each matched or mock aid program’s application window.
   * Uses `applicationWindowDays` from `aidPrograms.js`.
   * Uses `calculateAidDeadlines.js`.
   * Shows mock application statuses such as Preparing, Submitted, Approved, Denied.
   * Uses `aidApplications.js`.

---

## Recovery LocalStorage Keys

Use these keys:

```txt
recoveryDocumentChecklist
homePhotoChecklist
aidEligibilityAnswers
aidApplicationStatuses
```

Do not clear these keys when restarting only the readiness assessment unless explicitly requested.

The dashboard restart button should continue to remove only:

```txt
selectedZipCode
regionalRisk
homeProfile
```

---

## Recovery Data Rules

### `recoveryDocuments.js`

Should export `recoveryDocuments`.

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

Priority values may be:

```txt
High
Medium
Low
```

### `homePhotoCategories.js`

Should export `homePhotoCategories`.

Each item should include:

```js
{
  id,
  label,
  description
}
```

Example categories:

```txt
Front Door
Front View
Back View
Basement / Crawl Space
Roof & Gutters
Major Appliances
Valuable Items
```

### `aidPrograms.js`

Should export `aidPrograms`.

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

This is mock data for MVP demonstration. Do not present it as official FEMA, SBA, state, or local government data.

### `aidApplications.js`

Should export `mockAidApplications`.

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

---

## Dashboard and Recovery Relationship

`ScoreDashboard.jsx` should focus on:

* DisasterReady Score
* Top regional risks
* Weakness list
* Eco-mitigation recommendations
* Projected score simulation
* CTA button linking to `/recovery`

Do not keep a large recovery workflow inside `ScoreDashboard`.

Move recovery-related UI from the dashboard into `Recovery.jsx`.

A small card or CTA is allowed:

```txt
Prepare your recovery documents and aid application plan.
Go to Recovery Center
```

---

## Recovery Disclaimer

The Recovery page must include a small disclaimer:

```txt
Aid matches, estimated amounts, and deadlines shown here are mock educational estimates for MVP demonstration. They are not official FEMA, SBA, insurance, state, or local government determinations.
```

Use this near the aid matching and deadline tracker sections.

---

## Implementation Boundaries

Build now:

* `/recovery` route
* Recovery page layout
* Recovery document checklist
* Home photo category gallery placeholders
* Aid eligibility form using mock data
* Matched aid program cards
* Deadline tracker
* Mock application status list

Do not build yet unless explicitly requested:

* Real file uploads
* Image storage
* PDF export
* Real FEMA/SBA/state API integration
* Authentication-gated private document vault
* Supabase persistence
* Insurance claim form generation
* Legal or financial advice logic
