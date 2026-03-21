-- Store OAuth app credentials per org so users don't need to edit .env
-- Credentials are stored server-side and never exposed to the client.
CREATE TABLE integration_credentials (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider   TEXT NOT NULL,
  config     JSONB NOT NULL DEFAULT '{}',  -- { client_id, client_secret, ... }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, provider)
);

ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credentials_select" ON integration_credentials
  FOR SELECT USING (org_id = get_org_id());

CREATE POLICY "credentials_upsert" ON integration_credentials
  FOR INSERT WITH CHECK (org_id = get_org_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin')));

CREATE POLICY "credentials_update" ON integration_credentials
  FOR UPDATE USING (org_id = get_org_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin')));

CREATE POLICY "credentials_delete" ON integration_credentials
  FOR DELETE USING (org_id = get_org_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin')));
