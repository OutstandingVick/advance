# Architecture

```text
Sepolia                         Creditcoin testnet
┌──────────────────────┐        ┌──────────────────────────────┐
│ SourceLoanRegistry   │ event  │ Attestcoin BlockProver 0xFD2│
│ facility credit logs │───────▶│ inclusion + continuity proof│
└──────────────────────┘ proof  └──────────────┬───────────────┘
                                               │ verified tx bytes
                              ┌────────────────▼───────────────┐
                              │ AdvanceRegistry                │
                              │ evidence → shared profile      │
                              │ grants → expiring sessions     │
                              └──────────┬───────────┬─────────┘
                                         │           │
                                  ┌──────▼───┐ ┌────▼──────┐
                                  │ Lender A │ │ Lender B  │
                                  └──────────┘ └───────────┘
```

## Trust boundaries

- Attestcoin proves that encoded transaction data belongs to an attested source
  block; Advance remains responsible for interpreting that data safely.
- Advance binds proofs to one configured chain key and source contract.
- The configured source contract defines the semantics of its credit events.
- A verified event is stored once in a shared wallet profile.
- Each consumer needs its own wallet-issued grant and score session.
- New evidence increments `profileVersion`, invalidating older sessions.
- Revoking one grant does not affect another consumer's grant.

## Evidence-backed score

The deterministic score is bounded to 100–900. Repayments and repayment ratio
add bounded positive points; verified defaults apply larger penalties. Missing
default evidence is not interpreted as proof that a wallet never defaulted.

