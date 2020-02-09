const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const SERVER_PORT = 3000;
const logger = function(action, message){
    const date = new Date();
    console.log(`${date.toISOString()} - ${action} - ${message}`);
    fs.appendFile(
        './data/stats.log',
        `${date.toISOString()} - ${action} - ${message}\n`,
        (err)=>{
            if (err) console.log(err);
        }
    )
}


app.use(express.static('./vue_app'));
app.use(bodyParser.json());

app.get('/api/catalog', (req, res) => {
    fs.readFile('./data/catalog.json', (err, data) => {
        if(err) {
            res.status(500).send(err)
        }
        res.contentType('application/json').send(data);
    })
});

app.get('/api/cart', (req, res) => {
    fs.readFile('./data/cart.json', (err, data) => {
        if(err) {
            res.status(500).send(err)
        }
        res.contentType('application/json').send(data);
    })
});

app.post('/api/cart', (req, res) => {
    const goodItem = req.body;
    const cart = JSON.parse(fs.readFileSync('./data/cart.json'));

    const cartGood = cart.find(good => good.id === goodItem.id);

    if (cartGood) {
        cartGood.quantity++;
    } else {
        const catalog = JSON.parse(fs.readFileSync('./data/catalog.json'));
        const findResult = catalog.find(good => good.id === goodItem.id);
        if (findResult) {
            cart.push({...findResult, quantity: 1});
        } else {
            res.status(400).send(`Запрошеный товар с ID=${goodItem.id} отсутствует в каталоге`);
            return
        }
    }
    const cartData = JSON.stringify(cart);
    fs.writeFile('./data/cart.json', cartData, (err)=>{
        if (err) {
            res.status(500).send('Internal server error');
            return
        }
    });
    logger('ADD', goodItem.name);
    res.status(201)
        .contentType('application/json')
        .send(cartData);
});

app.del('/api/cart/:good_id', (req, res) => {
    const cart = JSON.parse(fs.readFileSync('./data/cart.json'));
    const good_id = req.params.good_id;
    const cartGood = cart.find(good => good.id === parseInt(good_id));
    if (cartGood){
        logger('DEL', cartGood.name);
        cartGood.quantity--;
        if(cartGood.quantity === 0) {
            const index = cart.indexOf(cartGood);
            cart.splice(index, 1);
        }
    }
    const cartData = JSON.stringify(cart);
    fs.writeFile('./data/cart.json', cartData, (err)=>{
        if (err) {
            res.status(500).send('Internal server error');
            return
        }
    });
    res.status(201)
        .contentType('application/json')
        .send(cartData);

});


app.listen(SERVER_PORT, () => {
    console.log(`Server is running!`);
    console.log(`Open in browser url: http://localhost:${SERVER_PORT}/`);
});

