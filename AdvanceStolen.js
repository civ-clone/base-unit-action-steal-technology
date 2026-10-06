"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvanceStolen = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const Interaction_1 = require("@civ-clone/core-diplomacy/Interaction");
/**
 * A record that `thief()` stole an advance from `victim()` in `city()`, so a city can be robbed only once. What
 * clears it (v474.05: the city changing hands) is up to the ruleset.
 */
class AdvanceStolen extends Interaction_1.default {
    constructor(thief, victim, city, ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance) {
        super(thief, victim, ruleRegistry, turn);
        this._city = city;
        this._thief = thief;
        this._victim = victim;
        this.addKey('city', 'thief', 'victim');
    }
    city() {
        return this._city;
    }
    thief() {
        return this._thief;
    }
    victim() {
        return this._victim;
    }
}
exports.AdvanceStolen = AdvanceStolen;
exports.default = AdvanceStolen;
//# sourceMappingURL=AdvanceStolen.js.map