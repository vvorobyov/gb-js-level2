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
    constructor(id_product, product_name , price, img='https://via.placeholder.com/150') {
        this.id_product = id_product;
        this.product_name = product_name;
        this.price = price;
        this.img = img;
        this.element = document.createElement('div');
        this._render();
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
        this.cart = cart;
        this.element = document.querySelector('.goods-list')
    }

    fetchGoods() {
        return makeGETRequest( `${API_URL}/catalogData.json`).then(
            (response) => {
                const goods = JSON.parse(response);
                goods.forEach(good => {
                    const newGood = new GoodItem(good.id_product, good.product_name, good.price, good.img);
                    this.goods.push(newGood);
                });
                return this;
            },
            (response, code) => {
                alert(`Response code = ${code}\n Response data = ${response}`);
            }
        )
    }

    render() {
        const goodsElements = this.goods.map((good) => {
            good.initListener(this.addToCart);
            return good.element;
        });
        this.element.append(...goodsElements);
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
    constructor({id_product, product_name , price, img}) {
        super(id_product, product_name , price, img);
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
    constructor(...items) {
        this.cartItems = items.map(item => new CartItem(item)); // На случай наличия ранее сохраненных данных о покупках
        this.element = document.querySelector('.cart-list');
        this.cartButton = document.querySelector('.cart-button');
        if (this.cartItems.length){
            this.getSummaryCost();
        }
        this._initRender();
    }

    _initRender(){
        const cartElements = this.cartItems.map(
            (cartItem) => {
                cartItem.initListener(this.removeItem);
                return cartItem.element;
        });
        this.element.append(...cartElements);
    }

    getSummaryCost() {
        const reducer = (summ, {price}) => summ + price;
        const cost = this.cartItems.reduce(reducer, 0);
        if (cost){
            this.cartButton.textContent = `Товаров на ${cost} р.`;
        }else {
            this.cartButton.textContent = 'Корзина';
        }
        return cost
    }

    addItem(goodItem){
        const cartItem = new CartItem(goodItem);
        this.cartItems.push(cartItem);
        cartItem.initListener(this.removeItem);
        this.element.appendChild(cartItem.element);
        this.getSummaryCost();
    }

    removeItem = (cartItem) => {
        const itemIndex = this.cartItems.indexOf(cartItem);
        cartItem.element.remove();
        this.cartItems.splice(itemIndex, 1);
        this.getSummaryCost()
    };

    toShoping(){}

}


const cart = new Cart();
const list = new GoodsList(cart);
list.fetchGoods().then((list) => {
    list.render();
});
// list.render();
console.log(`Стоимоть всех товаров: ${list.getSummaryCost()}`);


