export type Locale = "vi" | "en";

export type TranslationDictionary = {
  // Common
  common: {
    home: string;
    blog: string;
    search: string;
    save: string;
    delete: string;
    edit: string;
    create: string;
    cancel: string;
    select: string;
    back: string;
    loading: string;
    noData: string;
    confirm: string;
    tryAgain: string;
    goHome: string;
  };
  // Admin sidebar
  sidebar: {
    title: string;
    subtitle: string;
    dashboard: string;
    sites: string;
    users: string;
    landingPages: string;
    blogCategories: string;
    blogPosts: string;
    menus: string;
    leads: string;
    media: string;
    settings: string;
  };
  // Auth / Login
  auth: {
    loginTitle: string;
    loginDescription: string;
    loginButton: string;
    emailLabel: string;
    passwordLabel: string;
    testAccountsHint: string;
    invalidCredentials: string;
    accountInactive: string;
    logoutSummary: string;
  };
  // Dashboard
  dashboard: {
    title: string;
    eyebrow: string;
    description: string;
    tenants: string;
    publishedPages: string;
    publishedPosts: string;
    leads: string;
    currentScope: string;
    loggedInAs: string;
    viewingTenant: string;
  };
  // Pages
  pages: {
    title: string;
    eyebrow: string;
    description: string;
    createTitle: string;
    editTitle: string;
    formDescription: string;
    noTenant: string;
    noTenantDescription: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  // Blog
  blog: {
    postsTitle: string;
    postsEyebrow: string;
    postsDescription: string;
    createPostTitle: string;
    editPostTitle: string;
    postFormDescription: string;
    noTags: string;
    categoriesTitle: string;
    categoriesEyebrow: string;
    categoriesDescription: string;
    createCategoryTitle: string;
    editCategoryTitle: string;
    emptyPostsTitle: string;
    emptyPostsDescription: string;
    emptyCategoriesTitle: string;
    emptyCategoriesDescription: string;
    noBlog: string;
    noBlogDescription: string;
    noPosts: string;
    noPostsDescription: string;
    ctaTitle: string;
    ctaDescription: string;
    articleCtaTitle: string;
    articleCtaDescription: string;
    categoryArchiveEyebrow: string;
    emptyCategoryPostsDescription: string;
    knowledgeHub: string;
  };
  // Menus
  menus: {
    title: string;
    eyebrow: string;
    description: string;
    createTitle: string;
    editTitle: string;
    formDescription: string;
    emptyTitle: string;
    emptyDescription: string;
    defaultHomeLabel: string;
    defaultBlogLabel: string;
  };
  // Leads
  leads: {
    title: string;
    eyebrow: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
    noMessage: string;
  };
  // Users
  users: {
    title: string;
    eyebrow: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
    createTitle: string;
    editTitle: string;
    formDescription: string;
    noMemberships: string;
  };
  // Sites
  sites: {
    title: string;
    eyebrow: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
    createTitle: string;
    editTitle: string;
    formDescription: string;
    domainsTitle: string;
    noDomainsTitle: string;
    noDomainsDescription: string;
    noTenantForDomains: string;
    noTenantForDomainsDescription: string;
  };
  // Settings
  settings: {
    title: string;
    eyebrow: string;
    description: string;
  };
  // Media
  media: {
    title: string;
    eyebrow: string;
    description: string;
    assetsTitle: string;
  };
  // Status labels
  status: {
    draft: string;
    published: string;
    archived: string;
    active: string;
    inactive: string;
  };
  // Table headers
  table: {
    title: string;
    slug: string;
    status: string;
    updated: string;
    actions: string;
    name: string;
    description: string;
    email: string;
    role: string;
    memberships: string;
    domain: string;
    primary: string;
    mime: string;
    dimensions: string;
  };
  // Tenant picker
  tenantPicker: {
    select: string;
  };
  // Confirm dialog
  confirmDialog: {
    defaultMessage: string;
  };
  // Search
  searchToolbar: {
    placeholder: string;
  };
  // Error pages
  errors: {
    errorTitle: string;
    errorDescription: string;
    errorCode: string;
    notFoundTitle: string;
    notFoundDescription: string;
    notFoundHelp: string;
  };
  // Validation messages
  validation: {
    nameRequired: string;
    emailInvalid: string;
    slugRequired: string;
    titleRequired: string;
    siteNameRequired: string;
    seoTitleRequired: string;
    domainRequired: string;
    urlInvalid: string;
    emailFieldInvalid: string;
    invalidData: string;
    categoryRequired: string;
    featuredImageInvalid: string;
    phoneRequired: string;
  };
  // API errors
  apiErrors: {
    tenantInvalid: string;
    pageInvalid: string;
    contactInvalid: string;
    contactFailed: string;
  };
  // Default page blocks
  defaultBlocks: {
    heroHeadline: string;
    heroSubheadline: string;
    heroPrimaryCta: string;
    heroSecondaryCta: string;
    featuresTitle: string;
    feature1Title: string;
    feature1Description: string;
    feature2Title: string;
    feature2Description: string;
    feature3Title: string;
    feature3Description: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaLabel: string;
  };
};
