const Map = require('../modules/api.yandex');

export default class {
    constructor(){
        this.myApiMap = new Map();

        this.init();
    }
    async init(){
        this.yandexApi = await this.myApiMap.initMap({
            center: [53.938198, 27.481350],
            zoom: 15,
            controls: []
        })
        this.yandexApi.events.add('click', async e => {
            this.point = await this.myApiMap.getMapPosition(e);
            console.log(this.point);
        })

        this.Balloon = await this.myApiMap.createBalloon(this.position);
    }
}