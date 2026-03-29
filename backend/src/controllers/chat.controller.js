// Chat Controller
// Handles messaging between mentors and students

const messageRepository = require('../repositories/message.repo');

class ChatController {
  async sendMessage(req, res) {
    try {
      const { recipientId, messageText } = req.body;
      const senderId = req.user.id;
      
      // Validate input
      if (!recipientId || !messageText) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      
      // Save message
      const message = await messageRepository.saveMessage(senderId, recipientId, messageText);
      
      res.status(201).json({
        success: true,
        message: 'Message sent',
        data: message
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getConversation(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;
      
      // Fetch all messages between two users
      const messages = await messageRepository.getConversation(currentUserId, userId);
      
      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      
      // Fetch all conversations for user
      const conversations = await messageRepository.getConversations(userId);
      
      res.status(200).json({
        success: true,
        data: conversations
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ChatController();
