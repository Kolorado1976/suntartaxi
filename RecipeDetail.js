import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`https://your-api-url/recipes/${id}`);
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        console.error('Ошибка загрузки рецепта:', error);
      }
    };

    fetchRecipe();
  }, [id]);

  if (!recipe) return <div>Загрузка рецепта...</div>;

  return (
    <div className="recipe-detail">
      <h2>{recipe.title}</h2>
      <div className="recipe-photos">
        {recipe.photos.map((photo, index) => (
          <img key={index} src={photo.url} alt={recipe.title} />
        ))}
      </div>
      <div className="recipe-ingredients">
        <h3>Ингредиенты:</h3>
        <p>{recipe.ingredients}</p>
      </div>
      <div className="recipe-instructions">
        <h3>Инструкция:</h3>
        <p>{recipe.instructions}</p>
      </div>
      <p>Время приготовления: {recipe.cooking_time}</p>
    </div>
  );
};

export default RecipeDetail;
