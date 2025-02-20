CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    file VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE public.questions (
    id SERIAL PRIMARY KEY,
    text VARCHAR(512) NOT NULL UNIQUE,
    categories_id INTEGER NOT NULL REFERENCES public.categories(id)
);

CREATE TABLE public.answers (
    id SERIAL PRIMARY KEY,
    answer VARCHAR(512) NOT NULL,
    correct BOOLEAN,
    questions_id INTEGER NOT NULL REFERENCES public.questions(id)
);
