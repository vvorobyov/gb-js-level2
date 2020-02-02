const API_URL = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';

function makeGETRequest(url, body){
    let xhr;
    if (window.XMLHttpRequest){
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    const promise = new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.responseText, xhr.status);
                } else {
                    reject(xhr.responseText, xhr.status);
                }
            }
        }
    });

    xhr.open('GET', url, true);
    xhr.send(body);
    return promise;
}

class GoodItem {
    constructor(id_product, product_name , price, img='https://via.placeholder.com/150', buttonCallback) {
        this.id_product = id_product;
        this.product_name = product_name;
        this.price = price;
        this.img = img;
        this.element = document.createElement('div');
        this._render();
        this.initListener(buttonCallback)
    }

    _render() {
        this.element.classList.add('goods-item');
        this.element.id = `goodsItem${this.id_product}`;
        this.element.innerHTML = `
                <img src="${this.img}" alt="${this.product_name}">
                <h3>${this.product_name}</h3>
                <p>${this.price}</p>
                <button>Добавить</button>
        `
    }

    initListener(callback) {
        const button = this.element.querySelector('button');
        button.addEventListener('click', () => callback(this));
    }
}

class GoodsList {
    constructor(cart) {
        this.goods = [];
        this.filteredGoods = [];
        this.cart = cart;
        this.element = document.querySelector('.goods-list')
    }

    fetchGoods() {
        return makeGETRequest( `${API_URL}/catalogData.json`).then(
            (response) => {
                const goods = JSON.parse(response);
                goods.forEach(good => {
                    const newGood = new GoodItem(good.id_product, good.product_name, good.price, good.img, this.addToCart);
                    this.goods.push(newGood);
                    this.filteredGoods.push(newGood);
                });
            },
            (response, code) => {
                alert(`Response code = ${code}\n Response data = ${response}`);
            }
        )
    }

    render() {
        this.element.innerHTML = '';
        const goodsElements = this.filteredGoods.map((good) => good.element);
        this.element.append(...goodsElements);
    }

    filterGoods(value){
        const regext = new RegExp(value, 'i');
        this.filteredGoods = this.goods.filter(good => regext.test(good.product_name));
        if (this.filteredGoods.length) {
            this.render();
        }else{
            this.element.innerHTML = `<div> Не найдено совпадений для "${value}"</div>`;
            }
    }
    getSummaryCost() {
        const reducer = (summ, {price}) => summ + price;
        return this.goods.reduce(reducer, 0);
    }

    addToCart = (good) => {
        this.cart.addItem(good)
    }
}


class CartItem extends GoodItem{
    constructor({id_product, product_name , price, img}, buttonCallback) {
        super(id_product, product_name , price, img, buttonCallback);
    }

    _render() {
        this.element.classList.add('cart-item');
        this.element.id = `chartItem${this.id}`;
        this.element.innerHTML = `
                <img src="${this.img}" alt="${this.product_name}">
                <h3>${this.product_name}</h3>
                <p>${this.price}</p>
                <button>Удалить</button>
        `
    }
}


class Cart {
    constructor() {
        this.cartItems = []; // На случай наличия ранее сохраненных данных о покупках
        this.element = document.querySelector('.cart-list');
        this.cartButton = document.querySelector('.cart-button');
    }

    get countGoods(){
        return this.cartItems.length;
    }
    get amount(){
        const reducer = (summ, {price}) => summ + price;
        return this.cartItems.reduce(reducer, 0);
    }

    fetchCart(){
        return makeGETRequest(`${API_URL}/getBasket.json`).then(
            (response) => {
                const cartItems = JSON.parse(response).contents;
                cartItems.forEach(cartItem => {
                    const newItem = new CartItem(cartItem, this.removeItem);
                    this.cartItems.push(newItem);
                });
                this.renderCartButton();
            },
            (response, code) => {
                alert(`Response code = ${code}\n Response data = ${response}`);
            }
        )
    }

    render(){
        const cartElements = this.cartItems.map(cartItem => cartItem.element);
        this.element.append(...cartElements);
    }

    renderCartButton() {
        if (this.countGoods){
            this.cartButton.textContent = `Товаров на ${this.amount} р.`;
        }else {
            this.cartButton.textContent = 'Корзина';
        }
    }

    addItem(goodItem){
        const request = {id_product: goodItem.id_product};
        makeGETRequest(`${API_URL}/addToBasket.json`, request).then(
            response => {
                const data = JSON.parse(response);
                if (data.result === 1){
                    const cartItem = new CartItem(goodItem);
                    this.cartItems.push(cartItem);
                    cartItem.initListener(this.removeItem);
                    this.element.appendChild(cartItem.element);
                    this.renderCartButton();
                } else {
                    alert(`Error add ${goodItem.product_name} to cart!`);
                }
            },
            (response, code) => {
                alert(`Response code = ${code}\n Response data = ${response}`);
            }
        )
    }

    removeItem = (cartItem) => {
        const itemIndex = this.cartItems.indexOf(cartItem);
        const request = {id_product: cartItem.id_product};
        makeGETRequest(`${API_URL}/deleteFromBasket.json`, JSON.stringify(request)).then(
            response => {
                const data = JSON.parse(response);
                if (data.result === 1){
                    cartItem.element.remove();
                    this.cartItems.splice(itemIndex, 1);
                    this.renderCartButton();
                } else {
                    alert(`Error remove ${cartItem.product_name} from cart!`);
                }
            },
            (response, code) => {
                alert(`Response code = ${code}\n Response data = ${response}`);
            }
        );
    };

    toShoping(){}

}


const cart = new Cart();
const list = new GoodsList(cart);
list.fetchGoods()
    .then(() => list.render())
    .then(() => console.log(`Стоимоть всех товаров: ${list.getSummaryCost()}`));
cart.fetchCart()
    .then(() => cart.render());

const searchButton = document.querySelector('.search-button'),
    searchInput = document.querySelector('.goods-search');

searchButton.addEventListener('click', (event) => {
    const value = searchInput.value;
    list.filterGoods(value)
});




