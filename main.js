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
    constructor() {
        this.goods = [];
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

    addToCart(good) {
        console.log(good.id, good);
    }
}

const list = new GoodsList();
list.fetchGoods();
list.render();
