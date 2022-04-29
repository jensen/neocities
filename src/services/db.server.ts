const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function query(q: string, params: any[]) {
  const client = await pool.connect();
  const result = await client.query(q, params);

  client.release();

  return result.rows;
}

export const getAddress = async (hood: string, number: string) => {
  const [address] = await query(
    `
    select addresses.id, addresses.owner_id as owner
    from addresses join hoods on hoods.id = addresses.hood_id
    where hoods.name = $1 and addresses.number = $2
    `,
    [hood, number]
  );

  return address;
};

export const getOwnedAddress = async (
  hood: string,
  number: string,
  user: { id: string }
) => {
  const [address] = await query(
    `
    select addresses.id, addresses.owner_id as owner
    from addresses join hoods on hoods.id = addresses.hood_id
    where hoods.name = $1 and addresses.number = $2 and owner_id = $3
    `,
    [hood, number, user.id]
  );

  return address;
};
