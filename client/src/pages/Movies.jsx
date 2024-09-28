import { useEffect, useState } from "react"


export default function Movies() {

    const [movies, setMovies] = useState([])

    useEffect(() => {

        async function fechMovies() {
            try {
                const response = await fetch("http://localhost:8080/movies");
                if (!response.ok) {
                    throw new Error("Failed to fetch movies");
                }

                const data = await response.json()
                setMovies(data)
            } catch (error) {
                console.error("Error feching movies", error)
            }
            
        }
        fechMovies()
    }, [] )

    return (
        <div>
      <h1>Movies List</h1>
      <ul>
        {movies.length > 0 ? (
          movies.map((movie) => (
            <li key={movie.id}>
              <h2>{movie.title}</h2>
              <p>{movie.synopsis}</p>
              <p>Released: {movie.released}</p>
              <p>Director: {movie.director}</p>
            </li>
          ))
        ) : (
          <p>No movies found</p>
        )}
      </ul>
    </div>
  );
}