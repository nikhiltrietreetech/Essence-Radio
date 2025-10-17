import StreamSession from "../models/StreamSession.js";

export const startStream = async (req, res) => {
  try {
    const { user, streamId } = req.body;
    const session = await StreamSession.create({ user, streamId });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const endStream = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await StreamSession.findByPk(id);
    if (!session) return res.status(404).json({ message: "Stream not found" });

    session.endTime = new Date();
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
