//! Desktop auto-update (Rust). Checks the public R2 `latest.json` endpoint.

use std::time::Duration;

use tauri::{AppHandle, Runtime};
use tauri_plugin_updater::UpdaterExt;

const POLL_INTERVAL: Duration = Duration::from_secs(10 * 60);
const TRAY_ID: &str = "main";

fn set_update_badge<R: Runtime>(app: &AppHandle<R>, pending: bool) {
  if let Some(tray) = app.tray_by_id(TRAY_ID) {
    let _ = tray.set_title(if pending { Some("\u{25cf}") } else { None });
  }
}

async fn install_if_available<R: Runtime>(app: &AppHandle<R>) -> bool {
  let outcome = async {
    match app.updater()?.check().await? {
      Some(update) => {
        update.download_and_install(|_, _| {}, || {}).await?;
        Ok::<bool, tauri_plugin_updater::Error>(true)
      }
      None => Ok(false),
    }
  }
  .await;

  match outcome {
    Ok(true) => app.restart(),
    Ok(false) => false,
    Err(e) => {
      eprintln!("[updater] check/install failed: {e}");
      false
    }
  }
}

async fn update_available<R: Runtime>(app: &AppHandle<R>) -> bool {
  match app.updater() {
    Ok(updater) => matches!(updater.check().await, Ok(Some(_))),
    Err(_) => false,
  }
}

pub fn check_and_install<R: Runtime>(app: AppHandle<R>) {
  tauri::async_runtime::spawn(async move {
    if !install_if_available(&app).await {
      set_update_badge(&app, false);
    }
  });
}

pub fn spawn_poller<R: Runtime>(app: AppHandle<R>) {
  std::thread::spawn(move || loop {
    std::thread::sleep(POLL_INTERVAL);
    if tauri::async_runtime::block_on(update_available(&app)) {
      set_update_badge(&app, true);
      break;
    }
  });
}
