import { urls } from "@/config";
import api from "@/lib/axios";

async function uploadFiles(formData: FormData) {
  try {
    const response = await api.post(urls.fileUploadUrl, formData);
    
  } catch (error) {}
}

export { uploadFiles };
