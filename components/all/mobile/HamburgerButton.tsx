interface HamburgerButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variation?: string;
  className?: string;
}

export default function HamburgerButton({
  onClick,
  variation = "",
  className = "",
}: HamburgerButtonProps) {
  return (
    <button
      className={`${
        variation ? variation : ""
      } ${className} rounded-full shadow-25`}
      onClick={onClick}
    >
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="44"
          height="44"
          rx="22"
          fill="var(--action_bg_secondary)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M26 17C26.5523 17 27 17.4477 27 18C27 18.5523 26.5523 19 26 19L18 19C17.4477 19 17 18.5523 17 18C17 17.4477 17.4477 17 18 17H26ZM26 21C26.5523 21 27 21.4477 27 22C27 22.5523 26.5523 23 26 23H18C17.4477 23 17 22.5523 17 22C17 21.4477 17.4477 21 18 21L26 21ZM27 26C27 25.4477 26.5523 25 26 25L18 25C17.4477 25 17 25.4477 17 26C17 26.5523 17.4477 27 18 27H26C26.5523 27 27 26.5523 27 26Z"
          fill="var(--action_bg_primary)"
        />
      </svg>
    </button>
  );
}
