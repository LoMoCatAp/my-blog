// Comment bubble
export function CommentIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// Checkmark / success
export function CheckIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// Refresh / reload
export function RefreshIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

// Cat paw
export function PawIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} className={className} fill="currentColor">
      <path d="M512 85.33c-141.38 0-256 114.62-256 256 0 77.33 34.33 146.67 88.67 194.33-55.33 21-103.33 63.67-131.33 119.34-28 55.67-33.67 122.33-8.67 183.33 16.33 39.67 43.33 74.33 77.33 99.67 48 35.67 108.33 56.33 172 56.33h116c63.67 0 124-20.67 172-56.33 34-25.34 61-60 77.33-99.67 25-61 19.33-127.66-8.67-183.33-28-55.67-76-98.34-131.33-119.34 54.33-47.66 88.67-117 88.67-194.33 0-141.38-114.62-256-256-256zM384 597.33c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128-57.31-128-128-128zM640 597.33c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128-57.31-128-128-128z" />
    </svg>
  );
}

// Cat face
export function CatFaceIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} className={className} fill="currentColor">
      <path d="M405.47 362.54m-22.53 0a22.53 22.53 0 1 0 45.06 0 22.53 22.53 0 1 0-45.06 0Z" />
      <path d="M560.47 362.54m-22.53 0a22.53 22.53 0 1 0 45.06 0 22.53 22.53 0 1 0-45.06 0Z" />
      <path d="M583.79 832.87H259.86c-10.22 0-18.5-8.28-18.5-18.5s8.28-18.5 18.5-18.5h323.93c38.69 0 72.91-20.24 91.54-54.15 18.63-33.91 17.36-73.65-3.38-106.3l-63.84-100.49c-11.47-18.05-9.59-41.92 4.56-58.03 28.39-32.31 44.03-73.82 44.03-116.88V221.08c0-1.47-0.67-2.55-2-3.18-1.33-0.64-2.59-0.49-3.74 0.43l-55.83 44.79c-12.68 10.17-28.61 15.77-44.87 15.77H408.81c-16.26 0-32.19-5.6-44.87-15.77l-55.83-44.79c-1.15-0.92-2.41-1.07-3.74-0.43-1.33 0.64-2 1.71-2 3.18v138.94c0 43.95 16.21 86.1 45.63 118.69 11.99 13.27 18.59 30.31 18.59 47.97v215.67c0 10.22-8.28 18.5-18.5 18.5s-18.5-8.28-18.5-18.5V526.68c0-8.48-3.21-16.71-9.05-23.17-35.58-39.4-55.17-90.36-55.17-143.48V221.09c0-15.73 8.81-29.74 23-36.54 14.19-6.81 30.62-4.92 42.9 4.93l55.83 44.79a34.851 34.851 0 0 0 21.72 7.63h141.45c7.87 0 15.58-2.71 21.72-7.63l55.83-44.79c12.27-9.85 28.71-11.73 42.9-4.93 14.19 6.81 23 20.81 23 36.54v138.94c0 52.06-18.91 102.24-53.23 141.31-3.43 3.9-3.88 9.43-1.13 13.77L703.2 615.6c14.21 22.37 21.9 47.86 22.25 73.72 0.32 24.33-5.79 48.62-17.66 70.24-11.88 21.62-29.1 39.8-49.81 52.58-22.01 13.58-47.65 20.74-74.15 20.74z" />
    </svg>
  );
}

// Eye / views icon
export function EyeIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Calendar icon
export function CalendarIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// Edit / pencil icon
export function EditIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

// Mail / empty inbox icon
export function MailIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}
