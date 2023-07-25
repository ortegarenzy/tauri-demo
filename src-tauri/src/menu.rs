use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, WindowMenuEvent};

pub fn generate_menu() -> Menu {

    let app_menu = Submenu::new(
        "Tauri Demo",
        Menu::with_items([
            CustomMenuItem::new("about", "About Tauri Demo").into(),
            #[cfg(target_os = "macos")]
            MenuItem::Separator.into(),
            CustomMenuItem::new("clear", "Clear Data...")
                    .accelerator("Shift+CommandOrCtrl+Delete")
                    .into(),
            #[cfg(target_os = "macos")]
            MenuItem::Separator.into(),
            MenuItem::Hide.into(),
            MenuItem::HideOthers.into(),
            MenuItem::ShowAll.into(),
            #[cfg(target_os = "macos")]
            MenuItem::Separator.into(),
            MenuItem::Quit.into(),
        ])
    );

    let menu= Menu::new()
        .add_submenu(app_menu);

    menu
}

pub fn menu_handler(event: WindowMenuEvent<tauri::Wry>) {
    let menu_id = event.menu_item_id();

    match menu_id {
        "about" => {
        }
        "clear" => {
            event
                .window()
                .emit("native:clear_app_data", {})
                .map_err(|err| println!("{:?}", err))
                .ok();
        }
        _ => {}
    }
}
