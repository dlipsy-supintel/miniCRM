-- Add resend, mailchimp_a, mailchimp_b as allowed integration_tokens providers
ALTER TABLE integration_tokens
  DROP CONSTRAINT IF EXISTS integration_tokens_provider_check;

ALTER TABLE integration_tokens
  ADD CONSTRAINT integration_tokens_provider_check
  CHECK (provider IN ('google','mailchimp','mailchimp_a','mailchimp_b','stripe','calendly','hubspot','resend'));
