// Upload is multipart (not JSON), so there's no input schema here — the API
// validates the file itself (mime type, size) in the route.
export type ImageDto = {
  id: string;
  /** Absolute path the browser can load ("/media/<tenantId>/uploads/x.webp"). */
  url: string;
  contentType: string;
  sizeBytes: number;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
};
