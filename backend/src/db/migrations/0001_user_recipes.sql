CREATE TABLE "user_recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"image" text,
	"cook_time" text,
	"servings" integer,
	"category" text,
	"area" text,
	"youtube_url" text,
	"ingredients_json" text NOT NULL,
	"instructions_json" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);


