// Update existing company records with Clearbit logo URLs
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'cvhive',
  user: 'cvhive',
  password: 'cvhive123',
});

async function main() {
  const { rows } = await pool.query(
    `SELECT id, company_name, website FROM employers WHERE website IS NOT NULL AND website != ''`
  );

  console.log(`Found ${rows.length} companies with websites`);
  let updated = 0;

  for (const row of rows) {
    try {
      const url = new URL(row.website);
      const domain = url.hostname.replace(/^www\./, '');
      const logoUrl = `https://logo.clearbit.com/${domain}`;

      await pool.query(
        `UPDATE employers SET company_logo_url = $1 WHERE id = $2 AND (company_logo_url IS NULL OR company_logo_url = '')`,
        [logoUrl, row.id]
      );
      updated++;
      console.log(`  ✓ ${row.company_name} → ${logoUrl}`);
    } catch (e) {
      console.log(`  ✗ ${row.company_name}: ${e.message}`);
    }
  }

  console.log(`\nUpdated ${updated} / ${rows.length} companies`);
  await pool.end();
}

main().catch(console.error);
