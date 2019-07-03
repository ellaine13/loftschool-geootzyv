ymaps.ready(init);

function init() {
	var myPlacemark,
		infobox = document.querySelector('.infobox'),
		addrLine = document.querySelector('.infobox__address'),
		infoboxCloseBtn = document.querySelector('.btn--close'),
		feedbackForm = document.querySelector('#feedback-form'),
		formFieldset = document.querySelector('.form__fieldset'),
		myMap = new ymaps.Map('map', {
			center: [53.938198, 27.481350],
			zoom: 15
		});

	// Клик по кнопке "Закрыть" в попапе
	infoboxCloseBtn.addEventListener('click', function() {
		infoboxClosing();
	});

	// Отправка формы
	feedbackForm.addEventListener('submit', function(event) {
		event.preventDefault();

		leaveFeedback();
		this.reset();
	});

	// Слушаем клик на карте.
	myMap.events.add('click', function (e) {
		infoboxOpen();

		var coords = e.get('coords');

		// Если метка уже создана – просто передвигаем ее.
		if (myPlacemark) {
			myPlacemark.geometry.setCoordinates(coords);
		}
		// Если нет – создаем.
		else {
			myPlacemark = createPlacemark(coords);
			myMap.geoObjects.add(myPlacemark);
			// Слушаем событие окончания перетаскивания на метке.
			myPlacemark.events.add('dragend', function () {
				getAddress(myPlacemark.geometry.getCoordinates());
			});
		}
		getAddress(coords);
	});

	// Создание метки.
	function createPlacemark(coords) {
		return new ymaps.Placemark(coords, {
			iconCaption: 'поиск...'
		}, {
			preset: 'islands#violetDotIconWithCaption',
			draggable: true
		});
	}

	// Определяем адрес по координатам (обратное геокодирование).
	function getAddress(coords) {
		myPlacemark.properties.set('iconCaption', 'поиск...');
		ymaps.geocode(coords).then(function (res) {
			var firstGeoObject = res.geoObjects.get(0);

			myPlacemark.properties
				.set({
					// Формируем строку с данными об объекте.
					iconCaption: [
						// Название населенного пункта или вышестоящее административно-территориальное образование.
						firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
						// Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
						firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
					].filter(Boolean).join(', '),
					// В качестве контента балуна задаем строку с адресом объекта.
					balloonContent: firstGeoObject.getAddressLine()
				});

			addrLine.textContent = firstGeoObject.getAddressLine();
		});
	}

	// Прячем попап
	function infoboxClosing() {
		infobox.classList.add('is-hidden');
	}

	// Показываем попап
	function infoboxOpen() {
		infobox.classList.remove('is-hidden');
	}

	// Получаем дату
	function getCurrentTime() {
		var moment = new Date(),
			curYear = moment.getFullYear(),
			curMonth = moment.getMonth() + 1,
			curHour = moment.getHours(),
			curMinute = moment.getMinutes(),
			curSecond = moment.getSeconds(),
			curDay = moment.getDate(),
			mo = (curMonth < 10) ? ('0' + curMonth) : curMonth,
			hh = (curHour < 10) ? ('0' + curHour) : curHour,
			dd = (curDay < 10) ? ('0' + curDay) : curDay,
			mi = (curMinute < 10) ? ('0' + curMinute) : curMinute,
			ss = (curSecond < 10) ? ('0' + curSecond) : curSecond;

		var date = curYear + '-' + mo + '-' + dd;
		var time = hh + ":" + mi + ":" + ss;
		var dateTime = date + ' ' + time;

		return dateTime;
	}

	// Обрабатываем данные формы
	function leaveFeedback() {
		var feedbacksArr = [];

		for (var i = 0; i < formFieldset.elements.length; i++) {
			var field = formFieldset.elements[i];

			if (field.type === 'submit') continue;

			feedbacksArr.push({
				name: field.name,
				value: field.value
			});
		}

		console.log(feedbacksArr);
		return feedbacksArr;
	}
}