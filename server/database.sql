-- Table to store user-specific data, linkable via a hashed c_number
CREATE TABLE IF NOT EXISTS user_data (
    id SERIAL PRIMARY KEY,
    c_number_hash VARCHAR(255) UNIQUE NOT NULL, -- Store the HMAC of the original identifier string
    original_string_for_hmac TEXT NOT NULL,    -- The string that was originally HMACed
    home_address VARCHAR(255),
    supply_point VARCHAR(255),
    meter_serial_number VARCHAR(255),
    meter_location_description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table to log assistance requests
CREATE TABLE IF NOT EXISTS assistance_requests (
    id SERIAL PRIMARY KEY,
    request_type VARCHAR(255) NOT NULL, -- e.g., 'Meter not found', 'Reading difficulty', 'Other'
    user_identifier VARCHAR(255),       -- Can be linked to c_number_hash from user_data
    details TEXT,                       -- Optional additional details if a form is implemented later
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table to store water facts
-- Only one water fact should be active at a time.
-- This will be enforced by application logic: when a new fact is set to active, others are set to inactive.
CREATE TABLE IF NOT EXISTS water_facts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,          -- Title of the water fact (e.g., "Average Consumption")
    question1 TEXT NOT NULL,              -- The question text
    option1_q1 TEXT,                      -- Option 1 for question 1
    option2_q1 TEXT,                      -- Option 2 for question 1
    option3_q1 TEXT,                      -- Option 3 for question 1
    -- Add more options or questions as needed, or normalize further if questions become very complex
    -- For now, sticking to the "3 questions" idea from the issue, but Home.html only showed one.
    -- Let's assume the "3 questions" refers to 3 parts of a single fact, or options for one question.
    -- The HTML shows one question with multiple choice options.
    -- Let's refine this table based on the Home.html structure for the quiz part.
    -- It seems like one main question, a few options, and one correct answer.
    -- "columns necessary to census 3 questions, correct answer, description of the correct answer, title of the correct answer"
    -- This is a bit ambiguous. I will interpret it as:
    -- A water fact has a main title. It can present up to 3 related questions or pieces of information.
    -- For the quiz part on Home.html, it's one question with choices.
    -- Let's simplify for now and make it flexible.
    quiz_question TEXT,                   -- The question shown for the quiz (e.g., "Quale percentuale dell'acqua...")
    quiz_options TEXT[],                  -- Array of options for the quiz (e.g., ["20%", "40%", "60%"])
    quiz_correct_answer TEXT NOT NULL,    -- The correct option text (e.g., "60%")
    fact_title_after_answer VARCHAR(255) NOT NULL, -- e.g., "Correct Answer: 300 Liters" (as in Riepilogo)
    fact_description_after_answer TEXT NOT NULL, -- The detailed explanation shown after answering or in summary
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookup of active water fact
CREATE INDEX IF NOT EXISTS idx_active_water_fact ON water_facts (is_active) WHERE is_active = TRUE;

-- Index on c_number_hash for faster lookups
CREATE INDEX IF NOT EXISTS idx_c_number_hash ON user_data (c_number_hash);

-- You would typically add some sample data for testing:
-- Example:
-- INSERT INTO water_facts (title, quiz_question, quiz_options, quiz_correct_answer, fact_title_after_answer, fact_description_after_answer, is_active) VALUES
-- ('Outdoor Water Usage', 'Quale percentuale dell''acqua domestica viene tipicamente utilizzata per attività all''aperto?', ARRAY['20%', '40%', '60%'], '60%', 'Risposta Corretta: 60%!', 'Circa il 60% dell''acqua domestica può essere utilizzata per attività all''aperto come l''irrigazione del giardino.', TRUE);

-- INSERT INTO user_data (c_number_hash, original_string_for_hmac, home_address, supply_point, meter_serial_number, meter_location_description) VALUES
-- ('some_hmac_hash_example', 'string_to_be_hmaced_123', '123 Main St, Anytown', 'SP001', 'MSN001', 'Next to the garage');
