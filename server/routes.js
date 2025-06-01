const express = require('express');
const crypto = require('crypto');
const db = require('./db');

const router = express.Router();

// Environment variable for HMAC secret key - THIS MUST BE SET IN PRODUCTION
const HMAC_SECRET_KEY = process.env.HMAC_SECRET_KEY || 'supersecretkey';

// Helper function for HMAC generation (can be moved to a utils file)
function calculateHmac(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

// POST /api/verify_cnumber
router.post('/verify_cnumber', async (req, res) => {
  const { c_number } = req.body;

  if (!c_number) {
    return res.status(400).json({ error: 'c_number is required' });
  }

  try {
    // 1. Fetch user_data based on the provided c_number (which is already a hash)
    //    OR, if c_number is NOT the hash but the original identifier, then:
    //    a. Iterate through user_data, get 'original_string_for_hmac'
    //    b. Calculate HMAC for each and compare with input 'c_number'
    //    The issue implies c_number is the *result* of an HMAC.
    //    "riceve un url parameter 'c_number' che corrisponde al risultato del calcolo di un HMAC di una stringa"
    //    "il back end esegue nuovamente la codifica della stringa usando la stessa chiave ... e con il valore che ottiene in output esegue una query"
    //    This means the backend needs to know WHICH original string to re-HMAC.
    //    This is a critical point. If c_number is the HMAC, the frontend can't just send it and expect the backend to find data.
    //    The backend needs the *original string* that was HMACed to produce c_number.
    //    Let's assume for now the client also sends the original identifier, or c_number itself is an ID that allows lookup of the original_string_for_hmac.
    //    Let's refine: The frontend gets c_number. The backend needs to validate this c_number.
    //    If c_number is an HMAC, it must be an HMAC of a *known, specific string on the backend*.
    //    Or, each user has an `original_string_for_hmac` and the passed `c_number` is its HMAC.
    //    The most logical flow:
    //    1. Some system generates an HMAC (c_number) from a known `user_specific_string` + `secret_key`. This c_number is given to the user in the URL.
    //    2. The user's browser sends this `c_number` to our backend.
    //    3. The backend needs to find out which `user_specific_string` corresponds to this `c_number`.
    //       This implies `user_data` should perhaps store `user_specific_string` and the `c_number` (HMAC) that was generated.
    //       No, the issue says: "il back end esegue nuovamente la codifica della stringa usando la stessa chiave ... e con il valore che ottiene in output esegue una query"
    //       This means the backend MUST have access to the *original pre-HMAC string*. How does it get it?
    //       Possibility A: The `c_number` URL param is actually a temporary ID. The backend looks up this ID to get the original string, then HMACs it, then uses that HMAC to query. This seems overly complex.
    //       Possibility B: The `c_number` in the URL is the *actual HMAC value*. The frontend sends it. The backend has a *fixed, single string* that it HMACs. If the result matches `c_number`, then it's valid. Then it uses this validated `c_number` to query `user_data` where `c_number_hash` = `c_number`.

    //       Let's go with Possibility B for now as it's simpler and fits the "re-encode the string" part.
    //       The "string" must be a known, fixed string.

    const PREDEFINED_STRING_TO_HMAC = process.env.PREDEFINED_STRING_TO_HMAC || "my-fixed-string-for-hmac";
    const recalculated_hmac = calculateHmac(PREDEFINED_STRING_TO_HMAC, HMAC_SECRET_KEY);

    if (recalculated_hmac !== c_number) {
      // console.log(`Verification failed: Input c_number: ${c_number}, Recalculated HMAC: ${recalculated_hmac} from string "${PREDEFINED_STRING_TO_HMAC}"`);
      return res.status(403).json({ error: 'Invalid c_number: HMAC mismatch' });
    }

    // If HMAC matches, then use this c_number (which is an HMAC hash) to query the database.
    const { rows } = await db.query('SELECT home_address, supply_point, meter_serial_number, meter_location_description FROM user_data WHERE c_number_hash = $1', [c_number]);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'User data not found for this c_number' });
    }
  } catch (err) {
    console.error('Error in /verify_cnumber:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/assistance_request
router.post('/assistance_request', async (req, res) => {
  const { request_type, user_identifier, details } = req.body;

  if (!request_type) {
    return res.status(400).json({ error: 'request_type is required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO assistance_requests (request_type, user_identifier, details) VALUES ($1, $2, $3) RETURNING id',
      [request_type, user_identifier || null, details || null]
    );
    res.status(201).json({ message: 'Assistance request logged', id: result.rows[0].id });
  } catch (err) {
    console.error('Error in /assistance_request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/active_water_fact
router.get('/active_water_fact', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, title, quiz_question, quiz_options, quiz_correct_answer, fact_title_after_answer, fact_description_after_answer FROM water_facts WHERE is_active = TRUE LIMIT 1');
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      // It's good practice to always have an active water fact, or handle this case gracefully in frontend
      // For now, sending a 404 if no active fact is found.
      // Consider if there should be a default/fallback water fact.
      res.status(404).json({ error: 'No active water fact found' });
    }
  } catch (err) {
    console.error('Error in /active_water_fact:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// (Optional) Endpoint to set an active water fact - for admin purposes
router.post('/set_active_water_fact/:fact_id', async (req, res) => {
    const { fact_id } = req.params;
    const client = await db.pool.connect(); // Using pool directly for transaction
    try {
        await client.query('BEGIN');
        await client.query('UPDATE water_facts SET is_active = FALSE WHERE is_active = TRUE');
        const result = await client.query('UPDATE water_facts SET is_active = TRUE WHERE id = $1 RETURNING id', [fact_id]);
        await client.query('COMMIT');
        if (result.rows.length > 0) {
            res.json({ message: `Water fact ${result.rows[0].id} set to active.` });
        } else {
            res.status(404).json({ error: `Water fact with id ${fact_id} not found.`});
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in /set_active_water_fact:', err);
        res.status(500).json({ error: 'Internal server error while setting active water fact.' });
    } finally {
        client.release();
    }
});


module.exports = router;
