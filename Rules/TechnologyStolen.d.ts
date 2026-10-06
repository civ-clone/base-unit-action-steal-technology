import City from '@civ-clone/core-city/City';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * Processed when a Diplomat (`Unit`) steals an advance from `City`'s owner. `true` when something was stolen, which
 * uses the Diplomat up.
 */
export declare class TechnologyStolen extends Rule<[Unit, City], boolean> {}
export default TechnologyStolen;
