import express from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import { dbAll, dbRun } from '../database/initDb.js'

const router = express.Router()

// Get chat messages between two users
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const otherUserId = req.params.userId
    const currentUserId = req.user.id

    const messages = await dbAll(`
      SELECT cm.*, u.name as sender_name, u.avatar as sender_avatar
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE (cm.sender_id = ? AND cm.receiver_id = ?) OR (cm.sender_id = ? AND cm.receiver_id = ?)
      ORDER BY cm.sent_at ASC
    `, [currentUserId, otherUserId, otherUserId, currentUserId])

    res.json({ messages })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

// Send message
router.post('/:userId', authenticate, async (req, res) => {
  try {
    const { message } = req.body
    const receiverId = req.params.userId
    const senderId = req.user.id

    await dbRun(
      'INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [senderId, receiverId, message]
    )

    res.json({ message: 'Message sent successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// Get chat list (recent conversations)
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id

    const conversations = await dbAll(`
      SELECT
        CASE
          WHEN cm.sender_id = ? THEN cm.receiver_id
          ELSE cm.sender_id
        END as other_user_id,
        u.name as other_user_name,
        u.avatar as other_user_avatar,
        u.role as other_user_role,
        MAX(cm.sent_at) as last_message_time,
        (SELECT message FROM chat_messages WHERE
          (sender_id = ? AND receiver_id = other_user_id) OR
          (sender_id = other_user_id AND receiver_id = ?)
         ORDER BY sent_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM chat_messages WHERE
          receiver_id = ? AND sender_id = other_user_id AND is_read = 0) as unread_count
      FROM chat_messages cm
      JOIN users u ON (CASE WHEN cm.sender_id = ? THEN cm.receiver_id ELSE cm.sender_id END) = u.id
      WHERE cm.sender_id = ? OR cm.receiver_id = ?
      GROUP BY other_user_id
      ORDER BY last_message_time DESC
    `, [userId, userId, userId, userId, userId, userId, userId])

    res.json({ conversations })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
})

export default router