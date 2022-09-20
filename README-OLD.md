# BOT PARA MESSENGER 🤖

- Materia: Tópicos Avanzados de Programación
- Semestre: 2-2022

## Grupo 👨‍💻👩‍💻👨‍💻
- Alejandro Aragón Arturo
- Telma Natali Lino Mendoza
- Adrian Rosales Velasco

## Como instalar 🚀
### Requisitos previos:
- Aplicación en [Meta for Developers](https://developers.facebook.com)
- Cuenta en [Heroku](https://dashboard.heroku.com)
- Una página en Facebook
- Agente en Dialogflow. [Tutorial](https://www.youtube.com/watch?v=IKZ6E1Ue5Q8)
- Credenciales de Dialogflow en formato JSON. [Tutorial](https://www.youtube.com/watch?v=CXF9YlKhNUU)

### Paso 1: Configurar variables en Heroku
Ir a **Settings** en el panel de Heroku y agregar las siguientes variables:

| KEY | VALUE |
| ------------- | ------------- |
| VERIFICATION_TOKEN  | Clave personal secreta  |
| PAGE_ACCESS_TOKEN  | Token de acceso de la aplicación de Facebook |
| GOOGLE_APPLICATION_CREDENTIALS | google-credentials.json (Importante poner este mismo nombre) |
| GOOGLE_CREDENTIALS| Copiar y pegar todo el contenido del JSON  de sus crendeciales de dialogwflow|
Imagen de ejemplo:

<img src="https://i.imgur.com/am0loIo.png?raw=true" width="85%"></img> 

### Paso 2: Agregar Buildpacks en Heroku
Entrar en **Add Buildpacks** en la sección **Settings** en el panel de su aplicación en Heroku.
Ingresar el enlace:
```
https://github.com/buyersight/heroku-google-application-credentials-buildpack.git
```
Por ultimo **Guardar Cambios** y deberá quedar así.

<img src="https://imgur.com/F5lzQgl.png?raw=true" width="85%"></img> 

### Paso 3: Enlazar repositorio Github con Heroku
- Hacer un fork al repositorio:
```
https://github.com/black7in/bot-topicos
```
- Entrar en **Deploy** en el panel de la aplicación de Heroku.
- En **Deployment method** seleccionar **Github**.
- Ingresar con su cuenta Github.
- Buscar el nombre del repositorio.
- Connect.

<img src="https://imgur.com/DSx2ugk.png?raw=true" width="85%"></img> 

- Seleccionar la rama **develeop**
- Puede activar **Enable Automatic Deploys** o hacerlo manual.
- **Deploy Branch**.

<img src="https://imgur.com/KshzRWX.png?raw=true" width="85%"></img> 

- Probar el bot.