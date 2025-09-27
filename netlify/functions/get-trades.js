const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { user_id } = event.queryStringParameters;
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    const trades = await sql`
      SELECT * FROM trades 
      WHERE user_id = ${user_id} 
      ORDER BY timestamp DESC 
      LIMIT 100
    `;

    return {
      statusCode: 200,
      body: JSON.stringify(trades)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
