import {
  AuditAction,
  GlobalRole,
  MediaStatus,
  MenuLocation,
  PageBlockType,
  PageType,
  Prisma,
  PrismaClient,
  PublishStatus,
  TenantMemberRole,
  TenantStatus
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type BlockSeed = {
  blockType: PageBlockType;
  payload: Prisma.InputJsonValue;
};

async function replacePageBlocks(pageId: string, tenantId: string, createdById: string, blocks: BlockSeed[]) {
  await prisma.pageBlock.deleteMany({
    where: {
      pageId
    }
  });

  await prisma.pageBlock.createMany({
    data: blocks.map((block, index) => ({
      tenantId,
      pageId,
      blockType: block.blockType,
      position: index + 1,
      payload: block.payload,
      createdById,
      updatedById: createdById
    }))
  });
}

async function attachTags(blogPostId: string, tenantId: string, tagIds: string[], createdById: string) {
  await prisma.blogPostTag.deleteMany({
    where: {
      blogPostId
    }
  });

  await prisma.blogPostTag.createMany({
    data: tagIds.map((blogTagId) => ({
      tenantId,
      blogPostId,
      blogTagId,
      createdById
    }))
  });
}

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {
      name: "Super Admin",
      passwordHash,
      globalRole: GlobalRole.SUPER_ADMIN,
      isActive: true,
      deletedAt: null
    },
    create: {
      email: "superadmin@example.com",
      passwordHash,
      name: "Super Admin",
      globalRole: GlobalRole.SUPER_ADMIN,
      isActive: true
    }
  });

  const tenantAdmin = await prisma.user.upsert({
    where: { email: "tenantadmin@example.com" },
    update: {
      name: "Tenant Admin",
      passwordHash,
      globalRole: GlobalRole.USER,
      isActive: true,
      deletedAt: null
    },
    create: {
      email: "tenantadmin@example.com",
      passwordHash,
      name: "Tenant Admin",
      globalRole: GlobalRole.USER,
      isActive: true
    }
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@example.com" },
    update: {
      name: "Editor User",
      passwordHash,
      globalRole: GlobalRole.USER,
      isActive: true,
      deletedAt: null
    },
    create: {
      email: "editor@example.com",
      passwordHash,
      name: "Editor User",
      globalRole: GlobalRole.USER,
      isActive: true
    }
  });

  const tenant = await prisma.tenant.upsert({
    where: { slug: "alpha-clinic" },
    update: {
      status: TenantStatus.ACTIVE,
      deletedAt: null,
      updatedById: superAdmin.id
    },
    create: {
      slug: "alpha-clinic",
      status: TenantStatus.ACTIVE,
      createdById: superAdmin.id,
      updatedById: superAdmin.id
    }
  });

  await prisma.siteSettings.upsert({
    where: { tenantId: tenant.id },
    update: {
      siteName: "Alpha Clinic",
      siteTagline: "Landing page platform cho phong kham va dich vu suc khoe",
      logoUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
      faviconUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f",
      defaultSeoTitle: "Alpha Clinic | Cham soc suc khoe toan dien",
      defaultSeoDescription: "Nen tang CMS multi-tenant cho landing pages va blog chuan SEO.",
      defaultOgImageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f",
      businessName: "Alpha Clinic Co., Ltd",
      businessEmail: "hello@alphaclinic.vn",
      businessPhone: "0901 111 222",
      businessAddress: "12 Tran Hung Dao, Hoan Kiem, Ha Noi",
      businessDescription: "Phong kham da khoa toi uu cho mobile, lead generation va noi dung SEO.",
      socialLinks: {
        facebook: "https://facebook.com/alphaclinic",
        youtube: "https://youtube.com/@alphaclinic",
        zalo: "https://zalo.me/alphaclinic"
      },
      themeSettings: {
        primaryColor: "#0f766e",
        accentColor: "#14b8a6",
        heroPattern: "grid"
      },
      locale: "vi-VN",
      deletedAt: null,
      updatedById: superAdmin.id
    },
    create: {
      tenantId: tenant.id,
      siteName: "Alpha Clinic",
      siteTagline: "Landing page platform cho phong kham va dich vu suc khoe",
      logoUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
      faviconUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f",
      defaultSeoTitle: "Alpha Clinic | Cham soc suc khoe toan dien",
      defaultSeoDescription: "Nen tang CMS multi-tenant cho landing pages va blog chuan SEO.",
      defaultOgImageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f",
      businessName: "Alpha Clinic Co., Ltd",
      businessEmail: "hello@alphaclinic.vn",
      businessPhone: "0901 111 222",
      businessAddress: "12 Tran Hung Dao, Hoan Kiem, Ha Noi",
      businessDescription: "Phong kham da khoa toi uu cho mobile, lead generation va noi dung SEO.",
      socialLinks: {
        facebook: "https://facebook.com/alphaclinic",
        youtube: "https://youtube.com/@alphaclinic",
        zalo: "https://zalo.me/alphaclinic"
      },
      themeSettings: {
        primaryColor: "#0f766e",
        accentColor: "#14b8a6",
        heroPattern: "grid"
      },
      locale: "vi-VN",
      createdById: superAdmin.id,
      updatedById: superAdmin.id
    }
  });

  await prisma.tenantDomain.upsert({
    where: { host: "alpha.localhost" },
    update: {
      tenantId: tenant.id,
      isPrimary: true,
      isActive: true,
      deletedAt: null,
      updatedById: superAdmin.id
    },
    create: {
      tenantId: tenant.id,
      host: "alpha.localhost",
      isPrimary: true,
      isActive: true,
      redirectToPrimary: false,
      createdById: superAdmin.id,
      updatedById: superAdmin.id
    }
  });

  for (const domainSeed of [
    { host: "www.alpha.localhost", isPrimary: false },
    { host: "alpha.lvh.me", isPrimary: false }
  ]) {
    await prisma.tenantDomain.upsert({
      where: { host: domainSeed.host },
      update: {
        tenantId: tenant.id,
        isPrimary: domainSeed.isPrimary,
        isActive: true,
        deletedAt: null,
        updatedById: superAdmin.id
      },
      create: {
        tenantId: tenant.id,
        host: domainSeed.host,
        isPrimary: domainSeed.isPrimary,
        isActive: true,
        redirectToPrimary: false,
        createdById: superAdmin.id,
        updatedById: superAdmin.id
      }
    });
  }

  await prisma.tenantMembership.upsert({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: superAdmin.id
      }
    },
    update: {
      role: TenantMemberRole.TENANT_ADMIN,
      isDefault: true,
      deletedAt: null,
      updatedById: superAdmin.id
    },
    create: {
      tenantId: tenant.id,
      userId: superAdmin.id,
      role: TenantMemberRole.TENANT_ADMIN,
      isDefault: true,
      createdById: superAdmin.id,
      updatedById: superAdmin.id
    }
  });

  await prisma.tenantMembership.upsert({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: tenantAdmin.id
      }
    },
    update: {
      role: TenantMemberRole.TENANT_ADMIN,
      isDefault: true,
      deletedAt: null,
      updatedById: superAdmin.id
    },
    create: {
      tenantId: tenant.id,
      userId: tenantAdmin.id,
      role: TenantMemberRole.TENANT_ADMIN,
      isDefault: true,
      createdById: superAdmin.id,
      updatedById: superAdmin.id
    }
  });

  await prisma.tenantMembership.upsert({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: editor.id
      }
    },
    update: {
      role: TenantMemberRole.EDITOR,
      isDefault: true,
      deletedAt: null,
      updatedById: superAdmin.id
    },
    create: {
      tenantId: tenant.id,
      userId: editor.id,
      role: TenantMemberRole.EDITOR,
      isDefault: true,
      createdById: superAdmin.id,
      updatedById: superAdmin.id
    }
  });

  const primaryMenu = await prisma.menu.upsert({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: "primary"
      }
    },
    update: {
      name: "Primary Menu",
      location: MenuLocation.PRIMARY,
      deletedAt: null,
      updatedById: superAdmin.id
    },
    create: {
      tenantId: tenant.id,
      name: "Primary Menu",
      slug: "primary",
      location: MenuLocation.PRIMARY,
      isActive: true,
      createdById: superAdmin.id,
      updatedById: superAdmin.id
    }
  });

  await prisma.menuItem.deleteMany({
    where: {
      menuId: primaryMenu.id
    }
  });

  await prisma.menuItem.createMany({
    data: [
      {
        tenantId: tenant.id,
        menuId: primaryMenu.id,
        label: "Trang chu",
        href: "/",
        sortOrder: 1,
        isActive: true,
        createdById: superAdmin.id,
        updatedById: superAdmin.id
      },
      {
        tenantId: tenant.id,
        menuId: primaryMenu.id,
        label: "Gioi thieu",
        href: "/gioi-thieu",
        sortOrder: 2,
        isActive: true,
        createdById: superAdmin.id,
        updatedById: superAdmin.id
      },
      {
        tenantId: tenant.id,
        menuId: primaryMenu.id,
        label: "Blog",
        href: "/blog",
        sortOrder: 3,
        isActive: true,
        createdById: superAdmin.id,
        updatedById: superAdmin.id
      }
    ]
  });

  await prisma.mediaAsset.deleteMany({
    where: {
      tenantId: tenant.id
    }
  });

  const heroImage = await prisma.mediaAsset.create({
    data: {
      tenantId: tenant.id,
      name: "Hero doctor",
      url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f",
      alt: "Bac si tu van cho benh nhan",
      mimeType: "image/jpeg",
      sizeBytes: 245000,
      width: 1200,
      height: 800,
      status: MediaStatus.READY,
      createdById: superAdmin.id,
      updatedById: superAdmin.id
    }
  });

  const pagesToSeed = [
    {
      slug: "home",
      title: "Phong kham gia dinh toi uu cho mobile",
      summary: "Homepage cho tenant Alpha Clinic.",
      pageType: PageType.HOME,
      status: PublishStatus.PUBLISHED,
      seoTitle: "Alpha Clinic | Dat lich kham nhanh va tu van 1-1",
      seoDescription: "Homepage chuan SEO, semantic HTML va lead generation.",
      ogImageUrl: heroImage.url,
      blocks: [
        {
          blockType: PageBlockType.HERO,
          payload: {
            headline: "Cham soc suc khoe gia dinh, tu van nhanh, dat lich de dang",
            subheadline: "Landing platform toi uu mobile-first va gom lead truc tiep vao CMS.",
            primaryCtaLabel: "Nhan tu van",
            primaryCtaHref: "#contact",
            imageUrl: heroImage.url,
            imageAlt: heroImage.alt
          }
        },
        {
          blockType: PageBlockType.FEATURE_LIST,
          payload: {
            title: "Diem khac biet",
            items: [
              {
                title: "SEO first",
                description: "Metadata dong, canonical va JSON-LD day du."
              },
              {
                title: "Mobile first",
                description: "Toi uu layout va CTA cho dien thoai."
              },
              {
                title: "Lead capture",
                description: "Form lien he luu thang vao database."
              }
            ]
          }
        },
        {
          blockType: PageBlockType.CONTACT_FORM,
          payload: {
            title: "De lai thong tin",
            description: "Chung toi se goi lai trong gio hanh chinh."
          }
        }
      ]
    },
    {
      slug: "gioi-thieu",
      title: "Ve Alpha Clinic",
      summary: "Landing page gioi thieu thuong hieu va doi ngu.",
      pageType: PageType.ABOUT,
      status: PublishStatus.PUBLISHED,
      seoTitle: "Gioi thieu Alpha Clinic",
      seoDescription: "Trang gioi thieu phong kham va doi ngu chuyen mon.",
      ogImageUrl: heroImage.url,
      blocks: [
        {
          blockType: PageBlockType.RICH_TEXT,
          payload: {
            title: "Su menh",
            content: "Chung toi xay dung trai nghiem kham nhanh, ro rang va than thien cho ca gia dinh."
          }
        },
        {
          blockType: PageBlockType.TESTIMONIALS,
          payload: {
            title: "Cam nhan khach hang",
            items: [
              {
                quote: "Dat lich nhanh va nhan tu van rat som.",
                author: "Chi Lan",
                role: "Khach hang"
              },
              {
                quote: "Website de dung tren mobile va thong tin ro rang.",
                author: "Anh Quang",
                role: "Khach hang"
              }
            ]
          }
        }
      ]
    },
    {
      slug: "kham-tong-quat",
      title: "Goi kham tong quat",
      summary: "Landing page service thu lead cho goi kham tong quat.",
      pageType: PageType.SERVICE,
      status: PublishStatus.PUBLISHED,
      seoTitle: "Goi kham tong quat | Alpha Clinic",
      seoDescription: "Gioi thieu goi kham tong quat voi noi dung SEO va CTA manh.",
      ogImageUrl: heroImage.url,
      blocks: [
        {
          blockType: PageBlockType.HERO,
          payload: {
            headline: "Goi kham tong quat cho gia dinh hien dai",
            subheadline: "Toi uu quy trinh tiep nhan, lich hen va tu van sau kham.",
            primaryCtaLabel: "Dat lich ngay",
            primaryCtaHref: "#contact"
          }
        },
        {
          blockType: PageBlockType.FAQ,
          payload: {
            title: "Cau hoi thuong gap",
            items: [
              {
                question: "Can nhin an truoc khi kham khong?",
                answer: "Tuy theo goi kham, nhan vien tu van se huong dan truoc."
              }
            ]
          }
        }
      ]
    },
    {
      slug: "lien-he",
      title: "Lien he va dat lich",
      summary: "Landing page contact cho tenant.",
      pageType: PageType.CONTACT,
      status: PublishStatus.PUBLISHED,
      seoTitle: "Lien he Alpha Clinic",
      seoDescription: "Trang lien he va dat lich kham voi form lead generation.",
      ogImageUrl: heroImage.url,
      blocks: [
        {
          blockType: PageBlockType.CTA,
          payload: {
            title: "Can tu van nhanh?",
            description: "Goi ngay hoac de lai thong tin cho chung toi.",
            label: "Dat lich",
            href: "#contact"
          }
        },
        {
          blockType: PageBlockType.CONTACT_FORM,
          payload: {
            title: "Nhan lien he",
            description: "Thong tin cua ban se duoc nhan vien cham soc tiep nhan."
          }
        }
      ]
    }
  ] as const;

  const pageMap = new Map<string, string>();

  for (const pageSeed of pagesToSeed) {
    const page = await prisma.page.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug: pageSeed.slug
        }
      },
      update: {
        title: pageSeed.title,
        summary: pageSeed.summary,
        pageType: pageSeed.pageType,
        status: pageSeed.status,
        seoTitle: pageSeed.seoTitle,
        seoDescription: pageSeed.seoDescription,
        ogImageUrl: pageSeed.ogImageUrl,
        publishedAt: pageSeed.status === PublishStatus.PUBLISHED ? new Date() : null,
        deletedAt: null,
        updatedById: superAdmin.id
      },
      create: {
        tenantId: tenant.id,
        title: pageSeed.title,
        slug: pageSeed.slug,
        summary: pageSeed.summary,
        pageType: pageSeed.pageType,
        status: pageSeed.status,
        seoTitle: pageSeed.seoTitle,
        seoDescription: pageSeed.seoDescription,
        ogImageUrl: pageSeed.ogImageUrl,
        publishedAt: pageSeed.status === PublishStatus.PUBLISHED ? new Date() : null,
        createdById: superAdmin.id,
        updatedById: superAdmin.id
      }
    });

    pageMap.set(pageSeed.slug, page.id);
    await replacePageBlocks(page.id, tenant.id, superAdmin.id, [...pageSeed.blocks]);
  }

  const categories = await Promise.all(
    [
      {
        name: "Kien thuc suc khoe",
        slug: "kien-thuc-suc-khoe",
        description: "Noi dung huu ich ve cham soc suc khoe va phong benh."
      },
      {
        name: "SEO landing page",
        slug: "seo-landing-page",
        description: "Kinh nghiem toi uu noi dung, metadata va semantic HTML."
      },
      {
        name: "Van hanh phong kham",
        slug: "van-hanh-phong-kham",
        description: "Quy trinh van hanh, tiep nhan va cham soc benh nhan."
      }
    ].map((category) =>
      prisma.blogCategory.upsert({
        where: {
          tenantId_slug: {
            tenantId: tenant.id,
            slug: category.slug
          }
        },
        update: {
          name: category.name,
          description: category.description,
          seoTitle: `${category.name} | Alpha Clinic`,
          seoDescription: category.description,
          deletedAt: null,
          updatedById: superAdmin.id
        },
        create: {
          tenantId: tenant.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          seoTitle: `${category.name} | Alpha Clinic`,
          seoDescription: category.description,
          createdById: superAdmin.id,
          updatedById: superAdmin.id
        }
      })
    )
  );

  const tags = await Promise.all(
    [
      { name: "mobile-first", slug: "mobile-first" },
      { name: "seo", slug: "seo" },
      { name: "landing-page", slug: "landing-page" },
      { name: "lead-generation", slug: "lead-generation" },
      { name: "blog", slug: "blog" }
    ].map((tag) =>
      prisma.blogTag.upsert({
        where: {
          tenantId_slug: {
            tenantId: tenant.id,
            slug: tag.slug
          }
        },
        update: {
          name: tag.name,
          deletedAt: null,
          updatedById: superAdmin.id
        },
        create: {
          tenantId: tenant.id,
          name: tag.name,
          slug: tag.slug,
          createdById: superAdmin.id,
          updatedById: superAdmin.id
        }
      })
    )
  );

  const categoryBySlug = new Map(categories.map((item) => [item.slug, item]));
  const tagBySlug = new Map(tags.map((item) => [item.slug, item]));

  const blogPosts = [
    {
      title: "5 luu y khi toi uu homepage chuan SEO",
      slug: "5-luu-y-khi-toi-uu-homepage-chuan-seo",
      excerpt: "Nhung diem can co de homepage vua nhanh vua len top tot hon.",
      content:
        "Homepage can ro heading hierarchy, metadata, CTA va internal links. Ban nen bat dau tu nhu cau nguoi dung va su ro rang cua thong diep.\n\nSau do toi uu image, alt text va semantic HTML.",
      categorySlug: "seo-landing-page",
      tagSlugs: ["seo", "landing-page", "mobile-first"]
    },
    {
      title: "Cach thiet ke landing page chuyen doi cao cho phong kham",
      slug: "cach-thiet-ke-landing-page-chuyen-doi-cao-cho-phong-kham",
      excerpt: "Bo cuc hero, feature list va contact form giup thu lead hieu qua hon.",
      content:
        "Landing page cho phong kham nen co thong diep ro, proof tin cay va CTA o vi tri de thay tren mobile.\n\nMot block FAQ nho cung giup giam ma sat truoc khi submit form.",
      categorySlug: "seo-landing-page",
      tagSlugs: ["landing-page", "lead-generation", "mobile-first"]
    },
    {
      title: "Checklist van hanh quy trinh tiep nhan benh nhan moi",
      slug: "checklist-van-hanh-quy-trinh-tiep-nhan-benh-nhan-moi",
      excerpt: "Checklist giup doi ngu tiep nhan xu ly lead va lich hen nhat quan hon.",
      content:
        "Khi lead vao he thong, can co quy trinh phan loai, lien he, dat lich va nhac hen ro rang.\n\nCRM nhe trong CMS la du cho giai doan dau.",
      categorySlug: "van-hanh-phong-kham",
      tagSlugs: ["lead-generation", "blog"]
    },
    {
      title: "3 noi dung blog nen co de tang internal link cho landing pages",
      slug: "3-noi-dung-blog-nen-co-de-tang-internal-link-cho-landing-pages",
      excerpt: "Blog support rat tot cho SEO neu biet lien ket noi dung dung cach.",
      content:
        "Hay viet cac bai how-to, FAQ mo rong va case study nho. Moi bai viet nen tro ve page dich vu lien quan bang internal link tu nhien.\n\nDieu nay giup tang topical authority.",
      categorySlug: "kien-thuc-suc-khoe",
      tagSlugs: ["seo", "blog", "landing-page"]
    },
    {
      title: "Khi nao nen tach page service va page contact trong CMS",
      slug: "khi-nao-nen-tach-page-service-va-page-contact-trong-cms",
      excerpt: "Tach page dung luc giup menu ro rang va hanh trinh chuyen doi tot hon.",
      content:
        "Neu dich vu can giai thich sau, nen co service page rieng. Contact page dung de tong hop form, ban do, hotline va thong tin phap ly.\n\nCach tach nay tot cho ca UX lan SEO.",
      categorySlug: "van-hanh-phong-kham",
      tagSlugs: ["seo", "lead-generation"]
    }
  ] as const;

  for (const postSeed of blogPosts) {
    const category = categoryBySlug.get(postSeed.categorySlug);

    if (!category) {
      throw new Error(`Missing category for slug ${postSeed.categorySlug}`);
    }

    const post = await prisma.blogPost.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug: postSeed.slug
        }
      },
      update: {
        categoryId: category.id,
        authorId: superAdmin.id,
        title: postSeed.title,
        excerpt: postSeed.excerpt,
        content: postSeed.content,
        featuredImage: heroImage.url,
        seoTitle: `${postSeed.title} | Alpha Clinic`,
        seoDescription: postSeed.excerpt,
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date(),
        deletedAt: null,
        updatedById: superAdmin.id
      },
      create: {
        tenantId: tenant.id,
        categoryId: category.id,
        authorId: superAdmin.id,
        title: postSeed.title,
        slug: postSeed.slug,
        excerpt: postSeed.excerpt,
        content: postSeed.content,
        featuredImage: heroImage.url,
        seoTitle: `${postSeed.title} | Alpha Clinic`,
        seoDescription: postSeed.excerpt,
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date(),
        createdById: superAdmin.id,
        updatedById: superAdmin.id
      }
    });

    const tagIds = postSeed.tagSlugs.map((slug) => {
      const tag = tagBySlug.get(slug);

      if (!tag) {
        throw new Error(`Missing tag for slug ${slug}`);
      }

      return tag.id;
    });

    await attachTags(post.id, tenant.id, tagIds, superAdmin.id);
  }

  const contactPageId = pageMap.get("lien-he") ?? pageMap.get("home");

  if (!contactPageId) {
    throw new Error("No contact-capable page found for lead seeding.");
  }

  const existingLead = await prisma.lead.findFirst({
    where: {
      tenantId: tenant.id,
      email: "lead@example.com",
      deletedAt: null
    }
  });

  if (!existingLead) {
    await prisma.lead.create({
      data: {
        tenantId: tenant.id,
        pageId: contactPageId,
        name: "Nguyen Van A",
        email: "lead@example.com",
        phone: "0988888888",
        company: "Cong ty ABC",
        message: "Toi can dat lich kham vao sang thu 6.",
        sourcePath: "/lien-he",
        sourceHost: "alpha.localhost",
        metadata: {
          utm_source: "google",
          campaign: "alpha-launch"
        },
        createdById: superAdmin.id,
        updatedById: superAdmin.id
      }
    });
  }

  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      actorUserId: superAdmin.id,
      action: AuditAction.CREATE,
      entityType: "Seed",
      entityId: tenant.id,
      summary: "Initial CMS multi-tenant seed data created"
    }
  });

  const inactiveTenant = await prisma.tenant.upsert({
    where: { slug: "inactive-demo" },
    update: {
      status: TenantStatus.INACTIVE,
      deletedAt: null,
      updatedById: superAdmin.id
    },
    create: {
      slug: "inactive-demo",
      status: TenantStatus.INACTIVE,
      createdById: superAdmin.id,
      updatedById: superAdmin.id
    }
  });

  await prisma.siteSettings.upsert({
    where: { tenantId: inactiveTenant.id },
    update: {
      siteName: "Inactive Demo Site",
      defaultSeoTitle: "Inactive Demo Site",
      defaultSeoDescription: "Tenant mau de test inactive state theo hostname.",
      businessName: "Inactive Demo",
      deletedAt: null,
      updatedById: superAdmin.id
    },
    create: {
      tenantId: inactiveTenant.id,
      siteName: "Inactive Demo Site",
      defaultSeoTitle: "Inactive Demo Site",
      defaultSeoDescription: "Tenant mau de test inactive state theo hostname.",
      businessName: "Inactive Demo",
      createdById: superAdmin.id,
      updatedById: superAdmin.id
    }
  });

  await prisma.tenantDomain.upsert({
    where: { host: "inactive.lvh.me" },
    update: {
      tenantId: inactiveTenant.id,
      isPrimary: true,
      isActive: true,
      deletedAt: null,
      updatedById: superAdmin.id
    },
    create: {
      tenantId: inactiveTenant.id,
      host: "inactive.lvh.me",
      isPrimary: true,
      isActive: true,
      redirectToPrimary: false,
      createdById: superAdmin.id,
      updatedById: superAdmin.id
    }
  });

  console.log("Seed completed.");
  console.log("Super admin: superadmin@example.com / Admin@123");
  console.log("Tenant admin: tenantadmin@example.com / Admin@123");
  console.log("Editor: editor@example.com / Admin@123");
  console.log("Tenant hosts: alpha.localhost, www.alpha.localhost, alpha.lvh.me");
  console.log("Inactive demo host: inactive.lvh.me");
  console.log("Pages: 1 homepage + 3 landing pages");
  console.log("Blog: 3 categories + 5 posts");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
