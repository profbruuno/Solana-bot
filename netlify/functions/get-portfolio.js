const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { user_id } = event.queryStringParameters;
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    const portfolio = await sql`
      SELECT * FROM portfolio WHERE user_id = ${user_id}
    `;

    return {
      statusCode: 200,
      body: JSON.stringify(portfolio[0] || null)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
