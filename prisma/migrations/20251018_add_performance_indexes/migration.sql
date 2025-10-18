-- Enable pg_trgm extension for trigram text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Property indexes for common filter patterns
-- Composite index for filtering by status within organization
CREATE INDEX IF NOT EXISTS idx_property_org_status ON properties(organization_id, status);

-- Composite index for filtering by transaction type (sale/rent) within organization
CREATE INDEX IF NOT EXISTS idx_property_org_transaction ON properties(organization_id, transaction_type);

-- Composite index for filtering by property type within organization
CREATE INDEX IF NOT EXISTS idx_property_org_type ON properties(organization_id, property_type);

-- Composite index for price range queries within organization
CREATE INDEX IF NOT EXISTS idx_property_org_price ON properties(organization_id, price);

-- Address indexes for text search on location fields
-- GIN trigram index for free-text search on city names
CREATE INDEX IF NOT EXISTS idx_address_city_trgm ON addresses USING GIN (city gin_trgm_ops);

-- GIN trigram index for free-text search on region names
CREATE INDEX IF NOT EXISTS idx_address_region_trgm ON addresses USING GIN (region gin_trgm_ops);

-- GIN trigram index for free-text search on location descriptions
CREATE INDEX IF NOT EXISTS idx_address_location_trgm ON addresses USING GIN (location_text gin_trgm_ops);

-- Client indexes for common filter and search patterns
-- Composite index for filtering by client type within organization
CREATE INDEX IF NOT EXISTS idx_client_org_type ON clients(organization_id, client_type);

-- GIN index for array contains queries on tags
CREATE INDEX IF NOT EXISTS idx_client_tags_gin ON clients USING GIN (tags);

-- GIN trigram index for text search on client names
CREATE INDEX IF NOT EXISTS idx_client_name_trgm ON clients USING GIN (name gin_trgm_ops);

-- GIN trigram index for text search on email addresses
CREATE INDEX IF NOT EXISTS idx_client_email_trgm ON clients USING GIN (email gin_trgm_ops);

-- GIN trigram index for text search on phone numbers
CREATE INDEX IF NOT EXISTS idx_client_phone_trgm ON clients USING GIN (phone gin_trgm_ops);

-- Listing indexes for join optimization and filtering
-- B-tree index for property join optimization
CREATE INDEX IF NOT EXISTS idx_listing_property ON listings(property_id);

-- B-tree index for filtering by marketing status
CREATE INDEX IF NOT EXISTS idx_listing_status ON listings(marketing_status);

-- Activity index for feed queries
-- Composite index for filtering activities by entity type and date
CREATE INDEX IF NOT EXISTS idx_activity_entity_date ON activities(organization_id, entity_type, created_at DESC);

-- Comment: All indexes use IF NOT EXISTS to allow safe rerun of migration
-- Comment: Trigram indexes require pg_trgm extension which is enabled at the start
-- Comment: These indexes optimize common query patterns while maintaining RLS enforcement
