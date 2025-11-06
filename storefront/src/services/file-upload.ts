import { urls } from "@/config";
import api, { AxiosProgressEvent } from "@/lib/axios";

async function uploadFiles(
  formData: FormData,
  onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
  onError?: (error: unknown) => void
) {
  try {
    return api.post(urls.fileUploadUrl, formData, { onUploadProgress });
  } catch (error) {
    onError?.(error);
  }
}

export { uploadFiles };
