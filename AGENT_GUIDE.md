Read AGENT_GUIDE.md first.

Task:
Update AGENT_GUIDE.md to reflect the new product architecture separating pre-disaster user profile information from post-disaster recovery workflow.

Important constraints:
- Modify only AGENT_GUIDE.md in this commit.
- Do not modify React source files.
- Do not modify routes.
- Do not modify data files.
- Do not modify utility files.
- Do not make unrelated documentation changes.

Background:
The project architecture is changing.

Old mental model:
- Recovery.jsx contained a mix of preparedness documents, home photo checklist, aid eligibility questionnaire, deadlines, and recovery application support.

New mental model:
- UserInfo.jsx will be the pre-disaster profile page.
- Recovery.jsx will become the post-disaster workflow page.
- Users should only create a disaster/recovery profile in Recovery.jsx after they actually experience disaster damage.

Required documentation updates:

1. Add or update a section describing page responsibilities.

Document these page roles:

A. ScoreDashboard.jsx
Purpose:
- Shows readiness score, category scores, weaknesses, recommended actions, and score simulation.
- Uses regionalRisk + homeProfile.
- Pre-disaster readiness page.

B. UserInfo.jsx
Purpose:
- New planned page.
- Shows saved user/home/location/readiness profile in one place.
- Reads selectedZipCode, regionalRisk, and homeProfile from localStorage.
- Computes score summary using calculateScore(regionalRisk, homeProfile).
- Displays saved home questionnaire answers.
- Does not perform disaster aid matching.
- Does not ask post-disaster damage questions.

C. Recovery.jsx
Purpose:
- Post-disaster workflow page.
- Starts with a "Create Disaster Profile" flow.
- Used only when the user has experienced disaster damage and wants help organizing aid applications.
- Handles disasterProfile, matched aid programs, required documents, home damage photo evidence, deadlines, and application statuses.
- Should not be treated as the generic user profile page.

2. Add or update a section describing data model separation.

Document these concepts:

A. homeProfile
- Pre-disaster home questionnaire answers.
- Used for readiness score and recommendations.
- Stored in localStorage as homeProfile.
- Should not include actual disaster damage details.

B. regionalRisk
- ZIP/location-based risk data.
- Used for readiness score and regional risk display.
- Stored in localStorage as regionalRisk.

C. selectedZipCode
- User-selected ZIP code.
- Used for location/profile display.

D. disasterProfile
- New intended post-disaster data object.
- Used by Recovery.jsx after the user creates a disaster profile.
- Should include disaster-specific answers such as:
  - disasterType
  - disasterDate
  - declarationDate
  - hasDisasterDeclaration
  - ownershipStatus
  - isPrimaryResidence
  - homeLivability
  - insuranceStatus
  - insuranceClaimStatus
  - damageTypes
  - lostJobOrIncome
  - payment method details
- This should eventually replace or supersede aidEligibilityAnswers.

E. aidEligibilityAnswers
- Current transitional localStorage key.
- Existing Recovery flow may still use it.
- New work should prefer disasterProfile when refactoring Recovery.
- Maintain backward compatibility during migration.

F. recoveryDocumentChecklist
- Stores document readiness booleans by document id.

G. homePhotoEvidence
- Planned structured home/damage photo evidence metadata.
- Should eventually replace simple homePhotoChecklist.
- Should support category, timestamp, note, and photo records.
- Avoid storing many full image binaries in localStorage long-term.

H. readiness_score_snapshots
- Stores the latest readiness score state for a profile, not a full historical score timeline.
- Should be treated as the current snapshot for a given profile_id.
- If history is needed later, add a separate append-only table instead of overloading this one.

3. Add or update a section describing Recovery flow.

Expected Recovery.jsx flow:

Step 1:
- If no disasterProfile exists, show an intro card:
  "Create Disaster Profile"
- Explain that this flow is for users who experienced disaster damage.

Step 2:
- User completes disaster profile questionnaire.

Step 3:
- matchAidPrograms(disasterProfile) returns matched aid programs.

Step 4:
- calculateAidDeadlines(matchedPrograms, disasterProfile) returns deadline items.

Step 5:
- RecoveryChecklist receives matchedPrograms and disasterProfile context to show required/recommended documents.

Step 6:
- HomePhotoGallery manages damage photo evidence.

Step 7:
- AidApplicationStatusList tracks mock application statuses.

4. Add implementation guardrails.

Add these rules:
- Do not put post-disaster damage questions into UserInfo.jsx.
- Do not put generic home/readiness profile display into Recovery.jsx.
- Do not use Recovery.jsx as the primary place to display saved homeProfile.
- Do not duplicate readiness scoring logic inside UserInfo.jsx; use calculateScore.
- Do not duplicate aid matching logic inside components; use matchAidPrograms.
- Do not duplicate deadline calculation inside cards; use calculateAidDeadlines and DeadlineTracker.
- Preserve localStorage backward compatibility during migration.
- Prefer one-file-per-commit changes when possible.

5. Update any outdated references if AGENT_GUIDE.md currently describes Recovery.jsx as the place for general preparedness profile information.

Do not remove useful existing documentation unless it directly conflicts with the new architecture.

After editing:
- No build is required for documentation-only changes, but optionally run npm run build if desired.
- Report what sections were updated.
- Do not make unrelated changes.
