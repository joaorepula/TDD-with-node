import { createServer } from 'node:http'
import { once } from 'node:events'
import { randomUUID } from 'node:crypto'
const usersDb = [];
function getUserCategory(birthday){
    const age = new Date().getFullYear() - new Date(birthday).getFullYear()
    if(age < 18){
        throw new Error('18yo')
    }
    if(age >= 18 && age <= 25){
        return 'young-adult'
    }
    return ''
}

const server = createServer(async (request, response) => {
    try {
        if(request.url === '/users' && request.method === 'POST'){
            const user = JSON.parse(await once(request, 'data'))
            const updatedUser = {
                ...user,
                id: randomUUID(),
                category: getUserCategory(user.birthday),
            }
            usersDb.push(updatedUser)
            response.writeHead(201, {
                "Content-Type": 'application-json'
            })
            response.end(JSON.stringify({
                id: updatedUser.id
            }))
            return
        }
        if(request.url.startsWith('/users') && request.method === 'GET'){
            //ghost var
            const [,, id] = request.url.split('/')
            
            const user = usersDb.find(user => user.id === id)
            response.end(JSON.stringify(user))
            return
        }
        response.end('Hello world!')
    } catch (error) {
        if(error.message.includes('18yo')){
            response.writeHead(400, {
                'Content-Type': 'application/json'
            })
            response.end(JSON.stringify({
                message: error.message
            }))
            return
        }
        response.writeHead(500)
        response.end('deu ruim')
    }
})

export { server }