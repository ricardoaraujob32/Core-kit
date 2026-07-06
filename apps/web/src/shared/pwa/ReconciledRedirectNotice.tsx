// apps/web/src/shared/pwa/ReconciledRedirectNotice.tsx

type ReconciledRedirectNoticeProps = {
  isReconciled: boolean;
};

export function ReconciledRedirectNotice({
  isReconciled,
}: ReconciledRedirectNoticeProps) {
  if (!isReconciled) return null;

  return (
    <div className="ck-register-alert">
      Registro sincronizado. Abrindo o detalhe definitivo...
    </div>
  );
}
