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
    pub working_dir: Option<PathBuf>,
    pub hostname: String,
    pub mailpit_port: u16,
    #[serde(default = "default_memory_limit")]
    pub php_memory_limit: String,
    #[serde(default = "default_max_execution_time")]
    pub php_max_execution_time: u32,
    #[serde(default = "default_upload_max_filesize")]
    pub php_upload_max_filesize: String,
    #[serde(default = "default_post_max_size")]
    pub php_post_max_size: String,
    #[serde(default = "default_display_errors")]
    pub php_display_errors: bool,
    #[serde(default = "default_extensions")]
    pub php_extensions: Vec<String>,
}

fn default_memory_limit() -> String { "256M".to_string() }
fn default_max_execution_time() -> u32 { 120 }
fn default_upload_max_filesize() -> String { "64M".to_string() }
fn default_post_max_size() -> String { "64M".to_string() }
fn default_display_errors() -> bool { true }
fn default_extensions() -> Vec<String> { vec!["pdo_mysql".to_string(), "gd".to_string(), "intl".to_string(), "zip".to_string()] }

impl Default for LampConfig {
    fn default() -> Self {
        Self {
            name: "default-lamp".to_string(),
            php_version: "8.4".to_string(),
            apache_port: 80,
            mysql_port: 3306,
            phpmyadmin_port: 8585,
            mailpit_port: 8686,
            mysql_root_password: "root".to_string(),
            mysql_database: "lamp_db".to_string(),
            mysql_user: "lamp_user".to_string(),
            mysql_password: "lamp_password".to_string(),
            timezone: "UTC".to_string(),
            project_path: PathBuf::new(),
            working_dir: None,
            hostname: "localhost".to_string(),
            php_memory_limit: "256M".to_string(),
            php_max_execution_time: 120,
            php_upload_max_filesize: "64M".to_string(),
            php_post_max_size: "64M".to_string(),
            php_display_errors: true,
            php_extensions: vec!["pdo_mysql".to_string(), "gd".to_string(), "intl".to_string(), "zip".to_string()],
        }
    }
}
