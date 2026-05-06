import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:5432/nextacademy' });

client.connect()
  .then(() => client.query('DROP TABLE IF EXISTS "consultation_types_available_days" CASCADE;'))
  .then(() => { console.log('Table dropped'); process.exit(0); })
  .catch((e) => { console.error(e); process.exit(1); });
