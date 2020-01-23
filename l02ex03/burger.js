class Hamburger{
    constructor(size, stuffing){
        this.components_info = {
            small: {title: 'Маленький', price: 50, calories: 20},
            big: {title: 'Большой', price: 100, calories: 40},
            cheese: {title: 'сыром', price: 10, calories: 20},
            salad: {title: 'салатом', price: 20, calories: 5},
            potato: {title: 'картошкой', price: 15, calories: 10},
            seasoning: {title: 'посыпанный приправой', price: 15, calories: 0},
            mayonnaise: {title: 'политый майонезом', price: 20, calories: 5},
        };
        this.size = size;
        this.stuffing = stuffing;
        this.topping = [];

    }
    addTopping(topping){
        this.topping.push(topping);
    }
    removeTopping(topping){
        const index = this.topping.indexOf(topping);
        this.topping.splice(index, 1);

    }
    getToppings(){
        console.log(this.topping);
        return this.topping.map((topping)=>this.components_info[topping].title).join(' и ');
    }
    getSize(){
        return this.components_info[this.size].title;
    }
    getStuffing(){
        return this.stuffing.map((stuffing)=>this.components_info[stuffing].title).join(', ');
    }
    calculatePrice(){
        let price = this.components_info[this.size].price;
        this.topping.map(topping => price += this.components_info[topping].price);
        this.stuffing.map(stuffing => price += this.components_info[stuffing].price);
        return price
    }
    calculateCalories(){
        let calories = this.components_info[this.size].calories;
        this.topping.map(topping => calories += this.components_info[topping].calories);
        this.stuffing.map(stuffing => calories += this.components_info[stuffing].calories);
        return calories
    }

    orderDetail(){
        return `
            ${this.getSize()} гамбургер <br>
            C ${this.getStuffing()}<br>
            ${this.getToppings()}<br>
            <b>Количество каллорий</b>  - ${this.calculateCalories()}<br>
            <b>Стоимость</b>  - ${this.calculatePrice()}<br>
        `
    }

}

const createBurger = function () {
    const size_element = document.getElementById('burger_size');
    const stuffing_elements = [...document.querySelectorAll('#stuffing>input')];
    const size = size_element.options[size_element.selectedIndex].value;
    const stuffing = stuffing_elements.reduce((acc, item) => {
            if (item.checked) {
                acc.push(item.id);
            }
            return acc;
        }, []
    );
    if (stuffing.length) {
        return new Hamburger(size, stuffing);
    } else {
        alert('Выберите начинку!');
    }
};


const makeButton = document.getElementById('make');
makeButton.addEventListener('click', (event) => {
    const burger = createBurger();
    if (burger) {
        const makeBtn = event.target;
        const burger_size = document.getElementById('burger_size');
        const stuffing = document.getElementById('stuffing');
        const topping = document.getElementById('topping');
        const detailBtn = document.getElementById('orderDetailBtn');
        const detailInfo = document.getElementById('orderDetail');
        const seasoning_element = document.getElementById('seasoning');
        const mayonnaise_element = document.getElementById('mayonnaise');
        detailInfo.innerText = '';
        makeBtn.disabled = true;
        topping.disabled = false;
        stuffing.disabled = true;
        burger_size.disabled = true;
        detailBtn.disabled = false;
        const topping_change = (event) => {
            if (event.target.checked) {
                burger.addTopping(event.target.id)
            } else {
                burger.removeTopping(event.target.id)
            }
        };
        seasoning_element.addEventListener('change', topping_change);
        mayonnaise_element.addEventListener('change', topping_change);
        detailBtn.addEventListener('click', () => {
            detailInfo.innerHTML = burger.orderDetail();
            makeBtn.disabled = false;
            topping.disabled = true;
            stuffing.disabled = false;
            burger_size.disabled = false;
            detailBtn.disabled = true;
            seasoning_element.removeEventListener('change', topping_change);
            seasoning_element.checked = false;
            mayonnaise_element.removeEventListener('change', topping_change);
            mayonnaise_element.checked = false;
        })
    }
});
