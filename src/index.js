const Koa = require('koa');
const axios = require('axios');
const { faker } = require('@faker-js/faker')
const { moment } = require('moment')
const bodyParser = require('koa-bodyparser')
const Router = require('koa-router');

var router = new Router();


const app = new Koa();

//bodyparser

app.use(bodyParser());

// logger

app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});



// x-response-time

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});


// users

app.use(async (ctx, next) => {
    if (ctx.request.path === "/randomuser") {
        const response = await axios.get("https://randomuser.me/api/?results=5&seed=123")
        console.log(response)
        faker.seed(2023)
        let users = response.data.results.map(user => {
            return {
                ...user, lastMessage: {
                    message: faker.random.words(faker.datatype.number({ min: 2, max: 10, })),
                    messageTime: faker.datatype.boolean() ? faker.date.past() : faker.date.recent()
                }
            }
        })


        for (let i = 0; i < users.length; i++) {
            for (let j = 0; j < users.length; j++) {
                if (users[i].lastMessage.messageTime > users[j].lastMessage.messageTime) {
                    let temp = users[i]
                    users[i] = users[j]
                    users[j] = temp
                }
            }
        }

        ctx.body = users

    }
})

app.get('/messages', (req, res) => {
    res.json('selam')
})

app.listen(8082);
