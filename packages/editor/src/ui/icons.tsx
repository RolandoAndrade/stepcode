import type { LucideProps } from 'lucide-react'
import * as lucide from 'lucide-react'
import type { ComponentType } from 'react'

export const ICON_SIZE = 16

export type IconProps = Omit<LucideProps, 'size' | 'strokeWidth'> & { readonly size?: number }

// Spec §2.2: 16 px, stroke 1.75, currentColor, decorative by default (the button carries the name).
function icon(Component: ComponentType<LucideProps>) {
  return ({ size = ICON_SIZE, ...rest }: IconProps) => (
    <Component size={size} strokeWidth={1.75} aria-hidden="true" {...rest} />
  )
}

export const ArrowDownToDot = icon(lucide.ArrowDownToDot)
export const ArrowDownToLine = icon(lucide.ArrowDownToLine)
export const ArrowUpFromDot = icon(lucide.ArrowUpFromDot)
export const BookOpen = icon(lucide.BookOpen)
export const Bug = icon(lucide.Bug)
export const Check = icon(lucide.Check)
export const ChevronDown = icon(lucide.ChevronDown)
export const ChevronLeft = icon(lucide.ChevronLeft)
export const ChevronRight = icon(lucide.ChevronRight)
export const ChevronUp = icon(lucide.ChevronUp)
export const CircleCheck = icon(lucide.CircleCheck)
export const CircleX = icon(lucide.CircleX)
export const Copy = icon(lucide.Copy)
export const Download = icon(lucide.Download)
export const Ellipsis = icon(lucide.Ellipsis)
export const FilePlus = icon(lucide.FilePlus)
export const FolderOpen = icon(lucide.FolderOpen)
export const GripHorizontal = icon(lucide.GripHorizontal)
export const Hexagon = icon(lucide.Hexagon)
export const Info = icon(lucide.Info)
export const LoaderCircle = icon(lucide.LoaderCircle)
export const Menu = icon(lucide.Menu)
export const Monitor = icon(lucide.Monitor)
export const Moon = icon(lucide.Moon)
export const Pause = icon(lucide.Pause)
export const Play = icon(lucide.Play)
export const RotateCcw = icon(lucide.RotateCcw)
export const Save = icon(lucide.Save)
export const Settings = icon(lucide.Settings)
export const Share2 = icon(lucide.Share2)
export const Square = icon(lucide.Square)
export const StepForward = icon(lucide.StepForward)
export const Sun = icon(lucide.Sun)
export const Trash2 = icon(lucide.Trash2)
export const TriangleAlert = icon(lucide.TriangleAlert)
export const X = icon(lucide.X)
