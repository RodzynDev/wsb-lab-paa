const router = require('koa-router')()
const store = require('../store')

router.prefix('/tasks')

router.post('/add', async (ctx, next) => {
  if(ctx.request.body.title !== "") {
    await store.createTask(ctx.request.body.title, ctx.request.body.desc)
    ctx.redirect('/')
  } else {
    await ctx.render('errorMessage', {
      message: "Tytuł zadania nie może być pusty"
    })
  }
})

router.post('/updateStatus', async (ctx, next) => {
  const { id, status } = ctx.request.body
  await store.updateTaskStatus(id, status)
  ctx.status = 200
})

module.exports = router
