export function explainError(error: unknown): string {
  const e = error as {
    code?: string | number;
    shortMessage?: string;
    message?: string;
    reason?: string;
  };
  if (e?.code === 4001 || e?.code === "ACTION_REJECTED")
    return "Wallet request cancelled. Nothing was submitted.";
  if (e?.code === "INSUFFICIENT_FUNDS") return "Add test CTC to this wallet before submitting.";
  if (e?.code === "NETWORK_ERROR")
    return "The network changed or could not be reached. Reconnect your wallet.";
  if (e?.code === "TIMEOUT")
    return "Confirmation timed out. Check the transaction before retrying.";
  return (
    e?.reason ??
    e?.shortMessage ??
    e?.message ??
    "The request failed. Please retry after checking your connection."
  );
}
