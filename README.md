# base-unit-action-steal-technology

The `StealTechnology` and `SneakStealTechnology` unit actions, and the `AdvanceStolen` interaction that records a theft. See civ-clone/web-renderer#58.

## `perform(choice?)`

1. A caught check (base-unit-agent's `AgentSurvives` with `CAUGHT_CHECK`): a Diplomat that is caught is destroyed,
   after the `Moved` rules.
2. With no target chosen, the city's defenders may detect the Diplomat (`MissionDetected`): it then loses its moves and
   stays where it is.
3. The `TechnologyStolen(unit, city, action)` rules; nothing stolen leaves the Diplomat where it is.
4. `Moved`, then the Diplomat is used up unless it survives (`AgentSurvives`: `HARD` after a chosen target,
   `ORDINARY` otherwise).

With none of base-unit-agent's rules registered, only steps 3 and 4 do anything, and the Diplomat is used up, as
before.

**Targets:** `targets()` lists what the `MissionTargets` rules offer; `perform(choice)` takes one of them, or its name
(`targetName`), and the rules read it as `action.chosenTarget()`. A choice that isn't offered is ignored.

## `lib/stealAdvance`

- `stealableAdvances(thief, victim, playerResearchRegistry?)`: what the victim knows and the thief doesn't, but nothing
  repeatable.
- `firstStealableAdvance(thief, victim, order, randomNumberGenerator, { playerResearchRegistry, refuses })`: one draw
  for a start among the rule set's table `order` (a `null` slot is never known), then the first advance, walking on
  and round, that the thief can take; another package's advances are walked after the table. `null` when there's
  nothing, or the pair `refuses` (asked after the draw).
- `stealAdvance(thief, victim, city, AdvanceType, dependencies?)`: the thief learns it, an `AdvanceStolen` marks the
  city, and `player:advance-stolen` is emitted.
