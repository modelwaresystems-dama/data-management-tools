# FutureState workbook: what the AI Eval Framework v2 needs

For `AGGPSA_FutureState_Model.xlsx` and every other `<Company>_FutureState_Model.xlsx`.
Written against v2.0.1 of the AI Eval Framework and the Ethical Assessment Review application.

---

## The finding first

**The copy in this session is pre-EAR.** None of the schema extensions the EAR application writes are in it:
no `AssessedBy`, `AssessedOn`, `NA` or `NAReason` on sheets 110 to 124, no `ImpactTier` or `ApprovedBy` on
sheet 118, no `Dated`, `Attributed`, `Owned` or `Locatable` on 119, no `AcceptanceCriterion` on 121, no
`Status` or `RenewalOfID` on 123, and no `UseCaseTiering`, `AssessorPass`, `Reconciliation` or
`GovernanceForumRecord` sheets. The highest-numbered sheet is 223, so nothing has been written at 224 upward.

**Most of what the eval framework was missing, the EAR already produces.** The first action is not to hand-build
anything. It is to re-export the model from the EAR application, and then apply only what remains below.

The AI Eval Framework now reads all of the EAR columns when they are present and degrades cleanly when they are
not, so the app works on either copy. What changes is how much of it is measurable rather than merely stated.

---

## Part 1: what the EAR supplies once you re-export

Nothing to build. Listed so you can see what each column feeds.

| EAR field | Sheet | Feeds in v2 |
| :--- | :--- | :--- |
| `ImpactTier` | 118 | Gate criticality on every requirement generated from the EAR, and the proportionate review depth at S3 |
| `ApprovedBy`, `ApprovedOn` | 118 | The signed determination. Its absence is a gate-critical blocker on G0 admissibility |
| `SupersededBy` | 118 | `SupersedesRequirementID`, the requirement lineage |
| `Dated`, `Attributed`, `Owned`, `Locatable` | 119 | Concern 8 evidence integrity as four booleans. Operator `=`, threshold `4`, stop `3` |
| `ArtefactRef` | 119 | `EvidenceRepositoryURI` |
| `AcceptanceCriterion` | 121 | The typed threshold on every stewardship monitor |
| `LastObserved` | 121 | An immutable run against that threshold |
| `Status`, `RenewalOfID` | 123 | Lapsed exception becomes a stop threshold and fires G5 |
| `Outcome`, `RetainedIndefinitely` | 124 | G6 retirement closure |
| `AssessedBy`, `AssessedOn` | 110 to 124 | `RequirementOwnerRoleID` and `IndependenceRequired`, from the EAR's own segregation of duties |
| `NA`, `NAReason` | 110 to 124 | The explicit not-testable-yet finding, instead of an empty cell that reads as green |
| `UseCaseTiering` | new | The five tiering answers, which map almost one for one onto the G0 admissibility screen |
| `AssessorPass` | new | Independence evidence |
| `GovernanceForumRecord` | new | The accountable forum on a gate decision |

One note on sheet 113. The EAR renamed `BankBenefit` and `CustomerBenefit` to `FunderBenefit` and
`EntrepreneurBenefit`. The eval framework reads both, so a re-export does not break it either way.

---

## Part 2: what the EAR does not supply, and still needs building

### P0. Discrete condition identifiers

`StewardshipDecision.Conditions` holds the identical string `"Conditions per equity/consent review"` on all
eighteen rows. v2 expands one ConditionID into four requirements: a measurable control, an affected-group
outcome, a qualitative attestation and a monitoring trigger. A placeholder cannot be expanded into anything.

The eval framework now works around this by generating requirements from the seven domain assessments
instead, because that is where the harm, the mitigation, the affected group and the continue criteria actually
live. That is a better source than a conditions field would be, and it should stay. But a conditional approval
still carries conditions that someone has to discharge, and there is nowhere to put them.

**This belongs in the EAR application, not in the workbook by hand.** The EAR is authoritative for ethical
determination and risk acceptance, and the eval layer references its stable IDs. A new sheet at the next free
prefix:

`224 · EARCondition`. Columns: `ConditionID`, `EARReviewID`, `ObjectID`, `DomainKey`, `ConditionText`, `Harm`,
`AffectedGroup`, `MitigationControlID`, `OversightRequirement`, `RedressRoute`, `ContinueCriterion`,
`StopCriterion`, `RetestTrigger`, `OwnerRoleID`, `ReviewerRoleID`, `Status`, `DueDate`, `ClosedOn`,
`ClosureEvidenceID`.

`DomainKey` takes one of `purpose`, `human`, `benefit`, `authority`, `equity`, `sustain`, `community`, so a
condition inherits the depth rules the EAR already enforces. `StopCriterion` is the field that makes a
condition a stop threshold rather than a target.

### P0. Model and component versions

`AIModel` has no version column. `ModelCard` has no `ModelID` and no version, only `UseCaseID`. G4 authorises
one specific system and model version in one defined context, so as things stand that gate cannot be recorded
truthfully, and the retest trigger "component or version change" can never fire because there is nothing to
compare against.

`148 · AIModel`. Add `ModelVersionID`, `ReleasedOn`, `VersionStatus`, `SupersedesVersionID`,
`TrainingDataRef`, `TrainingCutoff`.

`73 · ModelCard`. Add `ModelID`, `ModelVersionID`, `CardVersion`, `ValidationDecision`, `ValidatedBy`,
`ValidatedOn`. Without `ModelID` the card cannot be a projection of a specific model, which is the one thing a
model card is for.

`225 · SystemCard` (new). Columns: `SystemID`, `SystemName`, `UseCaseIDs`, `ComponentIDs`, `Interfaces`, `Dependencies`,
`SupplierIDs`, `Autonomy`, `Tools`, `FallbackRoute`, `EnvironmentID`, `ConfigurationVersionID`,
`DeployedContext`, `MonitoringBaseline`. A system card exists from S3, when the solution concept exists, which
is earlier than a model card and later than the use-case record.

### P1. AIEval specification columns

`172 · AIEval` carries the threshold as prose with the operator glued on, and nothing else a specification
needs. Add:

`Operator`, `ThresholdValue`, `WarningThreshold`, `StopThreshold`, `Tolerance`, `Unit`, `SliceDimensions`,
`DatasetID`, `DatasetVersionID`, `EvaluatorType`, `EvaluatorID`, `RubricVersionID`, `EnvironmentID`,
`ConfigurationVersionID`, `ComponentVersionID`, `SampleSize`, `CoverageAchieved`, `ConfidenceLow`,
`ConfidenceHigh`, `ExecutedAt`, `AssuranceConcern`, `LifecyclePhase`, `GateCriticality`, `SourceConditionID`,
`SpecificationStatus`.

Keep the existing `Threshold` as written so nothing that reads it today breaks. `Operator` and
`ThresholdValue` are the typed pair the framework uses when both are present.

**Rename `Status` to `RecordedStatus_Historic`.** Do not delete it. Two recorded passes sit over computed fails
in the U05 rows, and that mismatch is the exercise in session step 15. The rename says plainly that the column
is history, never authority. Add a note row or a column comment to that effect.

### P1. Gate decision register

`51 · ImplementationGate` is one "Pilot gate" per use case with prose entry and exit criteria. It is not a
register of decisions taken.

`226 · GateDecisionRegister` (new). Columns: `GateDecisionID`, `UseCaseID`, `GateRef`, `Outcome`, `DecisionMakerRoleID`,
`DecisionMakerName`, `DecisionDate`, `ConditionsAttached`, `EvidenceIDs`, `ExpiryOrReviewTrigger`,
`SupersedesGateDecisionID`, `ForumID`.

`GateRef` takes `S1`, `G0`, `S2`, `G1`, `S3`, `G2`, `S4`, `G3`, `G4`, `S5`, `G5`, `G6`. The EAR verdict register
covers G0 only, so the other eleven have nowhere to live. `ForumID` joins the EAR's `GovernanceForumRecord`.

### P2. Readiness domains

`49 · ReadinessDimension` holds six: People, Process, Technology, Data, Governance, Measurement. v2 works from
nine. Add `RD7 Integration`, `RD8 Supplier and dependency`, `RD9 Change and recovery`, and split `RD3
Technology` into technology and model. Until Integration exists, concern 5 System, Integration and Operational
Resilience has nothing in the model to seed from, which is why it reads Unevidenced on every use case.

Adding a dimension means adding rows to `164 · UseCase_ReadinessAssessme` for each use case, which is
mechanical once the dimension rows exist.

### P2. Security, privacy and misuse

Nothing in the model covers concern 7. `RecordsRetention` and `Incident_Error_Log` are adjacent and neither is
it.

`227 · SecurityPrivacyAssessment` (new). Columns: `AssessmentID`, `ObjectID`, `ObjectType`, `ThreatScenario`,
`AttackSurface`, `RedTeamPerformed`, `RedTeamDate`, `LeakageTestResult`, `PromptInjectionTestResult`,
`AccessControlEvidence`, `ToolPermissionBoundary`, `RetentionConformance`, `ResidualRisk`, `OwnerRoleID`,
`ReviewerRoleID`, `EvidenceID`.

For AGGPSA this matters more than it looks. AG3 serves seven use cases, and authority earned in one can be
exercised in another.

---

## Part 3: defects in the current data

These are not schema changes. They are wrong values.

1. **`212 · BusinessPolicyControl` carries the literal string `"None"` in `PolicyID` on fifteen of twenty-three
   rows**, including all three controls bound to U05, and the same in `BusinessRuleID` and `RuleRequirement`.
   That is a Python `None` serialised as text. Every join against those columns silently matches nothing. The
   app now treats `"None"`, `"nan"`, `"null"` and `"NaN"` as blank, but the cells should be empty.

2. **The readiness contradiction on U05.** `164 · UseCase_ReadinessAssessme` records Data at 1 of 5 on the basis
   that no governed data product is mapped to the use case, while `189 · DataProduct_AIUseCase_Map` maps U05 to
   DP05. Two parts of the model disagree about whether the supply exists. One is stale.

3. **`76 · EvalMetric` says `"Threshold TBD"` on all four rows** and covers U01 to U04 only. `78 · EvalPlan`
   covers U01 and U08. `77 · EvalDataset` holds two rows, neither for U05's models. Three stub sheets.

4. **No use-case-level eval exists.** All fifteen AIEval rows for the U05 chain target AG3, ML-IMPACT or
   ML-ICEBERG. Nothing measures whether U05 as a use case works, which is defensible for component assurance
   and leaves concerns 1 and 2 with no measured evidence on any use case.

5. **About 1,078 cells carry em dashes**, concentrated in `CDE_DQ_Profile`, `CDE_DQ_Distribution`,
   `PolicyProcess`, `DataProduct` and `CriticalDataElement`. The app no longer propagates them into anything it
   generates, so this is cosmetic in the model itself.

---

## Part 4: what is already good, and should not be touched

Worth stating, because a change list reads as a complaint otherwise.

- **`156 · DataProductDQScorecard` is the best-built sheet in the model.** Ninety rows, each with a typed
  target and an observed score. It now generates twenty-one requirements for U05 with complete specifications
  and real runs. Nine of the eighteen dimensions on U05's three products miss their targets, and six of those
  are gate-critical.
- **Not one of those ninety rows records a status the arithmetic contradicts.** The data team's register is
  honest. The eval register, with fifteen rows, gets three wrong. That contrast is now taught in session steps
  14 and 15.
- **`122 · StewardshipTraceability` is a complete join row per use case**, and it is what lets the eval
  framework reach the right control from the ethical determination.
- **The seven EAR domain assessments carry real, specific content per use case.** `PotentialHarm`, `Mitigation`,
  `NonAIAlternative`, `AppealRoute`, `ContinueCriteria` and `NegativeImpact` are exactly what a requirement
  needs, which is why they are now the condition source in place of the placeholder.
- **`108 · ControlTest` compares an expected decision against an actual one.** That is already the v2 pattern,
  and it imports as a run without translation.

---

## Order of work

1. Re-export the model from the EAR application. That closes most of Part 1 with no manual effort.
2. Clear the literal `"None"` strings in `212 · BusinessPolicyControl`. One find and replace.
3. Resolve the U05 readiness contradiction. One of two cells is stale.
4. Add `EARCondition` in the EAR application, not in the workbook.
5. Add the version columns to `AIModel` and `ModelCard`. Nothing else unblocks G4.
6. Add the specification columns to `AIEval` and rename `Status`.
7. Add `GateDecisionRegister` and `SystemCard`.
8. Extend the readiness dimensions and add `SecurityPrivacyAssessment`.
