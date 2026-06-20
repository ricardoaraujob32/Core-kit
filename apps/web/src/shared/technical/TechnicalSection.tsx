
import type { JSX, PropsWithChildren } from "react";

type TechnicalSectionProps = PropsWithChildren<{
  title?: string;
}>;

export default function TechnicalSection({
  title = "Informações técnicas",
  children,
}: TechnicalSectionProps): JSX.Element {
  return (
    <details>
      <summary>{title}</summary>
      <div>
        {children}
      </div>
    </details>
  );
}
