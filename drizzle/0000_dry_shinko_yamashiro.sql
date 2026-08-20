CREATE TYPE "public"."pillar" AS ENUM('tvc', 'recipes', 'reels', 'stills', 'menu');--> statement-breakpoint
CREATE TABLE "awards" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bts_films" (
	"id" text PRIMARY KEY NOT NULL,
	"title_ar" text NOT NULL,
	"title_en" text NOT NULL,
	"client" text NOT NULL,
	"year" integer NOT NULL,
	"href" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logo" text DEFAULT '' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"client" text NOT NULL,
	"title_ar" text NOT NULL,
	"title_en" text NOT NULL,
	"pillar" "pillar" NOT NULL,
	"year" integer NOT NULL,
	"poster" text NOT NULL,
	"preview" text NOT NULL,
	"vimeo_id" text,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" text PRIMARY KEY NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"role" text NOT NULL,
	"bio_ar" text NOT NULL,
	"bio_en" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
