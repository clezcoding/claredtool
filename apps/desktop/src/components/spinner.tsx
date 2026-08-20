export function Spinner() {
  return (
    <div
      role="status"
      data-testid="spinner"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"
    >
      <span className="sr-only">Wird geladen</span>
    </div>
  );
}
