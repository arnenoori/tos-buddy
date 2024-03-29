-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Ensure this is hashed / google auth or whatever chrome gives us
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Websites Table
CREATE TABLE websites (
    website_id SERIAL PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    site_name TEXT,
    category TEXT, -- categorizing the website (e.g., e-commerce, social media)
    last_crawled TIMESTAMP WITH TIME ZONE
);

-- Terms of Service Table
CREATE TABLE terms_of_service (
    tos_id SERIAL PRIMARY KEY,
    website_id INT REFERENCES websites(website_id),
    content TEXT NOT NULL,
    simplified_content TEXT NOT NULL,
    version_identifier TEXT, -- maintain the TOS, use ChatGPT to create a training log changelog
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tos_url TEXT
);

-- User Preferences Table
CREATE TABLE user_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    preference_type TEXT NOT NULL,
    preference_value TEXT NOT NULL
);

-- Shared Data Tracking Table
CREATE TABLE shared_data_tracking (
    tracking_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    website_id INT REFERENCES websites(website_id),
    data_shared TEXT NOT NULL,
    date_shared TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes creation
CREATE INDEX idx_websites_url ON websites(url);
CREATE INDEX idx_terms_of_service_website_id_last_updated ON terms_of_service(website_id, last_updated);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_shared_data_tracking_user_id_website_id ON shared_data_tracking(user_id, website_id);
