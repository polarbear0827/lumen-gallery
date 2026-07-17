import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const baseProps: IconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function ArrowLeftIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
}

export function ArrowRightIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
}

export function ExpandIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5M3 8l6-6M21 8l-6-6M3 16l6 6M21 16l-6 6" /></svg>
}

export function CloseIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M5 5l14 14M19 5 5 19" /></svg>
}

export function MenuIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
}

export function DocumentIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M6 3h8l4 4v14H6V3Z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>
}

export function ExternalLinkIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M14 4h6v6M20 4l-9 9" /><path d="M19 13v6H5V5h6" /></svg>
}

export function DownloadIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M12 3v12M7 10l5 5 5-5M4 20h16" /></svg>
}

export function InfoIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></svg>
}

export function GridIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>
}

export function PlayIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="m8 5 11 7-11 7V5Z" /></svg>
}

export function PauseIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M8 5v14M16 5v14" /></svg>
}
