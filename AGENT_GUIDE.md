# AGENT_GUIDE.md

## Project Overview

DisasterDoc is a disaster recovery documentation web app that helps disaster survivors organize damage evidence, match possible aid programs, generate a recovery PDF package, and track application deadlines.

The product flow should feel like a guided recovery assistant, not a generic form website.

## Core User Flow

1. Basic Information
   The user enters name, contact information, disaster type, country, address, residency/status, disaster date, housing status, and insurance status.

2. Photo Upload
   The user uploads damage photos. The system labels photos by damage type and extracts available metadata such as captured date and location.

3. AI Interview
   The system asks 5–7 recovery-related questions to collect missing context, such as housing condition, insurance, immediate needs, lost documents, and whether the user has already contacted agencies.

4. Aid Matching
   The system recommends possible disaster aid programs and shows an estimated aid range based on the user's basic information, uploaded evidence, and interview responses.

5. Package Review
   The system organizes the user's disaster case into a structured recovery package.

6. PDF Download
   The user can download a final DisasterDoc recovery package as a PDF.

7. Deadline Tracking
   The user can track important application deadlines and required submission tasks.

## MVP Pages

Create only the following pages for the MVP:

* Landing
* Dashboard
* NewCase
* CaseDetail
* Deadlines

Do not create a Settings page for the MVP.

## Tech Stack

* React + Vite
* Tailwind CSS
* React Router
* Mock data first
* API integration later
* Supabase integration later if needed
* PDF generation later

The first goal is to complete the full UI flow using mock data before connecting real AI, database, or PDF logic.

## Team Responsibilities

Minjoo is responsible for:

* `src/components/**`
* reusable UI components
* component props structure
* mock data structure in `src/data/**`

Teammate is responsible for:

* `src/pages/**`
* `src/App.jsx`
* routing
* page layout
* navigation flow
* assembling components into pages

Avoid editing each other's main files unless necessary.

## Folder Structure

Use this structure:

```txt
src/
├── pages/
│   ├── Landing.jsx
│   ├── Dashboard.jsx
│   ├── NewCase.jsx
│   ├── CaseDetail.jsx
│   └── Deadlines.jsx
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── ProgressStepper.jsx
│   │
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Textarea.jsx
│   │   └── Badge.jsx
│   │
│   ├── case/
│   │   ├── CaseCard.jsx
│   │   └── StatusBadge.jsx
│   │
│   ├── upload/
│   │   ├── PhotoUploader.jsx
│   │   ├── PhotoGrid.jsx
│   │   └── PhotoCard.jsx
│   │
│   ├── interview/
│   │   ├── InterviewChat.jsx
│   │   └── ExtractedFactsPanel.jsx
│   │
│   ├── aid/
│   │   ├── AidMatchCard.jsx
│   │   └── DocumentChecklist.jsx
│   │
│   ├── report/
│   │   ├── ReportPreview.jsx
│   │   └── PdfDownloadButton.jsx
│   │
│   └── deadline/
│       ├── DeadlineCard.jsx
│       └── DeadlineList.jsx
│
├── data/
│   ├── mockCases.js
│   ├── mockAidPrograms.js
│   └── mockInterviewQuestions.js
│
└── App.jsx
```

## Component Contract

Pages should use components according to the following props.

### CaseCard

```jsx
<CaseCard caseData={caseItem} onClick={handleClick} />
```

Expected data:

```js
{
  id: "case-001",
  title: "Hurricane Damage - Florida",
  disasterType: "Hurricane",
  location: "Miami, Florida",
  disasterDate: "2026-09-18",
  status: "Evidence Review",
  photoCount: 12,
  aidMatchCount: 3,
  nextDeadline: "2026-10-17"
}
```

### PhotoCard

```jsx
<PhotoCard photo={photoItem} onLabelChange={handleLabelChange} />
```

Expected data:

```js
{
  id: "photo-001",
  url: "/mock/flooded-room.jpg",
  label: "Flood Damage",
  confidence: 0.91,
  capturedAt: "2026-09-19T14:30:00",
  location: "Miami, Florida"
}
```

### AidMatchCard

```jsx
<AidMatchCard program={programItem} onAddToPackage={handleAddToPackage} />
```

Expected data:

```js
{
  id: "aid-001",
  name: "FEMA Individual Assistance",
  agency: "FEMA",
  matchLevel: "High",
  estimatedAidRange: "$1,200 - $4,500",
  reason: [
    "Disaster type matches a declared hurricane event",
    "Uploaded photos show interior flood damage",
    "User reported temporary housing need"
  ],
  requiredDocuments: [
    "Proof of identity",
    "Proof of residence",
    "Damage photos",
    "Insurance status"
  ],
  deadline: "2026-10-17"
}
```

### DeadlineCard

```jsx
<DeadlineCard deadline={deadlineItem} onMarkSubmitted={handleMarkSubmitted} />
```

Expected data:

```js
{
  id: "deadline-001",
  title: "FEMA Individual Assistance Application",
  agency: "FEMA",
  dueDate: "2026-10-17",
  status: "Not Submitted",
  priority: "High",
  requiredActions: [
    "Review generated PDF",
    "Attach proof of residence",
    "Submit application online"
  ]
}
```

### ProgressStepper

```jsx
<ProgressStepper
  steps={["Basic Info", "Photos", "Interview", "Aid Match", "Review", "Download"]}
  currentStep={2}
/>
```

### InterviewChat

```jsx
<InterviewChat
  questions={mockInterviewQuestions}
  answers={answers}
  onAnswerSubmit={handleAnswerSubmit}
/>
```

### ExtractedFactsPanel

```jsx
<ExtractedFactsPanel facts={facts} />
```

Expected data:

```js
[
  "Home is currently unlivable",
  "User is a renter",
  "No flood insurance",
  "Needs temporary housing",
  "Lost personal documents"
]
```

### ReportPreview

```jsx
<ReportPreview reportData={reportData} />
```

## UI Guidelines

The UI should feel:

* calm
* trustworthy
* structured
* professional
* supportive but not overly emotional

Avoid:

* playful colors
* exaggerated AI claims
* overly casual language
* guaranteed aid language
* cluttered layouts

Use careful wording for aid prediction.

Preferred wording:

* "Estimated Aid Range"
* "Potential Match"
* "Required Documents"
* "Not guaranteed"
* "Based on provided information"

Avoid wording like:

* "You will receive"
* "Guaranteed aid"
* "Approved amount"

## Development Rules

1. Build with mock data first.
2. Do not connect real AI or Supabase until the full UI flow works.
3. Components should not contain page-level routing logic.
4. Pages should assemble components and handle navigation.
5. Keep component props simple and predictable.
6. Avoid creating unnecessary pages.
7. Avoid creating duplicate components.
8. Use Tailwind CSS for styling.
9. Use PascalCase for component file names.
10. Keep the MVP focused on the disaster documentation flow.

## MVP Priority

Highest priority:

1. Dashboard
2. New Case wizard
3. Photo upload and evidence labeling UI
4. AI interview UI
5. Aid matching UI
6. Report preview
7. PDF download button placeholder
8. Deadline tracking

Lower priority:

1. Login
2. Real notifications
3. User settings
4. Full calendar view
5. Real agency submission links
6. Real payment or aid processing

## Important Product Constraint

DisasterDoc does not guarantee disaster aid. It only organizes evidence, suggests possible aid programs, estimates potential aid ranges, and helps users prepare application materials.

Always present AI results as assistive suggestions, not final decisions.
