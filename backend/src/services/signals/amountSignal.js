const HIGH_AMOUNT_THRESHOLD = 50000;

export function evaluateAmountSignal(transaction){
    const amount = Number(transaction.amount);

    if (amount >=HIGH_AMOUNT_THRESHOLD){
        return {
            signal: "amount",
            triggered: true,
            reason: "Transaction amount is unusually high",
        };
    }

    return {
        signal:"amount",
        triggered:false,
        reason: "Transaction amount is within the normal review range",
    };
}