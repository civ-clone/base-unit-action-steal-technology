"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stealAdvance = exports.firstStealableAdvance = exports.stealableAdvances = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const AdvanceStolen_1 = require("../AdvanceStolen");
/** The advances `victim` knows and `thief` doesn't, other than repeatable ones: what a Diplomat could steal. */
const stealableAdvances = (thief, victim, playerResearchRegistry = PlayerResearchRegistry_1.instance) => {
    // Either without research (as a test may make them) has nothing to steal, rather than making the lookup throw.
    try {
        const thiefResearch = playerResearchRegistry.getByPlayer(thief);
        return playerResearchRegistry
            .getByPlayer(victim)
            .complete()
            .map((advance) => advance.sourceClass())
            .filter((AdvanceType) => !AdvanceType.repeatable && !thiefResearch.completed(AdvanceType));
    }
    catch (e) {
        return [];
    }
};
exports.stealableAdvances = stealableAdvances;
/**
 * The advance `thief` takes from `victim` as the originals pick it: one draw for a start among `order`'s slots, then
 * the first advance, walking on from there and round, that `victim` knows and `thief` doesn't. `order` is the rule
 * set's table of advances (a `null` slot is never known); any other advance `thief` could take (another package's) is
 * walked after the table, in the order `victim` learnt it, though the start is drawn over the table only. So an
 * advance after a run `thief` already knows is likelier. `null` if there is nothing to take, or the pair `refuses`.
 */
const firstStealableAdvance = (thief, victim, order, randomNumberGenerator, { playerResearchRegistry = PlayerResearchRegistry_1.instance, refuses = () => false, } = {}) => {
    const start = Math.floor(randomNumberGenerator() * order.length);
    if (refuses(thief, victim)) {
        return null;
    }
    const stealable = (0, exports.stealableAdvances)(thief, victim, playerResearchRegistry), walk = [
        ...order,
        ...stealable.filter((AdvanceType) => !order.includes(AdvanceType)),
    ];
    for (let i = 0; i < walk.length; i++) {
        const AdvanceType = walk[(start + i) % walk.length];
        if (AdvanceType !== null && stealable.includes(AdvanceType)) {
            return AdvanceType;
        }
    }
    return null;
};
exports.firstStealableAdvance = firstStealableAdvance;
/**
 * `thief` takes `AdvanceType` from `victim`'s `city`: it learns the advance, the city is marked as robbed (an
 * `AdvanceStolen`, which a rule set may clear when the city changes hands) and `player:advance-stolen` is emitted.
 */
const stealAdvance = (thief, victim, city, AdvanceType, { engine = Engine_1.instance, interactionRegistry = InteractionRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance, } = {}) => {
    playerResearchRegistry.getByPlayer(thief).addAdvance(AdvanceType);
    interactionRegistry.register(new AdvanceStolen_1.default(thief, victim, city, ruleRegistry, turn));
    engine.emit('player:advance-stolen', thief, victim, AdvanceType, city);
};
exports.stealAdvance = stealAdvance;
exports.default = exports.stealAdvance;
//# sourceMappingURL=stealAdvance.js.map