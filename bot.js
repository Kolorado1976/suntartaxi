const express = require('express');
const mysql = require('mysql2/promise');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// Настройки подключения к базе данных
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'recipes_db'
};

// Настройки MAX Bot API
const MAX_BOT_TOKEN = 'your_bot_token';
const MAX_API_URL = 'https://api.max.ru/v1/bots';
const CHANNEL_LINK = 'https://max.ru/join/-ymxaZ9uMf53TF2MQb6Zd_hbI7GrKdjd0iMdQoWR_9c';

// Обработчик приветствия и меню
async function handleStart(chatId) {
    const menuButtons = [
        { title: 'Поиск рецептов', payload: 'search_recipes' },
        { title: 'Создать рецепт', payload: 'create_recipe' }
    ];
    
    const menuMarkup = {
        type: 'inline_keyboard',
        buttons: [menuButtons]
    };
    
    await sendMessage(chatId, 'Добро пожаловать в кулинарного бота! Выберите действие:', menuMarkup);
}

// Обработка поиска рецептов
async function handleSearchRecipes(chatId, query, page = 1) {
    if (query.length < 3) {
        await sendMessage(chatId, 'Введите как минимум 3 символа для поиска');
        return;
    }
    
    const limit = 5;
    const offset = (page - 1) * limit;
    
    const [results] = await getConnection().query(
        'SELECT * FROM recipes WHERE title LIKE ? LIMIT ? OFFSET ?',
        [`%${query}%`, limit, offset]
    );
    
    if (results.length === 0) {
        await sendMessage(chatId, 'Рецепты не найдены');
        return;
    }
    
    let messageText = 'Найденные рецепты:\n\n';
    results.forEach((recipe, index) => {
        messageText += `${index + 1}. ${recipe.title}\n`;
        messageText += `Ингредиенты: ${recipe.ingredients}\n`;
        messageText += `Время приготовления: ${recipe.cooking_time}\n\n`;
    });
    
    // Проверяем есть ли следующая страница
    const [countResult] = await getConnection().query(
        'SELECT COUNT(*) as total FROM recipes WHERE title LIKE ?',
        [`%${query}%`]
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    const buttons = [];
    if (page > 1) {
        buttons.push({ title: 'Предыдущая страница', payload: `search_${query}_${page - 1}` });
    }
    if (page < totalPages) {
        buttons.push({ title: 'Следующая страница', payload: `search_${query}_${page + 1}` });
    }
    
    const markup = {
        type: 'inline_keyboard',
        buttons: buttons.length > 0 ? [buttons] : []
    };
    
    await sendMessage(chatId, messageText, markup);
}

// Обработка создания рецепта
async function handleCreateRecipe(chatId) {
    // Сохраняем состояние пользователя для создания рецепта
    userStates[chatId] = {
        step: 'title',
        recipe: {}
    };
    
    await sendMessage(chatId, 'Введите название рецепта:');
}

// Обработка шагов создания рецепта
async function handleRecipeStep(chatId, text) {
    if (!userStates[chatId]) {
        await handleStart(chatId);
        return;
    }
    
    const state = userStates[chatId];
    
    switch (state.step) {
        case 'title':
            state.recipe.title = text;
            state.step = 'ingredients';
            await sendMessage(chatId, 'Введите ингредиенты через запятую:');
            break;
            
        case 'ingredients':
            state.recipe.ingredients = text;
            state.step = 'cooking_time';
            await sendMessage(chatId, 'Введите время приготовления:');
            break;
            
        case 'cooking_time':
            state.recipe.cooking_time = text;
            state.step = 'photos';
            
            const buttons = [
                { title: 'Добавить фото', payload: 'add_photo' },
                { title: 'Пропустить', payload: 'skip_photo' }
            ];
            
            const markup = {
                type: 'inline_keyboard',
                buttons: [buttons]
            };
            
            await sendMessage(chatId, 'Хотите добавить фото к рецепту?', markup);
            break;
            
        case 'photos':
            // Обработка добавления фото
            break;
    }
}

// Отправка сообщения через MAX API
async function sendMessage(chatId, text, markup = null) {
    const url = `${MAX_API_URL}/${MAX_BOT_TOKEN}/sendMessage`;
    const data = {
        chat_id: chatId,
        text: text
    };
    
    if (markup) {
        data.reply_markup = markup;
    }
    
    try {
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
    }
}

// Получение соединения с базой данных
async function getConnection() {
    return await mysql.createConnection(dbConfig);
}

// Сохранение рецепта в базу данных
async function saveRecipe(recipe, photos = []) {
    const connection = await getConnection();
    const [result] = await connection.query(
        'INSERT INTO recipes (title, ingredients, cooking_time) VALUES (?, ?, ?)',
        [recipe.title, recipe.ingredients, recipe.cooking_time]
    );
    
    const recipeId = result.insertId;
    
    // Сохранение фотографий
    if (photos.length > 0) {
        const photoInserts = photos.map(photoUrl => [recipeId, photoUrl]);
        await connection.query(
            'INSERT INTO recipe_photos (recipe_id, photo_url) VALUES ?',
            [photoInserts]
        );
    }
    
    return recipeId;
}

// Публикация рецепта в канал
async function publishToChannel(recipeId) {
    const connection = await getConnection();
    const [recipe] = await connection.query(
        'SELECT * FROM recipes WHERE id = ?',
        [recipeId]
    );
    
    const [photos] = await connection.query(
        'SELECT photo_url FROM recipe_photos WHERE recipe_id = ?',
        [recipeId]
    );
    
    let messageText = `Новый рецепт: ${recipe.title}\n\n`;
    messageText += `Ингредиенты: ${recipe.ingredients}\n`;
    messageText += `Время приготовления: ${recipe.cooking_time}`;
    
    // Здесь нужно реализовать логику отправки сообщения в канал
    // с использованием MAX API и сохранить идентификатор поста
}

// Обработчик входящих сообщений
app.post('/webhook', async (req, res) => {
    const update = req.body;
    const chatId = update.message.chat.id;
    const text = update.message.text;
    const payload = update.callback_query ? update.callback_query.data : null;
    
    if (payload) {
        const [action, ...params] = payload.split('_');
        
        switch (action) {
            case 'search':
                const query = params[0];
                const page = parseInt(params[1]) || 1;
                await handleSearchRecipes(chatId, query, page);
                break;
                
            case 'create':
                await handleCreateRecipe(chatId);
                break;
                
            case 'add_photo':
                // Обработка добавления фото
                break;
                
            case 'skip_photo':
                // Сохранение рецепта без фото
                const recipe = userStates[chatId].recipe;
                const recipeId = await saveRecipe(recipe);
                await publishToChannel(recipeId);
                delete userStates[chatId];
                await sendMessage(chatId, 'Рецепт успешно сохранен и опубликован!');
                break;
        }
    } else if (text) {
        if (userStates[chatId]) {
            await handleRecipeStep(chatId, text);
        } else {
            await handleStart(chatId);
        }
    }
    
    res.sendStatus(200);
});

// Настройка вебхука
app.listen(3000, () => {
    console.log('Бот запущен на порту 3000');
});