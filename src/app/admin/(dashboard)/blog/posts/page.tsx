import Link from "next/link";
import { PublishStatus, TenantMemberRole } from "@prisma/client";

import { softDeletePostAction, upsertPostAction } from "@/features/blog/actions";
import { AdminFormSection } from "@/components/admin/form-section";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { PaginationLinks } from "@/components/admin/pagination-links";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { TenantPicker } from "@/components/admin/tenant-picker";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getLocaleFromCookie, getTranslations } from "@/lib/i18n";
import { formatDate, parseEnumSearchParam } from "@/lib/utils";
import { requireAuth } from "@/server/auth/session";
import { requireTenantAccess } from "@/server/auth/permissions";
import { buildPagination, parseListParams, resolveAdminTenant } from "@/server/queries/admin";
import { db } from "@/server/db/client";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BlogPostsPage({ searchParams }: Props) {
  const user = await requireAuth("/admin/blog/posts");
  const locale = await getLocaleFromCookie();
  const t = getTranslations(locale);
  const rawParams = await searchParams;
  const params = parseListParams(rawParams);
  const editId = typeof rawParams.edit === "string" ? rawParams.edit : undefined;
  const { tenants, selectedTenant } = await resolveAdminTenant(user, params.tenantId || undefined);

  if (!selectedTenant) {
    return <EmptyState description={t.pages.noTenantDescription} title={t.pages.noTenant} />;
  }

  await requireTenantAccess(selectedTenant.id, {
    roles: [TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR],
    nextPath: `/admin/blog/posts?tenantId=${selectedTenant.id}`
  });

  const statusFilter = parseEnumSearchParam(params.status, Object.values(PublishStatus));

  const where = {
    tenantId: selectedTenant.id,
    deletedAt: null,
    ...(params.q
      ? {
          OR: [
            { title: { contains: params.q, mode: "insensitive" as const } },
            { slug: { contains: params.q, mode: "insensitive" as const } },
            { excerpt: { contains: params.q, mode: "insensitive" as const } }
          ]
        }
      : {}),
    ...(statusFilter ? { status: statusFilter } : {})
  };

  const total = await db.blogPost.count({ where });
  const pagination = buildPagination(total, params.page, params.pageSize);
  const [posts, categories, selectedPost] = await Promise.all([
    db.blogPost.findMany({
      where,
      include: {
        author: true,
        category: true,
        tagLinks: {
          include: {
            blogTag: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      skip: pagination.skip,
      take: pagination.take
    }),
    db.blogCategory.findMany({
      where: {
        tenantId: selectedTenant.id,
        deletedAt: null
      },
      orderBy: {
        name: "asc"
      }
    }),
    editId
      ? db.blogPost.findFirst({
          where: {
            id: editId,
            tenantId: selectedTenant.id,
            deletedAt: null
          },
          include: {
            tagLinks: {
              include: {
                blogTag: true
              }
            }
          }
        })
      : Promise.resolve(null)
  ]);

  const filterParams = new URLSearchParams();
  filterParams.set("tenantId", selectedTenant.id);
  if (params.q) filterParams.set("q", params.q);
  if (params.status) filterParams.set("status", params.status);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={<TenantPicker selectedTenantId={selectedTenant.id} tenants={tenants} />}
        description={t.blog.postsDescription}
        eyebrow={t.blog.postsEyebrow}
        title={t.blog.postsTitle}
      />

      <DataTableToolbar
        q={params.q}
        status={params.status}
        tenantId={selectedTenant.id}
        searchPlaceholder={t.searchToolbar.placeholder}
        statusOptions={[
          { value: PublishStatus.DRAFT, label: t.status.draft },
          { value: PublishStatus.PUBLISHED, label: t.status.published },
          { value: PublishStatus.ARCHIVED, label: t.status.archived }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.table.title}</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>{t.table.status}</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>{t.status.published}</TableHead>
                  <TableHead className="text-right">{t.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.length === 0 ? (
                  <TableRow>
                    <TableCell className="p-0" colSpan={6}>
                      <EmptyState description={t.blog.emptyPostsDescription} title={t.blog.emptyPostsTitle} />
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-stone-950">{post.title}</p>
                          <p className="text-xs text-stone-500">{post.tagLinks.map((tag) => tag.blogTag.slug).join(", ") || t.blog.noTags}</p>
                        </div>
                      </TableCell>
                      <TableCell>{post.category.name}</TableCell>
                      <TableCell>
                        <AdminStatusBadge status={post.status} />
                      </TableCell>
                      <TableCell>{post.author.name}</TableCell>
                      <TableCell>{formatDate(post.publishedAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/blog/posts?tenantId=${selectedTenant.id}&edit=${post.id}`}>{t.common.edit}</Link>
                          </Button>
                          <form action={softDeletePostAction}>
                            <input name="tenantId" type="hidden" value={selectedTenant.id} />
                            <input name="postId" type="hidden" value={post.id} />
                            <ConfirmSubmitButton confirmationMessage={t.confirmDialog.defaultMessage} size="sm" variant="destructive">
                              {t.common.delete}
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationLinks basePath="/admin/blog/posts" page={pagination.page} pageCount={pagination.pageCount} params={filterParams} />
        </div>

        <AdminFormSection
          description={t.blog.postFormDescription}
          title={selectedPost ? t.blog.editPostTitle : t.blog.createPostTitle}
        >
          <form action={upsertPostAction} className="space-y-4">
            <input name="tenantId" type="hidden" value={selectedTenant.id} />
            <input name="postId" type="hidden" value={selectedPost?.id ?? ""} />

            <div className="space-y-2">
              <Label htmlFor="title">{t.table.title}</Label>
              <Input defaultValue={selectedPost?.title ?? ""} id="title" name="title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t.table.slug}</Label>
              <Input defaultValue={selectedPost?.slug ?? ""} id="slug" name="slug" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea defaultValue={selectedPost?.excerpt ?? ""} id="excerpt" name="excerpt" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featuredImage">Featured image URL</Label>
              <Input defaultValue={selectedPost?.featuredImage ?? ""} id="featuredImage" name="featuredImage" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select defaultValue={selectedPost?.categoryId ?? categories[0]?.id ?? ""} id="categoryId" name="categoryId">
                <option value="">{t.common.select}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">{t.table.status}</Label>
                <Select defaultValue={selectedPost?.status ?? PublishStatus.DRAFT} id="status" name="status">
                  {Object.values(PublishStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  defaultValue={selectedPost?.tagLinks.map((tagLink) => tagLink.blogTag.slug).join(", ") ?? ""}
                  id="tags"
                  name="tags"
                  placeholder="seo, landing-page"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea defaultValue={selectedPost?.content ?? ""} id="content" name="content" rows={12} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO title</Label>
              <Input defaultValue={selectedPost?.seoTitle ?? ""} id="seoTitle" name="seoTitle" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO description</Label>
              <Textarea defaultValue={selectedPost?.seoDescription ?? ""} id="seoDescription" name="seoDescription" rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <SubmitButton>{t.common.save}</SubmitButton>
              <Button asChild type="button" variant="ghost">
                <Link href={`/admin/blog/posts?tenantId=${selectedTenant.id}`}>{t.common.create}</Link>
              </Button>
            </div>
          </form>
        </AdminFormSection>
      </div>
    </div>
  );
}
