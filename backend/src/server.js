import express from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable, userRecipesTable } from "./db/schema.js";
import {and, eq } from "drizzle-orm";
import job from "./config/cron.js";
import crypto from "node:crypto";

const app = express();
const PORT = ENV.PORT || 5001;

if(ENV.NODE_ENV === "production") job.start();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true });
});

// send a post request to favorites
app.post("/api/favorites", async (req, res) =>{
    try {
        const { userId, recipeId, title, image, cookTime, servings } = req.body;
        
        if(!userId || !recipeId || !title) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        // Check if recipe is already saved for this user
        const existingFavorite = await db
            .select()
            .from(favoritesTable)
            .where(
                and(
                    eq(favoritesTable.userId, userId),
                    eq(favoritesTable.recipeId, recipeId)
                )
            )
            .limit(1);
        
        if (existingFavorite.length > 0) {
            return res.status(409).json({ 
                error: "Recipe already saved to favorites",
                favorite: existingFavorite[0]
            });
        }
        
        const newFavorite = await db.insert(favoritesTable).values({
            userId,
            recipeId,
            title,
            image,
            cookTime,
            servings
            
        }).returning();
        
        res.status(201).json(newFavorite[0]);
    } catch (error) {
        console.error("Error adding favorite:", error);
        res.status(500).json({ 
            error: "Failed to save recipe",
            details: error.message 
        });
    }
});

app.get("/api/favorites/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const userFavorites = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, userId));
        res.status(200).json(userFavorites);

    } catch (error) {
        console.error("Error fetching favorite:", error);
        res.status(500).json({ 
            error: "Failed to fetch favorites",
            details: error.message 
        });
    }
});

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
    try {
        console.log("Delete request params: ", req.params);

        const { userId, recipeId } = req.params;
        await db
        .delete(favoritesTable)
        .where(
            and(
            eq(favoritesTable.userId, userId), 
            eq(favoritesTable.recipeId, parseInt(recipeId))
        )
        );

        res.status(200).json({ message: "Favorite successfully removed" });

    } catch (error) {
        console.error("Error deleting a favorite:", error);
        res.status(500).json({ 
            error: "Failed to delete favorite",
            details: error.message 
        });
    }
});

// ----------------------------
// User-created recipes
// ----------------------------

function normalizeStringArray(input) {
  // Accept string[] or a single string (e.g. textarea) and normalize to string[].
  if (Array.isArray(input)) {
    return input.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof input === "string") {
    // Split on common newline types, and also support semicolon-separated content.
    const parts = input
      .split(/\r\n|\r|\n|\u2028|\u2029|;/g)
      .map((s) => s.trim())
      .filter(Boolean);
    // If it was a single non-empty paragraph with no separators, keep it.
    if (parts.length === 0 && input.trim()) return [input.trim()];
    return parts;
  }
  return [];
}

app.post("/api/user-recipes", async (req, res) => {
  try {
    const {
      userId,
      title,
      image,
      cookTime,
      servings,
      category,
      area,
      youtubeUrl,
      ingredients,
      instructions,
    } = req.body ?? {};

    if (!userId || !title) {
      return res.status(400).json({ error: "Missing required fields: userId, title" });
    }

    const ingredientsArr = normalizeStringArray(ingredients);
    const instructionsArr = normalizeStringArray(instructions);

    if (ingredientsArr.length === 0) {
      return res.status(400).json({ error: "Ingredients are required" });
    }
    if (instructionsArr.length === 0) {
      return res.status(400).json({ error: "Instructions are required" });
    }

    const id = crypto.randomUUID();

    const servingsInt =
      typeof servings === "number"
        ? servings
        : typeof servings === "string" && servings.trim()
          ? parseInt(servings, 10)
          : null;

    const inserted = await db
      .insert(userRecipesTable)
      .values({
        id,
        userId,
        title,
        image: image ?? null,
        cookTime: cookTime ?? null,
        servings: Number.isFinite(servingsInt) ? servingsInt : null,
        category: category ?? null,
        area: area ?? null,
        youtubeUrl: youtubeUrl ?? null,
        ingredientsJson: JSON.stringify(ingredientsArr),
        instructionsJson: JSON.stringify(instructionsArr),
      })
      .returning();

    res.status(201).json({
      ...inserted[0],
      ingredients: ingredientsArr,
      instructions: instructionsArr,
      source: "user",
    });
  } catch (error) {
    console.error("Error creating user recipe:", error);
    res.status(500).json({ error: "Failed to create recipe", details: error.message });
  }
});

app.get("/api/user-recipes/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await db
      .select()
      .from(userRecipesTable)
      .where(eq(userRecipesTable.userId, userId));

    const mapped = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      title: r.title,
      image: r.image,
      cookTime: r.cookTime,
      servings: r.servings,
      category: r.category,
      area: r.area,
      createdAt: r.createdAt,
      source: "user",
    }));

    res.status(200).json(mapped);
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    res.status(500).json({ error: "Failed to fetch recipes", details: error.message });
  }
});

app.get("/api/user-recipes/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;
    const rows = await db
      .select()
      .from(userRecipesTable)
      .where(and(eq(userRecipesTable.userId, userId), eq(userRecipesTable.id, recipeId)))
      .limit(1);

    if (rows.length === 0) return res.status(404).json({ error: "Recipe not found" });

    const r = rows[0];
    const ingredients = JSON.parse(r.ingredientsJson || "[]");
    const instructions = JSON.parse(r.instructionsJson || "[]");

    res.status(200).json({
      id: r.id,
      userId: r.userId,
      title: r.title,
      description: instructions[0] ? String(instructions[0]).slice(0, 120) + "..." : undefined,
      image: r.image,
      cookTime: r.cookTime,
      servings: r.servings,
      category: r.category,
      area: r.area,
      youtubeUrl: r.youtubeUrl,
      ingredients,
      instructions,
      source: "user",
      createdAt: r.createdAt,
    });
  } catch (error) {
    console.error("Error fetching user recipe:", error);
    res.status(500).json({ error: "Failed to fetch recipe", details: error.message });
  }
});

app.delete("/api/user-recipes/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;
    await db
      .delete(userRecipesTable)
      .where(and(eq(userRecipesTable.userId, userId), eq(userRecipesTable.id, recipeId)));
    res.status(200).json({ message: "Recipe deleted" });
  } catch (error) {
    console.error("Error deleting user recipe:", error);
    res.status(500).json({ error: "Failed to delete recipe", details: error.message });
  }
});

app.listen(PORT, () => {
    console.log("Server is running on PORT:", PORT);
});