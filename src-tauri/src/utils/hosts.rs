use std::fs;
use std::process::Command;

pub fn add_host_entry(hostname: &str) -> Result<(), String> {
    if hostname == "localhost" || hostname.is_empty() {
        return Ok(());
    }

    let hosts_path = "/etc/hosts";
    let content = fs::read_to_string(hosts_path).map_err(|e| e.to_string())?;
    
    // Check if hostname already exists in /etc/hosts
    if content.lines().any(|line| {
        let parts: Vec<&str> = line.split_whitespace().collect();
        parts.len() >= 2 && parts.contains(&hostname)
    }) {
        return Ok(());
    }

    // If not found, add it using pkexec
    // We use a temporary file to safely append and then move
    let entry = format!("127.0.0.1  {}", hostname);
    let script = format!("echo '{}' >> {}", entry, hosts_path);
    
    let status = Command::new("pkexec")
        .args(["bash", "-c", &script])
        .status()
        .map_err(|e| e.to_string())?;

    if status.success() {
        Ok(())
    } else {
        Err("Failed to update /etc/hosts. Authentication cancelled or failed.".to_string())
    }
}
