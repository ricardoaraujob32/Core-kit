// apps/web/src/shared/pwa/PwaLocalMigrationBootstrap.tsx

import { useEffect, useRef } from "react";
import { usePwaLocalMigration } from "./usePwaLocalMigration";

/**
 * Executa migrações locais uma vez ao abrir o app.
 */
export function PwaLocalMigrationBootstrap() {
  const migration = usePwaLocalMigration();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;

    ranRef.current = true;

    if (migration.status.needsMigration) {
      migration.migrate();
    }
  }, [migration]);

  return null;
}
