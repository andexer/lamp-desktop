# lamp-desktop

`lamp-desktop` es una aplicacion nativa para Linux pensada para levantar entornos de desarrollo PHP de forma grafica, rapida y sin pelearte con configuraciones manuales.

La idea del proyecto es ofrecer una experiencia tipo LAMP moderna sobre Docker, con una interfaz de escritorio donde puedas crear, configurar y ejecutar stacks locales para proyectos PHP sin depender de comandos largos ni archivos complejos desde el primer minuto.

## Que hace

- Crea entornos locales para desarrollo PHP con enfoque LAMP.
- Usa Docker por debajo para aislar servicios y simplificar el arranque.
- Permite configurar puertos, hostname, base de datos y credenciales desde una interfaz grafica.
- Incluye ajustes visuales para PHP, extensiones y edicion avanzada del archivo `lamp.ini`.
- Esta pensada como una herramienta de escritorio para Linux, no como un panel web.

## Enfoque del proyecto

Este proyecto busca ser una alternativa grafica, simple y nativa para desarrolladores que trabajan en Linux y necesitan levantar proyectos PHP rapidamente.

En lugar de preparar todo a mano cada vez, `lamp-desktop` centraliza la configuracion del entorno y automatiza la generacion del stack para que puedas concentrarte en desarrollar.

## Stack tecnico

- `Tauri`
- `SolidJS`
- `TypeScript`
- `Rust`
- `Docker`

## Requisitos

Para usar la aplicacion en Linux necesitas al menos:

- `Docker`
- `Docker Compose` o soporte Compose disponible en Docker
- `Node.js`
- `npm`
- toolchain de `Rust`

## Desarrollo local

Instala dependencias:

```bash
npm install
```

Inicia la app en modo desarrollo:

```bash
npm run dev
```

Para ejecutar Tauri:

```bash
npm run tauri dev
```

Compilar frontend:

```bash
npm run build
```

Compilar binario para Linux:

```bash
npm run build:linux
```

## Objetivo

`lamp-desktop` esta enfocado en facilitar la vida del desarrollador PHP en Linux:

- menos tiempo configurando
- menos errores manuales
- mas control visual del entorno
- una base simple para futuros flujos de trabajo

## Estado

El proyecto esta en desarrollo activo y puede seguir cambiando en interfaz, flujo y caracteristicas.

## Colaboraciones

Si quieres colaborar, eres bienvenido.

Acepto contribuciones para:

- mejoras de interfaz y experiencia de usuario
- soporte para mas versiones de PHP
- optimizacion de flujos Docker
- pruebas en distintas distribuciones Linux
- documentacion
- correccion de bugs
- nuevas funciones para entornos PHP locales

Si te interesa aportar, puedes abrir un issue, proponer cambios o enviar un pull request.

## Vision

La meta es convertir `lamp-desktop` en una herramienta comoda, clara y potente para levantar entornos PHP locales en Linux de manera grafica, especialmente para proyectos tipo LAMP y flujos de desarrollo modernos.

## Licencia

MIT
