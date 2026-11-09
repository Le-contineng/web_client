import type { SVGProps } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import * as H from "@hugeicons/core-free-icons";

/**
 * Icônes de l'application (Hugeicons, style « stroke rounded »). Tout le code
 * les importe d'ici, jamais de Hugeicons directement : les réglages par
 * défaut sont posés une seule fois, et les noms restent stables.
 * - décoratives par défaut (aria-hidden) : le texte voisin ou l'aria-label du
 *   bouton les nomme ;
 * - `weight` : « regular » au repos, « bold » pour un trait plus appuyé,
 *   « fill » pour un état actif (onglet de la navigation, intéressé), comme
 *   sur les réseaux sociaux ; « duotone » : une face légèrement teintée.
 * Sans état React : utilisables dans les Server Components comme dans les
 * composants client. Les composants shadcn/ui (src/shared/ui) gardent leurs
 * icônes Lucide, laissés intacts.
 */
export type IconWeight = "regular" | "bold" | "fill" | "duotone";
export type IconProps = Omit<SVGProps<SVGSVGElement>, "ref" | "strokeWidth"> & {
  weight?: IconWeight;
  size?: number;
};
export type Icon = (props: IconProps) => React.JSX.Element;

/** Épaisseur du trait selon le poids ; « fill » et « duotone » remplissent la forme. */
const STROKE: Record<IconWeight, number> = {
  regular: 1.5,
  bold: 2.25,
  fill: 1.5,
  duotone: 1.5,
};

function icon(glyph: IconSvgElement): Icon {
  function AppIcon({ weight = "regular", size = 24, ...props }: IconProps) {
    return (
      <HugeiconsIcon
        icon={glyph}
        size={size}
        strokeWidth={STROKE[weight]}
        aria-hidden
        {...(weight === "fill" && { fill: "currentColor" })}
        {...(weight === "duotone" && {
          fill: "currentColor",
          fillOpacity: 0.2,
        })}
        {...props}
      />
    );
  }
  return AppIcon;
}

export const ArrowCounterClockwiseIcon = icon(H.ArrowReloadHorizontalIcon);
export const ArrowLeftIcon = icon(H.ArrowLeft02Icon);
export const ArrowSquareOutIcon = icon(H.LinkSquare02Icon);
export const ArrowUpRightIcon = icon(H.ArrowUpRight01Icon);
export const BellIcon = icon(H.Notification01Icon);
export const MegaphoneIcon = icon(H.Megaphone01Icon);
export const BellRingingIcon = icon(H.Notification03Icon);
export const BellSlashIcon = icon(H.NotificationOff01Icon);
export const CalendarBlankIcon = icon(H.Calendar01Icon);
export const CalendarDotsIcon = icon(H.Calendar03Icon);
export const CalendarPlusIcon = icon(H.CalendarAdd01Icon);
export const CalendarXIcon = icon(H.CalendarRemove01Icon);
export const CameraIcon = icon(H.Camera01Icon);
export const CaretDoubleRightIcon = icon(H.ArrowRightDoubleIcon);
export const CaretDownIcon = icon(H.ArrowDown01Icon);
export const CaretLeftIcon = icon(H.ArrowLeft01Icon);
export const CaretRightIcon = icon(H.ArrowRight01Icon);
export const CaretUpIcon = icon(H.ArrowUp01Icon);
export const CheckIcon = icon(H.Tick02Icon);
export const CheckCircleIcon = icon(H.CheckmarkCircle02Icon);
export const ClockIcon = icon(H.Clock01Icon);
export const CopyIcon = icon(H.Copy01Icon);
export const DeviceMobileIcon = icon(H.SmartPhone01Icon);
export const DotsThreeIcon = icon(H.MoreHorizontalIcon);
export const DownloadSimpleIcon = icon(H.Download01Icon);
export const EnvelopeSimpleIcon = icon(H.Mail01Icon);
export const EyeIcon = icon(H.ViewIcon);
export const EyeSlashIcon = icon(H.ViewOffIcon);
export const FireIcon = icon(H.FireIcon);
export const FlagBannerIcon = icon(H.Flag02Icon);
export const FlagIcon = icon(H.Flag01Icon);
export const GlobeHemisphereWestIcon = icon(H.Globe02Icon);
export const GridNineIcon = icon(H.GridIcon);
export const HouseLineIcon = icon(H.Home09Icon);
export const ImagesIcon = icon(H.Album02Icon);
export const ImageIcon = icon(H.Image01Icon);
export const KeyIcon = icon(H.Key01Icon);
export const LaptopIcon = icon(H.LaptopIcon);
export const LinkSimpleIcon = icon(H.Link01Icon);
export const ListIcon = icon(H.Menu01Icon);
export const LockIcon = icon(H.LockIcon);
export const MagnifyingGlassIcon = icon(H.Search01Icon);
export const MagnifyingGlassMinusIcon = icon(H.SearchMinusIcon);
export const MapPinIcon = icon(H.Location01Icon);
export const MoonIcon = icon(H.Moon02Icon);
export const PencilSimpleIcon = icon(H.PencilEdit02Icon);
export const PlusIcon = icon(H.Add01Icon);
export const PaperPlaneRightIcon = icon(H.SentIcon);
export const DotsThreeVerticalIcon = icon(H.MoreVerticalIcon);
export const GearIcon = icon(H.Settings01Icon);
export const ChartBarIcon = icon(H.ChartColumnIcon);
export const PlusSquareIcon = icon(H.AddSquareIcon);
export const ProhibitIcon = icon(H.UnavailableIcon);
export const PulseIcon = icon(H.PulseIcon);
export const PushPinIcon = icon(H.PinIcon);
export const PushPinSlashIcon = icon(H.PinOffIcon);
export const ShareFatIcon = icon(H.Share08Icon);
export const ShieldIcon = icon(H.Shield01Icon);
export const ShieldSlashIcon = icon(H.ShieldBanIcon);
export const SidebarSimpleIcon = icon(H.SidebarLeftIcon);
export const SignInIcon = icon(H.Login01Icon);
export const SignOutIcon = icon(H.Logout01Icon);
export const SlidersHorizontalIcon = icon(H.FilterHorizontalIcon);
export const SquaresFourIcon = icon(H.DashboardSquare01Icon);
export const SunIcon = icon(H.Sun01Icon);
export const SwipeHandIcon = icon(H.Tap03Icon);
export const TagIcon = icon(H.Tag01Icon);
export const TextAlignLeftIcon = icon(H.TextAlignLeftIcon);
export const TranslateIcon = icon(H.TranslateIcon);
export const TrashIcon = icon(H.Delete02Icon);
export const TrayIcon = icon(H.InboxIcon);
export const UploadSimpleIcon = icon(H.Upload01Icon);
export const UserIcon = icon(H.UserIcon);
export const UserPlusIcon = icon(H.UserAdd01Icon);
export const UsersIcon = icon(H.UserGroupIcon);
export const ChartLineUpIcon = icon(H.ChartLineData01Icon);
export const WarningIcon = icon(H.Alert02Icon);
export const XCircleIcon = icon(H.CancelCircleIcon);
export const XIcon = icon(H.Cancel01Icon);
