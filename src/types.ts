export type TodoItem = {
	id: string;
	text: string;
	checked: boolean;
	lastModified: string;
}

export type AppData = {
    todos: TodoItem[]
    createdAt: string
    lastModifiedAt: string
}
