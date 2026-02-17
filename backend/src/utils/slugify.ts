import slugifyLib from 'slugify';
import db from '../config/database';

export const generateUniqueSlug = async (name: string): Promise<string> => {
  const baseSlug = slugifyLib(name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const result = await db.query(
      'SELECT id FROM candidates WHERE profile_slug = $1',
      [slug]
    );
    if (result.rows.length === 0) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
