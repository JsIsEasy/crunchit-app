import { urls } from "@/config";
import api from "@/lib/axios";

async function uploadFiles(files: File[]) {
  try {
    const response = await api(urls.fileUploadUrl);
  } catch (error) {}
}

export { uploadFiles };
