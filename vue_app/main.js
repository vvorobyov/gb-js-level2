function debounce(callback, wait, immediate) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) callback.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            callback.apply(context, args)
        }
    }
}

Vue.component('notify-list', {
    data:() => ({
        notifies: [],
        nextNotifyID: 1,
    }),
    template: `
        <div class="hotify-list">
            <notify v-for="notify in notifies" :key="notify.id" :notify="notify"></notify>
        </div>      
    `,
    methods: {
        addNotify(message, type='info', timeout=3000){
            const notify = {
                id: this.nextNotifyID++,
                message: message,
                type: type,
                timeout: timeout,
            };
            const removeNotify = () => {
                const index = this.notifies.indexOf(notify);
                this.notifies.splice(index, 1)
            };
            setTimeout(removeNotify, timeout);
            this.notifies.unshift(notify);
        }
    }
});

Vue.component('notify', {
    props: ['notify'],
    data:  () => ({
        isVisible: true,
    }),
    template: `
        <transition name="fade">
            <div v-bind:class="{notify:true, info: isInfo, warning: isWarning, error: isError}" 
                 v-if="isVisible">
                    {{notify.message}}
            </div>
         </transition>
    `,
    computed: {
        isInfo(){
            return this.notify.type === 'info';
        },
        isWarning(){
            return this.notify.type === 'warning';
        },
        isError(){
            return this.notify.type === 'error';
        },
    },
    mounted() {
        this.isVisible = true;
        const hideNotify = () => this.isVisible = false;
        setTimeout(hideNotify, this.notify.timeout-500);
    },


});

Vue.component('goods-item', {
    props: ['good'],
    template: `
        <div class="goods-item">
            <img src="https://via.placeholder.com/150" alt="">
            <h3>{{ good.name }}</h3>
            <p>{{ good.price }}</p>
            <button class="button" @click="addToCart">Добавить</button>
        </div>
    `,
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.good);
        }
    }
});

Vue.component('goods-list', {
    props: ['goods'],
    computed: {
        isFilteredGoodsNotEmpty() {
            return this.goods.length > 0;
        },
    },
    template: `
        <div class="goods-list" v-if="isFilteredGoodsNotEmpty" >
            <goods-item v-for="good in goods" 
                       :key="good.id" :good="good" 
                       @add-to-cart="addToCart"/>
        </div>
        <div class="goods-not-found" v-else>
            <h3>Нет данных</h3>
        </div>
    `,
    methods: {
        addToCart(good) {
            this.$emit('add-to-cart', good);
        }
    }
});

Vue.component('goods-search', {
    template: `
        <form class="goods-search" @submit.prevent>
            <input type="text" @input="inputHandler" class="goods-search-value">
        </form>    
    `,
    methods: {
        inputHandler(event) {
            this.$emit('change-search-value', event);
        }
    }
});

Vue.component('cart-item', {
    props: ['good'],
    template: `
        <li class="cart-item">
            <span class="cart-item-name">{{ good.name }}</span>
            <span class="cart-item-price">{{ good.price }}</span>
            <button class="cartBtn" @click="decGood">-</button>
            <span class="cart-item-count">{{ good.quantity }}</span>
            <button class="cartBtn" @click="incGood">+</button>
        </li>
    `,
    methods: {
        incGood() {
            this.$emit('add-good', this.good);
        },
        decGood() {
            this.$emit('remove-good', this.good);
        }
    }
});

Vue.component('cart', {
    props: {
        goods: Array,
    },
    data: () => ({
        isVisibleCart: false,
    }),
    computed: {
        isNotEmptyCart() {
            return this.goods && this.goods.length > 0
        },
        cartCaption() {
            const sum = this.goods.reduce((sum, good) => {
                return sum += good.price * good.quantity;
            }, 0);
            if (sum) {
                return `Товаров на сумму ${sum} р.`
            } else {
                return 'Корзина'
            }
        },
    },
    template: `
        <div class="cart">
            <button class="button" @click="toggleCartVisibility">{{ cartCaption }}</button>
            <transition name="fade">
                <div class="cart-container" v-if="isVisibleCart">
                    <ul class="cart-goods" v-if="isNotEmptyCart">
                        <cart-item v-for="good in goods" 
                                   :key="good.id" :good="good"
                                   @remove-good="removeGood" 
                                   @add-good="addGood"
                                   />
                    </ul>
                    <div class="empty-cart" v-else>
                        <h4>Корзина пуста</h4>
                    </div>
                </div>
            </transition>
        </div>
    `,
    methods: {
        toggleCartVisibility() {
            this.isVisibleCart = !this.isVisibleCart;
        },
        removeGood(good){
            this.$emit('remove-good', good);
        },
        addGood(good){
            this.$emit('add-good', good);
        }
    },

});

const app = new Vue({
    el: '#app',
    data: {
        goods: [],
        filteredGoods: [],
        searchLine: '',
        cart: [],
    },
    methods: {
        makeRequest(url, method, data) {
            return new Promise((resolve, reject) => {
                let xhr;
                if (window.XMLHttpRequest) {
                    xhr = new XMLHttpRequest();
                } else if (window.ActiveXObject) {
                    xhr = new ActiveXObject('Microsoft.XMLHTTP');
                }

                xhr.onload = (event) => {
                    if (event.target.status >= 200 && event.target.status < 300) {
                        resolve(JSON.parse(event.target.responseText), event.target.status);
                    } else {
                        reject(event.target.responseText, event.target.status);
                    }
                };

                xhr.onerror = function (err) {
                    reject(err)
                };

                xhr.open(method.toUpperCase(), url, true);
                if (data) {
                    data = JSON.stringify(data);
                    xhr.setRequestHeader("content-type", "application/json;charset=UTF-8");
                }
                console.log(data);
                xhr.send(data);
            })
        },
        async fetchGoods(){
            try {
                this.goods = await this.makeRequest(`api/catalog`, 'get');
                this.filteredGoods = [...this.goods];
            } catch (e) {
                console.log(e);
                this.addNotify('ОШИБКА! Не удалось получить список товаров с сервера!',
                    'error',
                    10000);
            }
        },
        async fetchCart(){
            try {
                //  TODO для устранения ошибки с корзиной необходимо удалить 1 в конце V
                const result = await this.makeRequest(`/api/cart`, 'get');
                this.cart = result;
                return result

            } catch (e) {
                console.error(e);
                this.addNotify('ОШИБКА! Не удалось получить товары в корзине!',
                    'error', 10000);
            }
        },
        async addToCartHandler(good) {
            try {
                this.cart = await this.makeRequest(`/api/cart`, 'post', good);
                this.addNotify(`Товар "${good.name}" добавлен в корзину!`);
            } catch (e) {
                console.log(e)
                this.addNotify(e, 'error', 10000);
            }
        },
        async removeFromCartHandler(good) {
            try {
                this.cart = await this.makeRequest(`/api/cart/${good.id}`, 'delete');
                this.addNotify(`1 ед. товара "${good.name}" удалена из корзины!`);
            } catch (e) {
                console.log(e)
                this.addNotify(e, 'error', 10000);
            }

        },
        addNotify(message, type, timeout) {
            this.$refs.notifier.addNotify(message, type, timeout);
        }
    },
    computed: {
        filteredGoodsHandler(){
            return debounce((event) => {
                const regext = new RegExp(event.target.value.trim(), 'i');
                this.filteredGoods = this.goods.filter(good => regext.test(good.name));
            }, 300)
        },
    },
    mounted() {
        this.fetchGoods();
        this.fetchCart();
    },
});

