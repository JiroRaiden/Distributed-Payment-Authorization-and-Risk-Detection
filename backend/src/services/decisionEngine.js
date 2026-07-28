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

    const hasTriggeredSignal = signals.some((signal) => signal.triggered);

    return {
        decision: hasTriggeredSignal ? "review" : "approve",
        signals,
        reason: hasTriggeredSignal ? "One or more fraud signals were triggered" : "No fraud signals were triggered",
    };
}
