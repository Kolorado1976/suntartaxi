import React, { useState, useEffect } from 'react';
import bridge from './bridge';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import AddRecipe from './components/AddRecipe';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Получение рецептов при загрузке приложения
    fetchRecipes();
    
    // Установка обработчика закрытия приложения
    return () => {
      bridge.close();
    };
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('https://your-api-url/recipes');
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error('Ошибка загрузки рецептов:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const paginatedRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Кулинарные рецепты</h1>
          <nav>
            <Link to="/">Главная</Link>
            <Link to="/add">Добавить рецепт</Link>
          </nav>
        </header>
        
        <main>
          <Route exact path="/">
            <div className="search-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Поиск рецепта..."
              />
            </div>
            
            {paginatedRecipes.map(recipe => (
              <RecipeList key={recipe.id} recipe={recipe} />
            ))}
            
            <div className="pagination">
              {currentPage > 1 && (
                <button onClick={() => setCurrentPage(currentPage - 1)}>
                  Предыдущая страница
                </button>
              )}
              {recipes.length > currentPage * itemsPerPage && (
                <button onClick={() => setCurrentPage(currentPage + 1)}>
                  Следующая страница
                </button>
              )}
            </div>
          </Route>
          
          <Route path="/recipe/:id">
            <RecipeDetail />
          </Route>
          
          <Route path="/add">
            <AddRecipe />
          </Route>
        </main>
        
        <footer>
          <button onClick={() => bridge.send('open_chat')}>
            Перейти в чат с ботом
          </button>
        </footer>
      </div>
    </Router>
  );
}

export default App;
