import City from '@civ-clone/core-city/City';
import Rule from '@civ-clone/core-rule/Rule';
import type StealTechnology from '../StealTechnology';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * Processed when a Diplomat (`Unit`) steals an advance from `City`'s owner, by the `StealTechnology` action (or
 * `SneakStealTechnology`), whose `chosenTarget()` is the advance the player chose, if any; a caller outside the action
 * may leave it out. `true` when something was stolen, which uses the Diplomat up unless it survives.
 */
export class TechnologyStolen extends Rule<
  [Unit, City, StealTechnology?],
  boolean
> {}

export default TechnologyStolen;
