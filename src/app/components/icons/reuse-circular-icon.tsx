import type { SVGProps } from "react";

export function ReuseCircularIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 12a9 9 0 0 1 14.6-7" />
      <path d="M17.6 2.9L18 6.7l-3.8.4" />
      <path d="M21 12a9 9 0 0 1-14.6 7" />
      <path d="M6.4 21.1L6 17.3l3.8-.4" />
    </svg>
  );
}
