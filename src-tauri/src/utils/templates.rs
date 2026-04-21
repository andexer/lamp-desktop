use crate::models::LampConfig;

pub fn generate_docker_compose(config: &LampConfig) -> String {
    format!(
r#"services:
  web:
    image: php:{}-apache
    container_name: {}-web
    ports:
      - "{}:80"
    volumes:
      - ./www:/var/www/html
    environment:
      - TZ={}
    networks:
      - lamp-network

  db:
    image: mariadb:latest
    container_name: {}-db
    command: --default-authentication-plugin=mysql_native_password
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: {}
      MYSQL_DATABASE: {}
      MYSQL_USER: {}
      MYSQL_PASSWORD: {}
    ports:
      - "{}:3306"
    volumes:
      - ./mysql_data:/var/lib/mysql
    networks:
      - lamp-network

  phpmyadmin:
    image: phpmyadmin:latest
    container_name: {}-pma
    environment:
      PMA_HOST: db
      PMA_PORT: 3306
      MYSQL_ROOT_PASSWORD: {}
    ports:
      - "{}:80"
    networks:
      - lamp-network

networks:
  lamp-network:
    driver: bridge
"#,
        config.php_version, config.name, config.apache_port, config.timezone,
        config.name, config.mysql_root_password, config.mysql_database, config.mysql_user, config.mysql_password, config.mysql_port,
        config.name, config.mysql_root_password, config.phpmyadmin_port
    )
}
