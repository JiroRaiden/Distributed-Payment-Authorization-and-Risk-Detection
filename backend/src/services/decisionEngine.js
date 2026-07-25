import { evaluateAmountSignal } from "./signals/amountSignal.js";
import { evaluateVelocitySignal } from "./signals/velocitySignal.js";
import { evaluateDeviceSignal } from "./signals/deviceSignal.js";
import { evaluateLocationSignal } from "./signals/locationSignal.js";
import { evaluateMerchantSignal } from "./signals/merchantSignal.js";

export function evaluateTransactionRisk(transaction) {
    const signals = [
        evaluateAmountSignal(transaction),
        evaluateVelocitySignal(transaction),
        evaluateDeviceSignal(transaction),
        evaluateLocationSignal(transaction),
        evaluateMerchantSignal(transaction),
    ];
    return {
        decision: "review",
        signals,
        reason: "TODO: Define final decision rule",
    };
}
