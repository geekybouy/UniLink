
import React from 'react';

export const Network = ({ className = "", ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="6" r="4" />
      <path d="M16 17a4 4 0 0 0-8 0" />
      <circle cx="19" cy="14" r="2" />
      <path d="M22 19c-.1-1.2-.9-2-2-2a2 2 0 0 0-2 2" />
      <circle cx="5" cy="14" r="2" />
      <path d="M8 19a2 2 0 0 0-4 0" />
    </svg>
  );
};

export default Network;
