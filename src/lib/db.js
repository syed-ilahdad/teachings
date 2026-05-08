export async function executeD1Query(sql, params = []) {
  const accountId  = process.env.R2_ACCOUNT_ID;
  const databaseId = process.env.CF_D1_DATABASE_ID;
  const apiToken   = process.env.CF_D1_API_TOKEN;
  if (!accountId || !databaseId || !apiToken)
    throw new Error('Missing D1 env vars');

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, params }),
    }
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`D1 HTTP ${res.status}: ${text}`);
  const data = JSON.parse(text);
  if (!data.success) {
    const isDupe = data.errors?.some(e =>
      e.message?.includes('duplicate column') || e.message?.includes('already exists')
    );
    if (isDupe) return { results: [], meta: {} };
    throw new Error(`D1 error: ${JSON.stringify(data.errors)}`);
  }
  return data.result[0];
}