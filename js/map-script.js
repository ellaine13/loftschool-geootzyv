ymaps.ready(init);

window.myObj = {};

function init() {
	var myPlacemark,
		infobox = document.querySelector('.infobox'),
		addrLine = document.querySelector('.infobox__address'),
		infoboxCloseBtn = document.querySelector('.btn--close'),
		feedbackForm = document.querySelector('#feedback-form'),
		infoboxList = document.querySelector('.infobox__list'),
		baloonLink = document.querySelector('.linkCoords'),
		myMap = new ymaps.Map('map', {
			center: [53.938198, 27.481350],
			zoom: 15
		}),
		clusterer = new ymaps.Clusterer({
			preset: 'islands#invertedVioletClusterIcons',
			clusterDisableClickZoom: true,
			clusterBalloonContentLayout: "cluster#balloonCarousel"
		});

	myMap.geoObjects.add(clusterer);
	window.point = null;
	window.addr = null;

	// Клик по кнопке "Закрыть" в попапе
	infoboxCloseBtn.addEventListener('click', function() {
		var feedbackItem = infoboxList.getElementsByClassName('infobox__item--feedback');

		while (feedbackItem[0]) {
			feedbackItem[0].parentNode.removeChild(feedbackItem[0]);
		}

		infoboxList.classList.remove('is-filled');
		infobox.classList.add('is-hidden');
	});

	// Отправка формы
	feedbackForm.addEventListener('submit', function(event) {
		event.preventDefault();

		leaveFeedback(this);
		this.reset();
	});

	// Слушаем клик на карте.
	myMap.events.add('click', function (e) {
		var coords = e.get('coords');

		infobox.classList.remove('is-hidden');
		window.point = coords;
		getAddress(coords);
	});

	// Слушаем клик на метке(кластере).
	clusterer.events.add('click', function (e) {
		var object = e.get('target'),
			coords = e.get('coords');

		if (!object.getGeoObjects) {
			clusterer.balloon.close();
			infobox.classList.remove('is-hidden');
		}

		console.log(object.getGeoObjects);

		window.point = coords;
		getAddress(coords);
	});


	// Создание метки
	function createPlacemark(coords, place, msg) {
		var d = new Date(),
			day = (d.getDate() < 10) ? ('0' + d.getDate()) : d.getDate(),
			month = (d.getMonth() < 10) ? ('0' + d.getMonth()) : d.getMonth(),
			hours = (d.getHours() < 10) ? ('0' + d.getHours()) : d.getHours(),
			minutes = (d.getMinutes() < 10) ? ('0' + d.getMinutes()) : d.getMinutes();

		return new ymaps.Placemark(coords, {
			balloonContentHeader: `<strong>${place}</strong>`,
			balloonContentBody: `<div id="review"><a class="linkCoords" href="javascript:void(0);" data-coords="${coords}">${window.addr}</a><p>${msg}</p></div>`,
			balloonContentFooter: `${day}.${month}.${d.getFullYear()} ${hours}.${minutes}`
		});
	}

	// Определяем адрес по координатам (обратное геокодирование)
	function getAddress(coords) {
		ymaps.geocode(coords).then(function (res) {
			addrLine.innerHTML = res.geoObjects.get(0).properties.get('text');

			window.addr = res.geoObjects.get(0).properties.get('text');
		});
	}

	// Обрабатываем данные формы
	function leaveFeedback(formMarkup) {
		var li = document.createElement('li'),
			feedback = document.createElement('article'),
			username = document.createElement('span'),
			place = document.createElement('h2'),
			timeEl = document.createElement('time'),
			usermsg = document.createElement('p'),
			moment = new Date(),
			curYear = moment.getFullYear(),
			curMonth = moment.getMonth() + 1,
			curDay = moment.getDate(),
			curHour = moment.getHours(),
			curMinute = moment.getMinutes(),
			curSecond = moment.getSeconds(),
			mo = (curMonth < 10) ? ('0' + curMonth) : curMonth,
			dd = (curDay < 10) ? ('0' + curDay) : curDay;
			hh = (curHour < 10) ? ('0' + curHour) : curHour,
			mi = (curMinute < 10) ? ('0' + curMinute) : curMinute,
			ss = (curSecond < 10) ? ('0' + curSecond) : curSecond
			date = curYear + '-' + mo + '-' + dd,
			time = hh + ":" + mi + ":" + ss,
			dateTime = date + ' ' + time,
			dateStr = dd + '.' + mo + '.' + curYear;

		li.classList.add('infobox__item');
		li.classList.add('infobox__item--feedback');
		feedback.classList.add('feedback');
		username.classList.add('feedback__username');
		place.classList.add('feedback__title');
		timeEl.classList.add('feedback__time');
		timeEl.setAttribute('datetime', dateTime);
		usermsg.classList.add('feedback__text');

		infoboxList.appendChild(li);
		li.appendChild(feedback);
		feedback.appendChild(username);
		feedback.appendChild(place);
		feedback.appendChild(timeEl);
		feedback.appendChild(usermsg);
		username.innerHTML = `${formMarkup.username.value}`;
		place.innerHTML = `${formMarkup.place.value}`;
		timeEl.innerHTML = `${dateStr}`;
		usermsg.innerHTML = `${formMarkup.usermsg.value}`;
		infoboxList.classList.add('is-filled');

		myPlacemark = createPlacemark(window.point, formMarkup.place.value, formMarkup.usermsg.value);
		console.log(myObj);
		clusterer.add(myPlacemark);

		if (!myObj[window.point.join(',')]) {
			myObj[window.point.join(',')] = [];
		}

		myObj[window.point.join(',')].push({
			name: formMarkup.username.value,
			place: formMarkup.place.value,
			usermsg: formMarkup.usermsg.value
		});
		console.log(myObj);
	}
}