const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const portfolio = JSON.parse(event.body);
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    await sql`
      INSERT INTO portfolio (user_id, usdc_balance, sol_balance, total_value) 
      VALUES (${portfolio.user_id}, ${portfolio.usdc_balance}, ${portfolio.sol_balance}, ${portfolio.total_value})
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        usdc_balance = EXCLUDED.usdc_balance,
        sol_balance = EXCLUDED.sol_balance,
        total_value = EXCLUDED.total_value,
        last_updated = CURRENT_TIMESTAMP
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Portfolio updated successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
