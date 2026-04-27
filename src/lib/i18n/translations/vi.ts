import type { TranslationDictionary } from "../types";

export const vi: TranslationDictionary = {
  common: {
    home: "Trang chu",
    blog: "Blog",
    search: "Tim kiem",
    save: "Luu",
    delete: "Xoa",
    edit: "Sua",
    create: "Tao moi",
    cancel: "Huy",
    select: "Chon",
    back: "Quay lai",
    loading: "Dang tai...",
    noData: "Khong co du lieu",
    confirm: "Xac nhan",
    tryAgain: "Thu tai lai",
    goHome: "Quay ve trang chu"
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
    loginTitle: "Dang nhap admin CMS",
    loginDescription: "Secure cookie session, email/password va role-based access control.",
    loginButton: "Dang nhap",
    emailLabel: "Email",
    passwordLabel: "Password",
    testAccountsHint: "Test accounts se duoc seed san cho `super_admin`, `tenant_admin`, va `editor`.",
    invalidCredentials: "Sai email hoac mat khau",
    accountInactive: "Tai khoan bi vo hieu hoa",
    logoutSummary: "Admin user logged out"
  },
  dashboard: {
    title: "Dashboard",
    eyebrow: "Overview",
    description: "Admin dashboard duoc bao ve bang session cookie va chi hien tenant nam trong pham vi quyen cua user hien tai.",
    tenants: "Tenants",
    publishedPages: "Published Pages",
    publishedPosts: "Published Posts",
    leads: "Leads",
    currentScope: "Current access scope",
    loggedInAs: "Dang nhap voi",
    viewingTenant: "Dang xem tenant:"
  },
  pages: {
    title: "Pages",
    eyebrow: "Content",
    description: "Quan ly landing pages theo tenant voi blocks JSON co validation server-side.",
    createTitle: "Tao page moi",
    editTitle: "Chinh sua page",
    formDescription: "Blocks dung JSON array theo schema cac block co ban. Ban co the bat dau tu mau mac dinh roi tinh chinh dan.",
    noTenant: "Khong co tenant",
    noTenantDescription: "Tai khoan nay chua duoc gan tenant nao.",
    emptyTitle: "Khong co page",
    emptyDescription: "Chua co landing page nao khop voi bo loc hien tai."
  },
  blog: {
    postsTitle: "Posts",
    postsEyebrow: "Blog",
    postsDescription: "Quan ly bai viet, category, tags va SEO metadata trong pham vi tenant.",
    createPostTitle: "Tao bai viet moi",
    editPostTitle: "Chinh sua bai viet",
    postFormDescription: "Tags nhap theo danh sach phan tach boi dau phay. Category phai ton tai truoc khi tao bai viet.",
    noTags: "Khong co tags",
    categoriesTitle: "Categories",
    categoriesEyebrow: "Blog",
    categoriesDescription: "CRUD day du cho blog categories theo tenant, slug unique trong pham vi tenant.",
    createCategoryTitle: "Tao category moi",
    editCategoryTitle: "Chinh sua category",
    emptyPostsTitle: "Khong co bai viet",
    emptyPostsDescription: "Chua co bai viet nao khop voi bo loc hien tai.",
    emptyCategoriesTitle: "Khong co category",
    emptyCategoriesDescription: "Chua co category nao khop voi bo loc hien tai.",
    noBlog: "Chua co blog",
    noBlogDescription: "Khong tim thay tenant cho domain hien tai.",
    noPosts: "Chua co bai viet",
    noPostsDescription: "Hay tao bai viet trong admin CMS de hien thi tai day.",
    ctaTitle: "Muon bien blog thanh kenh thu lead that su?",
    ctaDescription: "Ban can mot he thong landing page va blog chuan SEO cho nhieu domain trong cung mot codebase? Chung ta co the bat dau tu homepage va blog structure nay.",
    articleCtaTitle: "Muon bien article nay thanh mot cluster SEO hoan chinh?",
    articleCtaDescription: "Neu ban muon xay dung noi dung blog va landing page co internal linking dung cau truc, hay mo form lien he de nhan giai phap phu hop.",
    categoryArchiveEyebrow: "Category archive",
    emptyCategoryPostsDescription: "Chuyen muc nay chua co bai viet public nao.",
    knowledgeHub: "Knowledge hub"
  },
  menus: {
    title: "Menus",
    eyebrow: "Navigation",
    description: "Quan ly menus va menu items theo tenant. Items dung JSON de giai doan dau de maintain va validate de dang.",
    createTitle: "Tao menu moi",
    editTitle: "Chinh sua menu",
    formDescription: "Nhap menu items dang JSON array. Ho tro item cha-con 1 cap qua truong children.",
    emptyTitle: "Khong co menu",
    emptyDescription: "Chua co menu nao khop voi bo loc hien tai.",
    defaultHomeLabel: "Trang chu",
    defaultBlogLabel: "Blog"
  },
  leads: {
    title: "Leads",
    eyebrow: "CRM",
    description: "Danh sach lead chi doc, co search, filter va pagination theo tenant scope.",
    emptyTitle: "Khong co lead",
    emptyDescription: "Chua co lead nao khop voi bo loc hien tai.",
    noMessage: "Khong co ghi chu"
  },
  users: {
    title: "Users",
    eyebrow: "System",
    description: "Super admin quan ly user, role he thong va tenant memberships co ban.",
    emptyTitle: "Khong co user",
    emptyDescription: "Chua co user nao khop voi bo loc hien tai.",
    createTitle: "Tao user moi",
    editTitle: "Chinh sua user",
    formDescription: "Membership gan theo 1 tenant/role cho moi lan luu. Neu can them membership khac, sua user va chon tenant moi.",
    noMemberships: "Khong co membership"
  },
  sites: {
    title: "Sites",
    eyebrow: "System",
    description: "SUPER_ADMIN quan ly tenants, site settings, domains va trang thai active/inactive.",
    emptyTitle: "Khong co tenant",
    emptyDescription: "Chua co tenant nao khop voi bo loc hien tai.",
    createTitle: "Tao tenant moi",
    editTitle: "Chinh sua tenant",
    formDescription: "Thong tin co ban cua tenant: site name, SEO defaults, business info va status.",
    domainsTitle: "Domains",
    domainsDescription: "Them, xoa va chon primary domain cho tenant dang duoc mo.",
    noDomainsTitle: "Chua co domain",
    noDomainsDescription: "Tenant nay chua co domain nao.",
    noTenantForDomains: "Chua co tenant",
    noTenantForDomainsDescription: "Hay tao tenant truoc khi quan ly domains."
  },
  settings: {
    title: "Site Settings",
    eyebrow: "Tenant",
    description: "Quan ly site metadata, business info, social links va giao dien co ban cho tenant hien tai."
  },
  media: {
    title: "Media",
    eyebrow: "Assets",
    description: "Editor va tenant_admin co the xem media assets trong tenant cua minh.",
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
    select: "Chon"
  },
  confirmDialog: {
    defaultMessage: "Ban co chac chan muon xoa muc nay khong?"
  },
  searchToolbar: {
    placeholder: "Tim kiem..."
  },
  errors: {
    errorTitle: "Da co loi xay ra trong qua trinh tai trang",
    errorDescription: "He thong gap loi khong mong muon. Ban co the thu tai lai, hoac quay lai sau trong giay lat.",
    errorCode: "Ma loi:",
    notFoundTitle: "Khong tim thay tenant hoac noi dung",
    notFoundDescription: "chua duoc gan tenant, hoac duong dan ban truy cap khong ton tai.",
    notFoundHelp: "Hay kiem tra lai domain trong bang TenantDomain, hoac mo mot slug/page hop le cua tenant hien tai."
  },
  validation: {
    nameRequired: "Ten bat buoc nhap.",
    emailInvalid: "Email khong hop le.",
    slugRequired: "Slug bat buoc nhap.",
    titleRequired: "Tieu de bat buoc nhap.",
    siteNameRequired: "Ten website bat buoc nhap.",
    seoTitleRequired: "SEO title bat buoc nhap.",
    domainRequired: "Domain bat buoc nhap.",
    urlInvalid: "URL khong hop le.",
    emailFieldInvalid: "Email doanh nghiep khong hop le.",
    invalidData: "Du lieu khong hop le",
    categoryRequired: "Category bat buoc chon.",
    featuredImageInvalid: "Featured image URL khong hop le.",
    phoneRequired: "So dien thoai bat buoc nhap."
  },
  apiErrors: {
    tenantInvalid: "Tenant khong hop le",
    pageInvalid: "Page khong hop le",
    contactInvalid: "Yeu cau lien he khong hop le",
    contactFailed: "Khong the gui yeu cau lien he"
  },
  defaultBlocks: {
    heroHeadline: "Tieu de chinh cho landing page",
    heroSubheadline: "Gioi thieu ngan gon ve dich vu hoac san pham cua ban.",
    heroPrimaryCta: "Nhan tu van",
    heroSecondaryCta: "Xem them",
    featuresTitle: "Diem noi bat",
    feature1Title: "Giai phap toan dien",
    feature1Description: "Mo ta tinh nang hoac dich vu dau tien cua ban.",
    feature2Title: "Doi ngu chuyen nghiep",
    feature2Description: "Mo ta tinh nang hoac dich vu thu hai cua ban.",
    feature3Title: "Ho tro 24/7",
    feature3Description: "Mo ta tinh nang hoac dich vu thu ba cua ban.",
    ctaTitle: "San sang bat dau?",
    ctaDescription: "Hay lien he voi chung toi de duoc tu van mien phi.",
    ctaLabel: "Lien he ngay"
  }
};
