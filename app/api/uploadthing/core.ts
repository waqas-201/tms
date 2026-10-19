import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 8,
    },
  })
    .middleware(async ({ req }) => {
      // In production, session check can be performed, or fallback to dev
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      return { userId: session?.user?.id || "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url, ufsUrl: file.ufsUrl };
    }),

  consultationReportUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      let userId = "guest";
      try {
        const session = await auth.api.getSession({
          headers: req.headers,
        });
        if (session?.user?.id) {
          userId = session.user.id;
        }
      } catch {
        // Guest consultations allowed
      }
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.url,
        ufsUrl: file.ufsUrl,
        name: file.name,
        size: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
