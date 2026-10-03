# Runtime data

JSON files in this directory are runtime-only fallback data for local development.

- Production uses the configured Upstash Redis store.
- Runtime JSON files may contain personal data, management tokens, messages, recovery records, or operational logs.
- Do not commit runtime JSON files.
- Production backups must be created through the authenticated Backup Center, which reads the authoritative runtime storage.
- Restore remains a separate, controlled operation and is intentionally not automatic.
