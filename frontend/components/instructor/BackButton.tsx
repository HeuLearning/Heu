export default function BackButton({ onClick }) {
  return (
    <button onClick={onClick}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="16" fill="var(--action_bg_tertiary)" />
        <path
          d="M17.5 12.25L14 15.75L17.5 19.25"
          stroke="var(--action_bg_primary)"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>
  );
}
