import Chat from "../models/Chat.js";

export const saveMessage = async (req, res) => {
  try {
    const { username, message } = req.body;
    const chat = await Chat.create({ username, message });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Chat.findAll({
      order: [["timestamp", "DESC"]],
      limit: 50,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
