## CONFIGURACIÓN ENTORNO DE TRABAJO ##


Esta pequeña guía tiene como objetivo mostrar los pasos necesarios para arrancar con el proyecto a todos aquellos que como yo empezamos a trabajar con github.



###Copia del proyecto original en GIT 
Lo primero que debemos hacer es crearnos una cuenta de [github](https://github.com/) y hacer un fork del proyecto.

 	
![gitHub fork](images/git_fork.png)


Esto nos crea una copia en nuestra cuenta.

![gitHub fork](../images/git_copia.png)

###Generamos el ssh keys###

Generamos una llave única (en mi máquina) que identifica quien soy  para comunicársela a github. 

Abrimos Git Shell para generar la llave:

![Logos gitHub](../images/logos_gitHub.png)

Escribimos los siguientes comandos: Consulta esta [página](https://help.github.com/articles/generating-ssh-keys/#platform-windows) para más información.

    #Check for SSH keys	
    	ls ~/.ssh
     # Generate new SSH keys
    	ssh-keygen -t rsa -C "your_email@example.com”
    	enter
    	enter
    	enter
    # Add hoy key to the ssh-agent
    	ssh-agent -s
    	ssh-add  C:\Users\<usuaro>\.ssh\ide_rsa

Nos genera una clave en C:\Users\usuario\\.ssh dentro del fichero id_rsa.pub (abrimos y copiamos la clave)

En nuestro github, abrimos setting y copiamos la clave.

![gitHub propiedades](../images/git_img1.png)

![gitHub propiedades](../images/git_img2.png)

Aquí copiamos la clave

![gitHub propiedades](../images/git_img3.png)

Si todo es correcto nos aparecerá en nuestra pestaña de ssh keys la lista de claves.


###Instalamos un servidor de aplicaciónes. 
En mi caso he instalado wanpserver [wampserver](http://www.wampserver.com/)



###Copiamos el proyecto a disco local###

Desde la ventana de github, copiamos el enlace SSH

![gitHub propiedades](../images/git_img4.png)

En la ventana de Shell del proyecto nos posicionamos en: c:\wamp\www\ (directorio creado al instalar wampserver). Aquí es donde voy a guardar la copia de mi proyecto alojado en github.
 
Copiamos el proyecto: 

	git clone git@github.com:servigis/idealista-arcgis.git

Una vez terminado el proceso, tendremos nuestra copia en local.

![gitHub propiedades](../images/git_img5.png)


    Git remote –v
    git remote add hhkaos git@github.com:hhkaos/idealista-arcgis.git
    git pull hhkaos master



###Instalamos [bower](http://bower.io/)###

Continuamos en el Shell y nos posicionamos en el directorio del proyecto. 

En mi caso está en c:\wamp\www\arcgis-idealista\idealista-arcgis.


    Npm install –g bower 
![gitHub propiedades](../images/git_img6.png)

    bower install 
![gitHub propiedades](../images/git_img7.png)

###Mantemos nuestro cambios con github###

completar.......
