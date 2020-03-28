const storage = require('azure-storage')
const moment = require('moment');
const uuid = require('uuid')

const retryOperations = new storage.ExponentialRetryPolicyFilter();

function LoggingFilter() {
    this.handle = (requestOptions, next) => {
        console.log("requestOptions: ")
        console.log(requestOptions)
        next(requestOptions, (returnObject, finalCallback, next) => {
            if(next) {
                next(requestOptions, (returnObject, finalCallback, next))
            } else {
                finalCallback(returnObject);
            }
        })
    }
}

const service =
    storage
        .createTableService()
        .withFilter(retryOperations)
        .withFilter(new LoggingFilter());

const table = 'tasks'

const init = async () => (
  new Promise((resolve, reject) => {
    service.createTableIfNotExists(table, (error, result, response) => {
      !error ? resolve() : reject()
    })
  })
)

const createTask = async (title, desc) => (
  new Promise((resolve, reject) => {
    const generator = storage.TableUtilities.entityGenerator
    const task = {
      PartitionKey: generator.String('task'),
      RowKey: generator.String(uuid.v4()),
      title,
      desc,
      status: 'open'
    }

    service.insertEntity(table, task, (error, result, response) => {
      !error ? resolve() : reject()
    })
  })
)

const listTasks = async () => (
    new Promise((resolve, reject) => {
        const query = new storage.TableQuery()
            .select(['RowKey', 'title', 'desc', 'Timestamp', 'status'])
            .where('PartitionKey eq ?', 'task')

        service.queryEntities(table, query, null, (error, result, response) => {
            !error ? resolve(result.entries.map((entry) => ({
                id: entry.RowKey._,
                title: entry.title._,
                desc: entry.desc._? entry.desc._: 'Brak opisu zadania',
                timestamp: moment(entry.Timestamp._).format("DD-MM-YYYY HH:mm:ss"),
                status: entry.status._
            }))) : reject()
        })
    })
)

const updateTaskStatus = async (id, status) => (
    new Promise((resolve, reject) => {
        const generator = storage.TableUtilities.entityGenerator
        const task = {
            PartitionKey: generator.String('task'),
            RowKey: generator.String(id),
            status
        }

        service.mergeEntity(table, task, (error, result, response) => {
            !error ? resolve() : reject()
        })
    })
)

const deleteTask = async (id) => (
    new Promise((resolve, reject) => {
        const generator = storage.TableUtilities.entityGenerator
        const task = {
            PartitionKey: generator.String('task'),
            RowKey: generator.String(id)
        }

        service.deleteEntity(table, task, function(error, response){
            !error ? resolve() : reject()
        });
    })
)

module.exports = {
  init,
  createTask,
  listTasks,
  updateTaskStatus,
  deleteTask
}
