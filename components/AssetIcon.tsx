import Image from "next/image";
import { assetIcons, type AssetIconName } from "@/lib/asset-icons";
import { cn } from "@/lib/cn";

export function AssetIcon({
  name,
  size = 24,
  className,
  priority = false,
  alt,
}: {
  name: AssetIconName;
  size?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  return (
    <Image
      src={assetIcons[name]}
      alt={alt || name}
      width={size}
      height={size}
      priority={priority}
      className={cn("asset-icon", className)}
    />
  );
}
