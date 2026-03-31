import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.warn("Cloudinary credentials missing. Returning empty list for build.");
      return NextResponse.json([]);
    }

    let allResources: any[] = [];
    let next_cursor: string | undefined = undefined;

    do {
      const searchOptions: any = {
        expression: "resource_type:video",
        max_results: 500,
      };

      if (next_cursor) {
        searchOptions.next_cursor = next_cursor;
      }

      const result = await cloudinary.search
        .expression("resource_type:video")
        .max_results(500)
        .next_cursor(next_cursor)
        .execute();

      allResources = allResources.concat(result.resources);
      next_cursor = result.next_cursor;
    } while (next_cursor);

    const songs = allResources.map((resource: any) => ({
      id: resource.public_id,
      title: resource.public_id.split("/").pop(), // Basic title extraction
      url: resource.secure_url,
      duration: resource.duration,
      artist: resource.context?.custom?.artist || "Unknown Artist", 
      cover: resource.context?.custom?.caption || "/asset/album-placeholder.png",
    }));

    return NextResponse.json(songs);
  } catch (error) {
    console.error("Error fetching songs from Cloudinary:", error);
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
  }
}
