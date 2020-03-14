const storage = require('azure-storage')
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

module.exports = {
  init
}
