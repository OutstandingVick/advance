import { Input } from '@/components/ui/input';
import type { ConfigInput } from '@/lib/config';
export function DeploymentForm({
  value,
  onChange,
  disabled,
}: {
  value: ConfigInput;
  onChange: (c: ConfigInput) => void;
  disabled: boolean;
}) {
  const fields = [
    ['registry', 'Advance registry'],
    ['sourceRegistry', 'Sepolia source registry'],
    ['lenderA', 'Northstar lender'],
    ['lenderB', 'Harbor lender'],
  ] as const;
  return (
    <details className="panel settings">
      <summary>Verified testnet deployment addresses</summary>
      <p>
        These deployed contracts are preloaded from the repository&apos;s verified
        deployment record. You can expand this panel to inspect or replace them.
      </p>
      <div className="form-grid">
        {fields.map(([key, label]) => (
          <label key={key}>
            {label}
            <Input
              disabled={disabled}
              value={value[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              placeholder="0x…"
              spellCheck={false}
            />
          </label>
        ))}
      </div>
    </details>
  );
}
