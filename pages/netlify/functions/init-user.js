const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { user_id, initial_capital } = JSON.parse(event.body);
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    // Initialize user portfolio
    await sql`
      INSERT INTO portfolio (user_id, usdc_balance, sol_balance, total_value) 
      VALUES (${user_id}, ${initial_capital}, 0, ${initial_capital})
      ON CONFLICT (user_id) DO NOTHING
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User initialized successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
