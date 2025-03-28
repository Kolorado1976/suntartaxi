import React, { useState } from 'react';
import bridge from '../bridge';

const AddRecipe = () => {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [photos, setPhotos] = useState([]);
  const [instructions, setInstructions] = useState('');

  const handleAddPhoto = async () => {
    // Запрос на выбор фото через MAX Bridge
    bridge.chooseMedia({ type: 'image' })
      .then((selectedPhotos) => {
        setPhotos(prev => [...prev, ...selectedPhotos]);
      })
      .catch((error) => {
        console.error('Ошибка выбора фото:', error);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://your-api-url/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          ingredients,
          cooking_time: cookingTime,
          instructions,
          photos
        }),
      });
      
      if (response.ok) {
        alert('Рецепт успешно добавлен!');
        // Перезагрузка списка рецептов
        bridge.send('reload_recipes');
      } else {
        alert('Ошибка добавления рецепта');
      }
    } catch (error) {
      console.error('Ошибка отправки рецепта:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-recipe-form">
      <h2>Добавить новый рецепт</h2>
      
      <div className="form-group">
        <label htmlFor="title">Название рецепта:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="ingredients">Ингредиенты:</label>
        <textarea
          id="ingredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="cookingTime">Время приготовления:</label>
        <input
          type="text"
          id="cookingTime"
          value={cookingTime}
          onChange={(e) => setCookingTime(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="instructions">Инструкция:</label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Фото рецепта:</label>
        <button type="button" onClick={handleAddPhoto}>
          Добавить фото
        </button>
        {photos.length > 0 && (
          <div className="preview-photos">
            {photos.map((photo, index) => (
              <img key={index} src={photo.url} alt="Превью" />
            ))}
          </div>
        )}
      </div>
      
      <button type="submit">Сохранить рецепт</button>
    </form>
  );
};

export default AddRecipe;
