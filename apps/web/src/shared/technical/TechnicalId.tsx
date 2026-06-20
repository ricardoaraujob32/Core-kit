
import type { JSX } from "react";

type TechnicalIdProps = {
  value: string;
  label?: string;
  copyable?: boolean;
};

export default function TechnicalId({
  value,
  label = "ID",
  copyable = true,
}: TechnicalIdProps): JSX.Element {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // noop
    }
  }

  return (
    <div className="technical-id">
      <span className="technical-id__label">{label}</span>

      <code className="technical-id__value">
        {value}
      </code>

      {copyable ? (
        <button
          type="button"
          onClick={() => void handleCopy()}
        >
          Copiar
        </button>
      ) : null}
    </div>
  );
}
