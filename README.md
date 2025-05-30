# Laboratorio 3: Tipos de datos personalizados y ORM
## Descripcion
Este laboratorio consiste en realizar una aplicación CRUD completa utilizando exclusivamente un ORM. La entidad principal del diagrama entidad-relación debe estar conectada con algún atributo por una 
relación muchos-a-muchos y se debe poder insertar en múltiples tablas por medio de un mismo formulario. Adicionalmente, se deben declarar 2 tipos de datos personalizados.
## Ubicación de Archivos
- /backend/ los archivos relacionados al backend, incluyendo el schema.prisma para la creación de la base de datos y el manejo de migraciones
- /frontend/ la interfaz por medio de la cual se interactúa eon el backend
- /docs/ la documentación adicional, incluyendo el diagrama ERD y análisis.pdf

## Correr el Proyecto
Para correr el proyecto es necesario correr el siguiente comando
```
docker compose up --build
```
Adicionalmente, debido al script que ejecuta la inserción de datos, es necesario bajar los contenedores utilizando
```
docker compose down -v
```
para poder correr el proyecto nuevamente.

El backend se encuentra corriendo en el puerto 3001, frontend en el 3000 y la base de datos en el default de postgres 5432

## Ejemplos
### Create / Formulario de Creación
![image](https://github.com/user-attachments/assets/190aef29-40cc-4e37-b8fe-8f8fd85de44f)

![image](https://github.com/user-attachments/assets/c474ac97-19e2-402a-ad8a-1c6bf10ccc4e)


### Read / Visualización de Jugadores
![image](https://github.com/user-attachments/assets/68b577b4-a823-40f7-b06e-7e0ddae47857)

### Update / Actualización de Jugadores

![image](https://github.com/user-attachments/assets/14356936-f798-426c-882c-0c75cf258375)

![image](https://github.com/user-attachments/assets/763bb62c-8e0f-46f8-907f-2521708a082e)

### Delete / Eliminación de Jugadores

![image](https://github.com/user-attachments/assets/1b58e4ef-3309-408b-a4fb-aa930886bcc6)

![image](https://github.com/user-attachments/assets/108ae405-a303-46e0-a6ae-3aa36b6f9e24)
