import { ProjectsView } from "@/components/projects/projects-view";
import { listRows } from "@/lib/repo";
import type { Project } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = (await listRows("projects")) as unknown as Project[];
  return <ProjectsView initial={projects} />;
}
