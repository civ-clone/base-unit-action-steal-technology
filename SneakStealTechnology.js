"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SneakStealTechnology = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const StealTechnology_1 = require("./StealTechnology");
/** Stealing from a civilization the thief is at peace with, which ends the peace. */
class SneakStealTechnology extends StealTechnology_1.default {
    constructor(from, to, unit, city, enemy, ruleRegistry = RuleRegistry_1.instance) {
        super(from, to, unit, city, ruleRegistry);
        this._enemy = enemy;
        this.addKey('enemy');
    }
    enemy() {
        return this._enemy;
    }
    // Typed as `Action`: a subclass with a member of its own isn't assignable to it (civ-clone/web-renderer#21).
    forUnit(unit) {
        return new SneakStealTechnology(this.from(), this.to(), unit, this._city, this._enemy, this.ruleRegistry());
    }
}
exports.SneakStealTechnology = SneakStealTechnology;
exports.default = SneakStealTechnology;
//# sourceMappingURL=SneakStealTechnology.js.map