import { storageService } from "./async-storage.service.js"

const STORAGE_KEY = 'usersDB'

export const userService = {
    query,
    getById,
    getByUsername,
    add,
    getEmptyCredentials
}

function query() {
    return storageService.query(STORAGE_KEY)
}

function getById(userId) {
    return storageService.get(STORAGE_KEY, userId)
}

function getByUsername(username) {
    return storageService.query(STORAGE_KEY)
        .then(users => users.find(user => user.username === username))
}

function add(user) {
    const { username, password, fullname } = user
    if (!username || !password || !fullname) return Promise.reject('Missing credentials')

    return getByUsername(username)
        .then(existingUser => {
            if (existingUser) return Promise.reject('Username taken')

            return storageService.post(STORAGE_KEY, user)
                .then(user => {
                    user = { ...user }
                    delete user.password
                    return user
                })
        })
}

function getEmptyCredentials() {
    return {
        username: '',
        password: '',
        fullname: ''
    }
}

function _createAdmin() {
    const admin = {
        username: 'admin',
        password: 'admin',
        fullname: 'Admin Admin',
        isAdmin: true,
    }
    storageService.post(STORAGE_KEY, admin)
}