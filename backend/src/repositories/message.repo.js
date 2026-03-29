// Message Repository
// Database operations for messages and chat

const { query } = require('../db/connection');

class MessageRepository {
  async saveMessage(senderId, recipientId, messageText) {
    try {
      const result = await query(
        'INSERT INTO messages (sender_id, recipient_id, message_text) VALUES ($1, $2, $3) RETURNING *',
        [senderId, recipientId, messageText]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to save message: ' + error.message);
    }
  }

  async getConversation(userId1, userId2) {
    try {
      const result = await query(
        `SELECT * FROM messages
         WHERE (sender_id = $1 AND recipient_id = $2)
         OR (sender_id = $2 AND recipient_id = $1)
         ORDER BY sent_at ASC`,
        [userId1, userId2]
      );
      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch conversation: ' + error.message);
    }
  }

  async getConversations(userId) {
    try {
      const result = await query(
        `SELECT DISTINCT 
           CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END as other_user_id,
           message_text,
           sent_at
         FROM messages
         WHERE sender_id = $1 OR recipient_id = $1
         ORDER BY sent_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch conversations: ' + error.message);
    }
  }
}

module.exports = new MessageRepository();
