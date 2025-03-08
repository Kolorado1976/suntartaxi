let map;

function initMap() {
    // Инициализация карты с центром в Сунтаре
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
}

function orderTaxi() {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
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
