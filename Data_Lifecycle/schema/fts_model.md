# FTS model shape (`.fts.json`)

One JSON document per Finite State Transition model. Every element carries a stable ID; relationships are expressed by ID. Lists may be empty. The viewer and the skill both read this shape.

## meta
`modelId`, `name`, `level` (`global`, `knowledge-area`, `worked-example`), `knowledgeArea` (null for global), `version`, `status` (for example `Proposed / illustrative`), `buildStamp` (SAST), `source`, `note`, `counts`.

## rules
The retained metamodel decisions the model is built to. `id`, `shortName`, `statement`, `rationale`, `appliesTo`, `test`, `compliant`, `nonCompliant`, `status`, `authority`, `notes`.

## globalStates
`id`, `name`, `kind` = `global`, `definition`, `stateType`, `initial`, `terminal`, `status`, `semanticClass`, `nameQA` {`status`, `rationale`}, `retainedRuleIds` [].

## subStates
Nested to any depth: `parent` is a global state ID or another sub-state ID. `id`, `name`, `kind` = `sub`, `parent`, `definition`, `sequence`, `requirement`, `readiness` (true for a readiness state), `status`, `semanticClass`, `nameQA`, `retainedRuleIds`, `notes`.

## activities
Verbs permitted inside a state; state-preserving unless a transition contract is met. `id`, `name`, `permittedIn` (state ID), `activityType`, `nounVerb`, `permissibility`, `notes`.

## transitions
`id`, `name`, `level` (`Initial`, `Global`, `Sub-State`), `source` (state ID or `[Initial]`), `target`, `event` (event ID), `transitionType`, `optionality` (Required, Conditional, Optional / iterative, Optional / recursive), `guardSummary`, `status`.

## events
`id`, `name`, `eventType`, `meaning`.

## entryConditions, exitConditions
Predicates on a state. `id`, `appliesTo` (state ID), `predicate`, `requirement`, and for entry `conditionType`.

## invariants
`id`, `appliesTo`, `predicate`, `severity`.

## guards
Predicates on one transition, contributed by a scope such as a Knowledge Area. `id`, `name`, `transition` (transition ID), `predicate`, `scope`, `requirement`.

## kaInteractions
How a Knowledge Area state model touches a sub-state. `id`, `subState`, `knowledgeArea`, `interactionType`, `applicability`, `description`.

## kaMatrix
`knowledgeArea`, `scopeNote`, `cells` { column: value }.

## Governance chain
- `rulesGov`: `id`, `name`, `scope`, `statement`, `appliesTo`, `requirement`.
- `controls`: `id`, `name`, `controlType`, `appliesTo`, `objective`, `outcome`.
- `roles`: `id`, `name`, `accountability`, `responsibility`, `appliesTo`.
- `decisionRights`: `id`, `name`, `holder` (role ID), `appliesTo` (state or transition ID), `definition`, `requirement`.
- `exceptions`: `id`, `name`, `transition`, `basis`, `authority`, `conditions`, `statusValues`.
- `artefacts`: `id`, `name`, `artefactType`, `producedIn` (state ID), `producingActivity`, `evidenceUse`.
- `evidence`: `id`, `name`, `evidenceType`, `relatesTo` (state, transition, control, exception or decision-right ID), `description`, `requirement`.

## compositeStates
The state vector at a point in time. `id`, `name`, `globalState`, `subState`, `kaDimensions`, `context`, `vectorType`.

## relationships
Typed edges between any two elements. `id`, `source`, `type`, `target`, `cardinality`, `optionality`, `rationale`.

## Controlled transition contract
A transition is eligible when every exit condition on its source, every guard on the transition and every entry condition on its target evaluate TRUE. Eligibility is not authorisation: a material transition also requires the applicable decision right. The viewer renders this contract per transition.
