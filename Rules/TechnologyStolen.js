"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnologyStolen = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Processed when a Diplomat (`Unit`) steals an advance from `City`'s owner, by the `StealTechnology` action (or
 * `SneakStealTechnology`), whose `chosenTarget()` is the advance the player chose, if any; a caller outside the action
 * may leave it out. `true` when something was stolen, which uses the Diplomat up unless it survives.
 */
class TechnologyStolen extends Rule_1.default {
}
exports.TechnologyStolen = TechnologyStolen;
exports.default = TechnologyStolen;
//# sourceMappingURL=TechnologyStolen.js.map