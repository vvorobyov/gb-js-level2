const API_URL = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';

const app = new Vue({
    el: '#app',
    data: {
        goods: [],
        filteredGoods: [],
        searchLine: '',
        isVisibleCart: false,
    },
    methods: {
        makeGETRequest(url) {
            return new Promise((resolve, reject) => {
                let xhr;
                if (window.XMLHttpRequest) {
                    xhr = new XMLHttpRequest();
                } else if (window.ActiveXObject) {
                    xhr = new ActiveXObject('Microsoft.XMLHTTP');
                }

                xhr.onload = (event) => {
                    console.log(event);
                    if (event.target.status >= 200 && event.target.status < 300) {
                        resolve(JSON.parse(event.target.responseText), event.target.status);
                    } else {
                        reject(event.target.responseText, event.target.status);
                    }
                };

                xhr.onerror = function (err) {
                    reject(err)
                };

                xhr.open('GET', url, true);
                xhr.send();
            })
        },
        async fetchGoods(){
            try {
                this.goods = await this.makeGETRequest(`${API_URL}/catalogData.json`);
                this.filteredGoods = [...this.goods]
            } catch (e) {
                console.error(e);
            }
        },
        filterGoods(event){
            const regext = new RegExp(this.searchLine, 'i');
            this.filteredGoods = this.goods.filter(good => regext.test(good.product_name));
            event.preventDefault();
        },
    },
    computed: {
        isEmptyGoodsList() {
          return this.filteredGoods.length === 0;
        },
    },
    mounted() {
        this.fetchGoods();
    },
});