/**
 * 数据库连接
 */

const mongoose = require('mongoose')
const config = require("./index")
const log4js = require("../utils/log4j")

mongoose.connect(config.url).then(
    () => {
        log4js.info("连接成功")
    },
    err => {
        log4js.error(err)
    }
)