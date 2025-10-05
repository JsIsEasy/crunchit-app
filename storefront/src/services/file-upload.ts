import { urls } from "@/config";
import api, { AxiosProgressEvent } from "@/lib/axios";

async function uploadFiles(formData: FormData, onUploadProgress: (progressEvent: AxiosProgressEvent) => void) {
  try {
    await api.post(urls.fileUploadUrl, formData, { onUploadProgress });
  } catch (error) {}
}

export { uploadFiles };
