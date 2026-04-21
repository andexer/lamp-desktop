use crate::models::LampConfig;
use crate::utils::templates::generate_docker_compose;
use std::fs;
use std::path::Path;
use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};
use tauri::{AppHandle, Emitter};
use std::os::unix::fs::symlink;

use serde::Serialize;

#[derive(Serialize)]
pub struct DependencyStatus {
    docker: bool,
    docker_compose: bool,
}

#[tauri::command]
pub async fn check_docker() -> Result<DependencyStatus, String> {
    let docker_ok = Command::new("docker")
        .arg("--version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);

    let compose_ok = Command::new("docker")
        .args(["compose", "version"])
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);

    Ok(DependencyStatus {
        docker: docker_ok,
        docker_compose: compose_ok,
    })
}

#[tauri::command]
pub async fn create_project(config: LampConfig) -> Result<String, String> {
    let project_path = config.project_path.clone();
    if !project_path.exists() {
        fs::create_dir_all(&project_path).map_err(|e| e.to_string())?;
    }

    // Prepare Documentos/www path
    let mut docs_www = dirs::home_dir().ok_or("Could not find home directory")?;
    docs_www.push("Documentos");
    docs_www.push("www");
    docs_www.push(&config.name);
    
    if !docs_www.exists() {
        fs::create_dir_all(&docs_www).map_err(|e| e.to_string())?;
        fs::write(docs_www.join("index.php"), "<?php phpinfo(); ?>").map_err(|e| e.to_string())?;
    }

    // Create symlink inside ~/.lamp-desktop/projects/<name>/www pointing to ~/Documentos/www/<name>
    let www_link = project_path.join("www");
    if !www_link.exists() {
        symlink(&docs_www, &www_link).map_err(|e| e.to_string())?;
    }

    let compose_content = generate_docker_compose(&config);
    fs::write(project_path.join("docker-compose.yml"), compose_content).map_err(|e| e.to_string())?;

    Ok("Project created successfully".to_string())
}

#[tauri::command]
pub async fn docker_up(app: AppHandle, project_path: String) -> Result<String, String> {
    let mut child = Command::new("docker")
        .args(["compose", "up", "-d"])
        .current_dir(Path::new(&project_path))
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();
    let app_clone = app.clone();
    
    // Shared buffer for error reporting
    let error_msg = std::sync::Arc::new(std::sync::Mutex::new(String::new()));
    let error_msg_clone = error_msg.clone();

    // Stream logs in separate threads
    std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(l) = line {
                let _ = app_clone.emit("docker-log", l);
            }
        }
    });

    let app_clone_2 = app.clone();
    std::thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(l) = line {
                let _ = app_clone_2.emit("docker-log", &l);
                if let Ok(mut msg) = error_msg_clone.lock() {
                    msg.push_str(&l);
                    msg.push('\n');
                }
            }
        }
    });

    let status = child.wait().map_err(|e| e.to_string())?;
    if status.success() {
        Ok("Success".to_string())
    } else {
        let msg = error_msg.lock().unwrap().clone();
        Err(if msg.is_empty() { "Unknown Docker error".to_string() } else { msg })
    }
}

#[tauri::command]
pub async fn docker_down(project_path: String) -> Result<String, String> {
    let output = Command::new("docker")
        .args(["compose", "down"])
        .current_dir(Path::new(&project_path))
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub async fn get_docker_status(project_path: String) -> Result<String, String> {
    let output = Command::new("docker")
        .args(["compose", "ps", "--format", "json"])
        .current_dir(Path::new(&project_path))
        .output()
        .map_err(|e| e.to_string())?;

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[tauri::command]
pub async fn get_docker_logs(project_path: String, service: String) -> Result<String, String> {
    let output = Command::new("docker")
        .args(["compose", "logs", "--tail", "100", &service])
        .current_dir(Path::new(&project_path))
        .output()
        .map_err(|e| e.to_string())?;

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
