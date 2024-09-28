import { useState } from "react";



export default function AddMovie() {
  const [formValues, setFormValues] = useState({
    title: "",
    director: "",
    synopsis: "",
    release: "",
    img_url: "",
    genres: "",
  });




  const handleInputChange = (event) => {
    
    setFormValues({

      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    const genreArray = formValues.genres.split(',').map(genre => genre.trim());


    try {

      const response = await fetch("http://localhost:8080/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
            ...formValues,
            genres: genreArray,

          }),

      });

      if (response.status === 409) {
        alert('Movie already exists!');
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to add movie");
      }

      const result = await response.json();
      
      console.log("Movie added successfully:", result);
    } 
    
    catch (error) {

      console.error("Error adding movie:", error);
    }
  };





  return (
    <div>
      <h1>Add a Movie</h1>
      <form onSubmit={handleSubmit}>
        <label>
            Title:
          <input
            type="text"
            name="title"
            value={formValues.title}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
            Director:
          <input
            type="text"
            name="director"
            value={formValues.director}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
            Synopsis:
          <textarea
            name="synopsis"
            value={formValues.synopsis}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
            Release Date:
          <input
            type="date"
            name="release"
            value={formValues.release}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
            Image URL:
          <input
            type="text"
            name="img_url"
            value={formValues.img_url}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
            Genres (comma-separated):
          <input
            type="text"
            name="genres"
            value={formValues.genres}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <button type="submit">Add Movie</button>
      </form>

      <h2>Preview</h2>
      <p>Title: {formValues.title}</p>
      <p>Director: {formValues.director}</p>
      <p>Synopsis: {formValues.synopsis}</p>
      <p>Release: {formValues.release}</p>
      <p>Image URL: {formValues.img_url}</p>
      <p>Genres: {formValues.genres}</p>
    </div>
  );
}
