use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LampConfig {
    pub name: String,
    pub php_version: String,
    pub apache_port: u16,
    pub mysql_port: u16,
    pub phpmyadmin_port: u16,
    pub mysql_root_password: String,
    pub mysql_database: String,
    pub mysql_user: String,
    pub mysql_password: String,
    pub timezone: String,
    pub project_path: PathBuf,
}

impl Default for LampConfig {
    fn default() -> Self {
        Self {
            name: "default-lamp".to_string(),
            php_version: "8.4".to_string(),
            apache_port: 8080,
            mysql_port: 3307,
            phpmyadmin_port: 8081,
            mysql_root_password: "root".to_string(),
            mysql_database: "lamp_db".to_string(),
            mysql_user: "lamp_user".to_string(),
            mysql_password: "lamp_password".to_string(),
            timezone: "UTC".to_string(),
            project_path: PathBuf::new(),
        }
    }
}
