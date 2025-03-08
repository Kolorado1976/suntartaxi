let map;
let fromInput, toInput;
let suggestionsFrom, suggestionsTo;

// Инициализация карты
function initMap() {
    map = new ymaps.Map('map', {
        center: [62.1575, 117.6503], // Координаты Сунтара
        zoom: 14
    });

    // Добавление маркера для Сунтара
    const sunstarMarker = new ymaps.Placemark([62.1575, 117.6503], {
        hintContent: 'Сунтар'
    });
    map.geoObjects.add(sunstarMarker);

    // Пример свободного такси (случайные точки)
    const taxi1 = new ymaps.Placemark([62.1550, 117.6550], {
        hintContent: 'Свободное такси 1'
    });
    const taxi2 = new ymaps.Placemark([62.1590, 117.6600], {
        hintContent: 'Свободное такси 2'
    });
    map.geoObjects.add(taxi1);
    map.geoObjects.add(taxi2);

    // Инициализация элементов ввода
    fromInput = document.getElementById('from');
    toInput = document.getElementById('to');
    suggestionsFrom = document.getElementById('suggestions-from');
    suggestionsTo = document.getElementById('suggestions-to');

    // Обработчики ввода
    fromInput.addEventListener('input', () => fetchSuggestions(fromInput, suggestionsFrom));
    toInput.addEventListener('input', () => fetchSuggestions(toInput, suggestionsTo));
}

// Получение подсказок для адреса
function fetchSuggestions(input, suggestionsContainer) {
    const query = input.value;
    if (query.length < 3) {
        suggestionsContainer.innerHTML = '';
        return;
    }

    const url = `https://suggest-maps.yandex.ru/suggest-geo?part=${encodeURIComponent(query)}&lang=ru_RU`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            suggestionsContainer.innerHTML = '';
            data.results.forEach(result => {
                const div = document.createElement('div');
                div.textContent = result.title;
                div.onclick = () => {
                    input.value = result.title;
                    suggestionsContainer.innerHTML = '';
                };
                suggestionsContainer.appendChild(div);
            });
        });
}

// Заказ такси
function orderTaxi() {
    const from = fromInput.value;
    const to = toInput.value;
    const price = document.getElementById('price').value;

    if (!from || !to || !price) {
        alert('Заполните все поля!');
        return;
    }

    const data = {
        from: from,
        to: to,
        price: price
    };

    // Отправка данных в бота
    Telegram.WebApp.sendData(JSON.stringify(data));

    document.getElementById('status').innerText = 'Такси заказано! Ожидайте...';
}

ymaps.ready(initMap);
