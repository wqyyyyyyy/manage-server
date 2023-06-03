const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const log4js = require('./utils/log4j')
const util = require("./utils/util")


const users = require('./routes/users')
const jwt = require('jsonwebtoken')
const koajwt = require('koa-jwt')
const router = require("koa-router")()

require("./config/db")

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))



// logger
app.use(async (ctx, next) => {
  log4js.info(`get params:${JSON.stringify(ctx.request.query)}`)
  log4js.info(`post params:${JSON.stringify(ctx.request.body)}`)
  await next().catch((err) => {
    if(err.status == '401') {
      ctx.status = 200
      ctx.body = util.fail('token认证失败',util.CODE.AUTH_ERROR)
    }else{
      throw err;
    }
  })
})
app.use(koajwt({secret:'imooc'}).unless({path: [/^\/api\/user\/login/]}))
// routes
router.prefix("/api")
router.get("/leave/count", (ctx) => {
  const token = ctx.request.headers.authorization.split(' ')[1]
  const payload = jwt.verify(token,'imooc')
  ctx.body = payload
})
router.use(users.routes(), users.allowedMethods())
app.use(router.routes(),router.allowedMethods())
// app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
  log4js.error(err)
});

module.exports = app
