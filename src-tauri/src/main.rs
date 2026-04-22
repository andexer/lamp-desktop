// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod commands;
mod utils;

use commands::docker::{check_docker, create_project, docker_up, docker_down, get_docker_status, get_docker_logs, generate_php_ini_content};
use std::fs;
use std::path::PathBuf;

fn validate_project_name(name: &str) -> Result<&str, String> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err("Project name cannot be empty".to_string());
    }
    if trimmed.len() > 100 {
        return Err("Project name is too long".to_string());
    }
    if trimmed == "." || trimmed == ".." || trimmed.contains('/') || trimmed.contains('\\') {
        return Err("Invalid project name".to_string());
    }
    Ok(trimmed)
}

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

fn get_project_dir(name: &str) -> Result<PathBuf, String> {
    let safe_name = validate_project_name(name)?;
    Ok(get_projects_dir()?.join(safe_name))
}

#[tauri::command]
fn list_projects() -> Result<Vec<String>, String> {
    let projects_dir = get_projects_dir()?;
    let mut projects = Vec::new();
    for entry in fs::read_dir(projects_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_dir() && path.join("config.json").is_file() {
            if let Some(name) = entry.file_name().to_str() {
                projects.push(name.to_string());
            }
        }
    }
    projects.sort();
    Ok(projects)
}

#[tauri::command]
fn get_project_config(name: String) -> Result<models::config::LampConfig, String> {
    let project_dir = get_project_dir(&name)?;
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
    validate_project_name(&config.name)?;
    let project_dir = get_project_dir(&config.name)?;
    
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
fn read_php_ini(name: String) -> Result<String, String> {
    let project_dir = get_project_dir(&name)?;
    let ini_path = project_dir.join("lamp.ini");

    if ini_path.exists() {
        fs::read_to_string(ini_path).map_err(|e| e.to_string())
    } else {
        let config = get_project_config(name)?;
        Ok(generate_php_ini_content(&config))
    }
}

#[tauri::command]
fn write_php_ini(name: String, content: String) -> Result<(), String> {
    if content.len() > 262_144 {
        return Err("lamp.ini is too large".to_string());
    }
    let project_dir = get_project_dir(&name)?;
    if !project_dir.exists() {
        fs::create_dir_all(&project_dir).map_err(|e| e.to_string())?;
    }

    let normalized = content.replace("\r\n", "\n");
    fs::write(project_dir.join("lamp.ini"), normalized).map_err(|e| e.to_string())
}

#[tauri::command]
fn generate_php_ini_preview(config: models::config::LampConfig) -> Result<String, String> {
    Ok(generate_php_ini_content(&config))
}

#[tauri::command]
async fn open_terminal(path: std::path::PathBuf) -> Result<(), String> {
    let mut final_path = path;
    
    // If there is a www folder (or symlink), use that as the working directory
    let www_path = final_path.join("www");
    if www_path.exists() {
        if let Ok(canonical) = fs::canonicalize(&www_path) {
            final_path = canonical;
        } else {
            final_path = www_path;
        }
    }

    // Try common terminal emulators for Linux
    let terminals = ["konsole", "gnome-terminal", "xfce4-terminal", "xterm"];
    
    for term in terminals {
        if std::process::Command::new(term)
            .arg("--workdir")
            .arg(&final_path)
            .spawn()
            .is_ok() {
            return Ok(());
        }
        // Fallback for terminals that don't support --workdir but inherit from parent process
        if std::process::Command::new(term)
            .current_dir(&final_path)
            .spawn()
            .is_ok() {
            return Ok(());
        }
    }
    Err("No supported terminal found".to_string())
}

#[tauri::command]
async fn delete_project(name: String) -> Result<(), String> {
    let project_dir = get_project_dir(&name)?;
    
    // Try to find the working directory from config before deleting project_dir
    let mut working_dir = None;
    let config_path = project_dir.join("config.json");
    if config_path.exists() {
        if let Ok(content) = fs::read_to_string(&config_path) {
            if let Ok(config) = serde_json::from_str::<models::config::LampConfig>(&content) {
                working_dir = Some(match config.working_dir {
                    Some(path) => path,
                    None => {
                        let mut path = dirs::document_dir().unwrap_or_else(|| {
                             let mut p = dirs::home_dir().expect("Could not find home directory");
                             p.push("Documents");
                             p
                        });
                        path.push("www");
                        path.push(validate_project_name(&name)?);
                        path
                    }
                });
            }
        }
    }

    if project_dir.exists() {
        // We might need to use the docker trick for mysql_data if it exists
        let _ = fs::remove_dir_all(&project_dir);
        
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
    
    // Remove the working directory (default or custom)
    if let Some(wd) = working_dir {
        if wd.exists() {
            let _ = fs::remove_dir_all(&wd);
        }
    }

    Ok(())
}

#[tauri::command]
async fn register_hostname(hostname: String) -> Result<(), String> {
    utils::hosts::add_host_entry(&hostname)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
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
            read_php_ini,
            write_php_ini,
            generate_php_ini_preview,
            open_terminal,
            delete_project,
            register_hostname
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
