// schema.js. This is a description file: hpe the tables look like

import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const favoritesTable = pgTable("favorites", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    recipeId: integer("recipe_id").notNull(),
    title: text("title").notNull(),
    image: text("image"),
    cookTime: text("cook_time"),
    servings: text("servings"),
    createdAt: timestamp("created_at").defaultNow(),
});

// User-created recipes, stored per Clerk user.
// We use a text UUID (generated in app code) to avoid relying on DB extensions.
export const userRecipesTable = pgTable("user_recipes", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    image: text("image"),
    cookTime: text("cook_time"),
    servings: integer("servings"),
    category: text("category"),
    area: text("area"),
    youtubeUrl: text("youtube_url"),
    ingredientsJson: text("ingredients_json").notNull(), // JSON.stringify(string[])
    instructionsJson: text("instructions_json").notNull(), // JSON.stringify(string[])
    createdAt: timestamp("created_at").defaultNow(),
});