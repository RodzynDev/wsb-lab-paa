const storage = require('azure-storage')
const uuid = require('uuid')

const retryOperations = new storage.ExponentialRetryPolicyFilter();

const LoggingFilter = () => {
    this.handle = (requestOptions, next) => {
        console.log(requestOptions);
        next(requestOptions, (returnObject, finalCallback, next) => {
            console.log(returnObject);
            next(requestOptions, finalCallback);
        })
    }
}

const service =
    storage
        .createTableService()
        .withFilter(retryOperations)
        .withFilter(LoggingFilter);

const table = 'tasks'

const init = async () => (
  new Promise((resolve, reject) => {
    service.createTableIfNotExists(table, (error, result, response) => {
      !error ? resolve() : reject()
    })
  })
)

const createTask = async (title) => (
  new Promise((resolve, reject) => {
    const generator = storage.TableUtilities.entityGenerator
    const task = {
      PartitionKey: generator.String('task'),
      RowKey: generator.String(uuid.v4()),
      title
    }

    service.insertEntity(table, task, (error, result, response) => {
      !error ? resolve() : reject()
    })
  })
)

module.exports = {
  init,
  createTask
}
