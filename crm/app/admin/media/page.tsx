import { MediaView } from "@/components/media/media-view";
import { listRows } from "@/lib/repo";
import type { MediaAsset } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const assets = (await listRows("media")) as unknown as MediaAsset[];
  return <MediaView initial={assets} />;
}
