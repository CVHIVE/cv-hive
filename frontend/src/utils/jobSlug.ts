/**
 * Generate a URL-friendly slug for a job listing.
 * Format: "senior-developer-dubai-{uuid}"
 */
export function generateJobSlug(title: string, emirate: string, id: string): string {
  const slug = `${title}-${emirate}`
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return `${slug}-${id}`;
}

/**
 * Extract the UUID from a job slug parameter.
 * UUIDs are always 36 characters (8-4-4-4-12).
 * Falls back to using the entire param if no UUID pattern found.
 */
export function extractJobId(slugParam: string): string {
  // UUID is the last 36 characters after the last hyphen group
  const uuidMatch = slugParam.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  return uuidMatch ? uuidMatch[1] : slugParam;
}

/**
 * Build a job URL path from a job object.
 */
export function jobUrl(job: { id: string; title?: string; emirate?: string; job_title?: string }): string {
  const title = job.title || job.job_title || 'job';
  const emirate = job.emirate || '';
  return `/jobs/${generateJobSlug(title, emirate, job.id)}`;
}
