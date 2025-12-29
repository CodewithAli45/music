const cloudinary = require("../config/cloudinary");

exports.getAllSongs = async (req, res) => {
  let allSongs = [];
  let nextCursor = null;

  try {
    do {
      const result = await cloudinary.search
        .expression("(resource_type:video OR resource_type:raw)")
        .sort_by("created_at", "asc")
        .max_results(50)
        .next_cursor(nextCursor)
        .execute();

      allSongs = allSongs.concat(result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    // ✅ SEND RESPONSE (map ALL songs)
    res.json(
      allSongs.map(r => ({
        title: r.original_filename,
        url: r.secure_url,
        duration: r.duration || 0,
        format: r.format,
        public_id: r.public_id
      }))
    );

  } catch (err) {
    console.error("Cloudinary fetch error:", err);
    res.status(500).json({ error: err.message });
  }
};
