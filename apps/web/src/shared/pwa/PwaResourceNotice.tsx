// apps/web/src/shared/pwa/PwaResourceNotice.tsx

import { useOnlineStatus } from "./useOnlineStatus";

type PwaResourceNoticeProps = {
  isFromCache?: boolean;
  isRefreshing?: boolean;
  updatedAt?: string | null;
  error?: string | null;
};

export function PwaResourceNotice({
  isFromCache = false,
  isRefreshing = false,
  updatedAt,
  error,
}: PwaResourceNoticeProps) {
  const { isOffline } = useOnlineStatus();

  if (!isOffline && !isFromCache && !isRefreshing && !error) {
    return null;
  }

  return (
    <div className="ck-register-alert">
      {isOffline ? "Você está offline. " : null}
      {isFromCache ? "Exibindo dados salvos localmente. " : null}
      {isRefreshing ? "Atualizando em segundo plano. " : null}
      {updatedAt ? `Última atualização: ${updatedAt}. ` : null}
      {error ? `Aviso: ${error}` : null}
    </div>
  );
}
