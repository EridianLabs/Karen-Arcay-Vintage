# Fix DATABASE_URL when password has special characters

If `prisma db push` fails with **P1013** (invalid database string), the **password** in your URL probably has characters that must be URL-encoded.

**Encode the password:**
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `/` → `%2F`
- `:` → `%3A`
- `?` → `%3F`
- `&` → `%26`
- `=` → `%3D`

**Example:** If your Supabase password is `p@ss#123`, use `p%40ss%23123` in the URL:

```
postgres://postgres.PROJECT_REF:p%40ss%23123@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

**Or** in Supabase: Project Settings → Database → **Reset database password**, then pick a new password that only uses letters and numbers (no `@ # % / :` etc.) and use that in `DATABASE_URL`.
