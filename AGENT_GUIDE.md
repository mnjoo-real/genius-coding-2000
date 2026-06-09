# AGENT_GUIDE.md

## Project Overview

DisasterDoc is a disaster recovery documentation web app that helps disaster survivors organize damage evidence, match possible aid programs, generate a recovery PDF package, and track application deadlines.

The product should feel like a guided recovery assistant, not a generic form website.

DisasterDoc does not guarantee disaster aid. It organizes evidence, suggests possible aid programs, estimates potential aid ranges, and helps users prepare application materials.

Always present AI results as assistive suggestions, not final decisions.

---

## Core User Flow

1. **Basic Information**
   The user enters name, contact information, disaster type, country, address, residency/status, disaster date, housing status, and insurance status.

2. **Photo Upload**
   The user uploads damage photos. The system labels photos by damage type and extracts available metadata such as captured date and location.

3. **AI Interview**
   The system asks 5–7 recovery-related questions to collect missing context, such as housing condition, insurance, immediate needs, lost documents, and whether the user has already contacted agencies.

4. **Aid Matching**
   The system recommends possible disaster aid programs and shows an estimated aid range based on the user's basic information, uploaded evidence, and interview responses.

5. **Package Review**
   The system organizes the user's disaster case into a structured recovery package.

6. **PDF Download**
   The user can download a final DisasterDoc recovery package as a PDF.

7. **Deadline Tracking**
   The user can track important application deadlines and required submission tasks.

---

## MVP Pages

Create only the following pages for the MVP:

* `Landing.jsx`
* `Dashboard.jsx`
* `NewCase.jsx`
* `CaseDetail.jsx`
* `Deadlines.jsx`

Do **not** create a Settings page for the MVP.

Do **not** add unnecessary pages unless explicitly instructed.

---

## Tech Stack

Use the following stack:

* React + Vite
* Tailwind CSS
* React Router
* Mock data first
* API integration later
* Supabase integration later, only if needed
* PDF generation later

The first goal is to complete the full UI flow using mock data before connecting real AI, database, or PDF logic.

---

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

If a change affects both pages and components, keep the change minimal and preserve the component contract.

---

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

---

## Routing Structure

Use this route structure:

```txt
/                 -> Landing
/dashboard         -> Dashboard
/new-case          -> NewCase
/cases/:caseId     -> CaseDetail
/deadlines         -> Deadlines
```

Do not create routes for Settings, Profile, Login, or Admin unless explicitly instructed.

A mock login state is acceptable if needed for navigation flow.

---

## New Case Flow

The `NewCase.jsx` page should behave like a guided wizard.

Use this step order:

```txt
Basic Info → Photos → Interview → Aid Match → Review → Download
```

The user should always know where they are in the flow.

Use `ProgressStepper` for the step indicator.

The wizard should work with mock data first. Do not block UI implementation on real AI/API logic.

---

## Component Contract

Pages should use components according to the following props.

Do not rename these props unless explicitly instructed.

---

### CaseCard

Usage:

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

---

### StatusBadge

Usage:

```jsx
<StatusBadge status={caseData.status} />
```

Expected values:

```js
"Draft"
"Evidence Review"
"Interview Complete"
"Aid Matched"
"PDF Generated"
"Submitted"
```

---

### PhotoUploader

Usage:

```jsx
<PhotoUploader onUpload={handlePhotoUpload} />
```

Expected behavior:

* Allow drag-and-drop or file selection.
* For MVP, mock uploaded image previews are acceptable.
* Do not require a real storage backend for the first version.

---

### PhotoGrid

Usage:

```jsx
<PhotoGrid photos={photos} onLabelChange={handleLabelChange} />
```

Expected data:

```js
[
  {
    id: "photo-001",
    url: "/mock/flooded-room.jpg",
    label: "Flood Damage",
    confidence: 0.91,
    capturedAt: "2026-09-19T14:30:00",
    location: "Miami, Florida"
  }
]
```

---

### PhotoCard

Usage:

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

Photo labels should be editable because AI classification may be wrong.

---

### InterviewChat

Usage:

```jsx
<InterviewChat
  questions={mockInterviewQuestions}
  answers={answers}
  onAnswerSubmit={handleAnswerSubmit}
/>
```

Expected behavior:

* Ask 5–7 questions.
* Show question progress.
* Store answers in page state or mock state.
* Do not require a real AI API for the first version.

---

### ExtractedFactsPanel

Usage:

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

---

### AidMatchCard

Usage:

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

Use careful aid language. Never imply guaranteed approval.

---

### DocumentChecklist

Usage:

```jsx
<DocumentChecklist documents={requiredDocuments} />
```

Expected data:

```js
[
  "Proof of identity",
  "Proof of residence",
  "Damage photos",
  "Insurance status"
]
```

---

### DeadlineCard

Usage:

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

---

### DeadlineList

Usage:

```jsx
<DeadlineList deadlines={deadlines} onMarkSubmitted={handleMarkSubmitted} />
```

---

### ProgressStepper

Usage:

```jsx
<ProgressStepper
  steps={["Basic Info", "Photos", "Interview", "Aid Match", "Review", "Download"]}
  currentStep={2}
/>
```

`currentStep` should be zero-based unless explicitly changed across the whole project.

---

### ReportPreview

Usage:

```jsx
<ReportPreview reportData={reportData} />
```

Expected data:

```js
{
  applicantName: "Alex Kim",
  disasterSummary: "The applicant experienced hurricane-related flooding at their residence.",
  evidenceSummary: [
    "Interior flood damage detected",
    "Roof damage reported",
    "Temporary housing needed"
  ],
  timeline: [
    {
      date: "2026-09-18",
      event: "Hurricane impact reported"
    },
    {
      date: "2026-09-19",
      event: "Flood damage photos uploaded"
    }
  ],
  aidMatches: [
    "FEMA Individual Assistance",
    "Red Cross Emergency Shelter"
  ]
}
```

---

### PdfDownloadButton

Usage:

```jsx
<PdfDownloadButton reportData={reportData} />
```

For MVP, this can be a placeholder button until PDF generation is implemented.

---

## Mock Data Rules

Use mock data before real integrations.

Create mock data in:

```txt
src/data/mockCases.js
src/data/mockAidPrograms.js
src/data/mockInterviewQuestions.js
```

Mock data should be realistic enough for a demo.

Use disaster-related examples such as:

* hurricane damage
* flood damage
* wildfire damage
* earthquake damage
* storm damage

Avoid unrealistic or joke data.

---

## UI Guidelines

The UI should feel:

* calm
* trustworthy
* structured
* professional
* supportive but not overly emotional
* clear enough for a stressed disaster survivor

Avoid:

* playful colors
* exaggerated AI claims
* overly casual language
* guaranteed aid language
* cluttered layouts
* aggressive animations
* confusing technical jargon

Use careful wording for aid prediction.

Preferred wording:

* "Estimated Aid Range"
* "Potential Match"
* "Required Documents"
* "Not guaranteed"
* "Based on provided information"
* "Suggested next steps"
* "Possible aid program"

Avoid wording like:

* "You will receive"
* "Guaranteed aid"
* "Approved amount"
* "Confirmed eligibility"
* "Definitely qualified"

---

## Design System Rule

The global design system is defined in `src/index.css`.

All pages and components must follow the colors, typography, spacing, border radius, shadows, transitions, and utility classes defined in `src/index.css`.

Do not introduce conflicting colors, font sizes, shadows, spacing systems, border radius values, or custom visual styles unless explicitly instructed.

When styling a component, first check whether an existing class, CSS variable, or reusable style pattern already exists in `src/index.css`.

`src/index.css` is the single source of truth for DisasterDoc's visual design.

Do not create separate competing design systems inside individual components.

Do not hard-code random colors if a design token or existing utility class is already available in `src/index.css`.

---

## Styling Rules

Use Tailwind CSS for component styling.

Prefer reusable classes and patterns from `src/index.css`.

Use responsive layouts by default.

Cards should use consistent padding, rounded corners, border style, and shadow style.

Buttons should use the shared button patterns.

Inputs should use the shared form field patterns.

Badges should use consistent status colors and typography.

Avoid inline styles unless absolutely necessary.

Avoid creating large custom CSS files for individual components.

---

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
11. Preserve the component contract unless explicitly instructed.
12. Do not create a Settings page.
13. Do not create unrelated features.
14. Do not use guaranteed aid language.
15. Treat AI outputs as suggestions, not official decisions.
16. Follow `src/index.css` for visual design.

---

## File Naming Rules

Use PascalCase for React components:

```txt
CaseCard.jsx
AidMatchCard.jsx
DeadlineCard.jsx
ProgressStepper.jsx
```

Do not use:

```txt
casecard.jsx
aid-match-card.jsx
deadline_card.jsx
```

Use camelCase for mock data files:

```txt
mockCases.js
mockAidPrograms.js
mockInterviewQuestions.js
```

---

## Import Rules

Use consistent import paths.

If alias imports are configured, prefer:

```jsx
import CaseCard from "@/components/case/CaseCard";
import DeadlineCard from "@/components/deadline/DeadlineCard";
import Button from "@/components/ui/Button";
```

If alias imports are not configured, use relative imports consistently:

```jsx
import CaseCard from "../components/case/CaseCard";
import DeadlineCard from "../components/deadline/DeadlineCard";
import Button from "../components/ui/Button";
```

Do not mix import styles unnecessarily.

---

## Accessibility Rules

Use semantic HTML where possible.

Buttons should be actual `<button>` elements unless navigation requires a link.

Inputs should have labels.

Images should have meaningful `alt` text.

Do not rely only on color to communicate status.

Keep text readable and contrast high.

---

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
7. Real AI classification
8. Real PDF generation

---

## Collaboration Rules

Work in separate branches when possible.

Recommended branches:

```txt
feature/components-ui
feature/pages-flow
```

Minimize merge conflicts by keeping responsibility boundaries clear.

Components owner should avoid editing page layout unless necessary.

Pages owner should avoid changing component internals unless necessary.

If a prop must change, update this guide or clearly notify the other teammate.

---

## Recommended Agent Prompt

Before asking an AI coding agent to modify the project, use this instruction:

```txt
Read AGENT_GUIDE.md first and follow the project structure, component contract, and MVP scope exactly. Also, always follow the global design system and styling rules defined in src/index.css. Do not introduce conflicting styles, colors, spacing, shadows, or typography unless explicitly instructed.
```

---

## Final Product Constraint

DisasterDoc is an assistive recovery documentation tool.

It should help users:

* organize disaster evidence
* understand possible aid options
* prepare a structured recovery package
* track deadlines

It should not claim to:

* guarantee aid
* replace official agencies
* make legal decisions
* make final eligibility decisions
* submit applications automatically unless explicitly implemented later
