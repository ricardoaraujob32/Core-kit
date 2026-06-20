
import type { JSX } from "react";
import { TechnicalId } from "../../../shared/technical";

type Props = {
  locatarioId: string;
};

export default function LocatarioTechnicalCard({
  locatarioId,
}: Props): JSX.Element {
  return (
    <TechnicalId
      label="Locatário ID"
      value={locatarioId}
    />
  );
}
