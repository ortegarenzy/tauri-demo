import {
    BaseDirectory,
    createDir,
    exists,
    readTextFile,
    writeTextFile,
} from "@tauri-apps/api/fs"
import { appDataDir } from "@tauri-apps/api/path"
import { v4 as uuidv4 } from "uuid"
import { AppData, TodoItem } from "@/types"

const DIRECTORY_NAME = "TauriDemo"
const APP_DATA_FILE = "data.json"

export const createDirRecursive = async () => {
    const folderExists = await exists(DIRECTORY_NAME, {
        dir: BaseDirectory.AppData,
    })
    if (folderExists) {
        return
    }
    try {
        await createDir(DIRECTORY_NAME, {
            dir: BaseDirectory.AppData,
            recursive: true,
        })
        console.info(`${DIRECTORY_NAME} folder created.`)
    }
	catch (error) {
        console.error(
            `${DIRECTORY_NAME} folder doesn't exists and failed to create folder. Error - ${error}`
        )
    }
}

export const getAppDataFolder = async () => {
    return (await appDataDir())
}

export const initAppData = async () => {
    await createDirRecursive()
    try {
        const appDataFile = await exists(
            (await getAppDataFolder()) + `/${APP_DATA_FILE}`,
            { dir: BaseDirectory.Document }
        )
        if (appDataFile) {
            console.warn(`${APP_DATA_FILE} file already exists.`)
            return
        }
        const defaultAppData: AppData = {
            todos: [],
            createdAt: new Date().toString(),
            lastModifiedAt: new Date().toString(),
        }
        writeContentsToAppData(defaultAppData)
		console.info("Initialized app directory")
    }
	catch (error) {
        console.error("Got error initializing app data: ", error)
    }
}

export const resetAppData = async () => {
	try {
        const appData: AppData = {
            todos: [],
            createdAt: new Date().toString(),
            lastModifiedAt: new Date().toString(),
        }
        writeContentsToAppData(appData)
		console.info("Reset app data")
    }
	catch (error) {
        console.error("Got error initializing app data: ", error)
    }
}

export const writeContentsToAppData = async (data: AppData) => {
    const appFolder = await getAppDataFolder()
    await writeTextFile(appFolder + `/${APP_DATA_FILE}`, JSON.stringify(data))
}

export const readAppDataContents = async () => {
    const appFolder = await getAppDataFolder()
    const appData = await readTextFile(appFolder + `/` + APP_DATA_FILE)
    const data: AppData = JSON.parse(appData)
    return data
}

export const readTodos = async () => {
    const appData = await readAppDataContents()
    return appData.todos
}

export const createTodoItem = async (text: string) => {
	const todo: TodoItem = {
		id: uuidv4(),
		text,
		checked: false,
		lastModified: new Date().toUTCString()
	}
	const appData = await readAppDataContents()
	const updatedAppData: AppData = {
		...appData,
		todos: [ ...appData.todos, todo ],
		lastModifiedAt: new Date().toUTCString()
	}
	await writeContentsToAppData(updatedAppData)
	console.info(`Todo ${text} saved`)
}

export const updateTodoItem = async (todoId: string, checked: boolean) => {
	const appData = await readAppDataContents()
	const todos = appData.todos
	const index = todos.findIndex((todo) => todo.id === todoId)
	if(index < 0) {
		return
	}
	// We do it this way to preserve the ordering
	const foundTodo = todos[index]
	foundTodo.checked = checked
	foundTodo.lastModified = new Date().toUTCString()
	todos[index] = foundTodo
	const updatedAppData: AppData = {
		...appData,
		todos: todos,
		lastModifiedAt: new Date().toUTCString()
	}
	await writeContentsToAppData(updatedAppData)
	console.info(`Todo ${foundTodo.text} updated`)
}

export const removeTodoItem = async (todoId: string) => {
	const appData = await readAppDataContents()
	let todos = appData.todos
	const index = todos.findIndex((todo) => todo.id === todoId)
	if(index > -1) {
		todos = [
			...todos.slice(0, index),
			...todos.slice(index + 1)
		]
	}
	const updatedAppData: AppData = {
		...appData,
		todos: todos,
		lastModifiedAt: new Date().toUTCString()
	}
	await writeContentsToAppData(updatedAppData)
}
