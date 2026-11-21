import type { AppIconComponent } from "./app-icon"
import { BellBoldIcon } from "./solar/bell-bold"
import { BellLinearIcon } from "./solar/bell-linear"
import { Chart2BoldIcon } from "./solar/chart-2-bold"
import { Chart2LinearIcon } from "./solar/chart-2-linear"
import { ChartSquareBoldIcon } from "./solar/chart-square-bold"
import { ChartSquareLinearIcon } from "./solar/chart-square-linear"
import { ClockCircleBoldIcon } from "./solar/clock-circle-bold"
import { ClockCircleLinearIcon } from "./solar/clock-circle-linear"
import { CloudBoldIcon } from "./solar/cloud-bold"
import { CloudLinearIcon } from "./solar/cloud-linear"
import { SettingsBoldIcon } from "./solar/settings-bold"
import { SettingsLinearIcon } from "./solar/settings-linear"
import { CardBoldIcon } from "./solar/card-bold"
import { CardLinearIcon } from "./solar/card-linear"
import { EyeBoldIcon } from "./solar/eye-bold"
import { EyeLinearIcon } from "./solar/eye-linear"
import { DocumentTextBoldIcon } from "./solar/document-text-bold"
import { DocumentTextLinearIcon } from "./solar/document-text-linear"
import { FolderBoldIcon } from "./solar/folder-bold"
import { FolderLinearIcon } from "./solar/folder-linear"
import { HomeSmileAngleBoldIcon } from "./solar/home-smile-angle-bold"
import { HomeSmileAngleLinearIcon } from "./solar/home-smile-angle-linear"
import { Widget2BoldIcon } from "./solar/widget-2-bold"
import { Widget2LinearIcon } from "./solar/widget-2-linear"
import { LetterBoldIcon } from "./solar/letter-bold"
import { LetterLinearIcon } from "./solar/letter-linear"
import { NotebookBoldIcon } from "./solar/notebook-bold"
import { NotebookLinearIcon } from "./solar/notebook-linear"
import { Pallete2BoldIcon } from "./solar/pallete-2-bold"
import { Pallete2LinearIcon } from "./solar/pallete-2-linear"
import { BillListBoldIcon } from "./solar/bill-list-bold"
import { BillListLinearIcon } from "./solar/bill-list-linear"
import { RefreshBoldIcon } from "./solar/refresh-bold"
import { RefreshLinearIcon } from "./solar/refresh-linear"
import { ShieldWarningBoldIcon } from "./solar/shield-warning-bold"
import { ShieldWarningLinearIcon } from "./solar/shield-warning-linear"

/**
 * Bold counterparts of the Solar Linear icons that appear in controls with a
 * selected state (module rail, sidebar). Linear is the default; Bold shows on
 * hover or when the control is selected. Both are drawn on the same 24x24 grid,
 * so swapping never shifts the layout. Add a pair here together with its
 * `solar/<name>-bold.tsx` file.
 */
const bold = new Map<AppIconComponent, AppIconComponent>([
  [BellLinearIcon, BellBoldIcon],
  [Chart2LinearIcon, Chart2BoldIcon],
  [ChartSquareLinearIcon, ChartSquareBoldIcon],
  [ClockCircleLinearIcon, ClockCircleBoldIcon],
  [CloudLinearIcon, CloudBoldIcon],
  [SettingsLinearIcon, SettingsBoldIcon],
  [CardLinearIcon, CardBoldIcon],
  [EyeLinearIcon, EyeBoldIcon],
  [DocumentTextLinearIcon, DocumentTextBoldIcon],
  [FolderLinearIcon, FolderBoldIcon],
  [HomeSmileAngleLinearIcon, HomeSmileAngleBoldIcon],
  [Widget2LinearIcon, Widget2BoldIcon],
  [LetterLinearIcon, LetterBoldIcon],
  [NotebookLinearIcon, NotebookBoldIcon],
  [Pallete2LinearIcon, Pallete2BoldIcon],
  [BillListLinearIcon, BillListBoldIcon],
  [RefreshLinearIcon, RefreshBoldIcon],
  [ShieldWarningLinearIcon, ShieldWarningBoldIcon],
])

export function boldIconOf(icon: AppIconComponent) {
  return bold.get(icon)
}
