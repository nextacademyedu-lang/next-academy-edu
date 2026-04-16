# Database Migration Workflow

## Development
Schema changes are automatically pushed in development (`push: true`). This allows for rapid iteration without manual migration overhead.

## Production
1. Make your collection changes in `src/collections/`
2. Run: `pnpm payload migrate:create` to generate a new migration file
3. Review the generated migration in `src/migrations/` to ensure it captures intended changes
4. Deploy — migrations run automatically on application startup via the `prodMigrations` configuration in `payload.config.ts`.

## Never
- **Never** run `push: true` in production (this is enforced in `payload.config.ts` via `process.env.NODE_ENV !== 'production'`).
- **Never** edit generated migration files manually unless absolutely necessary for complex data migrations.
- **Never** delete migration files that have already been applied to production.
