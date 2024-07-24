export default function Button({ className, onClick = null, children }) {
  return (
    <button
      type="button"
      className={`relative inline-flex items-center justify-center rounded-[10px] px-[12px] py-[11px] ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
