const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const trade = JSON.parse(event.body);
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    await sql`
      INSERT INTO trades (id, type, amount, price, pnl, timestamp, user_id) 
      VALUES (${trade.id}, ${trade.type}, ${trade.amount}, ${trade.price}, ${trade.pnl}, ${trade.timestamp}, ${trade.user_id})
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Trade saved successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
