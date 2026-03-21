-- Default pipeline stages for new organizations
-- This is called by the registration API route after creating the org
-- INSERT INTO pipeline_stages (org_id, name, color, position) VALUES
--   (NEW_ORG_ID, 'Lead',     '#6366f1', 0),
--   (NEW_ORG_ID, 'Qualified','#8b5cf6', 1),
--   (NEW_ORG_ID, 'Proposal', '#f59e0b', 2),
--   (NEW_ORG_ID, 'Won',      '#10b981', 3, true, false),
--   (NEW_ORG_ID, 'Lost',     '#ef4444', 4, false, true);

-- This file is for manual seeding only. Stage seeding happens in the API.
SELECT 'Seed file ready' AS status;
