const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { user_id } = JSON.parse(event.body);
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    // Delete user's trades and reset portfolio
    await sql`DELETE FROM trades WHERE user_id = ${user_id}`;
    await sql`DELETE FROM portfolio WHERE user_id = ${user_id}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Account reset successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
