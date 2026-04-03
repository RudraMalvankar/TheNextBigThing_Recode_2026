import { Badge } from "./ui/badge";

type RageClickBadgeProps = {
  count: number;
};

export default function RageClickBadge({ count }: RageClickBadgeProps): JSX.Element {
  return <Badge className="border-red-500/40 bg-red-500/10 text-red-300">Rage Clicks: {count}</Badge>;
}
