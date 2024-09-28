import express from "express"
import cors from "cors"
import pg from "pg"
import dotenv from "dotenv"


const PORT = '8080'
const app = express()

app.use(cors())
app.use(express.json())

dotenv.config();

console.log(process.env.DB_URL);
console.log("this is a test")



const DB = new pg.Pool({

    connectionString: process.env.DB_URL
});



app.get("/", (req, res) => {

    try {

    res.status(200).send({message: `no kind of error`})
    } catch (error) {

        res.json(`${error.name}: ${error.message}`)
    }
})



app.get("/movies", async (req, res) => {

    try {

        const movies = (await DB.query(

            `SELECT 
            movies.id,
                movies.title, 
                movies.synopsis, 
                TO_CHAR(movies.released, 'YYYY-MM-DD') as release_date, 
                director.name as director, 
                movies.img_url,
                ARRAY_AGG(genre.name) AS genres FROM movies
            JOIN director ON movies.director = director.id
            JOIN movie_genre ON movie_genre.movie_id = movies.id
            JOIN genre ON movie_genre.genre_id = genre.id
            GROUP BY movies.id, director.name`
        )).rows;
        console.log(movies)
        res.status(200).json(movies)
    } catch (e) {

        console.log(e)
        res.status(500).json({ error: `${e.name}: ${e.message}` });
    }

  });


  
  app.post('/movies', async (req, res) => {

    const { title, director, synopsis, release, img_url, genres } = req.body;

    try {

// Check if movie already exists
        const existingMovie = await DB.query(`SELECT id FROM movies WHERE title = $1`, [title]);
        
        console.log('Existing movie check:', existingMovie.rows);
        
        if (existingMovie.rows.length > 0) {
            return res.status(409).json({ error: 'Movie already exists' });
        }

// director - check if exists, otherwise insert
        const directorResult = await DB.query(`SELECT id FROM directors WHERE name = $1`, [director]);
    
    let directorId;

    if (directorResult.rows.length > 0) {

      directorId = directorResult.rows[0].id;
    
    
    } else {

      const newDirector = await DB.query(`INSERT INTO directors (name) VALUES ($1) RETURNING id`, [director]);
      directorId = newDirector.rows[0].id;
    }

// Insert movie and get id
        const result = await DB.query(

            `INSERT INTO movies (title, director, synopsis, released, img_url) 
            VALUES ($1, $2, $3, $4, $5) RETURNING id`, 
            [title, directorId, synopsis, release, img_url]
        );
        
        const movieId = result.rows[0].id;

// handle genres
        const genreIds = await Promise.all(genres.map(async (genre) => {

            const genreResult = await DB.query(`SELECT id FROM genre WHERE name = $1`, [genre]);
            
            console.log(`Genre check for '${genre}':`, genreResult.rows);
            
            if (genreResult.rows.length > 0) {
                return genreResult.rows[0].id;
            } else {

            // Insert new genre if it doesn't exist
                const newGenre = await DB.query(`INSERT INTO genre (name) VALUES ($1) RETURNING id`, [genre]);
                return newGenre.rows[0].id;
            }
        }));

        console.log('Genre IDs:', genreIds);


// Insert into movie_genre
await Promise.all(genreIds.map(async (genreId) => {

    await DB.query(`INSERT INTO movie_genre (movie_id, genre_id) VALUES ($1, $2)`, [movieId, genreId]);

}));

res.status(201).json({ success: true, movieId });

} 
catch (error) {

console.error(error);

res.status(500).json({ error: `${error.name}: ${error.message}` });

}
});



app.listen(PORT, () => {

    console.log(`Listening on port: ${PORT}`);
});