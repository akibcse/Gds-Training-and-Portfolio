import { ref, get, update, set } from "firebase/database";
import { getFirebaseDatabase } from "../firebase";

const CMS_NODE = "cms";

export const migrateLegacyToCms = async () => {
    const db = getFirebaseDatabase();
    if (!db) return { success: false, error: "Database not initialized" };

    const migrationResults: Record<string, any> = {};

    try {
        // 1. Migrate Navbar
        const navbarSnap = await get(ref(db, "navbar"));
        if (navbarSnap.exists()) {
            const navbarData = navbarSnap.val();
            const navbarCms: any = {};
            if (Array.isArray(navbarData)) {
                navbarData.forEach(item => {
                    const id = item.id || Math.random().toString(36).substring(2, 9);
                    navbarCms[id] = item;
                });
            } else {
                Object.assign(navbarCms, navbarData);
            }
            await update(ref(db, `${CMS_NODE}/navbar`), navbarCms);
            migrationResults.navbar = "Migrated";
        }

        // 2. Migrate Footer
        const footerSnap = await get(ref(db, "footer"));
        if (footerSnap.exists()) {
            const footerData = footerSnap.val();
            const footerCms: any = {};
            if (Array.isArray(footerData)) {
                footerData.forEach(item => {
                    const id = item.id || Math.random().toString(36).substring(2, 9);
                    footerCms[id] = item;
                });
            } else {
                Object.assign(footerCms, footerData);
            }
            await update(ref(db, `${CMS_NODE}/footer`), footerCms);
            migrationResults.footer = "Migrated";
        }

        // 3. Migrate Courses
        const coursesSnap = await get(ref(db, "courses"));
        if (coursesSnap.exists()) {
            const coursesData = coursesSnap.val();
            const coursesCms: any = {};
            if (Array.isArray(coursesData)) {
                coursesData.forEach(item => {
                    const id = item.id || item.slug || Math.random().toString(36).substring(2, 9);
                    coursesCms[id] = item;
                });
            } else {
                Object.assign(coursesCms, coursesData);
            }
            await update(ref(db, `${CMS_NODE}/courses`), coursesCms);
            migrationResults.courses = "Migrated";
        }

        // 4. Migrate Blogs
        const blogsSnap = await get(ref(db, "blogs"));
        if (blogsSnap.exists()) {
            const blogsData = blogsSnap.val();
            const blogsCms: any = {};
            if (Array.isArray(blogsData)) {
                blogsData.forEach(item => {
                    const id = item.id || item.slug || Math.random().toString(36).substring(2, 9);
                    blogsCms[id] = item;
                });
            } else {
                Object.assign(blogsCms, blogsData);
            }
            await update(ref(db, `${CMS_NODE}/blogs`), blogsCms);
            migrationResults.blogs = "Migrated";
        }

        // 5. Migrate Projects (Portfolio)
        const projectsSnap = await get(ref(db, "projects"));
        const portfolioSnap = await get(ref(db, "portfolio"));
        const projectsData = projectsSnap.val() || portfolioSnap.val();

        if (projectsData) {
            const projectsCms: any = {};
            if (Array.isArray(projectsData)) {
                projectsData.forEach(item => {
                    const id = item.id || item.slug || Math.random().toString(36).substring(2, 9);
                    projectsCms[id] = item;
                });
            } else {
                Object.assign(projectsCms, projectsData);
            }
            await update(ref(db, `${CMS_NODE}/portfolio`), projectsCms);
            migrationResults.portfolio = "Migrated";
        }

        // 6. Migrate Users (Leads)
        const usersSnap = await get(ref(db, "users"));
        if (usersSnap.exists()) {
            const usersData = usersSnap.val();
            const leadsCms: any = {};
            if (Array.isArray(usersData)) {
                usersData.forEach(item => {
                    const id = item.id || Math.random().toString(36).substring(2, 9);
                    leadsCms[id] = {
                        ...item,
                        status: item.status || "New",
                        createdAt: item.updatedAt || new Date().toISOString()
                    };
                });
            } else {
                Object.assign(leadsCms, usersData);
            }
            await update(ref(db, `${CMS_NODE}/leads`), leadsCms);
            migrationResults.leads = "Migrated";
        }

        // 7. Migrate SEO Global
        const seoSnap = await get(ref(db, "seo"));
        if (seoSnap.exists()) {
            await update(ref(db, `${CMS_NODE}/seo/global`), seoSnap.val());
            migrationResults.seoGlobal = "Migrated";
        }

        // 8. Migrate SEO Pages
        const seoPagesSnap = await get(ref(db, "seo-pages"));
        if (seoPagesSnap.exists()) {
            const seoPagesData = seoPagesSnap.val();
            const seoPagesCms: any = {};
            if (Array.isArray(seoPagesData)) {
                seoPagesData.forEach(item => {
                    const key = item.pageKey || item.slug || Math.random().toString(36).substring(2, 9);
                    seoPagesCms[key] = item;
                });
            } else {
                Object.assign(seoPagesCms, seoPagesData);
            }
            await update(ref(db, `${CMS_NODE}/seo/pages`), seoPagesCms);
            migrationResults.seoPages = "Migrated";
        }

        return { success: true, results: migrationResults };
    } catch (error: any) {
        console.error("Migration failed:", error);
        return { success: false, error: error.message };
    }
};
