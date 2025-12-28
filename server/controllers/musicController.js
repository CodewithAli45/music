const cloudinary = require("../config/cloudinary");

exports.getAllSongs = async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression("(resource_type:video OR resource_type:raw)")
      .sort_by("created_at", "desc")
      .max_results(20)
      .execute();

    res.json(
      result.resources.map(r => ({
        title: r.original_filename,   // ✅ SONG NAME
        url: r.secure_url,
        duration: r.duration || 0,
        format: r.format,
        public_id: r.public_id
      }))
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
