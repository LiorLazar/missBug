import fs from 'fs'

import { utilService } from "../public/services/util.service.js";
import { loggerService } from "./logger.service.js";
import { readJsonFile } from "./util.service.js";

const users = readJsonFile('./data/user.json')

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    add
}

function query() {
    let usersToDisplay = users
    return Promise.resolve(usersToDisplay)
}

function getById(userId) {
    const user = users.find(user => user._id === userId)

    if (!user) {
        loggerService.error(`Couldnt find user ${userId} in userService`)
        return Promise.reject('Couldnt find user')
    }
    return Promise.resolve(user)
}

function getByUsername(username) {
    var user = users.find(user => user.username === username)
    return Promise.resolve(user)
}

function remove(userId) {
    users = users.filter(user => user._id !== userId)
}

function add(user) {
    return getByUsername(user.username)
        .then(existingUser => {
            if (existingUser) return Promise.reject('Username taken')

            user._id = utilService.makeId()
            users.push(user)

            return _saveUsersToFile()
                .then(() => {
                    user = { ...user }
                    delete user.password
                    return user
                })
        })
}

function _saveUsersToFile() {
    return new Promise((resolve, reject) => {
        const usersStr = JSON.stringify(users, null, 2)
        fs.writeFile('data/user.json', usersStr, err => {
            if (err) return console.log(err)
            resolve()
        })
    })
}