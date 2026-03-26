import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const { resources } = await cloudinary.search
      .expression("resource_type:video") // Cloudinary treats audio as video type usually
      .max_results(500) // Limit to 500
      .execute();

    // If no results, try general search or specific folder if needed
    // But usually audio is resource_type:video or we can just fetch all
    
    const songs = resources.map((resource: any) => ({
      id: resource.public_id,
      title: resource.public_id.split("/").pop(), // Basic title extraction
      url: resource.secure_url,
      duration: resource.duration,
      artist: "Unknown Artist", // Cloudinary doesn't store artist in search by default
      cover: resource.context?.custom?.caption || "/asset/album-placeholder.png",
    }));

    return NextResponse.json(songs);
  } catch (error) {
    console.error("Error fetching songs from Cloudinary:", error);
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
  }
}
