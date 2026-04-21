// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod commands;
mod utils;

use commands::docker::{check_docker, create_project, docker_up, docker_down, get_docker_status, get_docker_logs};
use std::fs;
use std::path::PathBuf;

fn get_base_dir() -> Result<PathBuf, String> {
    let mut path = dirs::home_dir().ok_or("Could not find home directory")?;
    path.push(".lamp-desktop");
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    Ok(path)
}

fn get_projects_dir() -> Result<PathBuf, String> {
    let mut path = get_base_dir()?;
    path.push("projects");
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    Ok(path)
}

#[tauri::command]
fn list_projects() -> Result<Vec<String>, String> {
    let projects_dir = get_projects_dir()?;
    let mut projects = Vec::new();
    for entry in fs::read_dir(projects_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        if entry.path().is_dir() {
            if let Some(name) = entry.file_name().to_str() {
                projects.push(name.to_string());
            }
        }
    }
    Ok(projects)
}

#[tauri::command]
fn get_project_config(name: String) -> Result<models::config::LampConfig, String> {
    let projects_dir = get_projects_dir()?;
    let project_dir = projects_dir.join(&name);
    let config_path = project_dir.join("config.json");

    if !config_path.exists() {
        return Err("Config not found".to_string());
    }

    let content = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let mut config: models::config::LampConfig = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    
    if config.project_path != project_dir {
        config.project_path = project_dir;
        let updated_content = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
        fs::write(config_path, updated_content).map_err(|e| e.to_string())?;
    }

    Ok(config)
}

#[tauri::command]
fn save_project_config(config: models::config::LampConfig) -> Result<models::config::LampConfig, String> {
    let projects_dir = get_projects_dir()?;
    let project_dir = projects_dir.join(&config.name);
    
    if !project_dir.exists() {
        fs::create_dir_all(&project_dir).map_err(|e| e.to_string())?;
    }

    let mut project_config = config.clone();
    project_config.project_path = project_dir.clone();

    let json_path = project_dir.join("config.json");
    let content = serde_json::to_string_pretty(&project_config).map_err(|e| e.to_string())?;
    fs::write(json_path, content).map_err(|e| e.to_string())?;
    
    Ok(project_config)
}

#[tauri::command]
async fn open_terminal(path: std::path::PathBuf) -> Result<(), String> {
    // Try common terminal emulators for Linux
    let terminals = ["konsole", "gnome-terminal", "xfce4-terminal", "xterm"];
    
    for term in terminals {
        if std::process::Command::new(term)
            .arg("--workdir")
            .arg(&path)
            .spawn()
            .is_ok() {
            return Ok(());
        }
        // Fallback for terminals that don't support --workdir but inherit from parent process
        if std::process::Command::new(term)
            .current_dir(&path)
            .spawn()
            .is_ok() {
            return Ok(());
        }
    }
    Err("No supported terminal found".to_string())
}

#[tauri::command]
async fn delete_project(name: String) -> Result<(), String> {
    let projects_dir = get_projects_dir()?;
    let project_dir = projects_dir.join(&name);
    
    if project_dir.exists() {
        // We might need to use the docker trick for mysql_data if it exists
        // but for now let's try standard removal
        let _ = fs::remove_dir_all(&project_dir);
        
        // If it still exists (due to permissions), we inform the user or try the docker trick
        if project_dir.exists() {
             let mut child = std::process::Command::new("docker")
                .args(["run", "--rm", "-v"])
                .arg(format!("{}:/data", project_dir.display()))
                .args(["alpine", "rm", "-rf", "/data"])
                .spawn()
                .map_err(|e| e.to_string())?;
             let _ = child.wait();
             let _ = fs::remove_dir_all(&project_dir);
        }
    }
    
    // Also remove the Documentos/www folder
    let mut docs_www = dirs::home_dir().ok_or("Could not find home directory")?;
    docs_www.push("Documentos");
    docs_www.push("www");
    docs_www.push(&name);
    if docs_www.exists() {
        let _ = fs::remove_dir_all(&docs_www);
    }

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            check_docker,
            create_project,
            docker_up,
            docker_down,
            get_docker_status,
            get_docker_logs,
            list_projects,
            get_project_config,
            save_project_config,
            open_terminal,
            delete_project
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
