import { BlogView } from "@/components/blog/blog-view";
import { listRows } from "@/lib/repo";
import type { Post } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function BlogAdminPage() {
  const posts = (await listRows("posts")) as unknown as Post[];
  return <BlogView initial={posts} />;
}
