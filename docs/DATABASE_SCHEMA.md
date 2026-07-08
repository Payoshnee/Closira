# Database Schema

## Rules

- PostgreSQL with UUID primary keys.
- Audit fields: `created_at`, `updated_at`, `deleted_at`.
- Private user data scoped by `user_id`.
- Soft delete for user-owned content.
- Use enums for stable closed sets and lookup tables for editable taxonomies.
- Add indexes for auth lookup, filters, search, ownership checks, and calendar ranges.
- pgvector stores image embeddings.

## Core Tables

### users

`id`, `email`, `password_hash`, `email_verified_at`, `status`, `role`, `last_login_at`, audit fields.

Indexes: unique lower email, role/status.

### user_profiles

`id`, `user_id`, `name`, `phone`, `gender`, `profile_image_id`, `style_preferences`, `favorite_colors`, `preferred_clothing_types`, `body_measurements`, `privacy_settings`, `notification_settings`, audit fields.

### categories

`id`, `user_id nullable`, `name`, `slug`, `sort_order`, `is_default`, audit fields.

Default examples: Traditional Wear, Western Wear, Casual Wear, Formal Wear, Party Wear, Wedding Wear, Sportswear, Nightwear, Footwear, Jewelry, Bags, Accessories, Makeup.

### subcategories

`id`, `category_id`, `user_id nullable`, `name`, `slug`, `sort_order`, `is_default`, audit fields.

### tags

`id`, `user_id nullable`, `type`, `name`, `slug`, `is_default`, audit fields.

Tag types: occasion, season, style, custom.

### wardrobe_items

`id`, `user_id`, `category_id`, `subcategory_id`, `title`, `primary_color`, `secondary_colors`, `material`, `pattern`, `brand`, `purchase_date`, `purchase_price`, `currency`, `size`, `fit_type`, `condition`, `season`, `usage_count`, `last_worn_at`, `storage_location`, `notes`, `is_favorite`, `visibility`, audit fields.

Indexes: user/category, user/subcategory, user/favorite, user/last_worn, user/purchase_date, user/title full-text.

### wardrobe_images

`id`, `user_id`, `wardrobe_item_id`, `image_type`, `storage_key`, `mime_type`, `size_bytes`, `width`, `height`, `variant`, `status`, audit fields.

Image types: front, back, close_up, profile, try_on_source, try_on_result.

### wardrobe_item_tags

`wardrobe_item_id`, `tag_id`, `source`, `confidence`.

Source: user, ai.

### outfits

`id`, `user_id`, `name`, `occasion`, `notes`, `is_favorite`, `cover_image_id`, `usage_count`, `last_worn_at`, audit fields.

### outfit_items

`id`, `outfit_id`, `wardrobe_item_id`, `slot`, `sort_order`, audit fields.

Slots: top, bottom, traditional, footwear, jewelry, bag, makeup, accessory, other.

### outfit_calendar

`id`, `user_id`, `outfit_id`, `event_name`, `event_type`, `starts_at`, `ends_at`, `location`, `notes`, `conflict_status`, `reminder_status`, audit fields.

### usage_logs

`id`, `user_id`, `wardrobe_item_id nullable`, `outfit_id nullable`, `worn_at`, `source`, `notes`, audit fields.

### shopping_checks

`id`, `user_id`, `image_id`, `detected_category_id`, `detected_colors`, `recommendation`, `compatibility_score`, `explanation`, `status`, audit fields.

### ai_analyses

`id`, `user_id`, `wardrobe_item_id nullable`, `shopping_check_id nullable`, `analysis_type`, `input_image_id`, `result_json`, `confidence`, `status`, `error_code`, audit fields.

### image_embeddings

`id`, `user_id`, `wardrobe_image_id`, `model_name`, `embedding vector`, `metadata`, audit fields.

Indexes: ivfflat/hnsw vector index by model, user/image.

### notifications

`id`, `user_id`, `type`, `title`, `body`, `scheduled_for`, `sent_at`, `read_at`, `status`, `metadata`, audit fields.

### admin_users

`id`, `email`, `password_hash`, `role`, `last_login_at`, audit fields.

### audit_logs

`id`, `actor_user_id nullable`, `actor_admin_id nullable`, `action`, `entity_type`, `entity_id`, `metadata`, `ip_address`, `user_agent`, `created_at`.

### subscription_plans

`id`, `code`, `name`, `price`, `currency`, `limits`, `features`, `is_active`, audit fields.

### payment_records

`id`, `user_id`, `subscription_plan_id`, `provider`, `provider_payment_id`, `amount`, `currency`, `status`, `paid_at`, audit fields.

## Data Flow

Wardrobe upload creates image records, stores files privately, queues AI analysis, and stores confirmed metadata. Mark-worn creates usage logs and updates cached counters. Analytics are derived from wardrobe, outfit, calendar, and usage tables.
