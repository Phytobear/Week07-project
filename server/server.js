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
    res.send("This is movie API");
});

app.get("/movies", async (req, res) => {

    try {
        const movies = (await DB.query(`SELECT * FROM movies`)).rows
        // console.log(movies)
        res.status(200).json(movies)
    } catch (e) {
        console.log(e)
    }

  });


  
  app.post('/movies', async (req, res) => {
    const { title, director, synopsis, release, img_url, genres } = req.body;
  
    try {
      const existingMovie = await DB.query(`SELECT id FROM movies WHERE title = $1`, [title]);
      if (existingMovie.rows.length > 0) {
        return res.status(409).json({ error: 'Movie already exists' });
      }

  
      const result = await DB.query(`
          INSERT INTO movies (title, director, synopsis, released, img_url) 
          VALUES ($1, $2, $3, $4, $5) RETURNING id`, 
          [title, director, synopsis, release, img_url]


      );
      const movieId = result.rows[0].id;


  
      const genreIds = await Promise.all(genres.map(async (genre) => {
        const genreResult = await DB.query(`SELECT id FROM genre WHERE name = $1`, [genre]);
        return genreResult.rows[0].id;
      }));

  
      await Promise.all(genreIds.map(async (genreId) => {
        await DB.query(`INSERT INTO movie_genre (movie_id, genre_id) VALUES ($1, $2)`, [movieId, genreId]);
      }));
  
      res.status(201).json({ success: true, movieId });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: `${error.name}: ${error.message}` });
    }
  });



app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});