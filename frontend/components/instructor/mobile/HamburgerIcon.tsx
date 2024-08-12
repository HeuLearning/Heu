import { useState } from "react";
import MobileNavMenu from "./MobileNavMenu";

export default function HamburgerIcon({ onClick }) {
  return (
    <button className="rounded-full shadow-25" onClick={onClick}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="20" r="20" fill="white" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M24 15C24.5523 15 25 15.4477 25 16C25 16.5523 24.5523 17 24 17L16 17C15.4477 17 15 16.5523 15 16C15 15.4477 15.4477 15 16 15H24ZM24 19C24.5523 19 25 19.4477 25 20C25 20.5523 24.5523 21 24 21H16C15.4477 21 15 20.5523 15 20C15 19.4477 15.4477 19 16 19L24 19ZM25 24C25 23.4477 24.5523 23 24 23L16 23C15.4477 23 15 23.4477 15 24C15 24.5523 15.4477 25 16 25H24C24.5523 25 25 24.5523 25 24Z"
          fill="var(--surface_bg_darkest)"
        />
      </svg>
    </button>
  );
}
