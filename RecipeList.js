import React from 'react';
import { Link } from 'react-router-dom';

const RecipeList = ({ recipe }) => {
  return (
    <div className="recipe-card">
      <h3>{recipe.title}</h3>
      <p>Время приготовления: {recipe.cooking_time}</p>
      <Link to={`/recipe/${recipe.id}`}>Подробнее</Link>
    </div>
  );
};

export default RecipeList;
