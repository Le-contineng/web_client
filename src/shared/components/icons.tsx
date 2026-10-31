import type { ComponentProps, ComponentType } from "react";
import * as P from "@phosphor-icons/react/ssr";

/**
 * Icônes de l'application (Phosphor). Tout le code les importe d'ici, jamais
 * de Phosphor directement : les réglages par défaut sont posés une seule fois.
 * - décoratives par défaut (aria-hidden) : le texte voisin ou l'aria-label du
 *   bouton les nomme ;
 * - `weight` : « regular » au repos, « fill » pour un état actif (onglet de
 *   la navigation, comme sur les réseaux sociaux).
 * Variante « ssr » : utilisables dans les Server Components comme dans les
 * composants client. Les composants shadcn/ui (src/shared/ui) gardent leurs
 * icônes Lucide, laissés intacts.
 */
export type IconProps = ComponentProps<typeof P.HouseIcon>;
export type Icon = ComponentType<IconProps>;

function icon(Phosphor: Icon): Icon {
  function AppIcon(props: IconProps) {
    return <Phosphor aria-hidden {...props} />;
  }
  return AppIcon;
}

export const ArrowCounterClockwiseIcon = icon(P.ArrowCounterClockwiseIcon);
export const ArrowLeftIcon = icon(P.ArrowLeftIcon);
export const ArrowSquareOutIcon = icon(P.ArrowSquareOutIcon);
export const ArrowUpRightIcon = icon(P.ArrowUpRightIcon);
export const BellIcon = icon(P.BellIcon);
export const MegaphoneIcon = icon(P.MegaphoneIcon);
export const BellRingingIcon = icon(P.BellRingingIcon);
export const BellSlashIcon = icon(P.BellSlashIcon);
export const CalendarBlankIcon = icon(P.CalendarBlankIcon);
export const CalendarDotsIcon = icon(P.CalendarDotsIcon);
export const CalendarXIcon = icon(P.CalendarXIcon);
export const CameraIcon = icon(P.CameraIcon);
export const CaretDoubleRightIcon = icon(P.CaretDoubleRightIcon);
export const CaretDownIcon = icon(P.CaretDownIcon);
export const CaretLeftIcon = icon(P.CaretLeftIcon);
export const CaretRightIcon = icon(P.CaretRightIcon);
export const CaretUpIcon = icon(P.CaretUpIcon);
export const CheckCircleIcon = icon(P.CheckCircleIcon);
export const ClockIcon = icon(P.ClockIcon);
export const CopyIcon = icon(P.CopyIcon);
export const DeviceMobileIcon = icon(P.DeviceMobileIcon);
export const DotsThreeIcon = icon(P.DotsThreeIcon);
export const DownloadSimpleIcon = icon(P.DownloadSimpleIcon);
export const EnvelopeSimpleIcon = icon(P.EnvelopeSimpleIcon);
export const EyeIcon = icon(P.EyeIcon);
export const EyeSlashIcon = icon(P.EyeSlashIcon);
export const FireIcon = icon(P.FireIcon);
export const FlagBannerIcon = icon(P.FlagBannerIcon);
export const FlagIcon = icon(P.FlagIcon);
export const GlobeHemisphereWestIcon = icon(P.GlobeHemisphereWestIcon);
export const GridNineIcon = icon(P.GridNineIcon);
export const HouseLineIcon = icon(P.HouseLineIcon);
export const ImageIcon = icon(P.ImageIcon);
export const KeyIcon = icon(P.KeyIcon);
export const LaptopIcon = icon(P.LaptopIcon);
export const LinkSimpleIcon = icon(P.LinkSimpleIcon);
export const ListIcon = icon(P.ListIcon);
export const LockIcon = icon(P.LockIcon);
export const MagnifyingGlassIcon = icon(P.MagnifyingGlassIcon);
export const MagnifyingGlassMinusIcon = icon(P.MagnifyingGlassMinusIcon);
export const MapPinIcon = icon(P.MapPinIcon);
export const MoonIcon = icon(P.MoonIcon);
export const PencilSimpleIcon = icon(P.PencilSimpleIcon);
export const PlusIcon = icon(P.PlusIcon);
export const PlusSquareIcon = icon(P.PlusSquareIcon);
export const ProhibitIcon = icon(P.ProhibitIcon);
export const PulseIcon = icon(P.PulseIcon);
export const PushPinIcon = icon(P.PushPinIcon);
export const PushPinSlashIcon = icon(P.PushPinSlashIcon);
export const ShareFatIcon = icon(P.ShareFatIcon);
export const ShieldIcon = icon(P.ShieldIcon);
export const ShieldSlashIcon = icon(P.ShieldSlashIcon);
export const SidebarSimpleIcon = icon(P.SidebarSimpleIcon);
export const SignInIcon = icon(P.SignInIcon);
export const SignOutIcon = icon(P.SignOutIcon);
export const SlidersHorizontalIcon = icon(P.SlidersHorizontalIcon);
export const SquaresFourIcon = icon(P.SquaresFourIcon);
export const SunIcon = icon(P.SunIcon);
export const TagIcon = icon(P.TagIcon);
export const TextAlignLeftIcon = icon(P.TextAlignLeftIcon);
export const TranslateIcon = icon(P.TranslateIcon);
export const TrashIcon = icon(P.TrashIcon);
export const TrayIcon = icon(P.TrayIcon);
export const UploadSimpleIcon = icon(P.UploadSimpleIcon);
export const UserIcon = icon(P.UserIcon);
export const UserPlusIcon = icon(P.UserPlusIcon);
export const UsersIcon = icon(P.UsersIcon);
export const ChartLineUpIcon = icon(P.ChartLineUpIcon);
export const WarningIcon = icon(P.WarningIcon);
export const XCircleIcon = icon(P.XCircleIcon);
export const XIcon = icon(P.XIcon);
