CREATE TABLE public.themes(
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_title text,
  icon text,
  description text,
  is_special boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true);

CREATE TABLE public.theme_relations(
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  parent uuid,
  child uuid,
  position integer NOT NULL,
  is_weak boolean NOT NULL DEFAULT false,
  FOREIGN KEY (parent) REFERENCES public.themes(id) ON UPDATE cascade ON DELETE cascade,
  FOREIGN KEY (child) REFERENCES public.themes(id) ON UPDATE cascade ON DELETE cascade);


CREATE TABLE public.contents(
  cdtn_id text NOT NULL PRIMARY KEY,
  title text NOT NULL,
  url text,
  slug text NOT NULL,
  source text NOT NULL);

CREATE TABLE public.content_relations(
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  theme_id uuid,
  theme_position integer NULL,
  FOREIGN KEY (content_id) REFERENCES public.contents(cdtn_id) ON UPDATE cascade ON DELETE cascade,
  FOREIGN KEY (theme_id) REFERENCES public.themes(id) ON UPDATE cascade ON DELETE cascade);
