"use server";

import { getClientIp } from "@/lib/auth/session";
import { formValues, handleStudioInquiry, type ContactFormState } from "@/lib/contact";

export async function submitStudioInquiry(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  try {
    return await handleStudioInquiry(formData, await getClientIp());
  } catch (error) {
    console.error("Studio inquiry error:", error instanceof Error ? error.name : "unknown");
    return {
      status: "error",
      message: "Your inquiry could not be sent because of a server problem. Please try again later or use email.",
      values: formValues(formData, true),
    };
  }
}
