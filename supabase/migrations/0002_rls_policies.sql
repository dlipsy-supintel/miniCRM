ALTER TABLE organizations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE synced_emails      ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_api_keys       ENABLE ROW LEVEL SECURITY;

-- Organizations
CREATE POLICY "org_select" ON organizations FOR SELECT USING (id = get_org_id());
CREATE POLICY "org_update" ON organizations FOR UPDATE USING (id = get_org_id()) WITH CHECK (id = get_org_id());

-- Profiles (allow users to always read their own profile even if org_id missing from JWT)
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (id = auth.uid() OR org_id = get_org_id());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (id = auth.uid());

-- Contacts
CREATE POLICY "contacts_select" ON contacts FOR SELECT USING (org_id = get_org_id());
CREATE POLICY "contacts_insert" ON contacts FOR INSERT WITH CHECK (org_id = get_org_id());
CREATE POLICY "contacts_update" ON contacts FOR UPDATE USING (org_id = get_org_id());
CREATE POLICY "contacts_delete" ON contacts FOR DELETE USING (org_id = get_org_id());

-- Companies
CREATE POLICY "companies_select" ON companies FOR SELECT USING (org_id = get_org_id());
CREATE POLICY "companies_insert" ON companies FOR INSERT WITH CHECK (org_id = get_org_id());
CREATE POLICY "companies_update" ON companies FOR UPDATE USING (org_id = get_org_id());
CREATE POLICY "companies_delete" ON companies FOR DELETE USING (org_id = get_org_id());

-- Pipeline stages
CREATE POLICY "stages_select" ON pipeline_stages FOR SELECT USING (org_id = get_org_id());
CREATE POLICY "stages_insert" ON pipeline_stages FOR INSERT WITH CHECK (org_id = get_org_id());
CREATE POLICY "stages_update" ON pipeline_stages FOR UPDATE USING (org_id = get_org_id());
CREATE POLICY "stages_delete" ON pipeline_stages FOR DELETE USING (org_id = get_org_id());

-- Deals
CREATE POLICY "deals_select" ON deals FOR SELECT USING (org_id = get_org_id());
CREATE POLICY "deals_insert" ON deals FOR INSERT WITH CHECK (org_id = get_org_id());
CREATE POLICY "deals_update" ON deals FOR UPDATE USING (org_id = get_org_id());
CREATE POLICY "deals_delete" ON deals FOR DELETE USING (org_id = get_org_id());

-- Activities
CREATE POLICY "activities_select" ON activities FOR SELECT USING (org_id = get_org_id());
CREATE POLICY "activities_insert" ON activities FOR INSERT WITH CHECK (org_id = get_org_id());
CREATE POLICY "activities_update" ON activities FOR UPDATE USING (org_id = get_org_id());
CREATE POLICY "activities_delete" ON activities FOR DELETE USING (org_id = get_org_id());

-- Notes
CREATE POLICY "notes_select" ON notes FOR SELECT USING (org_id = get_org_id());
CREATE POLICY "notes_insert" ON notes FOR INSERT WITH CHECK (org_id = get_org_id());
CREATE POLICY "notes_update" ON notes FOR UPDATE USING (org_id = get_org_id());
CREATE POLICY "notes_delete" ON notes FOR DELETE
  USING (org_id = get_org_id() AND (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin'))
  ));

-- Integration tokens
CREATE POLICY "tokens_select" ON integration_tokens FOR SELECT
  USING (org_id = get_org_id() AND (user_id = auth.uid() OR user_id IS NULL));
CREATE POLICY "tokens_insert" ON integration_tokens FOR INSERT WITH CHECK (org_id = get_org_id());
CREATE POLICY "tokens_update" ON integration_tokens FOR UPDATE
  USING (org_id = get_org_id() AND (user_id = auth.uid() OR user_id IS NULL));
CREATE POLICY "tokens_delete" ON integration_tokens FOR DELETE
  USING (org_id = get_org_id() AND (user_id = auth.uid() OR user_id IS NULL));

-- Synced emails
CREATE POLICY "emails_select" ON synced_emails FOR SELECT USING (org_id = get_org_id());
CREATE POLICY "emails_insert" ON synced_emails FOR INSERT WITH CHECK (org_id = get_org_id());

-- MCP API keys
CREATE POLICY "mcp_keys_select" ON mcp_api_keys FOR SELECT USING (org_id = get_org_id());
CREATE POLICY "mcp_keys_insert" ON mcp_api_keys FOR INSERT
  WITH CHECK (org_id = get_org_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin')));
CREATE POLICY "mcp_keys_delete" ON mcp_api_keys FOR DELETE
  USING (org_id = get_org_id() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin')));
