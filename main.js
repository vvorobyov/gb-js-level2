const goods = [
    {id: 1, title: "Робот-пылесос xiaomi", price: 20000, img: 'https://via.placeholder.com/150' },
    {id: 2, title: "Samsung Galaxy", price: 21500, img: 'https://via.placeholder.com/150' },
    {id: 3, title: "Стиральная машина hotpoint", price: 32000, img: 'https://via.placeholder.com/150' },
    {id: 4, title: "Умные часы apple watch", price: 26000, img: 'https://via.placeholder.com/150' },

];


class GoodItem {
    constructor(id, title , price, img='https://via.placeholder.com/150') {
        this.id = id;
        this.title = title;
        this.price = price;
        this.img = img;
        this.element = document.createElement('div');
        this._render();
    }

    _render() {
        this.element.classList.add('goods-item');
        this.element.id = `goodsItem${this.id}`;
        this.element.innerHTML = `
                <img src="${this.img}" alt="${this.title}">
                <h3>${this.title}</h3>
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
        goods.forEach(good => {
            const newGood = new GoodItem(good.id, good.title, good.price, good.img);
            this.goods.push(newGood);
        });
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
    constructor({id, title , price, img}) {
        super(id, title , price, img);
    }

    _render() {
        this.element.classList.add('cart-item');
        this.element.id = `chartItem${this.id}`;
        this.element.innerHTML = `
                <img src="${this.img}" alt="${this.title}">
                <h3>${this.title}</h3>
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


const cart = new Cart(goods[1], goods[2], goods[1]);
const list = new GoodsList(cart);
list.fetchGoods();
list.render();
console.log(`Стоимоть всех товаров: ${list.getSummaryCost()}`);


