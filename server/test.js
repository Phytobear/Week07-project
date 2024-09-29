

import pg from "pg"
import dotenv from "dotenv"


dotenv.config();


const DB = new pg.Pool({

    connectionString: process.env.DB_URL
});


const text = `
-- insert movie, director, and genre

DO $$

DECLARE directorName VARCHAR(255) := 'mr wobble';
DECLARE genreName VARCHAR(255) := 'scifi';
DECLARE movieName VARCHAR(255) := 'lost in space';
DECLARE movieSynopsis VARCHAR(255) := 'more stuff in space';
DECLARE movieDate DATE := '1978-01-01';
DECLARE movieImgUrl VARCHAR(255) := 'http://example.com/image.jpg';

BEGIN

    -- Insert a new director if it does not exist
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM directors WHERE name = directorName) THEN
            INSERT INTO directors (name) VALUES (directorName);
        END IF;
    END;

    -- Insert a new genre if it does not exist
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM genres WHERE name = genreName) THEN
            INSERT INTO genres (name) VALUES (genreName);
        END IF;
    END;

    -- Insert a new movie if it does not exist
    DECLARE
        directorId INT;
        genreId INT;
        movieId INT;
    BEGIN
        -- Get the director_id
        SELECT id INTO directorId FROM directors WHERE name = directorName;

        -- Get the genre_id
        SELECT id INTO genreId FROM genres WHERE name = genreName;

        IF NOT EXISTS (SELECT 1 FROM movies WHERE title = movieName) THEN
            INSERT INTO movies (title, synopsis, released, img_url, director_id)
            VALUES (movieName, movieSynopsis, movieDate, movieImgUrl, directorId);
        END IF;

        -- Get the movie_id
        SELECT id INTO movieId FROM movies WHERE title = movieName;

        -- Insert into movie_genres
        INSERT INTO movie_genres (movie_id, genre_id)
        SELECT movieId, genreId
        ON CONFLICT (movie_id, genre_id) DO NOTHING;
    END;
END $$;
`
const values = ['mr wibble']
 
const res = await DB.query(text)
console.log(res)




