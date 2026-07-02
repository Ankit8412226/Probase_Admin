import Project from "@/models/Project";
import { createId } from "@/lib/utils";
import { ensureDatabase, mapDocument, useMemoryStore, getCurrentTenantId } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { ProjectRecord } from "@/types";

export async function getProjects() {
  if (useMemoryStore()) {
    return [...getMemoryStore().projects].sort((a, b) => a.name.localeCompare(b.name));
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const projects = await Project.find({ tenantId }).sort({ createdAt: -1 }).lean();
  return projects.map((item) => mapDocument(item as unknown as { _id: string } & ProjectRecord));
}

export async function getProjectById(id: string) {
  if (useMemoryStore()) {
    return getMemoryStore().projects.find((item) => item.id === id) ?? null;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const project = await Project.findOne({ _id: id, tenantId }).lean();
  return project ? mapDocument(project as unknown as { _id: string } & ProjectRecord) : null;
}

export async function createProject(payload: Omit<ProjectRecord, "id">) {
  const project: ProjectRecord = {
    id: createId("proj"),
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (useMemoryStore()) {
    getMemoryStore().projects.unshift(project);
    return project;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  await Project.create({ _id: project.id, tenantId, ...project });
  return project;
}

export async function updateProject(id: string, payload: Partial<Omit<ProjectRecord, "id">>) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const index = store.projects.findIndex((item) => item.id === id);

    if (index < 0) {
      return null;
    }

    store.projects[index] = {
      ...store.projects[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return store.projects[index];
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const project = await Project.findOneAndUpdate(
    { _id: id, tenantId },
    { ...payload, updatedAt: new Date().toISOString() },
    { new: true },
  ).lean();
  return project ? mapDocument(project as unknown as { _id: string } & ProjectRecord) : null;
}

export async function deleteProject(id: string) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const previousLength = store.projects.length;
    store.projects = store.projects.filter((item) => item.id !== id);
    return previousLength !== store.projects.length;
  }

  await ensureDatabase();
  const tenantId = await getCurrentTenantId();
  const result = await Project.deleteOne({ _id: id, tenantId });
  return result.deletedCount === 1;
}

export async function seedProjects(records: ProjectRecord[]) {
  if (useMemoryStore()) {
    getMemoryStore().projects = structuredClone(records);
    return getMemoryStore().projects;
  }

  await ensureDatabase();
  await Project.deleteMany({});
  await Project.insertMany(records.map((project) => ({ _id: project.id, tenantId: "demo_tenant", ...project })));
  return getProjects();
}
