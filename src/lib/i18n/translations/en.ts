import type { TranslationDictionary } from "../types";

export const en: TranslationDictionary = {
  common: {
    home: "Home",
    blog: "Blog",
    search: "Search",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    cancel: "Cancel",
    select: "Select",
    back: "Back",
    loading: "Loading...",
    noData: "No data",
    confirm: "Confirm",
    tryAgain: "Try again",
    goHome: "Go to homepage"
  },
  sidebar: {
    title: "Admin CMS",
    subtitle: "Multi-tenant Control",
    dashboard: "Dashboard",
    sites: "Sites",
    users: "Users",
    landingPages: "Landing Pages",
    blogCategories: "Blog Categories",
    blogPosts: "Blog Posts",
    menus: "Menus",
    leads: "Leads",
    media: "Media",
    settings: "Settings"
  },
  auth: {
    loginTitle: "Admin CMS Login",
    loginDescription: "Secure cookie session, email/password and role-based access control.",
    loginButton: "Log in",
    emailLabel: "Email",
    passwordLabel: "Password",
    testAccountsHint: "Test accounts are pre-seeded for `super_admin`, `tenant_admin`, and `editor`.",
    invalidCredentials: "Invalid email or password",
    accountInactive: "Account is deactivated",
    logoutSummary: "Admin user logged out"
  },
  dashboard: {
    title: "Dashboard",
    eyebrow: "Overview",
    description: "Admin dashboard secured with session cookies, showing only tenants within your access scope.",
    tenants: "Tenants",
    publishedPages: "Published Pages",
    publishedPosts: "Published Posts",
    leads: "Leads",
    currentScope: "Current access scope",
    loggedInAs: "Logged in as",
    viewingTenant: "Viewing tenant:"
  },
  pages: {
    title: "Pages",
    eyebrow: "Content",
    description: "Manage landing pages per tenant with server-validated JSON blocks.",
    createTitle: "Create new page",
    editTitle: "Edit page",
    formDescription: "Blocks use a JSON array with a basic block schema. You can start from the default template and customize.",
    noTenant: "No tenant",
    noTenantDescription: "This account is not assigned to any tenant.",
    emptyTitle: "No pages",
    emptyDescription: "No landing pages match the current filters."
  },
  blog: {
    postsTitle: "Posts",
    postsEyebrow: "Blog",
    postsDescription: "Manage blog posts, categories, tags and SEO metadata within the tenant scope.",
    createPostTitle: "Create new post",
    editPostTitle: "Edit post",
    postFormDescription: "Enter tags as a comma-separated list. Category must exist before creating a post.",
    noTags: "No tags",
    categoriesTitle: "Categories",
    categoriesEyebrow: "Blog",
    categoriesDescription: "Full CRUD for blog categories per tenant, with slug uniqueness within the tenant scope.",
    createCategoryTitle: "Create new category",
    editCategoryTitle: "Edit category",
    emptyPostsTitle: "No posts",
    emptyPostsDescription: "No blog posts match the current filters.",
    emptyCategoriesTitle: "No categories",
    emptyCategoriesDescription: "No categories match the current filters.",
    noBlog: "No blog",
    noBlogDescription: "No tenant found for the current domain.",
    noPosts: "No posts yet",
    noPostsDescription: "Create blog posts in the admin CMS to display them here.",
    ctaTitle: "Want to turn your blog into a real lead channel?",
    ctaDescription: "Need a multi-domain landing page and SEO-ready blog system in a single codebase? We can start from this homepage and blog structure.",
    articleCtaTitle: "Want to turn this article into a complete SEO cluster?",
    articleCtaDescription: "If you want to build blog content and landing pages with proper internal linking structure, open the contact form for a tailored solution.",
    categoryArchiveEyebrow: "Category archive",
    emptyCategoryPostsDescription: "This category has no published posts yet.",
    knowledgeHub: "Knowledge hub"
  },
  menus: {
    title: "Menus",
    eyebrow: "Navigation",
    description: "Manage menus and menu items per tenant. Items use JSON for easy maintenance and validation.",
    createTitle: "Create new menu",
    editTitle: "Edit menu",
    formDescription: "Enter menu items as a JSON array. Supports parent-child items one level deep via the children field.",
    emptyTitle: "No menus",
    emptyDescription: "No menus match the current filters.",
    defaultHomeLabel: "Home",
    defaultBlogLabel: "Blog"
  },
  leads: {
    title: "Leads",
    eyebrow: "CRM",
    description: "Read-only lead list with search, filter, and pagination scoped by tenant.",
    emptyTitle: "No leads",
    emptyDescription: "No leads match the current filters.",
    noMessage: "No notes"
  },
  users: {
    title: "Users",
    eyebrow: "System",
    description: "Super admin manages users, system roles, and basic tenant memberships.",
    emptyTitle: "No users",
    emptyDescription: "No users match the current filters.",
    createTitle: "Create new user",
    editTitle: "Edit user",
    formDescription: "Membership is assigned one tenant/role per save. To add more memberships, edit the user and choose a new tenant.",
    noMemberships: "No memberships"
  },
  sites: {
    title: "Sites",
    eyebrow: "System",
    description: "SUPER_ADMIN manages tenants, site settings, domains, and active/inactive status.",
    emptyTitle: "No tenants",
    emptyDescription: "No tenants match the current filters.",
    createTitle: "Create new tenant",
    editTitle: "Edit tenant",
    formDescription: "Basic tenant info: site name, SEO defaults, business info, and status.",
    domainsTitle: "Domains",
    noDomainsTitle: "No domains",
    noDomainsDescription: "This tenant has no domains yet.",
    noTenantForDomains: "No tenant",
    noTenantForDomainsDescription: "Create a tenant before managing domains."
  },
  settings: {
    title: "Site Settings",
    eyebrow: "Tenant",
    description: "Manage site metadata, business info, social links, and basic theme for the current tenant."
  },
  media: {
    title: "Media",
    eyebrow: "Assets",
    description: "Editors and tenant admins can view media assets within their tenant.",
    assetsTitle: "Media assets"
  },
  status: {
    draft: "Draft",
    published: "Published",
    archived: "Archived",
    active: "Active",
    inactive: "Inactive"
  },
  table: {
    title: "Title",
    slug: "Slug",
    status: "Status",
    updated: "Updated",
    actions: "Actions",
    name: "Name",
    description: "Description",
    email: "Email",
    role: "Role",
    memberships: "Memberships",
    domain: "Domain",
    primary: "Primary",
    mime: "MIME",
    dimensions: "Dimensions"
  },
  tenantPicker: {
    select: "Select"
  },
  confirmDialog: {
    defaultMessage: "Are you sure you want to delete this item?"
  },
  searchToolbar: {
    placeholder: "Search..."
  },
  errors: {
    errorTitle: "An error occurred while loading the page",
    errorDescription: "The system encountered an unexpected error. You can try reloading, or come back later.",
    errorCode: "Error code:",
    notFoundTitle: "Tenant or content not found",
    notFoundDescription: "has not been assigned a tenant, or the path you are accessing does not exist.",
    notFoundHelp: "Please check the domain in the TenantDomain table, or open a valid slug/page for the current tenant."
  },
  validation: {
    nameRequired: "Name is required.",
    emailInvalid: "Invalid email address.",
    slugRequired: "Slug is required.",
    titleRequired: "Title is required.",
    siteNameRequired: "Site name is required.",
    seoTitleRequired: "SEO title is required.",
    domainRequired: "Domain is required.",
    urlInvalid: "Invalid URL.",
    emailFieldInvalid: "Invalid business email.",
    invalidData: "Invalid data",
    categoryRequired: "Category is required.",
    featuredImageInvalid: "Invalid featured image URL.",
    phoneRequired: "Phone number is required."
  },
  apiErrors: {
    tenantInvalid: "Invalid tenant",
    pageInvalid: "Invalid page",
    contactInvalid: "Invalid contact request",
    contactFailed: "Unable to submit contact request"
  },
  defaultBlocks: {
    heroHeadline: "Main headline for your landing page",
    heroSubheadline: "A brief introduction to your service or product.",
    heroPrimaryCta: "Get consultation",
    heroSecondaryCta: "Learn more",
    featuresTitle: "Key highlights",
    feature1Title: "Comprehensive solutions",
    feature1Description: "Describe your first feature or service.",
    feature2Title: "Professional team",
    feature2Description: "Describe your second feature or service.",
    feature3Title: "24/7 Support",
    feature3Description: "Describe your third feature or service.",
    ctaTitle: "Ready to get started?",
    ctaDescription: "Contact us for a free consultation.",
    ctaLabel: "Contact now"
  }
};
