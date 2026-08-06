mod update;

use tauri::{
  image::Image,
  menu::{Menu, MenuItem, PredefinedMenuItem},
  tray::TrayIconBuilder,
  Manager, WindowEvent,
};
#[cfg(target_os = "macos")]
use tauri::RunEvent;

fn show_main_window(app: &tauri::AppHandle) {
  if let Some(window) = app.get_webview_window("main") {
    let _ = window.unminimize();
    let _ = window.show();
    let _ = window.set_focus();
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
      show_main_window(app);
    }))
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .setup(|app| {
      let open_item = MenuItem::with_id(app, "open", "Open App Base", true, None::<&str>)?;
      let update_item =
        MenuItem::with_id(app, "check_update", "Check for Updates…", true, None::<&str>)?;
      let quit_item = MenuItem::with_id(app, "quit", "Quit App Base", true, None::<&str>)?;
      let menu = Menu::with_items(
        app,
        &[
          &open_item,
          &PredefinedMenuItem::separator(app)?,
          &update_item,
          &PredefinedMenuItem::separator(app)?,
          &quit_item,
        ],
      )?;

      let tray_icon = Image::from_bytes(include_bytes!("../icons/32x32.png"))?;
      TrayIconBuilder::with_id("main")
        .icon(tray_icon)
        .tooltip("App Base")
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(|app, event| match event.id.as_ref() {
          "open" => show_main_window(app),
          "check_update" => update::check_and_install(app.clone()),
          "quit" => app.exit(0),
          _ => {}
        })
        .build(app)?;

      show_main_window(app.handle());
      update::check_and_install(app.handle().clone());
      update::spawn_poller(app.handle().clone());
      Ok(())
    })
    .on_window_event(|window, event| {
      if let WindowEvent::CloseRequested { api, .. } = event {
        api.prevent_close();
        let _ = window.hide();
      }
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application")
    .run(|_app, _event| {
      #[cfg(target_os = "macos")]
      if let RunEvent::Reopen { .. } = _event {
        show_main_window(_app);
      }
    });
}
