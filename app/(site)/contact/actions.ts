"use server";

import { getClientIp } from "@/lib/auth/session";
import { formValues, handleContactSubmission, type ContactFormState } from "@/lib/contact";
import { getSiteSettings } from "@/lib/data/public";

export async function submitContact(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  try {
    const settings = await getSiteSettings();
    return await handleContactSubmission(formData, await getClientIp(), settings.contact.formEnabled);
  } catch (error) {
    console.error("Contact form error:", error instanceof Error ? error.name : "unknown");
    return {
      status: "error",
      message: "Your message could not be sent because of a server problem. Please try again later or use email.",
      values: formValues(formData),
    };
  }
}
