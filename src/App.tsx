import { useCallback, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event"
import { confirm } from "@tauri-apps/api/dialog"

import { TodoItem } from "./types";
import {
	createTodoItem,
	initAppData,
	readTodos,
	removeTodoItem,
	resetAppData,
	updateTodoItem
} from "./lib/AppUtils";

function App() {

	const [ draft, setDraft ] = useState<string>("")
	const [ todos, setTodos ] = useState<TodoItem[]>([])

	useEffect(() => {
		init()
		const unlisten = eventInit()
		return () => {
			unlisten()
		}
	}, [])

	const confirmClear = async () => {
		const confirmation = await confirm("Are you sure you want to clear app data?", { title: "Tauri Demo", type: "warning" })
		if(!confirmation) {
			return
		}
		await resetAppData()
		await syncTodos()
	}

	const eventInit = useCallback(() => {
		const unlistenSettingsEvent = listen("native:clear_app_data", () => {
			confirmClear()
		})
		return () => {
			unlistenSettingsEvent.then((fnc) => fnc())
		}
	}, [])

	const init = useCallback(async () => {
		await initAppData()
		syncTodos()
	}, [])

	const syncTodos = useCallback(async () => {
		const savedItems = await readTodos()
		setTodos(savedItems)
	}, [])

	const addTodo = async (draft: string) => {
		await createTodoItem(draft)
		await syncTodos()
		setDraft("")
	}

	const toggleTodo = async (todo: TodoItem) => {
		await updateTodoItem(todo.id, !todo.checked)
		await syncTodos()
	}

	const handleTodoDelete = async (todo: TodoItem) => {
		await removeTodoItem(todo.id)
		await syncTodos()
	}

	return (
		<div className="flex flex-col w-full space-y-2 mx-auto max-w-md mt-12">
			<span className="self-end text-xs text-gray-500">
				There are {todos.length} todo's.
			</span>
			<input
				type="text"
				placeholder="What needs to be done?"
				className="appearance-none box-border px-2 py-3 w-full bg-white shadow-sm focus:outline-none focus:shadow-md hover:shadow-md rounded-sm text-black text-sm"
				value={draft}
				onChange={(e) => {
					setDraft(e.target.value)
				}}
				onKeyDown={(e) => {
					if (draft && e.key === "Enter") {
						addTodo(draft)
					}
				}}
			/>
			{todos.map((todo: TodoItem) => (
				<div key={todo.id} className="flex items-center justify-between">
					<div onClick={() => toggleTodo(todo)}>
						<span className={`${todo.checked ? "line-through" : undefined} cursor-pointer text-sm`}>
							{todo.text}
						</span>
					</div>
					<button onClick={() => handleTodoDelete(todo)}>
						x
					</button>
				</div>
			))}
		</div>
	)
}

export default App;
