import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals'
import { server } from '../src/api.js'
function waitForServerStatus(server) {
    return new Promise((resolve, reject) => {
        server.once('error', (err) => reject(err))
        server.once('listening', () => resolve())
    })
}

describe('API Users E2E Suite', () => {
    let _testServer
    let _testServerAddress

    beforeAll(async () => {
        _testServer = server.listen();

        await waitForServerStatus(_testServer)

        const serverInfo = _testServer.address()
        _testServerAddress = `http://localhost:${serverInfo.port}`

    })

    function createUser(data){
        return fetch(`${_testServerAddress}/users`, {
            method:'POST',
            body:JSON.stringify(data)
        })
    }
    async function findUserById(id){
        const user = await fetch(`${_testServerAddress}/users/${id}`)
        return user.json()
    }

    afterAll(done => {
        server.closeAllConnections()
        _testServer.close(done)
    })

    it('should register a new user with young-adult category', async () => {
        const expectedCategory = 'young-adult'
        //!O ano que vem o teste pode quebrar o teste, sempre mockar o tempo.
        jest.useFakeTimers({
            now: new Date('2023-11-23')
        })
        const response = await createUser({
            name:'Repula da Silva',
            birthday:'2000-01-01',
        })
        expect(response.status).toBe(201) //201-created
        const result = await response.json()
        expect(result.id).not.toBeUndefined()
        const user = await findUserById(result.id)

        expect(user.category).toBe(expectedCategory)
    })
    it.todo('should register a new user with with-adult category')
    it.todo('should register a new user with senior category')
    it('should throw an error when registering a under-age user', async () => {
        const response = await createUser({
            name:'Joao da Silva',
            birthday:'2020-01-01',
        })
        expect(response.status).toBe(400)
        const result = await response.json()
        console.log(result)
        expect(result).toEqual({ message: '18yo' })
    })

})
